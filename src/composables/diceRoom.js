// Anbindung an den gemeinsamen Würfelraum (Repo dice-room).
// Gewürfelt wird auf dem Server, alle im Raum sehen den Wurf.
import { computed, reactive, watch } from 'vue'
import { Notify } from 'quasar'
import { useCharacterStore } from '../stores/characterStore'
import { useSettingsStore } from '../stores/settingsStore'

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
      pending.shift()
      Notify.create({ message: `Würfelraum: ${msg.message}`, color: 'negative', icon: 'error' })
    }
  }

  ws.onclose = () => {
    if (socket !== ws) return
    clearInterval(pingTimer)
    socket = null
    pending = []
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

function disconnect() {
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

// Rogue Trader: W100 gleich oder unter Zielwert, je volle 10 Punkte Abstand = 1 Grad.
// Ab AUTO_FAIL_FROM misslingt immer, 01 gelingt immer (gleich wie im Würfelraum).
const AUTO_FAIL_FROM = 95

export function evaluateTest(roll, target) {
  const success = roll < AUTO_FAIL_FROM && (roll === 1 || roll <= target)
  // Automatischer Erfolg/Misserfolg gegen den Zielwert hat keine Grade
  const degrees = success === (roll <= target) ? Math.floor(Math.abs(target - roll) / 10) : 0
  const word = success
    ? degrees === 1 ? 'Erfolgsgrad' : 'Erfolgsgrade'
    : degrees === 1 ? 'Misserfolgsgrad' : 'Misserfolgsgrade'
  return {
    success,
    degrees,
    text: `${success ? 'Erfolg' : 'Misserfolg'}${degrees ? ` · ${degrees} ${word}` : ''}`
  }
}

function hasNaturalTen(output) {
  return [...output.matchAll(/\[([^\]]*)\]/g)].some(([, dice]) =>
    dice.split(',').some((d) => !d.trim().endsWith('d') && parseInt(d, 10) === 10)
  )
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

// "3d10kh2+4: [6d, 8, 9]+4 = 21" -> "[<s>6</s>, 8, 9] +4 = 21"
// Suffix d = weggefallen, ^ = auf Mindestwert angehoben (Proven)
function diceHtml(output) {
  const body = escapeHtml(output.slice(output.indexOf(':') + 1).trim())
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

function showOwnResult(roll, options = {}) {
  if (roll.kind === 'test') {
    const result = evaluateTest(roll.total, roll.target)
    options.onResult?.(roll, result)
    Notify.create({
      message: `${roll.label || 'Probe'}: ${String(roll.total).padStart(2, '0')} gegen ${roll.target}`,
      caption: result.text,
      color: result.success ? 'positive' : 'negative',
      icon: 'casino',
      position: 'top',
      timeout: 4000
    })
    return
  }

  const fury = options.fury && hasNaturalTen(roll.output)
  const needsAnswer = fury && !!options.onFury
  const dice = diceHtml(roll.output)
  Notify.create({
    html: true,
    message: escapeHtml(`${roll.label || 'Wurf'}: ${roll.total}`),
    caption: fury ? `${dice} · 10 gewürfelt – Zorn des Imperators möglich!` : dice,
    color: fury ? 'deep-orange' : 'grey-9',
    icon: fury ? 'local_fire_department' : 'casino',
    position: 'top',
    // Bestätigungsanfragen bleiben stehen, bis man einen der Buttons klickt
    timeout: needsAnswer ? 0 : fury ? 15000 : 4000,
    actions: needsAnswer
      ? [
          { label: 'Bestätigen', color: 'white', handler: () => options.onFury(roll) },
          { label: 'Ignorieren', color: 'white' }
        ]
      : []
  })
}

// Einmal in App.vue aufrufen: verbindet/trennt passend zu den Einstellungen.
export function initDiceRoom() {
  const settingsStore = useSettingsStore()
  let typingTimer = null

  function apply() {
    const room = slugifyRoom(settingsStore.settings.diceRoom)
    const name = playerName()
    if (!settingsStore.settings.diceEnabled || !room || !name) {
      disconnect()
    } else if (wanted?.room !== room || wanted?.name !== name) {
      connect(room, name)
    }
  }

  // Nicht bei jedem getippten Buchstaben neu verbinden, erst wenn kurz Ruhe ist
  watch(
    () => [settingsStore.settings.diceRoom, settingsStore.settings.dicePlayerName],
    () => {
      clearTimeout(typingTimer)
      typingTimer = setTimeout(apply, 800)
    }
  )
  watch(() => settingsStore.settings.diceEnabled, apply, { immediate: true })
}

export function useDiceRoom() {
  const settingsStore = useSettingsStore()
  const characterStore = useCharacterStore()

  const connected = computed(() => state.status === 'connected')
  const nameMissing = computed(() => !playerName())
  // Name mitgeben, damit der Würfelraum nicht nach dem Namen fragt
  const roomUrl = computed(() => {
    const query = new URLSearchParams({ raum: slugifyRoom(settingsStore.settings.diceRoom) })
    if (playerName()) query.set('name', playerName())
    return `${DICE_SERVER}/?${query}`
  })

  // Probe auf einen Zielwert. Erschöpfung (-10) wird automatisch abgezogen.
  // onResult(roll, evaluation) wird nach dem eigenen Wurf aufgerufen.
  function test(target, label, { onResult } = {}) {
    let finalTarget = Number(target) || 0
    let finalLabel = label
    if (characterStore.character.exhaustion > 0) {
      finalTarget -= 10
      finalLabel = `${label} (−10 Erschöpfung)`
    }
    return send(
      { type: 'roll', kind: 'test', target: finalTarget, label: finalLabel },
      { onResult }
    )
  }

  // fury: eine gewürfelte 10 hervorheben; onFury(roll): Handler für "Bestätigen".
  function roll(notation, label, { fury = false, onFury } = {}) {
    return send({ type: 'roll', kind: 'free', notation, label }, { fury, onFury })
  }

  return { state, connected, nameMissing, roomUrl, test, roll, slugifyRoom }
}
