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
                    Mindestwurf: {{ acq.calculatedMinRoll }}
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
                    flat
                    dense
                    size="sm"
                    icon="refresh"
                    color="primary"
                    label="Wurf wiederholen"
                    @click="repeatRoll(acq.originalIndex)"
                    :disable="getAttemptCount(acq) >= 5"
                  >
                    <q-tooltip v-if="getAttemptCount(acq) >= 5">Maximale Anzahl an Versuchen erreicht</q-tooltip>
                  </q-btn>
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
                    Mindestwurf: {{ acq.calculatedMinRoll }} - Erfolgreich!
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
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 600px">
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

    <!-- Repeat Roll Dialog -->
    <q-dialog v-model="showRepeatDialog">
      <q-card v-if="repeatAcquisition" style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Wurf wiederholen</div>
          <div class="text-subtitle2 text-grey-7">{{ repeatAcquisition?.item }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <div class="text-body2">
            Aktueller Versuch: {{ repeatAcquisition ? getAttemptCount(repeatAcquisition) + 1 : 1 }} von 5
          </div>

          <q-input
            v-model.number="rollResult"
            label="Wurfergebnis"
            type="number"
            filled
            dense
            hint="Das Ergebnis deines W100-Wurfs"
            :rules="[val => val !== null && val >= 1 && val <= 100 || 'Bitte einen Wert zwischen 1 und 100 eingeben']"
          />

          <q-select
            v-model="repeatAcquisition.availability"
            :options="availabilityOptions"
            label="Verfügbarkeit"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateRepeatAvailabilityMod"
          />

          <q-select
            v-model="repeatAcquisition.amount"
            :options="amountOptions"
            label="Menge (Kategorie)"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateRepeatAmountMod"
          />

          <q-select
            v-model="repeatAcquisition.quality"
            :options="qualityOptions"
            label="Qualität"
            filled
            dense
            emit-value
            map-options
            @update:model-value="updateRepeatQualityMod"
          />

          <q-input
            v-model.number="repeatAcquisition.additionalMod"
            label="Zusätzliche Modifikatoren"
            type="number"
            filled
            dense
          />

          <!-- Calculated Min Roll Display -->
          <div class="q-pa-md rounded-borders" style="background-color: black; border: 2px solid #d4af37;">
            <div class="text-h6" style="color: #d4af37;">Berechneter Mindestwurf: {{ calculatedRepeatMinRoll }}</div>
            <div class="text-caption text-grey-4">
              Profit Factor ({{ character.profitFactor.current }})
              <span v-if="repeatAcquisition.availabilityMod !== 0"> {{ repeatAcquisition.availabilityMod > 0 ? '+' : '' }}{{ repeatAcquisition.availabilityMod }}</span>
              <span v-if="repeatAcquisition.amountMod !== 0"> {{ repeatAcquisition.amountMod > 0 ? '+' : '' }}{{ repeatAcquisition.amountMod }}</span>
              <span v-if="repeatAcquisition.qualityMod !== 0"> {{ repeatAcquisition.qualityMod > 0 ? '+' : '' }}{{ repeatAcquisition.qualityMod }}</span>
              <span v-if="repeatAcquisition.additionalMod !== 0"> {{ repeatAcquisition.additionalMod > 0 ? '+' : '' }}{{ repeatAcquisition.additionalMod }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelRepeatDialog"
          />
          <q-btn
            flat
            label="Wurf ausgeführt"
            color="primary"
            @click="confirmRepeatRoll"
            :disable="!rollResult || rollResult < 1 || rollResult > 100"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddDialog = ref(false)
const showRepeatDialog = ref(false)
const showCompleted = ref(false)
const editingIndex = ref(null)
const repeatIndex = ref(null)
const rollResult = ref(null)

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

const calculatedRepeatMinRoll = computed(() => {
  if (!repeatAcquisition.value) return 0
  const profitFactor = character.value.profitFactor.current || 0
  return profitFactor +
    (repeatAcquisition.value.availabilityMod || 0) +
    (repeatAcquisition.value.amountMod || 0) +
    (repeatAcquisition.value.qualityMod || 0) +
    (repeatAcquisition.value.additionalMod || 0)
})

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

const updateRepeatAvailabilityMod = (value) => {
  const option = availabilityOptions.find(opt => opt.value === value)
  repeatAcquisition.value.availabilityMod = option ? option.mod : 0
}

const updateRepeatAmountMod = (value) => {
  const option = amountOptions.find(opt => opt.value === value)
  repeatAcquisition.value.amountMod = option ? option.mod : 0
}

const updateRepeatQualityMod = (value) => {
  const option = qualityOptions.find(opt => opt.value === value)
  repeatAcquisition.value.qualityMod = option ? option.mod : 0
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
  showRepeatDialog.value = true
}

const confirmRepeatRoll = () => {
  // Improved validation
  if (repeatIndex.value === null ||
      !rollResult.value ||
      typeof rollResult.value !== 'number' ||
      rollResult.value < 1 ||
      rollResult.value > 100) {
    return
  }

  // Calculate min roll
  const minRoll = calculatedRepeatMinRoll.value

  // Create new attempt object
  const newAttempt = {
    rollResult: rollResult.value,
    date: new Date().toISOString(),
    availability: repeatAcquisition.value.availability,
    availabilityMod: repeatAcquisition.value.availabilityMod,
    amount: repeatAcquisition.value.amount,
    amountMod: repeatAcquisition.value.amountMod,
    quality: repeatAcquisition.value.quality,
    qualityMod: repeatAcquisition.value.qualityMod,
    additionalMod: repeatAcquisition.value.additionalMod || 0,
    calculatedMinRoll: minRoll,
    success: rollResult.value <= minRoll
  }

  // Ensure attempts is an array
  if (!Array.isArray(repeatAcquisition.value.attempts)) {
    repeatAcquisition.value.attempts = []
  }

  // Add attempt to array
  repeatAcquisition.value.attempts.push(newAttempt)

  // Update the main modifiers to the latest values
  repeatAcquisition.value.calculatedMinRoll = minRoll

  character.value.acquisitions[repeatIndex.value] = { ...repeatAcquisition.value }

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
