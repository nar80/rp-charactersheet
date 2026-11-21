<template>
  <q-dialog :model-value="modelValue" persistent :maximized="$q.screen.lt.sm" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="wizard-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Neuer Charakter</div>
        <q-space />
        <q-chip dense square :color="useRoom ? 'positive' : 'grey-8'" :icon="useRoom ? 'wifi' : 'wifi_off'">
          {{ useRoom ? 'Würfe im Würfelraum' : 'Würfe lokal' }}
        </q-chip>
        <q-btn flat round dense icon="close" @click="close" />
      </q-card-section>

      <q-stepper v-model="step" flat animated header-nav alternative-labels class="wizard-stepper">
        <!-- 1: Name & Hintergrund -->
        <q-step :name="1" title="Herkunft" icon="badge" :done="!!(draft.firstName && draft.background)">
          <div class="text-caption text-grey-6 q-mb-md">
            Wähle oder würfle Name und Hintergrund (S. 7). Der Hintergrund sagt, was deine Figur kann und weiß.
            Diese Würfe bleiben lokal.
          </div>
          <div class="row q-col-gutter-sm">
            <WizardField v-model="draft.firstName" label="Vorname" :options="firstNames" hint="1W20 Zeile, 1W3 Spalte" class="col-12 col-sm-6" @roll="rollFirstName" />
            <WizardField v-model="draft.lastName" label="Nachname" :options="lastNames" hint="1W20" class="col-12 col-sm-6" @roll="draft.lastName = pick(lastNames)" />
            <WizardField v-model="draft.background" label="Hintergrund" :options="backgrounds" hint="1W20" class="col-12 col-sm-6" @roll="draft.background = pick(backgrounds)" />
            <WizardField v-model="draft.origin" label="Herkunft (optional)" :options="origins" hint="1W8" class="col-12 col-sm-6" @roll="draft.origin = pick(origins)" />
          </div>
          <q-btn class="q-mt-md" outline no-caps icon="casino" label="Alles würfeln" @click="rollStep1" />
        </q-step>

        <!-- 2: Attribute, TP, Alter -->
        <q-step :name="2" title="Werte" icon="fitness_center" :done="attributesDone && draft.hp != null">
          <div class="text-caption text-grey-6 q-mb-md">
            3W6 für ST, GE und WK – in dieser Reihenfolge. Danach dürfen zwei Werte getauscht werden.
            TP: 1W6, Alter: 2W20+10 (S. 5).
          </div>
          <div class="row q-col-gutter-sm">
            <div v-for="attr in ATTRIBUTES" :key="attr.key" class="col-4">
              <div class="value-box text-center" :class="{ selected: swapPick.includes(attr.key) }" @click="toggleSwap(attr.key)">
                <div class="value-label">{{ attr.key }}</div>
                <div class="value-number">{{ draft.attributes[attr.key] ?? '–' }}</div>
                <div class="text-caption text-grey-6">{{ diceText(draft.attributeDice[attr.key]) || attr.name }}</div>
              </div>
            </div>
          </div>
          <div class="row q-gutter-sm q-mt-sm items-center">
            <q-btn
              outline no-caps icon="casino"
              :label="attributesDone ? 'Attribute neu würfeln' : 'Attribute würfeln (3× 3W6)'"
              :loading="busy"
              :disable="draft.swapped != null"
              @click="rollAttributes"
            />
            <template v-if="attributesDone">
              <q-btn
                v-if="draft.swapped == null"
                flat no-caps icon="swap_horiz"
                :label="swapPick.length === 2 ? `${swapPick[0]} ↔ ${swapPick[1]} tauschen` : 'Zwei Werte antippen zum Tauschen'"
                :disable="swapPick.length !== 2"
                @click="swap"
              />
              <q-btn v-else flat no-caps icon="undo" :label="`Tausch ${draft.swapped.join(' ↔ ')} rückgängig`" @click="unswap" />
            </template>
          </div>

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col-6">
              <div class="value-box text-center">
                <div class="value-label">TP</div>
                <div class="value-number">{{ draft.hp ?? '–' }}</div>
                <q-btn flat dense no-caps size="sm" icon="casino" label="1W6" :loading="busy" @click="rollHp" />
              </div>
            </div>
            <div class="col-6">
              <div class="value-box text-center">
                <div class="value-label">Alter</div>
                <div class="value-number">{{ draft.age ?? '–' }}</div>
                <q-btn flat dense no-caps size="sm" icon="casino" label="2W20+10" :loading="busy" @click="rollAge" />
              </div>
            </div>
          </div>
        </q-step>

        <!-- 3: Merkmale -->
        <q-step :name="3" title="Merkmale" icon="face" :done="traitsDone">
          <div class="text-caption text-grey-6 q-mb-md">Aussehen, Sprechweise, Tugend, Laster, Ruf und Unglück (S. 8). Lokal gewürfelt.</div>
          <div class="row q-col-gutter-sm">
            <WizardField
              v-for="t in traits"
              :key="t.key"
              v-model="draft.traits[t.key]"
              :label="t.label"
              :options="t.values"
              :hint="`1W${t.values.length}`"
              class="col-6 col-sm-4"
              @roll="draft.traits[t.key] = pick(t.values)"
            />
          </div>
          <q-btn class="q-mt-md" outline no-caps icon="casino" label="Alle Merkmale würfeln" @click="rollTraits" />
        </q-step>

        <!-- 4: Ausrüstung -->
        <q-step :name="4" title="Ausrüstung" icon="backpack" :done="gearDone">
          <div class="text-caption text-grey-6 q-mb-md">
            Alle beginnen mit Rationen (3 Tage), einer Fackel und 3W6 Goldstücken. Dann je ein Wurf auf jeder
            Tabelle (S. 9). Gibt ein Ergebnis mehrere Gegenstände her, wähle einen davon.
          </div>

          <q-list bordered separator class="rounded-borders">
            <q-item>
              <q-item-section avatar><q-icon name="savings" /></q-item-section>
              <q-item-section>
                <q-item-label>Goldstücke</q-item-label>
                <q-item-label caption>{{ draft.gold != null ? `${draft.gold} GM · ${diceText(draft.goldDice)}` : '3W6' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense round icon="casino" :loading="busy" @click="rollGold" />
              </q-item-section>
            </q-item>

            <q-item v-for="row in gearRows" :key="row.key">
              <q-item-section avatar><q-icon :name="row.icon" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ row.label }} <span class="text-grey-6 text-caption">W{{ row.die }}</span></q-item-label>
                <q-item-label v-if="draft.gear[row.key].roll == null" caption>noch nicht gewürfelt</q-item-label>
                <template v-else>
                  <q-item-label caption>Wurf: {{ draft.gear[row.key].roll }}</q-item-label>
                  <GearChoice v-model="draft.gear[row.key].choice" :options="draft.gear[row.key].options" :pick-one="draft.gear[row.key].pickOne" />
                </template>
              </q-item-section>
              <q-item-section side top>
                <q-btn flat dense round icon="casino" :loading="busy" @click="rollGear(row.key)" />
              </q-item-section>
            </q-item>

            <!-- Bonusgegenstand: erst Kategorie, dann ggf. Tabelle wählen und darauf würfeln -->
            <q-item>
              <q-item-section avatar><q-icon name="redeem" /></q-item-section>
              <q-item-section>
                <q-item-label>Bonusgegenstand <span class="text-grey-6 text-caption">W20</span></q-item-label>
                <q-item-label v-if="bonus.roll == null" caption>noch nicht gewürfelt</q-item-label>
                <template v-else>
                  <q-item-label caption>Wurf: {{ bonus.roll }} – {{ bonusKind.label }}</q-item-label>
                  <q-option-group
                    v-if="bonusKind.tables.length > 1"
                    v-model="bonus.table"
                    :options="bonusKind.tables.map((t) => ({ label: TABLES[t].label, value: t }))"
                    inline dense
                    @update:model-value="bonus.sub = emptyRow()"
                  />
                  <div class="row items-center q-gutter-sm">
                    <q-btn
                      outline dense no-caps size="sm" icon="casino"
                      :label="`Auf ${TABLES[bonus.table].label} würfeln (W${TABLES[bonus.table].die})`"
                      :loading="busy"
                      @click="rollBonusSub"
                    />
                    <span v-if="bonus.sub.roll != null" class="text-caption">Wurf: {{ bonus.sub.roll }}</span>
                  </div>
                  <GearChoice v-if="bonus.sub.roll != null" v-model="bonus.sub.choice" :options="bonus.sub.options" :pick-one="bonus.sub.pickOne" />
                </template>
              </q-item-section>
              <q-item-section side top>
                <q-btn flat dense round icon="casino" :loading="busy" @click="rollBonus" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn class="q-mt-md" outline no-caps icon="casino" label="Alles würfeln" :loading="busy" @click="rollAllGear" />
        </q-step>

        <!-- 5: Übersicht -->
        <q-step :name="5" title="Fertig" icon="check">
          <div class="text-h6">{{ fullName || 'Namenlos' }}</div>
          <div class="text-grey-5 q-mb-md">
            {{ [draft.background, draft.origin && `aus: ${draft.origin}`, draft.age && `${draft.age} Jahre`].filter(Boolean).join(' · ') }}
          </div>
          <div class="row q-col-gutter-sm q-mb-md">
            <div v-for="attr in ATTRIBUTES" :key="attr.key" class="col-3">
              <div class="value-box text-center">
                <div class="value-label">{{ attr.key }}</div>
                <div class="value-number">{{ draft.attributes[attr.key] ?? '–' }}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="value-box text-center">
                <div class="value-label">TP</div>
                <div class="value-number">{{ draft.hp ?? '–' }}</div>
              </div>
            </div>
          </div>
          <div class="text-subtitle2">Ausrüstung ({{ gearSlots }} / {{ INVENTORY_SLOTS }} Plätze) · {{ draft.gold ?? 0 }} GM</div>
          <div class="text-caption text-grey-6">Antippen zum Weglassen, nochmal antippen zum Behalten.</div>
          <div class="q-mb-md">
            <q-chip
              v-for="(item, i) in finalGear"
              :key="i"
              dense
              square
              clickable
              :class="{ 'gear-dropped': dropped.includes(i) }"
              :icon="dropped.includes(i) ? 'block' : undefined"
              @click="toggleDrop(i)"
            >
              {{ item.name }}<span v-if="item.spell">: {{ item.spell }}</span>
              <q-tooltip v-if="spellTexts[item.spell]" max-width="300px">{{ spellTexts[item.spell] }}</q-tooltip>
              <span v-if="item.damage && item.type === 'weapon'" class="q-ml-xs text-grey-5">{{ item.damage.toUpperCase().replace('D', 'W') }}</span>
              <span v-if="item.armor" class="q-ml-xs text-grey-5">+{{ item.armor }}</span>
              <span v-if="item.bulky" class="q-ml-xs text-grey-6">sperrig</span>
            </q-chip>
          </div>
          <q-banner v-if="gearSlots >= INVENTORY_SLOTS" dense rounded class="bg-negative text-white q-mb-md">
            Damit wären alle {{ INVENTORY_SLOTS }} Plätze belegt – laut Regeln fallen die TP dann auf 0.
            Lass etwas weg oder verstaue es später auf einem Transportmittel.
          </q-banner>
          <q-banner v-if="missing.length" dense rounded class="bg-warning text-black q-mb-md">
            Noch offen: {{ missing.join(', ') }}. Du kannst trotzdem übernehmen und den Rest im Bogen eintragen.
          </q-banner>
          <div class="text-caption text-grey-6">
            Übernehmen ersetzt den aktuellen Cairn-Charakter{{ store.character.name ? ` (${store.character.name})` : '' }}.
          </div>
        </q-step>

        <template #navigation>
          <q-stepper-navigation class="row q-gutter-sm">
            <q-btn v-if="step > 1" flat no-caps label="Zurück" @click="step--" />
            <q-space />
            <q-btn v-if="step < 5" color="primary" no-caps label="Weiter" @click="step++" />
            <q-btn v-else color="primary" no-caps icon="check" label="Charakter übernehmen" @click="apply" />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, h } from 'vue'
