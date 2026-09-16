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
            <q-tooltip>{{ alphabetSort ? 'Alphabetische Ansicht – ausschalten, um die Reihenfolge per Ziehen zu ändern' : 'Alphabetisch anzeigen' }}</q-tooltip>
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
        <div v-for="(columnTalents, col) in talentColumns" :key="col" class="col-12 col-md-6">
          <draggable
            :model-value="columnTalents"
            @update:model-value="setColumnTalents(col, $event)"
            :item-key="talentKey"
            group="talents"
            :disabled="alphabetSort"
            :animation="150"
            :delay="200"
            :delay-on-touch-only="true"
            class="talent-column"
            :class="{ 'talent-column-sortable': !alphabetSort }"
          >
            <template #item="{ element: talent }">
              <q-card bordered flat class="bg-grey-9 q-mb-sm" :class="{ 'cursor-grab': !alphabetSort }">
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
                      <div class="text-subtitle1 text-bold" :class="{ 'important-talent': talent.important }">
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
                        @click="editTalent(talentIndex(talent))"
                      >
                        <q-tooltip>Bearbeiten</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        size="sm"
                        icon="delete"
                        color="grey-6"
                        @click="removeTalent(talent)"
                      >
                        <q-tooltip>Entfernen</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </template>
          </draggable>
        </div>
      </div>
    </q-card-section>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Talent löschen?</div>
        </q-card-section>

        <q-card-section>
          <p>
            Möchtest du das Talent <strong>{{ talentToDelete?.name }}</strong>
            <span v-if="talentToDelete?.specialization">({{ talentToDelete.specialization }})</span>
            wirklich löschen?
          </p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            v-close-popup
          />
          <q-btn
            flat
            label="Löschen"
            color="negative"
            @click="confirmDeleteTalent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Talent Dialog -->
    <q-dialog v-model="showAddTalentDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingIndex !== null ? 'Talent bearbeiten' : 'Talent hinzufügen' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <div class="row q-gutter-sm">
            <q-btn
              :outline="isCustomTalent"
              :flat="!isCustomTalent"
              :color="!isCustomTalent ? 'primary' : 'grey'"
              label="Aus Grundregelwerk"
              @click="switchToRulebookTalent"
              class="col"
            />
            <q-btn
              :outline="!isCustomTalent"
              :flat="isCustomTalent"
              :color="isCustomTalent ? 'primary' : 'grey'"
              label="Eigenes Talent"
              @click="switchToCustomTalent"
              class="col"
            />
          </div>

          <q-select
            v-if="!isCustomTalent"
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
            v-if="isCustomTalent"
            v-model="newTalent.name"
            label="Talentname (erforderlich)"
            filled
            dense
            hint="z.B. 'Meister der Dunkelheit', 'Xeno-Linguist'"
            :rules="[val => !!val || 'Name erforderlich']"
            lazy-rules
          />

          <q-input
            v-if="newTalent.selectedTalent?.requiresSpecialization || isCustomTalent"
            v-model="newTalent.specialization"
            :label="newTalent.selectedTalent?.requiresSpecialization ? 'Spezialisierung (erforderlich)' : 'Spezialisierung (optional)'"
            filled
            dense
            hint="z.B. 'Orks', 'Plasma-Waffen', 'Handelsgüter'"
            :rules="newTalent.selectedTalent?.requiresSpecialization ? [val => !!val || 'Spezialisierung erforderlich'] : []"
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
            hint="z.B. 'WK 40, ST 35' oder '--' für keine"
          />

          <q-input
            v-model="newTalent.benefit"
            label="Vorzug"
            type="textarea"
            filled
            rows="3"
            hint="Beschreibe den Vorteil, den das Talent bietet"
          />

          <q-input
            v-model="newTalent.description"
            label="Zusätzliche Notizen (optional)"
            type="textarea"
            filled
            rows="3"
            hint="Eigene Notizen, Hausregeln oder Details zur Anwendung"
          />

          <q-checkbox
            v-model="newTalent.important"
            label="Wichtiges Talent hervorheben"
            color="amber"
          >
            <q-tooltip>Hebt das Talent optisch hervor (z.B. für häufig genutzte Talente)</q-tooltip>
          </q-checkbox>
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
            :disable="!newTalent.name || (!isCustomTalent && newTalent.selectedTalent?.requiresSpecialization && !newTalent.specialization)"
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
import draggable from 'vuedraggable'
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
const isCustomTalent = ref(false)
const showDeleteDialog = ref(false)
const talentToDelete = ref(null)

