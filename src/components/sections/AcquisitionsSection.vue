<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">
            <q-icon name="inventory_2" class="q-mr-sm" />
            Beschaffungen
          </div>
          <div class="text-caption text-grey-6">
            Erworbene Güter und Beschaffungswürfe
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Neue Beschaffung"
            @click="showAddDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="character.acquisitions.length === 0" class="text-center text-grey-6 q-pa-lg">
        <q-icon name="inventory_2" size="4rem" color="grey-6" />
        <div class="q-mt-md">Noch keine Beschaffungen eingetragen</div>
        <div class="text-caption">Klicke auf "Neue Beschaffung" um zu beginnen</div>
      </div>

      <template v-else>
        <!-- Offene Beschaffungen -->
        <div v-if="openAcquisitions.length > 0" class="q-mb-lg">
          <div class="text-subtitle1 text-bold q-mb-sm">
            <q-icon name="pending" color="warning" class="q-mr-xs" />
            Offene Beschaffungen ({{ openAcquisitions.length }})
          </div>
          <q-timeline color="warning">
            <q-timeline-entry
              v-for="acq in openAcquisitions"
              :key="acq.originalIndex"
              :title="acq.item"
              :subtitle="formatDate(acq.date)"
              icon="inventory_2"
            >
              <template #default>
                <div class="q-mb-sm">
                  <div class="text-body2">
                    <span class="text-grey-6">Gegenstand:</span> <span class="text-bold">{{ acq.item }}</span>
                  </div>
                  <div class="text-body2" v-if="acq.quantity">
                    <span class="text-grey-6">Menge:</span> <span class="text-bold">{{ acq.quantity }}</span>
                  </div>
                </div>

                <!-- Calculated Min Roll -->
                <div class="q-mb-sm q-pa-sm rounded-borders" style="background-color: black; border: 2px solid #d4af37;">
                  <div class="text-body2 text-bold" style="color: #d4af37;">
                    Mindestwurf: {{ minRollFor(acq) }}
                  </div>
                  <div class="text-caption text-grey-4">
                    Profit Factor ({{ character.profitFactor.current }})
                    <span v-if="acq.availabilityMod !== 0"> {{ acq.availabilityMod > 0 ? '+' : '' }}{{ acq.availabilityMod }} ({{ acq.availability }})</span>
                    <span v-if="acq.amountMod !== 0"> {{ acq.amountMod > 0 ? '+' : '' }}{{ acq.amountMod }} ({{ acq.amount }})</span>
                    <span v-if="acq.qualityMod !== 0"> {{ acq.qualityMod > 0 ? '+' : '' }}{{ acq.qualityMod }} ({{ acq.quality }})</span>
                    <span v-if="acq.additionalMod !== 0"> {{ acq.additionalMod > 0 ? '+' : '' }}{{ acq.additionalMod }} (Zusätzlich)</span>
                  </div>
                </div>

                <!-- Attempts -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">
                    Versuche: {{ getAttemptCount(acq) }} von 5
                  </div>

                  <!-- Attempt History -->
                  <div v-if="getAttemptCount(acq) > 0" class="q-mb-sm">
                    <q-list dense bordered class="rounded-borders">
                      <q-item
                        v-for="(attempt, attemptIdx) in getAttempts(acq)"
                        :key="attemptIdx"
                        class="q-pa-sm"
                      >
                        <q-item-section>
                          <q-item-label>
                            <span class="text-bold">Versuch {{ attemptIdx + 1 }}:</span>
                            <span :class="attempt.success ? 'text-positive' : 'text-negative'">
                              {{ attempt.rollResult }} {{ attempt.success ? '✓' : '✗' }}
                            </span>
                            <span v-if="attempt.degrees" class="text-grey-5 q-ml-xs">
                              ({{ attempt.degrees }} {{ attempt.success ? 'EG' : 'MG' }})
                            </span>
                            <span v-if="attempt.rollBonus" class="text-grey-5 q-ml-xs">
                              {{ attempt.rollBonus > 0 ? '+' : '' }}{{ attempt.rollBonus }} Bonus
                            </span>
                            <span class="text-grey-6 q-ml-sm">(Mindestwurf: {{ attempt.calculatedMinRoll }})</span>
                          </q-item-label>
                          <q-item-label caption v-if="attempt.date">
                            {{ formatDateTime(attempt.date) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>

                  <q-btn
                    unelevated
                    dense
                    size="sm"
                    icon="casino"
                    color="primary"
                    class="q-px-sm"
                    :label="getAttemptCount(acq) ? 'Erneut würfeln' : 'Würfeln'"
                    @click="repeatRoll(acq.originalIndex)"
                  />
                </div>

                <!-- Notes -->
                <div v-if="acq.notes" class="text-body2 q-mt-sm">
                  <div class="text-grey-6">Notizen:</div>
                  <div class="q-pl-sm" style="white-space: pre-wrap;">{{ acq.notes }}</div>
                </div>

                <!-- Actions -->
                <div class="q-mt-sm">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="edit"
                    color="grey-6"
                    @click="editAcquisition(acq.originalIndex)"
                  >
                    <q-tooltip>Bearbeiten</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="delete"
                    color="grey-6"
                    @click="removeAcquisition(acq.originalIndex)"
                  >
                    <q-tooltip>Löschen</q-tooltip>
                  </q-btn>
                </div>
              </template>
            </q-timeline-entry>
          </q-timeline>
        </div>

        <!-- Abgeschlossene Beschaffungen (einklappbar) -->
        <q-expansion-item
          v-if="completedAcquisitions.length > 0"
          v-model="showCompleted"
          icon="check_circle"
          header-class="text-positive"
          :label="`Abgeschlossene Beschaffungen (${completedAcquisitions.length})`"
        >
          <q-timeline color="positive" class="q-mt-sm">
            <q-timeline-entry
              v-for="acq in completedAcquisitions"
              :key="acq.originalIndex"
              :title="acq.item"
              :subtitle="formatDate(acq.date)"
              icon="check_circle"
              color="positive"
            >
              <template #default>
                <div class="q-mb-sm">
                  <div class="text-body2">
                    <span class="text-grey-6">Gegenstand:</span> <span class="text-bold">{{ acq.item }}</span>
                  </div>
                  <div class="text-body2" v-if="acq.quantity">
                    <span class="text-grey-6">Menge:</span> <span class="text-bold">{{ acq.quantity }}</span>
                  </div>
                </div>

                <!-- Calculated Min Roll -->
                <div class="q-mb-sm q-pa-sm rounded-borders" style="background-color: black; border: 2px solid #4caf50;">
                  <div class="text-body2 text-bold text-positive">
                    <template v-if="successfulAttempt(acq)">
                      Erfolgreich bei Versuch {{ successfulAttempt(acq) }}
                    </template>
                    <template v-else>Nach 5 Versuchen erhalten</template>
                  </div>
                  <div class="text-caption text-grey-4">
                    Profit Factor ({{ character.profitFactor.current }})
                    <span v-if="acq.availabilityMod !== 0"> {{ acq.availabilityMod > 0 ? '+' : '' }}{{ acq.availabilityMod }} ({{ acq.availability }})</span>
                    <span v-if="acq.amountMod !== 0"> {{ acq.amountMod > 0 ? '+' : '' }}{{ acq.amountMod }} ({{ acq.amount }})</span>
                    <span v-if="acq.qualityMod !== 0"> {{ acq.qualityMod > 0 ? '+' : '' }}{{ acq.qualityMod }} ({{ acq.quality }})</span>
                    <span v-if="acq.additionalMod !== 0"> {{ acq.additionalMod > 0 ? '+' : '' }}{{ acq.additionalMod }} (Zusätzlich)</span>
                  </div>
                </div>

                <!-- Attempts -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">
                    Versuche: {{ getAttemptCount(acq) }} von 5
                  </div>

                  <!-- Attempt History -->
                  <div v-if="getAttemptCount(acq) > 0" class="q-mb-sm">
                    <q-list dense bordered class="rounded-borders">
                      <q-item
                        v-for="(attempt, attemptIdx) in getAttempts(acq)"
                        :key="attemptIdx"
                        class="q-pa-sm"
                      >
                        <q-item-section>
                          <q-item-label>
                            <span class="text-bold">Versuch {{ attemptIdx + 1 }}:</span>
                            <span :class="attempt.success ? 'text-positive' : 'text-negative'">
                              {{ attempt.rollResult }} {{ attempt.success ? '✓' : '✗' }}
                            </span>
                            <span v-if="attempt.degrees" class="text-grey-5 q-ml-xs">
                              ({{ attempt.degrees }} {{ attempt.success ? 'EG' : 'MG' }})
                            </span>
                            <span v-if="attempt.rollBonus" class="text-grey-5 q-ml-xs">
                              {{ attempt.rollBonus > 0 ? '+' : '' }}{{ attempt.rollBonus }} Bonus
                            </span>
                            <span class="text-grey-6 q-ml-sm">(Mindestwurf: {{ attempt.calculatedMinRoll }})</span>
                          </q-item-label>
                          <q-item-label caption v-if="attempt.date">
                            {{ formatDateTime(attempt.date) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="acq.notes" class="text-body2 q-mt-sm">
                  <div class="text-grey-6">Notizen:</div>
                  <div class="q-pl-sm" style="white-space: pre-wrap;">{{ acq.notes }}</div>
                </div>

                <!-- Actions -->
                <div class="q-mt-sm">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="edit"
                    color="grey-6"
                    @click="editAcquisition(acq.originalIndex)"
                  >
                    <q-tooltip>Bearbeiten</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="delete"
                    color="grey-6"
                    @click="removeAcquisition(acq.originalIndex)"
                  >
                    <q-tooltip>Löschen</q-tooltip>
                  </q-btn>
                </div>
              </template>
            </q-timeline-entry>
          </q-timeline>
        </q-expansion-item>
      </template>
    </q-card-section>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showAddDialog" :maximized="$q.screen.lt.sm">
      <q-card style="width: 600px; max-width: 100vw">
        <q-card-section>
          <div class="text-h6">{{ editingIndex !== null ? 'Beschaffung bearbeiten' : 'Neue Beschaffung' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newAcquisition.item"
            label="Gegenstand"
            filled
            dense
            hint="Was soll beschafft werden?"
          />

          <q-input
            v-model="newAcquisition.quantity"
            label="Menge/Anzahl (optional)"
            filled
            dense
            hint="z.B. '5 Stück' oder '10kg'"
          />

          <q-select
            v-model="newAcquisition.availability"
            :options="availabilityOptions"
            label="Verfügbarkeit"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateAvailabilityMod"
          />

          <q-select
            v-model="newAcquisition.amount"
            :options="amountOptions"
            label="Menge (Kategorie)"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateAmountMod"
          />

          <q-select
            v-model="newAcquisition.quality"
            :options="qualityOptions"
            label="Qualität"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateQualityMod"
          />

          <q-input
            v-model.number="newAcquisition.additionalMod"
            label="Zusätzliche Modifikatoren"
            type="number"
            filled
            dense
            hint="Weitere situative Boni/Mali"
          />

          <!-- Calculated Min Roll Display -->
          <div class="q-pa-md rounded-borders" style="background-color: black; border: 2px solid #d4af37;">
            <div class="text-h6" style="color: #d4af37;">Berechneter Mindestwurf: {{ calculatedMinRoll }}</div>
            <div class="text-caption text-grey-4">
              Profit Factor ({{ character.profitFactor.current }})
              <span v-if="newAcquisition.availabilityMod !== 0"> {{ newAcquisition.availabilityMod > 0 ? '+' : '' }}{{ newAcquisition.availabilityMod }}</span>
              <span v-if="newAcquisition.amountMod !== 0"> {{ newAcquisition.amountMod > 0 ? '+' : '' }}{{ newAcquisition.amountMod }}</span>
              <span v-if="newAcquisition.qualityMod !== 0"> {{ newAcquisition.qualityMod > 0 ? '+' : '' }}{{ newAcquisition.qualityMod }}</span>
              <span v-if="newAcquisition.additionalMod !== 0"> {{ newAcquisition.additionalMod > 0 ? '+' : '' }}{{ newAcquisition.additionalMod }}</span>
            </div>
          </div>

          <q-input
            v-model="newAcquisition.date"
            label="Datum"
            filled
            dense
            type="date"
          />

          <q-input
            v-model="newAcquisition.notes"
            label="Notizen (optional)"
            type="textarea"
            filled
            rows="3"
            hint="Zusätzliche Informationen"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelDialog"
          />
          <q-btn
            flat
            label="Speichern"
            color="primary"
            @click="saveAcquisition"
            :disable="!newAcquisition.item"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Beschaffungswurf -->
    <q-dialog v-model="showRepeatDialog" :maximized="$q.screen.lt.sm">
      <q-card v-if="repeatAcquisition" style="width: 460px; max-width: 100vw">
        <q-card-section>
          <div class="text-h6">Beschaffungswurf</div>
          <div class="text-subtitle2 text-grey-6">
            {{ repeatAcquisition.item }} · Versuch {{ getAttemptCount(repeatAcquisition) + 1 }} von 5
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model.number="rollBonus"
            label="Bonus für diesen Wurf"
            type="number"
            filled
            dense
            hint="z. B. Kontakte, Gefallen, Verhandlungsprobe"
          />

          <div class="q-pa-md rounded-borders" style="background-color: black; border: 2px solid #d4af37;">
            <div class="text-h6" style="color: #d4af37;">Mindestwurf: {{ calculatedRepeatMinRoll }}</div>
            <div class="text-caption text-grey-4">
              Profit Factor ({{ character.profitFactor.current }})
              <span v-if="repeatAcquisition.availabilityMod"> {{ signed(repeatAcquisition.availabilityMod) }} ({{ repeatAcquisition.availability }})</span>
              <span v-if="repeatAcquisition.amountMod"> {{ signed(repeatAcquisition.amountMod) }} ({{ repeatAcquisition.amount }})</span>
              <span v-if="repeatAcquisition.qualityMod"> {{ signed(repeatAcquisition.qualityMod) }} ({{ repeatAcquisition.quality }})</span>
              <span v-if="repeatAcquisition.additionalMod"> {{ signed(repeatAcquisition.additionalMod) }} (Zusätzlich)</span>
              <span v-if="rollBonus"> {{ signed(rollBonus) }} (Bonus)</span>
            </div>
          </div>

          <div v-if="!dice.connected.value || manualEntry" class="row items-start q-col-gutter-sm">
            <div v-if="!dice.connected.value" class="col-12 text-caption text-grey-6">
              Nicht mit dem Würfelraum verbunden – Ergebnis von Hand eintragen.
            </div>
            <div class="col">
              <q-input
                v-model.number="rollResult"
                label="Wurfergebnis (W100)"
                type="number"
                filled
                dense
                autofocus
                @keyup.enter="confirmRepeatRoll"
              />
            </div>
            <div class="col-auto">
              <q-btn
                unelevated
                label="Eintragen"
                color="primary"
                class="q-mt-xs"
                :disable="!validRollResult"
                @click="confirmRepeatRoll"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            v-if="dice.connected.value && !manualEntry"
            flat
            no-caps
            label="Von Hand eintragen"
            color="grey"
            class="q-mr-auto"
            @click="manualEntry = true"
          />
          <q-btn flat label="Abbrechen" color="grey" @click="cancelRepeatDialog" />
          <q-btn
            v-if="dice.connected.value"
            unelevated
            icon="casino"
            :label="`Würfeln (${calculatedRepeatMinRoll})`"
            color="primary"
            @click="rollInDiceRoom"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useCharacterStore } from '../../stores/characterStore'
import { evaluateTest, useDiceRoom } from '../../composables/diceRoom'

const $q = useQuasar()
const dice = useDiceRoom()
const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddDialog = ref(false)
const showRepeatDialog = ref(false)
const showCompleted = ref(false)
const editingIndex = ref(null)
const repeatIndex = ref(null)
const rollResult = ref(null)
const rollBonus = ref(0)
const manualEntry = ref(false)

// Availability options with modifiers
const availabilityOptions = [
  { label: 'Unglaublich verbreitet (+70)', value: 'Unglaublich verbreitet', mod: 70 },
  { label: 'In Hülle und Fülle (+50)', value: 'In Hülle und Fülle', mod: 50 },
  { label: 'Im Überfluß vorhanden (+30)', value: 'Im Überfluß vorhanden', mod: 30 },
  { label: 'Verbreitet (+20)', value: 'Verbreitet', mod: 20 },
  { label: 'Durchschnittlich (+10)', value: 'Durchschnittlich', mod: 10 },
  { label: 'Knapp (+0)', value: 'Knapp', mod: 0 },
  { label: 'Selten (-10)', value: 'Selten', mod: -10 },
  { label: 'Sehr selten (-20)', value: 'Sehr selten', mod: -20 },
  { label: 'Extrem selten (-30)', value: 'Extrem selten', mod: -30 },
  { label: 'Fast einzigartig (-50)', value: 'Fast einzigartig', mod: -50 },
  { label: 'Einzigartig (-70)', value: 'Einzigartig', mod: -70 }
]

// Amount options with modifiers
const amountOptions = [
  { label: 'Ein Mann (+30)', value: 'Ein Mann', mod: 30 },
  { label: 'Trupp (3-5) (+20)', value: 'Trupp', mod: 20 },
  { label: 'Zug (10-30) (+10)', value: 'Zug', mod: 10 },
  { label: 'Kompanie (50-100) (+0)', value: 'Kompanie', mod: 0 },
  { label: 'Regiment (500-1.000) (-10)', value: 'Regiment', mod: -10 },
  { label: 'Division (2.000-5.000) (-20)', value: 'Division', mod: -20 },
  { label: 'Armee (10.000+) (-30)', value: 'Armee', mod: -30 }
]

// Quality options with modifiers
const qualityOptions = [
  { label: 'Gering (+10)', value: 'Gering', mod: 10 },
  { label: 'Normal (+0)', value: 'Normal', mod: 0 },
  { label: 'Gut (-10)', value: 'Gut', mod: -10 },
  { label: 'Hervorragend (-30)', value: 'Hervorragend', mod: -30 }
]

const newAcquisition = ref({
  item: '',
  quantity: '',
  availability: 'Knapp',
  availabilityMod: 0,
  amount: 'Ein Mann',
  amountMod: 30,
  quality: 'Normal',
  qualityMod: 0,
  additionalMod: 0,
  calculatedMinRoll: 0,
  date: new Date().toISOString().split('T')[0],
  attempts: [],
  notes: ''
})

const repeatAcquisition = ref(null)

const sortedAcquisitions = computed(() => {
  return [...character.value.acquisitions].map((acq, index) => ({
    ...acq,
    originalIndex: index
  })).sort((a, b) => {
    const dateA = new Date(a.date || 0)
    const dateB = new Date(b.date || 0)

    // Handle invalid dates
    if (isNaN(dateA.getTime())) return 1
    if (isNaN(dateB.getTime())) return -1

    return dateB - dateA
  })
})

// Open acquisitions (no successful attempt yet)
const openAcquisitions = computed(() => {
  return sortedAcquisitions.value.filter(acq => !isAcquisitionSuccessful(acq))
})

// Completed acquisitions (at least one successful attempt)
const completedAcquisitions = computed(() => {
  return sortedAcquisitions.value.filter(acq => isAcquisitionSuccessful(acq))
})

const calculatedMinRoll = computed(() => {
  const profitFactor = character.value.profitFactor.current || 0
  return profitFactor +
    (newAcquisition.value.availabilityMod || 0) +
    (newAcquisition.value.amountMod || 0) +
    (newAcquisition.value.qualityMod || 0) +
    (newAcquisition.value.additionalMod || 0)
})

// Mindestwurf mit dem aktuellen Profit Factor
const minRollFor = (acq, bonus = 0) =>
  (character.value.profitFactor.current || 0) +
  (acq.availabilityMod || 0) +
  (acq.amountMod || 0) +
  (acq.qualityMod || 0) +
  (acq.additionalMod || 0) +
  (Number(bonus) || 0)

const calculatedRepeatMinRoll = computed(() =>
  repeatAcquisition.value ? minRollFor(repeatAcquisition.value, rollBonus.value) : 0
)

const validRollResult = computed(() =>
  Number.isInteger(rollResult.value) && rollResult.value >= 1 && rollResult.value <= 100
)

const signed = (value) => (value > 0 ? `+${value}` : `${value}`)

// Nummer des erfolgreichen Versuchs (1-basiert) oder 0 bei Pity
const successfulAttempt = (acq) => getAttempts(acq).findIndex(a => a.success) + 1

const formatDate = (dateString) => {
  if (!dateString) return 'Kein Datum'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Ungültiges Datum'

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Kein Datum'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Ungültiges Datum'

  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAttemptCount = (acq) => {
  if (!acq) return 0
  if (Array.isArray(acq.attempts)) {
    return acq.attempts.length
  }
  return acq.attempts || 0
}

const getAttempts = (acq) => {
  if (!acq) return []
  if (Array.isArray(acq.attempts)) {
    return acq.attempts
  }
  return []
}

// Check if an acquisition has been successfully completed
// Either by a successful roll OR by completing all 5 attempts
const isAcquisitionSuccessful = (acq) => {
  const attempts = getAttempts(acq)
  const hasSuccessfulAttempt = attempts.some(attempt => attempt.success)
  const allAttemptsUsed = attempts.length >= 5
  return hasSuccessfulAttempt || allAttemptsUsed
}

const updateAvailabilityMod = (value) => {
  const option = availabilityOptions.find(opt => opt.value === value)
  newAcquisition.value.availabilityMod = option ? option.mod : 0
}

const updateAmountMod = (value) => {
  const option = amountOptions.find(opt => opt.value === value)
  newAcquisition.value.amountMod = option ? option.mod : 0
}

const updateQualityMod = (value) => {
  const option = qualityOptions.find(opt => opt.value === value)
  newAcquisition.value.qualityMod = option ? option.mod : 0
}

const editAcquisition = (index) => {
  editingIndex.value = index
  const acq = character.value.acquisitions[index]
  newAcquisition.value = { ...acq }
  showAddDialog.value = true
}

const saveAcquisition = () => {
  if (!newAcquisition.value.item) return

  // Calculate min roll before saving
  newAcquisition.value.calculatedMinRoll = calculatedMinRoll.value

  if (editingIndex.value !== null) {
    character.value.acquisitions[editingIndex.value] = { ...newAcquisition.value }
  } else {
    character.value.acquisitions.push({ ...newAcquisition.value })
  }

  cancelDialog()
}

const removeAcquisition = (index) => {
  character.value.acquisitions.splice(index, 1)
}

const repeatRoll = (index) => {
  repeatIndex.value = index
  repeatAcquisition.value = { ...character.value.acquisitions[index] }

  // Ensure attempts is an array (migrate old format)
  if (!Array.isArray(repeatAcquisition.value.attempts)) {
    repeatAcquisition.value.attempts = []
  }

  rollResult.value = null
  rollBonus.value = 0
  manualEntry.value = false
  showRepeatDialog.value = true
}

// Versuch an der Beschaffung speichern (aus dem Würfelraum oder von Hand)
const recordAttempt = (acq, result, minRoll, bonus) => {
  const evaluation = evaluateTest(result, minRoll)
  const attempts = Array.isArray(acq.attempts) ? acq.attempts : []
  acq.attempts = [...attempts, {
    rollResult: result,
    date: new Date().toISOString(),
    availability: acq.availability,
    availabilityMod: acq.availabilityMod,
    amount: acq.amount,
    amountMod: acq.amountMod,
    quality: acq.quality,
    qualityMod: acq.qualityMod,
    additionalMod: acq.additionalMod || 0,
    rollBonus: Number(bonus) || 0,
    calculatedMinRoll: minRoll,
    success: evaluation.success,
    degrees: evaluation.degrees
  }]
  acq.calculatedMinRoll = minRoll
}

const rollInDiceRoom = () => {
  // Das Original aus dem Store, damit das Ergebnis auch nach dem Schließen ankommt
  const acq = character.value.acquisitions[repeatIndex.value]
  const minRoll = calculatedRepeatMinRoll.value
  const bonus = rollBonus.value
  const attempt = getAttemptCount(acq) + 1
  const sent = dice.test(minRoll, `Beschaffung: ${acq.item} (Versuch ${attempt}/5)`, {
    exhaustion: false,
    onResult: (roll) => recordAttempt(acq, roll.total, roll.target, bonus)
  })
  if (sent) cancelRepeatDialog()
}

const confirmRepeatRoll = () => {
  if (repeatIndex.value === null || !validRollResult.value) return
  const acq = character.value.acquisitions[repeatIndex.value]
  recordAttempt(acq, rollResult.value, calculatedRepeatMinRoll.value, rollBonus.value)
  cancelRepeatDialog()
}

const cancelDialog = () => {
  showAddDialog.value = false
  editingIndex.value = null
  newAcquisition.value = {
    item: '',
    quantity: '',
    availability: 'Knapp',
    availabilityMod: 0,
    amount: 'Ein Mann',
    amountMod: 30,
    quality: 'Normal',
    qualityMod: 0,
    additionalMod: 0,
    calculatedMinRoll: 0,
    date: new Date().toISOString().split('T')[0],
    attempts: [],
    notes: ''
  }
}

const cancelRepeatDialog = () => {
  showRepeatDialog.value = false
  repeatIndex.value = null
  repeatAcquisition.value = null
  rollResult.value = null
}
</script>

<style scoped>
.q-timeline {
  padding: 0;
}
</style>
