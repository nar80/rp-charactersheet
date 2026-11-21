// Anbindung an den gemeinsamen Würfelraum (Repo dice-room).
// Gewürfelt wird auf dem Server, alle im Raum sehen den Wurf.
import { computed, reactive, watch } from 'vue'
import { Notify } from 'quasar'
import { useSettingsStore } from './settingsStore'

export const DICE_SERVER = import.meta.env.VITE_DICE_SERVER || 'https://dice-room.dice-room.workers.dev'

// server: Begrüßung des Würfelraums ({ version, systems }); null = älterer Server ohne Begrüßung.
// roomSystem: welches System der Raum spielt (stellt die SL im Würfelraum ein).
const state = reactive({ status: 'disconnected', players: [], server: null, roomSystem: null })

let socket = null
let pingTimer = null
let retryTimer = null
let retryDelay = 1000
let wanted = null
// Eigene Würfe, die auf ihr Ergebnis warten: { requestId, options }
let pending = []
// Avatar im Würfelraum (Vorschaubild des Portraits); '' = keins
let avatar = ''
// Bleibt für die Lebensdauer der Seite gleich. Der Server ersetzt beim Wiederverbinden
// die alte Verbindung dieses Tabs, statt den Spieler doppelt anzuzeigen.
const clientId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

// Pflichtfeld: ohne "Name im Würfelraum" wird nicht verbunden
function playerName() {
  const { settings } = useSettingsStore()
  return String(settings.dicePlayerName || '').trim().slice(0, 30)
}

function slugifyRoom(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function open() {
  clearTimeout(retryTimer)
  if (!wanted) return
  state.status = 'connecting'
  const query = new URLSearchParams({ name: wanted.name, id: clientId })
  const url = `${DICE_SERVER.replace(/^http/, 'ws')}/api/room/${wanted.room}/ws?${query}`
  const ws = new WebSocket(url)
  socket = ws

  // Eine alte, gerade schließende Verbindung darf die neue nicht beeinflussen.
  ws.onopen = () => {
    if (socket !== ws) return
    retryDelay = 1000
    state.status = 'connected'
    clearInterval(pingTimer)
    pingTimer = setInterval(() => ws.readyState === 1 && ws.send('ping'), 30000)
  }

  ws.onmessage = (event) => {
    if (socket !== ws || event.data === 'pong') return
    const msg = JSON.parse(event.data)
    if (msg.type === 'presence') state.players = msg.players
    if (msg.type === 'welcome') {
      state.server = { version: msg.version, systems: msg.systems || [] }
      state.roomSystem = msg.system || null
      sendProfile()
    }
    if (msg.type === 'room') state.roomSystem = msg.system
    if (msg.type === 'roll') {
      const own = takePending(msg.roll.requestId, msg.roll.player === wanted?.name)
      if (own) showOwnResult(msg.roll, own.options)
    }
    if (msg.type === 'error') {
      // Fehler ohne Kennung (z. B. ungültige Nachricht) gehören zu keinem Wurf
      if (msg.requestId || !state.server) takePending(msg.requestId, true)?.options?.onError?.(msg.message)
      Notify.create({ message: `Würfelraum: ${msg.message}`, color: 'negative', icon: 'error' })
    }
  }

  ws.onclose = () => {
    if (socket !== ws) return
    clearInterval(pingTimer)
    socket = null
    flushPending('Verbindung zum Würfelraum getrennt')
    state.status = 'disconnected'
    state.players = []
    state.server = null
    state.roomSystem = null
    if (wanted) {
      retryTimer = setTimeout(open, retryDelay)
      retryDelay = Math.min(retryDelay * 2, 15000)
    }
  }
}

function connect(room, name) {
  disconnect()
  wanted = { room, name }
  open()
}

// Wer auf ein Ergebnis wartet, erfährt, dass keins mehr kommt. Sonst würde das nächste
// Ergebnis (evtl. in einem anderen Raum) den Optionen eines alten Wurfs zugeordnet.
function flushPending(reason) {
  const waiting = pending
  pending = []
  for (const entry of waiting) entry.options?.onError?.(reason)
}

// Eigenen wartenden Wurf zu einem Ergebnis finden. Neuer Server: über die Kennung (requestId),
// damit zwei Geräte mit demselben Namen sich nicht die Ergebnisse wegnehmen. Älterer Server
// ohne Kennung: wie früher der älteste eigene Wurf, wenn der Name passt (legacyMatch).
function takePending(requestId, legacyMatch) {
  if (requestId) {
    const index = pending.findIndex((p) => p.requestId === requestId)
    return index >= 0 ? pending.splice(index, 1)[0] : null
  }
  return legacyMatch && !state.server ? pending.shift() : null
}

function disconnect() {
  flushPending('Würfelraum gewechselt')
  wanted = null
  clearTimeout(retryTimer)
  clearInterval(pingTimer)
  const ws = socket
  socket = null
  ws?.close()
  state.status = 'disconnected'
  state.players = []
  state.server = null
  state.roomSystem = null
}

// Avatar an den Raum schicken (ab Würfelraum-Version 2; ältere Server kennen das nicht)
function sendProfile() {
  if (socket?.readyState !== 1 || (state.server?.version ?? 1) < 2) return
  // Wird gerade der Raum gewechselt (z. B. anderer Bogen mit anderem Raum), nicht in den alten Raum
  // schicken – das welcome des neuen Raums schickt den Avatar ohnehin
  if (wanted?.room !== slugifyRoom(useSettingsStore().currentRoom)) return
  socket.send(JSON.stringify({ type: 'profile', avatar }))
}

// Vom Bogen aufgerufen, wenn sich das Portrait ändert (oder System/Charakter wechselt)
export function setDiceAvatar(dataUrl) {
  if ((dataUrl || '') === avatar) return
  avatar = dataUrl || ''
  sendProfile()
}

// Portrait auf ein kleines Vorschaubild verkleinern (Würfelraum-Avatar, ca. 3–5 KB)
export function makeThumbnail(dataUrl, size = 64) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      // Mittiges Quadrat (Portraits sind schon quadratisch, andere Bilder werden beschnitten)
      const side = Math.min(image.naturalWidth, image.naturalHeight)
      ctx.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, size, size)
      let data = canvas.toDataURL('image/webp', 0.8)
      if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', 0.8)
      resolve(data)
    }
    image.onerror = () => resolve('')
    image.src = dataUrl
  })
}

