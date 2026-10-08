<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">
            <q-icon name="local_fire_department" class="q-mr-sm" />
            Psy-Kräfte
          </div>
          <div class="text-caption text-grey-6">
            Psionische Fähigkeiten und gefährliche Warp-Mächte
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            dense
            icon="sort_by_alpha"
            :color="alphabetSort ? 'primary' : 'grey'"
            @click="alphabetSort = !alphabetSort"
          >
            <q-tooltip>Alphabetisch sortieren</q-tooltip>
          </q-btn>
          <q-btn
            color="primary"
            icon="add"
            label="Psy-Kraft hinzufügen"
            @click="showAddPowerDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="character.psiPowers.length === 0" class="text-center text-grey-6 q-pa-lg">
        <q-icon name="local_fire_department" size="4rem" color="grey-6" />
        <div class="q-mt-md">Keine Psy-Kräfte vorhanden</div>
        <div class="text-caption">Klicke auf "Psy-Kraft hinzufügen" um zu beginnen</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="(power, index) in sortedPowers"
          :key="power.originalIndex"
          class="col-12 col-md-6"
        >
          <q-card bordered flat class="bg-grey-9">
            <q-card-section class="q-pa-sm">
              <div class="row items-center q-mb-xs">
                <div class="col-auto q-pr-xs">
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="info"
                    color="grey-6"
                    @click="showInfoDialog(power)"
                  >
                    <q-tooltip>Details anzeigen</q-tooltip>
                  </q-btn>
                </div>
                <div class="col">
                  <div class="text-subtitle1 text-bold">{{ power.name }}</div>
                  <div class="text-caption text-grey-6">
                    {{ power.discipline || 'Psy-Kraft' }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="edit"
                    color="grey-6"
                    @click="editPower(power.originalIndex)"
                  >
                    <q-tooltip>Bearbeiten</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="delete"
                    color="negative"
                    @click="removePower(power.originalIndex)"
                  >
                    <q-tooltip>Entfernen</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Power Details -->
              <div class="text-caption" style="line-height: 1.5;">
                <span v-if="power.value">
                  <span class="text-grey-6">Wert:</span> <span class="text-bold">{{ power.value }}</span>
                  <span class="q-mx-sm">•</span>
                </span>
                <span v-if="power.range">
                  <span class="text-grey-6">Reichweite:</span> <span class="text-bold">{{ power.range }}</span>
                  <span class="q-mx-sm">•</span>
                </span>
                <span v-if="power.focus">
                  <span class="text-grey-6">Fokus:</span> <span class="text-bold">{{ power.focus }}</span>
                </span>
              </div>

              <!-- Hinterlegte Würfe: Proben und Schaden -->
              <div v-if="power.rolls?.length" class="row q-gutter-xs q-mt-xs">
                <q-btn
                  v-for="roll in power.rolls"
                  :key="roll.id"
                  dense
                  no-caps
                  unelevated
                  size="sm"
                  :color="roll.kind === 'damage' ? 'deep-orange-9' : 'primary'"
                  :text-color="roll.kind === 'damage' ? 'white' : 'dark'"
                  :icon="roll.kind === 'damage' ? 'local_fire_department' : 'casino'"
                  :disable="!dice.connected.value"
                  @click="startRoll(power, roll)"
                >
                  <span class="q-ml-xs">{{ roll.label || (roll.kind === 'damage' ? 'Schaden' : 'Probe') }}:
                    <b>{{ rollDisplay(roll) }}</b></span>
                  <q-tooltip>
                    <template v-if="!dice.connected.value">Würfelraum nicht verbunden</template>
                    <template v-else>
                      {{ roll.kind === 'damage' ? `Schaden würfeln (${damageNotation(roll)})` : `Probe auf ${testTarget(roll)} (${roll.attribute})` }}
                      <template v-if="optionalBonuses(roll.bonuses).length"> – mit Auswahl situativer Boni</template>
                    </template>
                  </q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Add/Edit Power Dialog -->
    <q-dialog v-model="showAddPowerDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingIndex !== null ? 'Psy-Kraft bearbeiten' : 'Psy-Kraft hinzufügen' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newPower.name"
            label="Name"
            filled
            dense
            hint="z.B. 'Gedankenlesen', 'Telekinetischer Stoß'"
          />

          <q-input
            v-model="newPower.discipline"
            label="Disziplin"
            filled
            dense
            hint="z.B. 'Telepathie', 'Telekinese', 'Pyrokinese'"
          />

          <q-input
            v-model="newPower.value"
            label="Wert/Schwierigkeit"
            filled
            dense
            hint="z.B. 'Herausfordend (+0)', 'Schwer (-10)'"
          />

          <q-input
            v-model="newPower.range"
            label="Reichweite"
            filled
            dense
            hint="z.B. '10m', 'Berührung', 'Sichtweite'"
          />

          <q-input
            v-model="newPower.focus"
            label="Fokus-Zeit"
            filled
            dense
            hint="z.B. 'Halbe Aktion', 'Volle Aktion', 'Reaktion'"
          />

          <q-input
            v-model="newPower.description"
            label="Wirkung/Beschreibung"
            type="textarea"
            filled
            rows="5"
          />

          <!-- Würfe: Proben und Schaden mit eigenen Boni -->
          <div>
            <div class="text-subtitle1">Würfe</div>
            <div class="text-caption text-grey-6 q-mb-sm">
              Erscheinen als Knöpfe auf der Karte. Werte für den aktuellen Rang eintragen.
            </div>
            <q-card
              v-for="(roll, i) in newPower.rolls"
              :key="roll.id"
              flat
              bordered
              class="q-pa-sm q-mb-sm"
            >
              <div class="row items-center q-col-gutter-sm">
                <!-- Art steht fest, sie ergibt sich aus "Probe/Schaden hinzufügen" -->
                <div
                  class="col-auto text-bold"
                  :class="roll.kind === 'damage' ? 'text-deep-orange' : 'text-primary'"
                >
                  <q-icon :name="roll.kind === 'damage' ? 'local_fire_department' : 'casino'" />
                  {{ roll.kind === 'damage' ? 'Schaden' : 'Probe' }}
                </div>
                <div class="col">
                  <q-input
                    v-model="roll.label"
                    :label="roll.kind === 'damage' ? 'Bezeichnung (z. B. Schaden)' : 'Bezeichnung (z. B. Lidloser Blick)'"
                    filled
                    dense
                    maxlength="40"
                  />
                </div>
                <div class="col-auto">
                  <q-btn flat dense round size="sm" icon="delete" color="grey-6" @click="newPower.rolls.splice(i, 1)" />
                </div>
              </div>

              <div class="row q-col-gutter-sm q-mt-xs">
                <template v-if="roll.kind === 'test'">
                  <div class="col-6">
                    <q-select
                      v-model="roll.attribute"
                      :options="attributeOptions"
                      label="Attribut"
                      filled
                      dense
                      emit-value
                      map-options
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model.number="roll.modifier"
                      type="number"
                      label="Modifikator"
                      hint="z. B. -10 für Schwer"
                      filled
                      dense
                    />
                  </div>
                </template>
                <div v-else class="col-12">
                  <q-input
                    v-model="roll.damage"
                    label="Schaden"
                    placeholder="z. B. 2W10+4 oder 1W10+WKb"
                    hint="Attributbonus mit „b“: WKb, WAb, … wird eingerechnet"
                    filled
                    dense
                    maxlength="40"
                  />
                </div>
              </div>

              <SituationalBonusEditor
                v-model="roll.bonuses"
                class="q-mt-sm"
                :allow-dice="roll.kind === 'damage'"
                :hint="roll.kind === 'damage'
                  ? 'Zum Anklicken beim Würfeln, z. B. „gegen Dämonen“ +1W10 oder +5.'
                  : 'Zum Anklicken beim Würfeln, z. B. „gegen Dämonen“ +10.'"
              />
            </q-card>
            <div class="row q-gutter-sm">
              <q-btn flat dense no-caps icon="casino" label="Probe hinzufügen" color="primary" @click="addRoll('test')" />
              <q-btn flat dense no-caps icon="local_fire_department" label="Schaden hinzufügen" color="deep-orange" @click="addRoll('damage')" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelPowerDialog"
          />
          <q-btn
            flat
            label="Speichern"
            color="primary"
            @click="savePower"
            :disable="!newPower.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info Dialog -->
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ currentPower?.name }}</div>
          <div v-if="currentPower?.discipline" class="text-caption text-grey-6">
            {{ currentPower.discipline }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6" v-if="currentPower?.value">
              <div class="text-caption text-grey-6">Wert/Schwierigkeit</div>
              <div class="text-body1">{{ currentPower.value }}</div>
            </div>
            <div class="col-6" v-if="currentPower?.range">
              <div class="text-caption text-grey-6">Reichweite</div>
              <div class="text-body1">{{ currentPower.range }}</div>
            </div>
            <div class="col-12" v-if="currentPower?.focus">
              <div class="text-caption text-grey-6">Fokus-Zeit</div>
              <div class="text-body1">{{ currentPower.focus }}</div>
            </div>
          </div>
          <div v-if="currentPower?.description" class="q-mt-md">
            <div class="text-caption text-grey-6">Wirkung</div>
            <div class="text-body2" style="white-space: pre-wrap;">{{ currentPower.description }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Schließen"
            color="primary"
            @click="showInfo = false"
          />
          <q-btn
            flat
            label="Bearbeiten"
            color="primary"
            @click="editFromInfo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <SituationalRollDialog
      v-model="showRollDialog"
      :title="rollingTitle"
      :base="rollingBase"
      :bonuses="rolling?.roll.bonuses || []"
      :fixed="rolling ? attributeMods(rolling.roll) : []"
      @roll="sendRoll"
    />
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useCharacterStore } from '../../stores/characterStore'
import { useDiceRoom } from '../../composables/diceRoom'
import {
  addToNotation,
  alwaysBonuses,
  bonusSum,
  cleanBonuses,
  optionalBonuses,
  rollLabel,
  tagAttribute
} from '../../composables/situationalBonuses'
import SituationalBonusEditor from '../SituationalBonusEditor.vue'
import SituationalRollDialog from '../SituationalRollDialog.vue'

const $q = useQuasar()
const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)
const dice = useDiceRoom()

