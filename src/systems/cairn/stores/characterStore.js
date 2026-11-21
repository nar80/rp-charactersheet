// Cairn-Charakter: 3 Attribute, TP, Rüstung, 10 Inventarplätze (Regeln S. 5–6, 14–19)
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { scars as SCARS } from '../data/tables'

const STORAGE_KEY = 'rp-character-cairn'

export const ATTRIBUTES = [
  { key: 'ST', name: 'Stärke', hint: 'Kraft, Heldenmut, Widerstand, Gift', zero: 'Tod' },
  { key: 'GE', name: 'Geschicklichkeit', hint: 'Ausweichen, Schleichen, Klettern, Reaktion', zero: 'Gelähmt' },
  { key: 'WK', name: 'Willenskraft', hint: 'Überreden, Einschüchtern, Täuschen, Magie', zero: 'Delirium' }
]

// Inventar: 2 Hände, 2 Oberkörper, 6 Rucksack. Was in Händen oder am Körper ist, gilt als getragen.
export const LOCATIONS = [
  { key: 'hands', label: 'Hände', capacity: 2, icon: 'back_hand' },
  { key: 'body', label: 'Körper', capacity: 2, icon: 'accessibility_new' },
  { key: 'pack', label: 'Rucksack', capacity: 6, icon: 'backpack' }
]
export const INVENTORY_SLOTS = 10
export const MAX_ARMOR = 3

export const ITEM_TYPES = [
  { key: 'gear', label: 'Ausrüstung', icon: 'construction' },
  { key: 'weapon', label: 'Waffe', icon: 'gavel' },
  { key: 'armor', label: 'Rüstung', icon: 'shield' },
  { key: 'spellbook', label: 'Zauberbuch', icon: 'auto_stories' },
  { key: 'scroll', label: 'Schriftrolle', icon: 'history_edu' },
  { key: 'relic', label: 'Relikt', icon: 'diamond' },
  { key: 'fatigue', label: 'Erschöpfung', icon: 'bedtime' }
]

export const newId = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

export const createItem = (data = {}) => ({
  id: newId(),
  name: '',
  type: 'gear',
  bulky: false,
  location: 'pack',
  damage: 'd6',
  armor: 0,
  spell: '',
  charges: null, // { value, max } für Relikte
  notes: '',
  ...data
})

// Schriftrollen belegen keinen Platz (S. 16), sperrige Gegenstände zwei
export const slotsOf = (item) => (item.type === 'scroll' ? 0 : item.bulky ? 2 : 1)

const createDefaultCharacter = () => ({
  name: '',
  portrait: '', // Data-URL, 256×256
  age: null,
  background: '',
  origin: '',
  traits: {},
  coins: { gold: 0, silver: 0, copper: 0 },
  attributes: {
    ST: { value: 10, max: 10 },
    GE: { value: 10, max: 10 },
    WK: { value: 10, max: 10 }
  },
  hp: { value: 3, max: 3 },
  deprived: false, // Bedrängt
  incapacitated: false, // Außer Gefecht (kritischer Schaden, Tödliche Wunde)
  doomed: false, // Verdammt: nächster misslungener Rettungswurf gegen kritischen Schaden tötet
  dead: false, // Tot (z. B. durch Verdammt); ST 0 zählt ebenfalls als Tod
  inventory: [],
  carriers: [], // Transportmittel { id, name, capacity }
  transportItems: [],
  scars: [], // Verletzungen { id, index, note, results: { [stepKey]: { roll, text, success? } } }
  notes: ''
})

// Gespeicherte Daten auf das aktuelle Schema heben (neue Felder bekommen Standardwerte)
function normalize(data) {
  const base = createDefaultCharacter()
  const merged = { ...base, ...data }
  merged.coins = { ...base.coins, ...data?.coins }
  merged.hp = { ...base.hp, ...data?.hp }
  merged.attributes = Object.fromEntries(
    Object.entries(base.attributes).map(([key, value]) => [key, { ...value, ...data?.attributes?.[key] }])
  )
  merged.traits = { ...data?.traits }
  // Listen und Gegenstände absichern: kaputte oder handbearbeitete Dateien dürfen den Bogen nicht zerschießen
  const list = (value) => (Array.isArray(value) ? value.filter((x) => x && typeof x === 'object') : [])
  const item = (raw) => {
    const it = createItem(raw)
    it.name = String(it.name ?? '')
    if (!LOCATIONS.some((l) => l.key === it.location)) it.location = 'pack'
    return it
  }
  merged.inventory = list(data?.inventory).map(item)
  merged.transportItems = list(data?.transportItems).map(item)
  merged.carriers = list(data?.carriers).map((c) => ({ id: newId(), name: '', capacity: 0, ...c }))
  merged.scars = list(data?.scars).map((scar) => ({ note: '', ...scar, results: { ...scar.results } }))
  return merged
}