import { useQuasar, QSelect, QBtn, QOptionGroup } from 'quasar'
import { useCairnStore, ATTRIBUTES, INVENTORY_SLOTS, slotsOf, newId } from '../stores/characterStore'
import { useCairnDice } from '../composables/dice'
import { pick } from '../data/generator'
import {
  firstNames, lastNames, backgrounds, origins, traits, expeditionGear, tools, trinkets,
  weaponTable, armorTable, helmShieldTable, spells, spellTexts
} from '../data/tables'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const store = useCairnStore()
const cairnDice = useCairnDice()
const useRoom = computed(() => cairnDice.connected.value)

// --- kleine Hilfskomponenten ---
// Auswahlfeld mit Würfelknopf (Wähle oder würfle)
const WizardField = (props, { emit }) =>
  h(QSelect, {
    modelValue: props.modelValue,
    'onUpdate:modelValue': (v) => emit('update:modelValue', v),
    // Getippter Text gilt sofort, auch ohne Enter (sonst geht ein eigener Name beim Klick auf „Weiter“ verloren)
    onInputValue: (v) => emit('update:modelValue', v),
    options: props.options,
    label: props.label,
    hint: props.hint,
    filled: true,
    dense: true,
    useInput: true,
    fillInput: true,
    hideSelected: true,
    inputDebounce: 0,
    newValueMode: 'add-unique'
  }, {
    append: () => h(QBtn, { flat: true, dense: true, round: true, size: 'sm', icon: 'casino', onClick: (e) => { e.stopPropagation(); emit('roll') } })
  })