function send(payload, options) {
  if (socket?.readyState !== 1) return false
  const requestId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  pending.push({ requestId, options })
  socket.send(JSON.stringify({ ...payload, requestId }))
  return true
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

// "3d10kh2+4: [6d, 8, 9]+4 = 21" -> "[<s>6</s>, 8, 9] +4 = 21"
// Suffix d = weggefallen, ^ = auf Mindestwert angehoben (Proven)
export function diceHtml(output) {
  // "floor((…)/2)" (halber Schaden, z. B. Instabil) ohne das technische floor
  const body = escapeHtml(
    output.slice(output.indexOf(':') + 1).trim().replace(/^floor\((.*)\)(\s*=)/, '$1$2')
  )
  return body.replace(/\[([^\]]*)\]/g, (_, dice) =>
    `[${dice
      .split(',')
      .map((d) => d.trim())
      .map((d) => {
        const value = d.replace(/[d^]+$/, '')
        const flags = d.slice(value.length)
        const text = flags.includes('^') ? `<u>${value}</u>` : value
        return flags.includes('d') ? `<s style="opacity:.6">${text}</s>` : text
      })
      .join(', ')}]`
  )
}

// Ergebnis des eigenen Wurfs anzeigen. Das System kann über options.present(roll)
// eine eigene Anzeige liefern (Quasar-Notify-Optionen), sonst wird neutral angezeigt.
function showOwnResult(roll, options = {}) {
  const custom = options.present?.(roll)
  if (custom === false) return
  Notify.create({
    html: true,
    message: escapeHtml(`${roll.label || 'Wurf'}: ${roll.total}`),
    caption: diceHtml(roll.output || ''),
    color: 'grey-9',
    icon: 'casino',
    position: 'top',
    timeout: 4000,
    ...custom
  })
}

// Einmal in App.vue aufrufen: verbindet/trennt passend zu den Einstellungen.
export function initDiceRoom() {
  const settingsStore = useSettingsStore()
  let typingTimer = null

  function apply() {
    const room = slugifyRoom(settingsStore.currentRoom)
    const name = playerName()
    if (!settingsStore.settings.diceEnabled || !room || !name) {
      disconnect()
    } else if (wanted?.room !== room || wanted?.name !== name) {
      connect(room, name)
    }
  }

  // Nicht bei jedem getippten Buchstaben neu verbinden, erst wenn kurz Ruhe ist.
  // Der Raum hängt am System: Wechsel zwischen den Bögen verbindet in den Raum des anderen Systems.
  watch(
    () => [settingsStore.currentRoom, settingsStore.settings.dicePlayerName],
    () => {
      clearTimeout(typingTimer)
      typingTimer = setTimeout(apply, 800)
    }
  )
  watch(() => settingsStore.settings.diceEnabled, apply, { immediate: true })
}

// Systemneutral: Das jeweilige Spielsystem legt fest, wie Würfe ausgewertet und angezeigt
// werden (options.present), und ruft onResult(roll) nach dem eigenen Wurf auf.
export function useDiceRoom() {
  const settingsStore = useSettingsStore()

  const connected = computed(() => state.status === 'connected')
  const nameMissing = computed(() => !playerName())
  // Name mitgeben, damit der Würfelraum nicht nach dem Namen fragt
  const roomUrl = computed(() => {
    const query = new URLSearchParams({ raum: slugifyRoom(settingsStore.currentRoom) })
    if (playerName()) query.set('name', playerName())
    return `${DICE_SERVER}/?${query}`
  })

  // W100-Probe auf dem Server (kind "test"), Zielwert wird mitgespeichert
  function test(target, label, options = {}) {
    return send({ type: 'roll', kind: 'test', target: Number(target) || 0, label }, options)
  }

  // Freier Wurf in Würfelnotation, z. B. "1d20" oder "2d10+3"
  function roll(notation, label, options = {}) {
    return send({ type: 'roll', kind: 'free', notation, label }, options)
  }

  // Ab Würfelraum-Version 2: Probe eines Systems. Der Server würfelt, wertet aus und schickt das
  // Ergebnis als roll.outcome mit – im Verlauf sehen alle Erfolg/Misserfolg.
  const supportsChecks = computed(() => (state.server?.version ?? 1) >= 2)
  function check(system, checkName, params, label, options = {}) {
    return send({ type: 'roll', system, check: checkName, ...params, label }, options)
  }

  return { state, connected, nameMissing, roomUrl, test, roll, check, supportsChecks, slugifyRoom }
}