export const useCairnStore = defineStore('cairnCharacter', () => {
  const character = ref(createDefaultCharacter())

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) character.value = normalize(JSON.parse(stored))
  } catch (error) {
    console.error('Cairn-Charakter konnte nicht geladen werden:', error)
  }

  watch(character, () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character.value))
    } catch {
      // Speicher nicht verfügbar (Privatmodus) – gilt dann nur für diese Sitzung
    }
  }, { deep: true })

  // --- Inventar ---
  const usedSlots = computed(() =>
    Object.fromEntries(
      LOCATIONS.map((loc) => [
        loc.key,
        character.value.inventory.filter((i) => i.location === loc.key).reduce((sum, i) => sum + slotsOf(i), 0)
      ])
    )
  )
  const totalSlots = computed(() => Object.values(usedSlots.value).reduce((a, b) => a + b, 0))
  // Volles Inventar: TP fallen auf 0 (S. 6)
  const inventoryFull = computed(() => totalSlots.value >= INVENTORY_SLOTS)
  const fatigue = computed(() => character.value.inventory.filter((i) => i.type === 'fatigue').length)

  const transportCapacity = computed(() => character.value.carriers.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0))
  const transportUsed = computed(() => character.value.transportItems.reduce((sum, i) => sum + slotsOf(i), 0))

  const freeIn = (location) => LOCATIONS.find((l) => l.key === location).capacity - usedSlots.value[location]

  // Waffen und Schilde in die Hände, Rüstung an den Körper, sonst in den Rucksack – wo Platz ist
  function placeFor(item) {
    const preferred =
      item.type === 'weapon' || /schild/i.test(item.name) ? 'hands'
        : item.type === 'armor' ? 'body'
          : 'pack'
    const order = [preferred, ...['pack', 'body', 'hands'].filter((l) => l !== preferred)]
    return order.find((l) => freeIn(l) >= slotsOf(item)) || 'pack'
  }

  function addItem(data) {
    const item = createItem(data)
    if (!data.location) item.location = placeFor(item)
    character.value.inventory.push(item)
    return item
  }

  function removeItem(id) {
    character.value.inventory = character.value.inventory.filter((i) => i.id !== id)
  }

  function moveToTransport(id) {
    const item = character.value.inventory.find((i) => i.id === id)
    if (!item) return
    removeItem(id)
    character.value.transportItems.push(item)
  }

  // Transportmittel entfernen; ohne Transportmittel kommen die Gegenstände zurück ins Inventar
  function removeCarrier(id) {
    character.value.carriers = character.value.carriers.filter((c) => c.id !== id)
    if (!character.value.carriers.length) {
      for (const it of [...character.value.transportItems]) moveFromTransport(it.id)
    }
  }

  function moveFromTransport(id) {
    const item = character.value.transportItems.find((i) => i.id === id)
    if (!item) return
    character.value.transportItems = character.value.transportItems.filter((i) => i.id !== id)
    item.location = placeFor(item)
    character.value.inventory.push(item)
  }

  // Erschöpfung belegt einen Platz, bevorzugt im Rucksack
  function addFatigue(count = 1) {
    for (let n = 0; n < count; n++) {
      addItem({ name: 'Erschöpfung', type: 'fatigue', location: ['pack', 'body', 'hands'].find((l) => freeIn(l) >= 1) || 'pack' })
    }
  }

  // --- Rüstung & Zustände ---
  const armor = computed(() =>
    Math.min(
      MAX_ARMOR,
      character.value.inventory
        .filter((i) => i.location !== 'pack')
        .reduce((sum, i) => sum + (Number(i.armor) || 0), 0)
    )
  )

  const conditions = computed(() => {
    const list = ATTRIBUTES.filter((a) => character.value.attributes[a.key].value <= 0).map((a) => a.zero)
    if (character.value.dead && !list.includes('Tod')) list.unshift('Tod')
    if (character.value.incapacitated) list.push('Außer Gefecht')
    if (character.value.doomed) list.push('Verdammt')
    if (character.value.deprived) list.push('Bedrängt')
    if (inventoryFull.value) list.push('Inventar voll')
    return list
  })

  watch(inventoryFull, (full) => {
    if (full) character.value.hp.value = 0
  }, { immediate: true })

  // Aktuelle TP nie über dem Maximum (z. B. wenn max. TP von Hand gesenkt wird)
  watch(() => character.value.hp.max, (max) => {
    if (character.value.hp.value > max) character.value.hp.value = max
  })

  // Schaden nehmen (S. 17–18): Rüstung abziehen, dann TP, Rest geht auf ST.
  // Ergebnis sagt, ob eine Verletzung (TP genau 0) oder ein ST-Rettungswurf (kritisch) fällig ist.
  function takeDamage(amount, { ignoreArmor = false } = {}) {
    const raw = Math.max(0, Math.trunc(Number(amount) || 0))
    const dealt = Math.max(0, raw - (ignoreArmor ? 0 : armor.value))
    const hp = character.value.hp
    const before = hp.value
    const remaining = before - dealt
    let overflow = 0
    if (remaining >= 0) {
      hp.value = remaining
    } else {
      hp.value = 0
      overflow = -remaining
      const st = character.value.attributes.ST
      st.value = Math.max(0, st.value - overflow)
    }
    return {
      raw,
      dealt,
      before,
      overflow,
      scar: dealt > 0 && remaining === 0,
      critical: overflow > 0
    }
  }

  // Verletzung eintragen; Zustände wie Bedrängt gelten sofort (S. 20)
  function addScar(index, note = '') {
    character.value.scars.push({ id: newId(), index, note, results: {} })
    Object.assign(character.value, SCARS[index]?.onAdd)
  }

  // Ergebnis eines Verletzungs-Schritts eintragen und anwenden. Gibt den Text fürs Protokoll zurück.
  function applyScarStep(scarId, step, total, extra = {}) {
    const scar = character.value.scars.find((s) => s.id === scarId)
    if (!scar) return ''
    let text = ''
    if (step.type === 'where') {
      text = step.values[total - 1]
    } else if (step.type === 'save') {
      text = extra.success ? 'Erfolg' : 'Misserfolg'
    } else if (step.type === 'max') {
      const target = step.target === 'rolled' ? scar.results.where?.text : step.target
      text = raiseMax(target, total, step.mode)
    }
    scar.results[step.key] = { roll: total, text, ...extra }
    return text
  }

  // Maximum von TP oder Attribut ändern. Bei Attributen steigt der aktuelle Wert mit;
  // TP heilen dadurch nicht (die kommen nur durch Rast zurück), sie werden höchstens gekappt.
  function raiseMax(target, total, mode) {
    const stat = target === 'hp' ? character.value.hp : character.value.attributes[target]
    if (!stat) return 'unbekanntes Ziel'
    const name = target === 'hp' ? 'max. TP' : `max. ${target}`
    const before = stat.max
    let after = before
    // 'current': mit dem aktuellen Wert vergleichen (Kopfwunde: „höher als dein Attributswert“)
    if (mode === 'current') {
      if (total <= stat.value) return `${total} – nicht höher als ${target} ${stat.value}, bleibt`
      const old = stat.value
      stat.value = total
      stat.max = Math.max(stat.max, total)
      return `${target} ${old} → ${total}`
    }
    if (mode === 'add') after = before + total
    else if (mode === 'set') after = total
    else if (total > before) after = total
    if (after === before) return `${total} – nicht höher als ${name} ${before}, bleibt`
    stat.max = after
    const grow = target === 'hp' ? 0 : after - before
    stat.value = Math.max(0, Math.min(after, stat.value + grow))
    return `${name} ${before} → ${after}`
  }

  // Ergebnis des Rettungswurfs gegen kritischen Schaden (S. 18, Verdammt S. 20)
  function resolveCriticalSave(success) {
    const c = character.value
    if (c.doomed) {
      c.doomed = false
      if (!success) {
        c.dead = true
        return 'dead'
      }
      return 'survivedDoom'
    }
    if (!success) c.incapacitated = true
    return success ? 'ok' : 'down'
  }

  // --- Erholung (S. 14–15) ---
  // Bedrängt verhindert die Erholung von TP und Attributen, nicht das Abbauen von Erschöpfung.
  // Ergebnis: was passiert ist (done) und was nicht ging (blocked), für die Meldung.
  function healHp(result) {
    if (character.value.deprived) result.blocked.push('TP (Bedrängt)')
    else if (inventoryFull.value) result.blocked.push('TP (Inventar voll)')
    else {
      character.value.hp.value = character.value.hp.max
      result.done.push('TP voll')
    }
    return result
  }

  // Kurze Rast: TP voll
  function shortRest() {
    return healHp({ done: [], blocked: [] })
  }

  // Nacht an sicherem Ort: Erschöpfung weg, TP voll
  function safeRest() {
    const result = { done: [], blocked: [] }
    const before = character.value.inventory.length
    character.value.inventory = character.value.inventory.filter((i) => i.type !== 'fatigue')
    if (character.value.inventory.length < before) result.done.push('Erschöpfung entfernt')
    return healHp(result)
  }

  // Eine Woche Ruhe mit Heilkundigen: zusätzlich Attribute zurück auf Maximum
  function weekRest() {
    const result = safeRest()
    if (character.value.deprived) result.blocked.push('Attribute (Bedrängt)')
    else {
      for (const attr of Object.values(character.value.attributes)) attr.value = attr.max
      result.done.push('Attribute auf Maximum')
    }
    return result
  }

  // Zauber wirken: Zauberbuch kostet eine Erschöpfung, Schriftrolle verschwindet (S. 16)
  function castSpell(id) {
    const item = character.value.inventory.find((i) => i.id === id)
    if (!item) return
    if (item.type === 'scroll') removeItem(id)
    else addFatigue(1)
  }

  function loadCharacter(data) {
    character.value = normalize(data)
  }

  function resetCharacter() {
    character.value = createDefaultCharacter()
  }

  return {
    character,
    usedSlots,
    totalSlots,
    inventoryFull,
    fatigue,
    transportCapacity,
    transportUsed,
    armor,
    conditions,
    addItem,
    removeItem,
    moveToTransport,
    moveFromTransport,
    removeCarrier,
    addFatigue,
    takeDamage,
    addScar,
    applyScarStep,
    resolveCriticalSave,
    shortRest,
    safeRest,
    weekRest,
    castSpell,
    loadCharacter,
    resetCharacter
  }
})