WizardField.props = ['modelValue', 'label', 'options', 'hint']
WizardField.emits = ['update:modelValue', 'roll']

// Ergebnis eines Tabellenwurfs: alle Gegenstände oder einer davon zur Wahl
const itemLabel = (item) =>
  [item.name, item.damage && item.type === 'weapon' ? item.damage.toUpperCase().replace('D', 'W') : '', item.armor ? `+${item.armor} Rüstung` : '', item.bulky ? 'sperrig' : '']
    .filter(Boolean).join(' · ')
const GearChoice = (props, { emit }) => {
  if (!props.options.length) return h('div', { class: 'text-caption text-grey-6' }, 'Nichts')
  if (!props.pickOne) return h('div', { class: 'text-body2' }, props.options.map(itemLabel).join(', '))
  return h(QOptionGroup, {
    modelValue: props.modelValue,
    'onUpdate:modelValue': (v) => emit('update:modelValue', v),
    options: props.options.map((o, i) => ({ label: itemLabel(o), value: i })),
    inline: true,
    dense: true
  })
}
GearChoice.props = ['modelValue', 'options', 'pickOne']
GearChoice.emits = ['update:modelValue']

// --- Tabellen der Startausrüstung ---
const fromRange = (table, roll) => table.find(([from, to]) => roll >= from && roll <= to)[2]
const single = (list) => (roll) => {
  const entry = list[roll - 1]
  return [typeof entry === 'string' ? { name: entry, type: 'gear' } : { type: 'gear', ...entry }]
}
const TABLES = {
  armor: { label: 'Rüstung', icon: 'shield', die: 20, resolve: (r) => fromRange(armorTable, r).map((a) => ({ ...a, type: 'armor' })) },
  helmShield: { label: 'Helme & Schilde', icon: 'security', die: 20, resolve: (r) => fromRange(helmShieldTable, r).map((a) => ({ ...a, type: 'armor' })) },
  weapon: { label: 'Waffen', icon: 'gavel', die: 20, pickOne: true, resolve: (r) => fromRange(weaponTable, r).map((w) => ({ ...w, type: 'weapon' })) },
  expedition: { label: 'Expeditionsausrüstung', icon: 'explore', die: 20, resolve: single(expeditionGear) },
  tools: { label: 'Werkzeuge', icon: 'construction', die: 20, resolve: single(tools) },
  trinkets: { label: 'Krimskrams', icon: 'emoji_objects', die: 20, resolve: single(trinkets) },
  spellbook: { label: 'Zauberbücher', icon: 'auto_stories', die: 100, resolve: (r) => [{ name: 'Zauberbuch', type: 'spellbook', spell: spells[r - 1] }] }
}
const gearRows = ['armor', 'helmShield', 'weapon', 'expedition', 'tools', 'trinkets'].map((key) => ({ key, ...TABLES[key] }))