// Available talents (filter out already added talents without specialization)
const availableTalents = computed(() => {
  return searchFilteredTalents.value.filter(talent => {
    // If talent requires specialization, always show it (can be added multiple times)
    if (talent.requiresSpecialization) {
      return true
    }

    // For talents without specialization, only show if not already added
    // When editing, allow the currently edited talent to still appear
    const alreadyAdded = character.value.talents.some((t, idx) =>
      t.name === talent.name && idx !== editingIndex.value
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
  description: '',
  important: false
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

// Talents keep their own order plus a column (0 = left, 1 = right) set by dragging.
// The alphabetical view only changes the display, the stored order stays untouched.
const hasColumn = (talent) => talent.column === 0 || talent.column === 1

const shorterColumn = () => {
  const left = character.value.talents.filter(t => t.column === 0).length
  const right = character.value.talents.filter(t => t.column === 1).length
  return left <= right ? 0 : 1
}

// Older characters have no column yet: split them in halves like the previous layout
watch(() => character.value.talents, (list) => {
  if (!list || list.every(hasColumn)) return
  const legacy = !list.some(hasColumn)
  const half = Math.ceil(list.length / 2)
  list.forEach((talent, index) => {
    if (hasColumn(talent)) return
    talent.column = legacy ? (index < half ? 0 : 1) : shorterColumn()
  })
}, { immediate: true })

const talentColumns = computed(() => {
  const list = character.value.talents
  if (alphabetSort.value) {
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, 'de'))
    const half = Math.ceil(sorted.length / 2)
    return [sorted.slice(0, half), sorted.slice(half)]
  }
  return [0, 1].map(col => list.filter(t => (hasColumn(t) ? t.column : 0) === col))
})

const setColumnTalents = (col, newList) => {
  newList.forEach(talent => { talent.column = col })
  const otherList = talentColumns.value[1 - col]
  character.value.talents = col === 0 ? [...newList, ...otherList] : [...otherList, ...newList]
}

// Stable keys for drag & drop (names are not unique, e.g. same talent with different specialization)
const talentKeys = new WeakMap()
let nextTalentKey = 0
const talentKey = (talent) => {
  if (!talentKeys.has(talent)) talentKeys.set(talent, nextTalentKey++)
  return talentKeys.get(talent)
}

const talentIndex = (talent) => character.value.talents.indexOf(talent)

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

const switchToCustomTalent = () => {
  isCustomTalent.value = true
  // Clear selected talent from rulebook
  newTalent.value.selectedTalent = null
  // Clear fields for custom entry if not editing
  if (editingIndex.value === null) {
    newTalent.value.name = ''
    newTalent.value.prerequisites = '--'
    newTalent.value.benefit = ''
  }
}

const switchToRulebookTalent = () => {
  isCustomTalent.value = false
  // Clear fields when switching back
  if (editingIndex.value === null) {
    newTalent.value.selectedTalent = null
    newTalent.value.name = ''
    newTalent.value.prerequisites = ''
    newTalent.value.benefit = ''
  }
}

const showInfoDialog = (talent) => {
  currentTalent.value = talent
  showInfo.value = true
}

const editFromInfo = () => {
  showInfo.value = false
  editTalent(talentIndex(currentTalent.value))
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
    description: newTalent.value.description || '',
    important: newTalent.value.important || false,
    column: editingIndex.value !== null
      ? character.value.talents[editingIndex.value].column
      : shorterColumn()
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

  // If talent is not in the rulebook, it's a custom talent
  isCustomTalent.value = !foundTalent

  newTalent.value = {
    selectedTalent: foundTalent || null,
    name: talent.name || '',
    specialization: talent.specialization || '',
    tier: talent.tier || '',
    prerequisites: talent.prerequisites || '',
    benefit: talent.benefit || '',
    description: talent.description || '',
    important: talent.important || false
  }

  showAddTalentDialog.value = true
}

const removeTalent = (talent) => {
  talentToDelete.value = talent
  showDeleteDialog.value = true
}

const confirmDeleteTalent = () => {
  const index = talentToDelete.value ? talentIndex(talentToDelete.value) : -1
  if (index >= 0) {
    characterStore.removeTalent(index)
  }
  showDeleteDialog.value = false
  talentToDelete.value = null
}

const cancelTalentDialog = () => {
  showAddTalentDialog.value = false
  editingIndex.value = null
  isCustomTalent.value = false
  newTalent.value = {
    selectedTalent: null,
    name: '',
    specialization: '',
    tier: '',
    prerequisites: '',
    benefit: '',
    description: '',
    important: false
  }
}
</script>

<style scoped>
.important-talent {
  color: #ffd54f;
  text-shadow: 0 0 8px rgba(255, 213, 79, 0.6), 0 0 16px rgba(255, 213, 79, 0.3);
}

.cursor-grab {
  cursor: grab;
}

.cursor-grab:active {
  cursor: grabbing;
}

/* Keep an empty column as drop target */
.talent-column-sortable {
  min-height: 60px;
  border-radius: 4px;
}

.talent-column-sortable:empty {
  border: 1px dashed rgba(255, 255, 255, 0.2);
}
</style>
