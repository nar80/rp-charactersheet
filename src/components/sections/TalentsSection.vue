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
              <div class="row items-center">
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
                    <q-tooltip>Beschreibung anzeigen</q-tooltip>
                  </q-btn>
                </div>
                <div class="col">
                  <div class="text-subtitle1 text-bold">{{ talent.name }}</div>
                  <div v-if="talent.tier" class="text-caption text-grey-6">
                    {{ talent.tier }}
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
          <q-input
            v-model="newTalent.name"
            label="Talent-Name"
            filled
            dense
            hint="z.B. 'Gerechter Zorn', 'Meisterschütze', 'Eiserner Wille'"
          />

          <q-input
            v-model="newTalent.tier"
            label="Stufe/Rang (optional)"
            filled
            dense
            hint="z.B. 'Rang 1', 'Meister', 'Stufe 3'"
          />

          <q-input
            v-model="newTalent.description"
            label="Beschreibung"
            type="textarea"
            filled
            rows="5"
            hint="Beschreibe die Wirkung und Regeln des Talents"
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
            :disable="!newTalent.name"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info Dialog -->
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ currentTalent?.name }}</div>
          <div v-if="currentTalent?.tier" class="text-caption text-grey-6">
            {{ currentTalent.tier }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-body2" style="white-space: pre-wrap;">
            {{ currentTalent?.description || 'Keine Beschreibung vorhanden' }}
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

const showAddTalentDialog = ref(false)
const editingIndex = ref(null)
const alphabetSort = ref(false)
const showInfo = ref(false)
const currentTalent = ref(null)

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
  name: '',
  tier: '',
  description: ''
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

  if (editingIndex.value !== null) {
    // Update existing talent
    character.value.talents[editingIndex.value] = { ...newTalent.value }
  } else {
    // Add new talent
    characterStore.addTalent({ ...newTalent.value })
  }

  cancelTalentDialog()
}

const editTalent = (index) => {
  editingIndex.value = index
  newTalent.value = { ...character.value.talents[index] }
  showAddTalentDialog.value = true
}

const removeTalent = (index) => {
  characterStore.removeTalent(index)
}

const cancelTalentDialog = () => {
  showAddTalentDialog.value = false
  editingIndex.value = null
  newTalent.value = {
    name: '',
    tier: '',
    description: ''
  }
}
</script>