const BONUS = [
  { to: 5, label: 'Werkzeug oder Krimskrams', tables: ['tools', 'trinkets'] },
  { to: 13, label: 'Expeditionsausrüstung', tables: ['expedition'] },
  { to: 17, label: 'Rüstung oder Waffe', tables: ['armor', 'weapon'] },
  { to: 20, label: 'Zauberbuch', tables: ['spellbook'] }
]

// --- Entwurf ---
const emptyRow = () => ({ roll: null, options: [], pickOne: false, choice: 0 })
const createDraft = () => ({
  firstName: '',
  lastName: '',
  background: '',
  origin: '',
  attributes: { ST: null, GE: null, WK: null },
  attributeDice: {},
  swapped: null,
  hp: null,
  age: null,
  traits: {},
  gold: null,
  goldDice: null,
  gear: Object.fromEntries(gearRows.map((r) => [r.key, emptyRow()])),
  bonus: { roll: null, table: null, sub: emptyRow() }
})

const step = ref(1)
const draft = reactive(createDraft())
const bonus = computed(() => draft.bonus)
const bonusKind = computed(() => BONUS.find((b) => bonus.value.roll <= b.to))
const swapPick = ref([])
const busy = ref(false)

// Jedes Öffnen beginnt eine neue Runde; Würfe aus einer alten Runde werden verworfen
let generation = 0
watch(() => props.modelValue, (open) => {
  if (!open) return
  generation++
  Object.assign(draft, createDraft())
  swapPick.value = []
  step.value = 1
})