const attributeOptions = [
  { value: 'WK', label: 'Willenskraft (WK)' },
  { value: 'WA', label: 'Wahrnehmung (WA)' },
  { value: 'IN', label: 'Intelligenz (IN)' },
  { value: 'CH', label: 'Charisma (CH)' },
  { value: 'WI', label: 'Widerstand (WI)' },
  { value: 'KG', label: 'Kampfgeschick (KG)' },
  { value: 'BF', label: 'Ballistische Fe. (BF)' },
  { value: 'ST', label: 'Stärke (ST)' },
  { value: 'GE', label: 'Gewandtheit (GE)' }
]

// Würfe einer Psy-Kraft: [{ id, kind: 'test' | 'damage', label, attribute, modifier,
// damage, bonuses: [situative Boni] }]
const newRoll = (kind) => ({
  id: Date.now() + Math.random(),
  kind,
  label: '',
  attribute: 'WK',
  modifier: 0,
  damage: '',
  bonuses: []
})

const addRoll = (kind) => {
  newPower.value.rolls.push(newRoll(kind))
}

// Zielwert einer Probe: Attribut (mit Buffs) + Modifikator + "Immer"-Boni
const testTarget = (roll) =>
  characterStore.getEffectiveAttribute(roll.attribute) +
  (Number(roll.modifier) || 0) +
  bonusSum(alwaysBonuses(roll.bonuses))

