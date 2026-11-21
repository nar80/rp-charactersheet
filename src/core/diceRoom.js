// Anbindung an den gemeinsamen Würfelraum (Repo dice-room).
// Gewürfelt wird auf dem Server, alle im Raum sehen den Wurf.
import { computed, reactive, watch } from 'vue'
import { Notify } from 'quasar'
import { useSettingsStore } from './settingsStore'

export const DICE_SERVER = import.meta.env.VITE_DICE_SERVER || 'https://dice-room.dice-room.workers.dev'

const state = reactive({ status: 'disconnected', players: [] })

let socket = null
let pingTimer = null
let retryTimer = null
let retryDelay = 1000
let wanted = null
let pending = []
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
    if (msg.type === 'roll' && msg.roll.player === wanted?.name && pending.length) {
      showOwnResult(msg.roll, pending.shift())
    }
    if (msg.type === 'error') {
      pending.shift()?.onError?.(msg.message)
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
  for (const options of waiting) options?.onError?.(reason)
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
}

function send(payload, options) {
  if (socket?.readyState !== 1) return false
  pending.push(options)
  socket.send(JSON.stringify(payload))
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

  return { state, connected, nameMissing, roomUrl, test, roll, slugifyRoom }
}