const diceText = (dice) => (dice?.length ? `[${dice.join(', ')}]` : '')

// Würfeln über den Würfelraum (oder lokal). Bei Fehlern Hinweis und null.
async function roll(notation, label, { room = true } = {}) {
  const round = generation
  busy.value = true
  try {
    const result = await cairnDice.rollValue(notation, `Erschaffung${fullName.value ? ` ${fullName.value}` : ''}: ${label}`, { room })
    return round === generation ? result : null
  } catch (error) {
    $q.notify({ type: 'negative', position: 'top', message: `Wurf fehlgeschlagen: ${error.message}` })
    return null
  } finally {
    busy.value = false
  }
}

// --- Schritt 1 ---
const fullName = computed(() => [draft.firstName, draft.lastName].filter(Boolean).join(' '))
function rollFirstName() {
  const row = 1 + Math.floor(Math.random() * 20)
  const col = 1 + Math.floor(Math.random() * 3)
  draft.firstName = firstNames[(row - 1) * 3 + (col - 1)]
}
function rollStep1() {
  rollFirstName()
  draft.lastName = pick(lastNames)
  draft.background = pick(backgrounds)
  draft.origin = pick(origins)
}

// --- Schritt 2 ---
const attributesDone = computed(() => ATTRIBUTES.every((a) => draft.attributes[a.key] != null))
async function rollAttributes() {
  // Erst alle drei würfeln, dann gemeinsam übernehmen – scheitert ein Wurf, bleibt der alte Satz komplett
  const rolled = []
  for (const attr of ATTRIBUTES) {
    const r = await roll('3d6', `${attr.name} (3W6)`)
    if (!r) return
    rolled.push([attr.key, r])
  }
  for (const [key, r] of rolled) {
    draft.attributes[key] = r.total
    draft.attributeDice[key] = r.dice
  }
  swapPick.value = []
}
function toggleSwap(key) {
  if (!attributesDone.value || draft.swapped) return
  const pickList = swapPick.value
  swapPick.value = pickList.includes(key) ? pickList.filter((k) => k !== key) : [...pickList, key].slice(-2)
}
function exchange([a, b]) {
  ;[draft.attributes[a], draft.attributes[b]] = [draft.attributes[b], draft.attributes[a]]
  ;[draft.attributeDice[a], draft.attributeDice[b]] = [draft.attributeDice[b], draft.attributeDice[a]]
}
function swap() {
  exchange(swapPick.value)
  draft.swapped = [...swapPick.value]
  swapPick.value = []
}
function unswap() {
  exchange(draft.swapped)
  draft.swapped = null
}
async function rollHp() {
  const r = await roll('1d6', 'TP (1W6)')
  if (r) draft.hp = r.total
}
async function rollAge() {
  const r = await roll('2d20+10', 'Alter (2W20+10)')
  if (r) draft.age = r.total
}

// --- Schritt 3 ---
const traitsDone = computed(() => traits.every((t) => draft.traits[t.key]))
function rollTraits() {
  for (const t of traits) draft.traits[t.key] = pick(t.values)
}

// --- Schritt 4 ---
async function rollTableInto(row, tableKey) {
  const table = TABLES[tableKey]
  const r = await roll(`1d${table.die}`, `${table.label} (W${table.die})`)
  if (!r) return false
  Object.assign(row, { roll: r.total, options: table.resolve(r.total), pickOne: !!table.pickOne, choice: 0 })
  return true
}
const rollGear = (key) => rollTableInto(draft.gear[key], key)
async function rollGold() {
  const r = await roll('3d6', 'Gold (3W6)')
  if (!r) return false
  draft.gold = r.total
  draft.goldDice = r.dice
  return true
}
async function rollBonus() {
  const r = await roll('1d20', 'Bonusgegenstand (W20)')
  if (!r) return false
  draft.bonus.roll = r.total
  draft.bonus.table = BONUS.find((b) => r.total <= b.to).tables[0]
  draft.bonus.sub = emptyRow()
  return true
}
const rollBonusSub = () => rollTableInto(draft.bonus.sub, draft.bonus.table)
// Nur was noch fehlt, der Reihe nach; beim ersten Fehler aufhören
async function rollAllGear() {
  if (draft.gold == null && !(await rollGold())) return
  for (const row of gearRows) {
    if (draft.gear[row.key].roll == null && !(await rollGear(row.key))) return
  }
  if (draft.bonus.roll == null && !(await rollBonus())) return
  if (draft.bonus.sub.roll == null) await rollBonusSub()
}
const gearDone = computed(() =>
  draft.gold != null && gearRows.every((r) => draft.gear[r.key].roll != null) && draft.bonus.sub.roll != null
)