// "2W10+WKb" -> "2W10+4" (WK 45). Attributbonus = Zehnerstelle des effektiven Werts.
const damageNotation = (roll) =>
  String(roll.damage || '').replace(/\b(KG|BF|ST|WI|GE|IN|WA|WK|CH)b\b/g, (_, attr) =>
    String(Math.floor(characterStore.getEffectiveAttribute(attr) / 10))
  )

// Buffs und "Immer"-Boni auf die verwendeten Attribute, für den Wurftext.
// Probe: "+20 WK Navigator-Segen", Schaden: "+1 WKb Navigator-Segen"
const attributeMods = (roll) => {
  if (roll.kind !== 'damage') {
    return tagAttribute(roll.attribute, characterStore.attributeModifiers(roll.attribute))
  }
  const attrs = new Set(
    [...String(roll.damage || '').matchAll(/\b(KG|BF|ST|WI|GE|IN|WA|WK|CH)b\b/g)].map(m => m[1])
  )
  return [...attrs].flatMap(attr => characterStore.attributeBonusModifiers(attr))
}

const rollDisplay = (roll) =>
  roll.kind === 'damage'
    ? addToNotation(damageNotation(roll), alwaysBonuses(roll.bonuses))
    : testTarget(roll)

// Würfeln: ohne optionale Boni sofort, sonst erst Auswahl
const showRollDialog = ref(false)
const rolling = ref(null)

