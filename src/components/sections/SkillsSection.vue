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
            flat
            dense
            icon="sort_by_alpha"
            :color="sortAlphabetically ? 'primary' : 'grey'"
            @click="sortAlphabetically = !sortAlphabetically"
          >
            <q-tooltip>Alphabetisch sortieren</q-tooltip>
          </q-btn>
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
                      @click="showInfoDialog(skill)"
                    >
                      <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                    </q-btn>
                  </div>

                  <!-- Skill Name -->
                  <div class="col-5 text-body2">
                    {{ skill.name }}
                    <span v-if="skill.specialization" class="text-caption text-grey-6">
                      ({{ skill.specialization }})
                    </span>
                    <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                  </div>

                  <!-- E Checkbox only -->
                  <div class="col-2 flex justify-center">
                    <q-checkbox
                      :model-value="skill.trained"
                      label="E"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill, { trained: $event })"
                    >
                      <q-tooltip>Erlernt (volles Attribut)</q-tooltip>
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
                      @update:model-value="updateSkill(skill, { bonus: parseInt($event) || 0 })"
                      input-style="text-align: center; font-size: 0.9rem;"
                    />
                  </div>

                  <!-- Value and Delete (for custom basic skills) -->
                  <div class="col-2 text-right flex items-center justify-end q-gutter-xs">
                    <div class="text-body1 text-primary">
                      {{ getSkillValue(skill) }}
                    </div>
                    <!-- Delete button only for custom-added basic skills (have an id) -->
                    <q-btn
                      v-if="skill.id !== undefined"
                      flat
                      dense
                      round
                      size="xs"
                      icon="delete"
                      color="grey-6"
                      @click="removeSkill(skill)"
                    >
                      <q-tooltip>Fertigkeit löschen</q-tooltip>
                    </q-btn>
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
                      @click="showInfoDialog(skill)"
                    >
                      <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                    </q-btn>
                  </div>

                  <!-- Skill Name -->
                  <div class="col-5 text-body2">
                    {{ skill.name }}
                    <span v-if="skill.specialization" class="text-caption text-grey-6">
                      ({{ skill.specialization }})
                    </span>
                    <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                  </div>

                  <!-- E Checkbox only -->
                  <div class="col-2 flex justify-center">
                    <q-checkbox
                      :model-value="skill.trained"
                      label="E"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill, { trained: $event })"
                    >
                      <q-tooltip>Erlernt (volles Attribut)</q-tooltip>
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
                      @update:model-value="updateSkill(skill, { bonus: parseInt($event) || 0 })"
                      input-style="text-align: center; font-size: 0.9rem;"
                    />
                  </div>

                  <!-- Value and Delete (for custom basic skills) -->
                  <div class="col-2 text-right flex items-center justify-end q-gutter-xs">
                    <div class="text-body1 text-primary">
                      {{ getSkillValue(skill) }}
                    </div>
                    <!-- Delete button only for custom-added basic skills (have an id) -->
                    <q-btn
                      v-if="skill.id !== undefined"
                      flat
                      dense
                      round
                      size="xs"
                      icon="delete"
                      color="grey-6"
                      @click="removeSkill(skill)"
                    >
                      <q-tooltip>Fertigkeit löschen</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <!-- Learned Skills Section - Full Width -->
      <div v-if="sortedFilteredLearnedSkills.length > 0" class="q-mt-md">
        <div class="text-subtitle2 text-grey-7 q-mb-sm">Erlernte Fertigkeiten</div>

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
                        @click="showInfoDialog(skill)"
                      >
                        <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                      </q-btn>
                    </div>

                    <!-- Skill Name with specialization -->
                    <div class="col-4 text-body2">
                      {{ skill.name }}
                      <span v-if="skill.specialization" class="text-caption text-grey-6">
                        ({{ skill.specialization }})
                      </span>
                      <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                    </div>

                    <!-- Checkboxes -->
                    <div class="col-3 flex justify-center q-gutter-xs">
                      <q-checkbox
                        :model-value="skill.plus10"
                        label="+10"
                        size="xs"
                        dense
                        @update:model-value="updateSkill(skill, { plus10: $event })"
                      >
                        <q-tooltip>+10%</q-tooltip>
                      </q-checkbox>

                      <q-checkbox
                        :model-value="skill.plus20"
                        label="+20"
                        size="xs"
                        dense
                        @update:model-value="updateSkill(skill, { plus20: $event })"
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
                        @update:model-value="updateSkill(skill, { bonus: parseInt($event) || 0 })"
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
                        color="grey-6"
                        @click="removeSkill(skill)"
                      >
                        <q-tooltip>{{ skill.isBasic ? 'Zurück zu Grundfertigkeiten' : 'Fertigkeit löschen' }}</q-tooltip>
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
                        @click="showInfoDialog(skill)"
                      >
                        <q-tooltip>Beschreibung anzeigen/bearbeiten</q-tooltip>
                      </q-btn>
                    </div>

                    <!-- Skill Name with specialization -->
                    <div class="col-4 text-body2">
                      {{ skill.name }}
                      <span v-if="skill.specialization" class="text-caption text-grey-6">
                        ({{ skill.specialization }})
                      </span>
                      <span class="text-caption text-grey-6">({{ skill.attribute }})</span>
                    </div>

                    <!-- Checkboxes -->
                    <div class="col-3 flex justify-center q-gutter-xs">
                      <q-checkbox
                        :model-value="skill.plus10"
                        label="+10"
                        size="xs"
                        dense
                        @update:model-value="updateSkill(skill, { plus10: $event })"
                      >
                        <q-tooltip>+10%</q-tooltip>
                      </q-checkbox>

                      <q-checkbox
                        :model-value="skill.plus20"
                        label="+20"
                        size="xs"
                        dense
                        @update:model-value="updateSkill(skill, { plus20: $event })"
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
                        @update:model-value="updateSkill(skill, { bonus: parseInt($event) || 0 })"
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
                        color="grey-6"
                        @click="removeSkill(skill)"
                      >
                        <q-tooltip>{{ skill.isBasic ? 'Zurück zu Grundfertigkeiten' : 'Fertigkeit löschen' }}</q-tooltip>
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
          <q-select
            v-model="newSkill.selectedSkill"
            :options="advancedSkills"
            option-label="name"
            label="Fertigkeit auswählen"
            filled
            dense
            clearable
            use-input
            input-debounce="0"
            @filter="filterSkills"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>
                    {{ scope.opt.attribute }}
                    <span v-if="scope.opt.requiresSpecialization">• Benötigt Spezialisierung</span>
                    <span v-if="scope.opt.category"> • {{ scope.opt.category }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Keine Fertigkeiten gefunden
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="newSkill.specialization"
            :label="requiresSpecialization ? 'Spezialisierung (erforderlich)' : 'Spezialisierung (optional)'"
            filled
            dense
            :hint="requiresSpecialization ? 'Diese Fertigkeit benötigt eine Spezialisierung' : 'z.B. \'Verbotenes Wissen (Dämonen)\''"
            :rules="requiresSpecialization ? [val => !!val || 'Spezialisierung erforderlich'] : []"
          />

          <q-select
            v-model="newSkill.attribute"
            :options="attributeOptions"
            label="Attribut"
            filled
            dense
            :disable="!!newSkill.selectedSkill"
            hint="Wird automatisch gesetzt bei Auswahl einer vordefinierten Fertigkeit"
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
            :disable="!!newSkill.selectedSkill"
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
            :disable="!newSkill.name || !newSkill.attribute || (requiresSpecialization && !newSkill.specialization)"
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
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'
import { advancedSkills } from '../../data/advancedSkills'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddSkillDialog = ref(false)
const showSkillInfoDialog = ref(false)
const selectedSkill = ref(null)
const selectedSkillType = ref(null) // 'basic' or 'learned'
const editDescription = ref('')
const filterText = ref('')
const sortAlphabetically = ref(true)

// Load sort preference from localStorage
onMounted(() => {
  const saved = localStorage.getItem('skills-sort-alpha')
  if (saved !== null) {
    sortAlphabetically.value = saved === 'true'
  }
})

// Save sort preference to localStorage
watch(sortAlphabetically, (newValue) => {
  localStorage.setItem('skills-sort-alpha', newValue.toString())
})

const newSkill = ref({
  selectedSkill: null,
  name: '',
  specialization: '',
  attribute: 'IN',
  isBasic: false,
  description: ''
})

// Computed: Check if selected skill requires specialization
const requiresSpecialization = computed(() => {
  return newSkill.value.selectedSkill?.requiresSpecialization || false
})

// Watch selected skill and auto-fill data
watch(() => newSkill.value.selectedSkill, (skill) => {
  if (skill) {
    newSkill.value.name = skill.name
    newSkill.value.attribute = skill.attribute
    newSkill.value.description = skill.description || ''
    newSkill.value.isBasic = false
    // Clear specialization when changing skill
    if (!skill.requiresSpecialization) {
      newSkill.value.specialization = ''
    }
  }
})

const attributeOptions = ['KG', 'BF', 'ST', 'WI', 'GE', 'IN', 'WA', 'WK', 'CH']

// Filter function for skill selection
const skillOptions = ref(advancedSkills)

const filterSkills = (val, update) => {
  update(() => {
    if (val === '') {
      skillOptions.value = advancedSkills
    } else {
      const needle = val.toLowerCase()
      skillOptions.value = advancedSkills.filter(
        skill => skill.name.toLowerCase().includes(needle)
      )
    }
  })
}

// Combine all skills (basic + learned)
const allSkills = computed(() => {
  return [...character.value.basicSkills, ...character.value.learnedSkills]
})

// Filter basic skills: isBasic=true AND trained=false
const filteredBasicSkills = computed(() => {
  let skills = allSkills.value.filter(skill => skill.isBasic && !skill.trained)

  if (filterText.value) {
    const filter = filterText.value.toLowerCase()
    skills = skills.filter(skill =>
      skill.name.toLowerCase().includes(filter) ||
      skill.attribute.toLowerCase().includes(filter)
    )
  }

  return skills
})

// Filter learned skills: trained=true (regardless of isBasic)
const filteredLearnedSkills = computed(() => {
  let skills = allSkills.value.filter(skill => skill.trained)

  if (filterText.value) {
    const filter = filterText.value.toLowerCase()
    skills = skills.filter(skill =>
      skill.name.toLowerCase().includes(filter) ||
      skill.attribute.toLowerCase().includes(filter) ||
      (skill.specialization && skill.specialization.toLowerCase().includes(filter))
    )
  }

  return skills
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

const updateSkill = (skill, updates) => {
  // Check if skill has id (learned skill) or is from basicSkills
  if (skill.id !== undefined) {
    // It's a learned skill
    characterStore.updateLearnedSkill(skill.id, updates)
  } else {
    // It's a basic skill (identified by name)
    characterStore.updateBasicSkill(skill.name, updates)
  }
}

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
    // Check if specialization is required
    if (requiresSpecialization.value && !newSkill.value.specialization) {
      return
    }

    characterStore.addLearnedSkill(newSkill.value)

    // Reset form
    newSkill.value = {
      selectedSkill: null,
      name: '',
      specialization: '',
      attribute: 'IN',
      isBasic: false,
      description: ''
    }

    showAddSkillDialog.value = false
  }
}

const removeSkill = (skill) => {
  // Wenn es eine benutzerdefinierte Fertigkeit mit ID ist, wirklich löschen
  if (skill.id !== undefined) {
    characterStore.removeLearnedSkill(skill.id)
  }
  // Wenn es eine vordefinierte Grundfertigkeit ist (kein ID), die erlernt wurde,
  // dann nur trained auf false setzen (zurück zu Grundfertigkeiten)
  else if (skill.isBasic) {
    updateSkill(skill, { trained: false, plus10: false, plus20: false })
  }
}

const showInfoDialog = (skill, type) => {
  selectedSkill.value = skill
  // Auto-detect type if not provided
  if (type) {
    selectedSkillType.value = type
  } else {
    selectedSkillType.value = skill.id !== undefined ? 'learned' : 'basic'
  }
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