const chosen = (row) => (row.roll == null ? [] : row.pickOne ? [row.options[row.choice]].filter(Boolean) : row.options)
const finalGear = computed(() => [
  { name: 'Rationen (3 Tage)', type: 'gear' },
  { name: 'Fackel', type: 'gear' },
  ...gearRows.flatMap((r) => chosen(draft.gear[r.key])),
  ...chosen(draft.bonus.sub)
])
// In der Übersicht weggelassene Gegenstände (Index in finalGear); neu gewürfelt = alles wieder drin
const dropped = ref([])
watch(
  () => [...gearRows.map((r) => draft.gear[r.key].roll), draft.bonus.roll, draft.bonus.table, draft.bonus.sub.roll].join('|'),
  () => { dropped.value = [] }
)
const toggleDrop = (i) => {
  dropped.value = dropped.value.includes(i) ? dropped.value.filter((x) => x !== i) : [...dropped.value, i]
}
const keptGear = computed(() => finalGear.value.filter((_, i) => !dropped.value.includes(i)))
const gearSlots = computed(() => keptGear.value.reduce((sum, i) => sum + slotsOf(i), 0))

// --- Übernehmen ---
const missing = computed(() => [
  !fullName.value && 'Name',
  !draft.background && 'Hintergrund',
  !attributesDone.value && 'Attribute',
  draft.hp == null && 'TP',
  !gearDone.value && 'Ausrüstung'
].filter(Boolean))

function apply() {
  store.resetCharacter()
  const c = store.character
  c.name = fullName.value
  c.background = draft.background
  c.origin = draft.origin
  c.age = draft.age
  c.traits = { ...draft.traits }
  c.coins.gold = draft.gold ?? 0
  for (const attr of ATTRIBUTES) {
    const value = draft.attributes[attr.key] ?? 10
    c.attributes[attr.key] = { value, max: value }
  }
  const hp = draft.hp ?? 1
  c.hp = { value: hp, max: hp }
  for (const item of keptGear.value) {
    if (/^Karren/.test(item.name)) {
      // Karren wird mit beiden Händen gezogen (sperrig) und bringt +4 Plätze als Transportmittel (S. 6)
      store.addItem({ ...item, location: 'hands' })
      c.carriers.push({ id: newId(), name: 'Karren', capacity: 4 })
    } else {
      store.addItem({ ...item })
    }
  }
  $q.notify({ type: 'positive', position: 'top', message: `${c.name || 'Charakter'} ist bereit für den Wald` })
  emit('update:modelValue', false)
}

function close() {
  const started =
    fullName.value || draft.background || ATTRIBUTES.some((a) => draft.attributes[a.key] != null) ||
    draft.hp != null || draft.age != null || draft.gold != null || Object.keys(draft.traits).length ||
    gearRows.some((r) => draft.gear[r.key].roll != null) || draft.bonus.roll != null
  if (!started) return emit('update:modelValue', false)
  $q.dialog({ title: 'Abbrechen?', message: 'Die bisherigen Würfe gehen verloren.', cancel: true })
    .onOk(() => emit('update:modelValue', false))
}
</script>

<style scoped>
.wizard-card {
  width: 820px;
  max-width: 96vw;
}
.wizard-stepper {
  background: transparent;
}
.value-box {
  border: 1px solid rgba(var(--accent-rgb), 0.35);
  border-radius: 6px;
  padding: 6px 4px;
  cursor: default;
}
.value-box.selected {
  border-color: var(--imperial-gold);
  background: rgba(var(--accent-rgb), 0.15);
  cursor: pointer;
}
.gear-dropped {
  opacity: 0.45;
  text-decoration: line-through;
}
.value-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.value-number {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.3;
}
</style>
