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
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

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
  description: ''
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

  if (editingIndex.value !== null) {
    // Update existing power
    characterStore.updatePsiPower(editingIndex.value, { ...newPower.value })
  } else {
    // Add new power
    characterStore.addPsiPower({ ...newPower.value })
  }

  cancelPowerDialog()
}

const editPower = (index) => {
  editingIndex.value = index
  newPower.value = { ...character.value.psiPowers[index] }
  showAddPowerDialog.value = true
}

const removePower = (index) => {
  characterStore.removePsiPower(index)
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
    description: ''
  }
}
</script>
