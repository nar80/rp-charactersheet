<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div class="col-auto">
          <div class="text-h5">Fertigkeiten</div>
          <div class="text-caption text-grey-6">
            Grundfertigkeiten werden mit halbem Attributwert beherrscht
          </div>
        </div>
        <div class="col">
          <q-input
            v-model="filterText"
            label="Filter"
            filled
            dense
            clearable
            placeholder="Fertigkeit suchen..."
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Neue Fertigkeit"
            @click="showAddSkillDialog = true"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Left Column -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 text-grey-7 q-mb-sm">Grundfertigkeiten</div>
          <q-list bordered separator>
            <q-item
              v-for="(skill, index) in filteredLeftBasicSkills"
              :key="index"
              dense
            >
              <q-item-section>
                <div class="row items-center">
                  <!-- Info Icon -->
                  <div class="col-auto q-pr-xs">
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="info"
                      color="grey-6"
                      @click="showInfoDialog(skill, 'basic')"
                    >
                      <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                    </q-btn>
                  </div>

                  <!-- Skill Name -->
                  <div class="col-4 text-body2">
                    {{ skill.name }}
                    <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                  </div>

                  <!-- Checkboxes -->
                  <div class="col-4 flex justify-center q-gutter-xs">
                    <q-checkbox
                      :model-value="skill.trained"
                      label="E"
                      size="xs"
                      dense
                      @update:model-value="updateBasicSkill(skill.name, { trained: $event })"
                    >
                      <q-tooltip>Erlernt (volles Attribut)</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus10"
                      label="+10"
                      size="xs"
                      dense
                      @update:model-value="updateBasicSkill(skill.name, { plus10: $event })"
                    >
                      <q-tooltip>+10%</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus20"
                      label="+20"
                      size="xs"
                      dense
                      @update:model-value="updateBasicSkill(skill.name, { plus20: $event })"
                    >
                      <q-tooltip>+20%</q-tooltip>
                    </q-checkbox>
                  </div>

                  <!-- Bonus Input -->
                  <div class="col-2">
                    <q-input
                      :model-value="skill.bonus"
                      type="number"
                      dense
                      filled
                      placeholder="+"
                      @update:model-value="updateBasicSkill(skill.name, { bonus: parseInt($event) || 0 })"
                      input-style="text-align: center; font-size: 0.9rem;"
                    />
                  </div>

                  <!-- Value -->
                  <div class="col-1 text-right">
                    <div class="text-body1 text-primary">
                      {{ getSkillValue(skill) }}
                    </div>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 text-grey-7 q-mb-sm">Grundfertigkeiten</div>
          <q-list bordered separator>
            <q-item
              v-for="(skill, index) in filteredRightBasicSkills"
              :key="index"
              dense
            >
              <q-item-section>
                <div class="row items-center">
                  <!-- Info Icon -->
                  <div class="col-auto q-pr-xs">
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="info"
                      color="grey-6"
                      @click="showInfoDialog(skill, 'basic')"
                    >
                      <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                    </q-btn>
                  </div>

                  <!-- Skill Name -->
                  <div class="col-4 text-body2">
                    {{ skill.name }}
                    <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                  </div>

                  <!-- Checkboxes -->
                  <div class="col-4 flex justify-center q-gutter-xs">
                    <q-checkbox
                      :model-value="skill.trained"
                      label="E"
                      size="xs"
                      dense
                      @update:model-value="updateBasicSkill(skill.name, { trained: $event })"
                    >
                      <q-tooltip>Erlernt (volles Attribut)</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus10"
                      label="+10"
                      size="xs"
                      dense
                      @update:model-value="updateBasicSkill(skill.name, { plus10: $event })"
                    >
                      <q-tooltip>+10%</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus20"
                      label="+20"
                      size="xs"
                      dense
                      @update:model-value="updateBasicSkill(skill.name, { plus20: $event })"
                    >
                      <q-tooltip>+20%</q-tooltip>
                    </q-checkbox>
                  </div>

                  <!-- Bonus Input -->
                  <div class="col-2">
                    <q-input
                      :model-value="skill.bonus"
                      type="number"
                      dense
                      filled
                      placeholder="+"
                      @update:model-value="updateBasicSkill(skill.name, { bonus: parseInt($event) || 0 })"
                      input-style="text-align: center; font-size: 0.9rem;"
                    />
                  </div>

                  <!-- Value -->
                  <div class="col-1 text-right">
                    <div class="text-body1 text-primary">
                      {{ getSkillValue(skill) }}
                    </div>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <!-- Learned Skills Section - Full Width -->
      <div v-if="sortedFilteredLearnedSkills.length > 0" class="q-mt-md">
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-subtitle2 text-grey-7">Erlernte Fertigkeiten</div>
          </div>
          <div class="col-auto">
            <q-toggle
              v-model="sortAlphabetically"
              label="Alphabetisch sortieren"
              size="xs"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <!-- Left Column Learned -->
          <div class="col-12 col-md-6">
            <q-list bordered separator>
              <q-item
                v-for="skill in leftLearnedSkills"
                :key="skill.id"
                dense
                class="bg-grey-9"
              >
                <q-item-section>
                  <div class="row items-center">
                    <!-- Info Icon -->
                    <div class="col-auto q-pr-xs">
                      <q-btn
                        flat
                        dense
                        round
                        size="xs"
                        icon="info"
                        color="grey-6"
                        @click="showInfoDialog(skill, 'learned')"
                      >
                        <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                      </q-btn>
                    </div>

                    <!-- Skill Name with specialization -->
                    <div class="col-3 text-body2">
                      {{ skill.name }}
                      <span v-if="skill.specialization" class="text-caption text-grey-6">
                        ({{ skill.specialization }})
                      </span>
                      <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                      <q-badge v-if="skill.isBasic" color="orange" label="GF" class="q-ml-xs">
                        <q-tooltip>Als Grundfertigkeit gewährt</q-tooltip>
                      </q-badge>
                    </div>

                    <!-- Checkboxes -->
                    <div class="col-4 flex justify-center q-gutter-xs">
                      <q-checkbox
                        :model-value="skill.plus10"
                        label="+10"
                        size="xs"
                        dense
                        @update:model-value="updateLearnedSkill(skill.id, { plus10: $event })"
                      >
                        <q-tooltip>+10%</q-tooltip>
                      </q-checkbox>

                      <q-checkbox
                        :model-value="skill.plus20"
                        label="+20"
                        size="xs"
                        dense
                        @update:model-value="updateLearnedSkill(skill.id, { plus20: $event })"
                      >
                        <q-tooltip>+20%</q-tooltip>
                      </q-checkbox>
                    </div>

                    <!-- Bonus Input -->
                    <div class="col-2">
                      <q-input
                        :model-value="skill.bonus"
                        type="number"
                        dense
                        filled
                        placeholder="+"
                        @update:model-value="updateLearnedSkill(skill.id, { bonus: parseInt($event) || 0 })"
                        input-style="text-align: center; font-size: 0.9rem;"
                      />
                    </div>

                    <!-- Value and Delete -->
                    <div class="col-2 text-right flex items-center justify-end q-gutter-xs">
                      <div class="text-body1 text-primary">
                        {{ getSkillValue(skill) }}
                      </div>
                      <q-btn
                        flat
                        dense
                        round
                        size="xs"
                        icon="delete"
                        color="negative"
                        @click="removeSkill(skill.id)"
                      >
                        <q-tooltip>Fertigkeit entfernen</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Right Column Learned -->
          <div class="col-12 col-md-6">
            <q-list bordered separator>
              <q-item
                v-for="skill in rightLearnedSkills"
                :key="skill.id"
                dense
                class="bg-grey-9"
              >
                <q-item-section>
                  <div class="row items-center">
                    <!-- Info Icon -->
                    <div class="col-auto q-pr-xs">
                      <q-btn
                        flat
                        dense
                        round
                        size="xs"
                        icon="info"
                        color="grey-6"
                        @click="showInfoDialog(skill, 'learned')"
                      >
                        <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                      </q-btn>
                    </div>

                    <!-- Skill Name with specialization -->
                    <div class="col-3 text-body2">
                      {{ skill.name }}
                      <span v-if="skill.specialization" class="text-caption text-grey-6">
                        ({{ skill.specialization }})
                      </span>
                      <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                      <q-badge v-if="skill.isBasic" color="orange" label="GF" class="q-ml-xs">
                        <q-tooltip>Als Grundfertigkeit gewährt</q-tooltip>
                      </q-badge>
                    </div>

                    <!-- Checkboxes -->
                    <div class="col-4 flex justify-center q-gutter-xs">
                      <q-checkbox
                        :model-value="skill.plus10"
                        label="+10"
                        size="xs"
                        dense
                        @update:model-value="updateLearnedSkill(skill.id, { plus10: $event })"
                      >
                        <q-tooltip>+10%</q-tooltip>
                      </q-checkbox>

                      <q-checkbox
                        :model-value="skill.plus20"
                        label="+20"
                        size="xs"
                        dense
                        @update:model-value="updateLearnedSkill(skill.id, { plus20: $event })"
                      >
                        <q-tooltip>+20%</q-tooltip>
                      </q-checkbox>
                    </div>

                    <!-- Bonus Input -->
                    <div class="col-2">
                      <q-input
                        :model-value="skill.bonus"
                        type="number"
                        dense
                        filled
                        placeholder="+"
                        @update:model-value="updateLearnedSkill(skill.id, { bonus: parseInt($event) || 0 })"
                        input-style="text-align: center; font-size: 0.9rem;"
                      />
                    </div>

                    <!-- Value and Delete -->
                    <div class="col-2 text-right flex items-center justify-end q-gutter-xs">
                      <div class="text-body1 text-primary">
                        {{ getSkillValue(skill) }}
                      </div>
                      <q-btn
                        flat
                        dense
                        round
                        size="xs"
                        icon="delete"
                        color="negative"
                        @click="removeSkill(skill.id)"
                      >
                        <q-tooltip>Fertigkeit entfernen</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Add Skill Dialog -->
    <q-dialog v-model="showAddSkillDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Neue Fertigkeit hinzufügen</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="newSkill.name"
            label="Fertigkeitenname"
            filled
            dense
          />

          <q-input
            v-model="newSkill.specialization"
            label="Spezialisierung (optional)"
            filled
            dense
            hint="z.B. 'Verbotenes Wissen (Dämonen)'"
          />

          <q-select
            v-model="newSkill.attribute"
            :options="attributeOptions"
            label="Attribut"
            filled
            dense
          />

          <q-input
            v-model="newSkill.description"
            label="Beschreibung (optional)"
            type="textarea"
            filled
            rows="3"
          />

          <q-checkbox
            v-model="newSkill.isBasic"
            label="Als Grundfertigkeit gewährt"
          >
            <q-tooltip>
              Wenn aktiviert, kann diese Fertigkeit mit halbem Attributwert verwendet werden
            </q-tooltip>
          </q-checkbox>
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
            label="Hinzufügen"
            color="primary"
            @click="addNewSkill"
            :disable="!newSkill.name || !newSkill.attribute"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info/Description Dialog -->
    <q-dialog v-model="showSkillInfoDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ selectedSkill?.name }}</div>
          <div class="text-caption text-grey-6">
            {{ selectedSkill?.attribute }} -
            {{ selectedSkill?.specialization ? `${selectedSkill.specialization} - ` : '' }}
            {{ selectedSkillType === 'basic' ? 'Grundfertigkeit' : 'Erlernte Fertigkeit' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="editDescription"
            label="Beschreibung"
            type="textarea"
            filled
            rows="5"
            hint="Füge hier deine eigene Beschreibung oder Notizen zur Fertigkeit hinzu"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="grey"
            @click="cancelInfoDialog"
          />
          <q-btn
            flat
            label="Speichern"
            color="primary"
            @click="saveDescription"
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

const showAddSkillDialog = ref(false)
const showSkillInfoDialog = ref(false)
const selectedSkill = ref(null)
const selectedSkillType = ref(null) // 'basic' or 'learned'
const editDescription = ref('')
const filterText = ref('')
const sortAlphabetically = ref(true)

const newSkill = ref({
  name: '',
  specialization: '',
  attribute: 'IN',
  isBasic: false,
  description: ''
})

const attributeOptions = ['KG', 'BF', 'ST', 'WI', 'GE', 'IN', 'WA', 'WK', 'CH']

// Filter basic skills by search text
const filteredBasicSkills = computed(() => {
  if (!filterText.value) return character.value.basicSkills

  const filter = filterText.value.toLowerCase()
  return character.value.basicSkills.filter(skill =>
    skill.name.toLowerCase().includes(filter) ||
    skill.attribute.toLowerCase().includes(filter)
  )
})

// Filter learned skills by search text
const filteredLearnedSkills = computed(() => {
  if (!filterText.value) return character.value.learnedSkills

  const filter = filterText.value.toLowerCase()
  return character.value.learnedSkills.filter(skill =>
    skill.name.toLowerCase().includes(filter) ||
    skill.attribute.toLowerCase().includes(filter) ||
    (skill.specialization && skill.specialization.toLowerCase().includes(filter))
  )
})

// Sort and filter learned skills
const sortedFilteredLearnedSkills = computed(() => {
  const skills = [...filteredLearnedSkills.value]

  if (sortAlphabetically.value) {
    skills.sort((a, b) => a.name.localeCompare(b.name))
  }

  return skills
})

// Split basic skills into two columns
const filteredLeftBasicSkills = computed(() => {
  const half = Math.ceil(filteredBasicSkills.value.length / 2)
  return filteredBasicSkills.value.slice(0, half)
})

const filteredRightBasicSkills = computed(() => {
  const half = Math.ceil(filteredBasicSkills.value.length / 2)
  return filteredBasicSkills.value.slice(half)
})

// Split learned skills into two columns (balanced)
const leftLearnedSkills = computed(() => {
  const half = Math.ceil(sortedFilteredLearnedSkills.value.length / 2)
  return sortedFilteredLearnedSkills.value.slice(0, half)
})

const rightLearnedSkills = computed(() => {
  const half = Math.ceil(sortedFilteredLearnedSkills.value.length / 2)
  return sortedFilteredLearnedSkills.value.slice(half)
})

const updateBasicSkill = (skillName, updates) => {
  characterStore.updateBasicSkill(skillName, updates)
}

const updateLearnedSkill = (skillId, updates) => {
  characterStore.updateLearnedSkill(skillId, updates)
}

const getSkillValue = (skill) => {
  return characterStore.getSkillValue(skill)
}

const addNewSkill = () => {
  if (newSkill.value.name && newSkill.value.attribute) {
    characterStore.addLearnedSkill(newSkill.value)

    // Reset form
    newSkill.value = {
      name: '',
      specialization: '',
      attribute: 'IN',
      isBasic: false,
      description: ''
    }

    showAddSkillDialog.value = false
  }
}

const removeSkill = (skillId) => {
  characterStore.removeLearnedSkill(skillId)
}

const showInfoDialog = (skill, type) => {
  selectedSkill.value = skill
  selectedSkillType.value = type
  editDescription.value = skill.description || ''
  showSkillInfoDialog.value = true
}

const saveDescription = () => {
  if (selectedSkillType.value === 'basic') {
    updateBasicSkill(selectedSkill.value.name, { description: editDescription.value })
  } else {
    updateLearnedSkill(selectedSkill.value.id, { description: editDescription.value })
  }
  showSkillInfoDialog.value = false
}

const cancelInfoDialog = () => {
  showSkillInfoDialog.value = false
  selectedSkill.value = null
  editDescription.value = ''
}
</script>

<style scoped>
.q-item {
  min-height: 50px;
}
</style>
