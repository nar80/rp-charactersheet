<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">
            <q-icon name="military_tech" class="q-mr-sm" />
            Talente
          </div>
          <div class="text-caption text-grey-6">
            Besondere Fähigkeiten und imperiale Auszeichnungen
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
            label="Talent hinzufügen"
            @click="showAddTalentDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="character.talents.length === 0" class="text-center text-grey-6 q-pa-lg">
        <q-icon name="military_tech" size="4rem" color="grey-6" />
        <div class="q-mt-md">Keine Talente vorhanden</div>
        <div class="text-caption">Klicke auf "Talent hinzufügen" um zu beginnen</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="(talent, index) in sortedTalents"
          :key="talent.originalIndex"
          class="col-12 col-md-6"
        >
          <q-card bordered flat class="bg-grey-9">
            <q-card-section class="q-pa-sm">
              <div class="row items-start">
                <div class="col-auto q-pr-xs">
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="info"
                    color="grey-6"
                    @click="showInfoDialog(talent)"
                  >
                    <q-tooltip>Details anzeigen</q-tooltip>
                  </q-btn>
                </div>
                <div class="col">
                  <div class="text-subtitle1 text-bold">
                    {{ talent.name }}
                    <span v-if="talent.specialization" class="text-weight-regular"> ({{ talent.specialization }})</span>
                    <span v-if="talent.tier" class="text-weight-regular"> ({{ talent.tier }})</span>
                  </div>
                  <div v-if="talent.benefit" class="text-body2 text-grey-4 q-mt-xs">
                    {{ talent.benefit }}
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
                    @click="editTalent(talent.originalIndex)"
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
                    @click="removeTalent(talent.originalIndex)"
                  >
                    <q-tooltip>Entfernen</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Add/Edit Talent Dialog -->
    <q-dialog v-model="showAddTalentDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingIndex !== null ? 'Talent bearbeiten' : 'Talent hinzufügen' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="newTalent.selectedTalent"
            :options="availableTalents"
            option-label="name"
            label="Talent auswählen"
            filled
            dense
            use-input
            input-debounce="0"
            @filter="filterTalents"
            hint="Wähle ein Talent aus dem Grundregelwerk"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Keine Ergebnisse
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.benefit }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-if="newTalent.selectedTalent?.requiresSpecialization"
            v-model="newTalent.specialization"
            label="Spezialisierung (erforderlich)"
            filled
            dense
            hint="z.B. 'Orks', 'Plasma-Waffen', 'Handelsgüter'"
            :rules="[val => !!val || 'Spezialisierung erforderlich']"
            lazy-rules
          />

          <q-input
            v-model="newTalent.tier"
            label="Stufe/Rang (optional)"
            filled
            dense
            hint="z.B. 'Rang 1', 'Rang 2' - für mehrfach wählbare Talente"
          />

          <q-input
            v-model="newTalent.prerequisites"
            label="Voraussetzungen"
            filled
            dense
            readonly
            hint="Automatisch aus Grundregelwerk"
          />

          <q-input
            v-model="newTalent.benefit"
            label="Vorzug"
            type="textarea"
            filled
            rows="3"
            readonly
            hint="Automatisch aus Grundregelwerk"
          />

          <q-input
            v-model="newTalent.description"
            label="Zusätzliche Notizen (optional)"
            type="textarea"
            filled
            rows="3"
            hint="Eigene Notizen, Hausregeln oder Details zur Anwendung"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelTalentDialog"
          />
          <q-btn
            flat
            label="Speichern"
            color="primary"
            @click="saveTalent"
            :disable="!newTalent.name || (newTalent.selectedTalent?.requiresSpecialization && !newTalent.specialization)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info Dialog -->
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ currentTalent?.name }}
            <span v-if="currentTalent?.specialization" class="text-weight-regular"> ({{ currentTalent.specialization }})</span>
          </div>
          <div v-if="currentTalent?.tier" class="text-caption text-grey-6">
            {{ currentTalent.tier }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <div v-if="currentTalent?.prerequisites">
            <div class="text-caption text-grey-6">Voraussetzungen:</div>
            <div class="text-body2">{{ currentTalent.prerequisites }}</div>
          </div>

          <div v-if="currentTalent?.benefit">
            <div class="text-caption text-grey-6">Vorzug:</div>
            <div class="text-body2">{{ currentTalent.benefit }}</div>
          </div>

          <div v-if="currentTalent?.description">
            <div class="text-caption text-grey-6">Zusätzliche Notizen:</div>
            <div class="text-body2" style="white-space: pre-wrap;">{{ currentTalent.description }}</div>
          </div>

          <div v-if="!currentTalent?.prerequisites && !currentTalent?.benefit && !currentTalent?.description" class="text-grey-6">
            Keine Details vorhanden
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
import { talents } from '../../data/talents'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddTalentDialog = ref(false)
const editingIndex = ref(null)
const alphabetSort = ref(false)
const showInfo = ref(false)
const currentTalent = ref(null)
const searchFilteredTalents = ref(talents)

// Available talents (filter out already added talents without specialization)
const availableTalents = computed(() => {
  return searchFilteredTalents.value.filter(talent => {
    // If talent requires specialization, always show it (can be added multiple times)
    if (talent.requiresSpecialization) {
      return true
    }

    // For talents without specialization, only show if not already added
    const alreadyAdded = character.value.talents.some(t =>
      t.name === talent.name && editingIndex.value === null
    )
    return !alreadyAdded
  })
})

// Load sort preference from localStorage
onMounted(() => {
  const saved = localStorage.getItem('talents-sort-alpha')
  if (saved !== null) {
    alphabetSort.value = saved === 'true'
  }
})

// Save sort preference to localStorage
watch(alphabetSort, (newValue) => {
  localStorage.setItem('talents-sort-alpha', newValue.toString())
})

const newTalent = ref({
  selectedTalent: null,
  name: '',
  specialization: '',
  tier: '',
  prerequisites: '',
  benefit: '',
  description: ''
})

// Watch for talent selection to auto-fill fields
watch(() => newTalent.value.selectedTalent, (talent) => {
  if (talent) {
    newTalent.value.name = talent.name
    newTalent.value.prerequisites = talent.prerequisites
    newTalent.value.benefit = talent.benefit
    // Clear specialization when switching talents
    if (editingIndex.value === null) {
      newTalent.value.specialization = ''
    }
  }
})

// Sorted talents
const sortedTalents = computed(() => {
  const talentsWithIndex = character.value.talents.map((talent, index) => ({
    ...talent,
    originalIndex: index
  }))

  if (alphabetSort.value) {
    return talentsWithIndex.sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }

  return talentsWithIndex
})

const filterTalents = (val, update) => {
  update(() => {
    if (val === '') {
      searchFilteredTalents.value = talents
    } else {
      const needle = val.toLowerCase()
      searchFilteredTalents.value = talents.filter(t =>
        t.name.toLowerCase().includes(needle) ||
        t.benefit.toLowerCase().includes(needle)
      )
    }
  })
}

const showInfoDialog = (talent) => {
  currentTalent.value = talent
  showInfo.value = true
}

const editFromInfo = () => {
  showInfo.value = false
  editTalent(currentTalent.value.originalIndex)
}

const saveTalent = () => {
  if (!newTalent.value.name) return

  // Construct the talent object to save (without selectedTalent)
  const talentToSave = {
    name: newTalent.value.name,
    specialization: newTalent.value.specialization || '',
    tier: newTalent.value.tier || '',
    prerequisites: newTalent.value.prerequisites || '',
    benefit: newTalent.value.benefit || '',
    description: newTalent.value.description || ''
  }

  if (editingIndex.value !== null) {
    // Update existing talent
    character.value.talents[editingIndex.value] = talentToSave
  } else {
    // Add new talent
    characterStore.addTalent(talentToSave)
  }

  cancelTalentDialog()
}

const editTalent = (index) => {
  editingIndex.value = index
  const talent = character.value.talents[index]

  // Try to find the talent in the talents list to populate selectedTalent
  const foundTalent = talents.find(t => t.name === talent.name)

  newTalent.value = {
    selectedTalent: foundTalent || null,
    name: talent.name || '',
    specialization: talent.specialization || '',
    tier: talent.tier || '',
    prerequisites: talent.prerequisites || '',
    benefit: talent.benefit || '',
    description: talent.description || ''
  }

  showAddTalentDialog.value = true
}

const removeTalent = (index) => {
  characterStore.removeTalent(index)
}

const cancelTalentDialog = () => {
  showAddTalentDialog.value = false
  editingIndex.value = null
  newTalent.value = {
    selectedTalent: null,
    name: '',
    specialization: '',
    tier: '',
    prerequisites: '',
    benefit: '',
    description: ''
  }
}
</script>