const rollName = (power, roll) =>
  roll.label && roll.label !== power.name ? `${power.name} – ${roll.label}` : power.name

const rollingTitle = computed(() =>
  rolling.value ? rollName(rolling.value.power, rolling.value.roll) : ''
)
const rollingBase = computed(() => {
  if (!rolling.value) return 0
  const { roll } = rolling.value
  return roll.kind === 'damage' ? damageNotation(roll) : testTarget(roll)
})

const startRoll = (power, roll) => {
  if (!dice.connected.value) return
  if (!optionalBonuses(roll.bonuses).length) {
    const always = alwaysBonuses(roll.bonuses)
    const label = rollLabel(rollName(power, roll), [...attributeMods(roll), ...always])
    if (roll.kind === 'damage') {
      dice.roll(addToNotation(damageNotation(roll), always), label)
    } else {
      dice.test(testTarget(roll), label)
    }
    return
  }
  rolling.value = { power, roll }
  showRollDialog.value = true
}

const sendRoll = (target, label) => {
  if (rolling.value?.roll.kind === 'damage') {
    dice.roll(target, label)
  } else {
    dice.test(target, label)
  }
}

// Kopie für den Dialog, damit "Abbrechen" nichts verändert
const copyRolls = (rolls = []) =>
  rolls.map(r => ({ ...r, bonuses: (r.bonuses || []).map(b => ({ ...b })) }))

const cleanRolls = (rolls = []) =>
  rolls
    .map(r => ({
      ...r,
      label: String(r.label || '').trim(),
      modifier: Number(r.modifier) || 0,
      damage: String(r.damage || '').trim(),
      bonuses: cleanBonuses(r.bonuses)
    }))
    .filter(r => (r.kind === 'damage' ? r.damage : r.attribute))

const showAddPowerDialog = ref(false)
const editingIndex = ref(null)
const alphabetSort = ref(false)
const showInfo = ref(false)
const currentPower = ref(null)

const newPower = ref({
  name: '',
  discipline: '',
  value: '',
  range: '',
  focus: '',
  description: '',
  rolls: []
})

// Load sort preference
onMounted(() => {
  const saved = localStorage.getItem('psi-sort-alpha')
  if (saved !== null) {
    alphabetSort.value = saved === 'true'
  }
})

// Save sort preference
watch(alphabetSort, (newValue) => {
  localStorage.setItem('psi-sort-alpha', newValue.toString())
})

// Sorted powers
const sortedPowers = computed(() => {
  const powersWithIndex = character.value.psiPowers.map((power, index) => ({
    ...power,
    originalIndex: index
  }))

  if (alphabetSort.value) {
    return powersWithIndex.sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }

  return powersWithIndex
})

const showInfoDialog = (power) => {
  currentPower.value = power
  showInfo.value = true
}

const editFromInfo = () => {
  showInfo.value = false
  editPower(currentPower.value.originalIndex)
}

const savePower = () => {
  if (!newPower.value.name) return

  const power = { ...newPower.value, rolls: cleanRolls(newPower.value.rolls) }
  if (editingIndex.value !== null) {
    // Update existing power
    characterStore.updatePsiPower(editingIndex.value, power)
  } else {
    // Add new power
    characterStore.addPsiPower(power)
  }

  cancelPowerDialog()
}

const editPower = (index) => {
  editingIndex.value = index
  const power = character.value.psiPowers[index]
  newPower.value = { ...power, rolls: copyRolls(power.rolls) }
  showAddPowerDialog.value = true
}

const removePower = (index) => {
  const name = character.value.psiPowers[index]?.name || 'diese Psy-Kraft'
  $q.dialog({
    title: 'Psy-Kraft löschen',
    message: `Willst du die Psy-Kraft "${name}" wirklich löschen?`,
    cancel: 'Abbrechen',
    ok: { label: 'Löschen', color: 'negative' },
    persistent: true
  }).onOk(() => {
    characterStore.removePsiPower(index)
  })
}

const cancelPowerDialog = () => {
  showAddPowerDialog.value = false
  editingIndex.value = null
  newPower.value = {
    name: '',
    discipline: '',
    value: '',
    range: '',
    focus: '',
    description: '',
    rolls: []
  }
}
</script>
