<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">Talente & Eigenschaften</div>
          <div class="text-caption text-grey-6">
            Spezielle Fähigkeiten, Eigenschaften und Vorteile deines Charakters
          </div>
        </div>
        <div class="col-auto">
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
        <q-icon name="stars" size="4rem" color="grey-6" />
        <div class="q-mt-md">Noch keine Talente hinzugefügt</div>
        <div class="text-caption">Klicke auf "Talent hinzufügen" um zu beginnen</div>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="(talent, index) in character.talents"
          :key="index"
          class="col-12 col-md-6"
        >
          <q-card bordered flat class="bg-grey-9">
            <q-card-section>
              <div class="row items-start">
                <div class="col">
                  <div class="text-h6">{{ talent.name }}</div>
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
                    @click="editTalent(index)"
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
                    @click="removeTalent(index)"
                  >
                    <q-tooltip>Entfernen</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="text-body2">
                {{ talent.description || 'Keine Beschreibung vorhanden' }}
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
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddTalentDialog = ref(false)
const editingIndex = ref(null)

const newTalent = ref({
  name: '',
  tier: '',
  description: ''
})

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
