<template>
  <q-card>
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h5">Fertigkeiten</div>
          <div class="text-caption text-grey-6">
            Grundfertigkeiten werden mit halbem Attributwert beherrscht
          </div>
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
              v-for="(skill, index) in leftColumnBasicSkills"
              :key="index"
              dense
            >
              <q-item-section>
                <div class="row items-center">
                  <!-- Skill Name -->
                  <div class="col-5 text-body2">
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

          <!-- Learned Skills - Left Column -->
          <div v-if="leftColumnLearnedSkills.length > 0" class="q-mt-md">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Erlernte Fertigkeiten</div>
            <q-list bordered separator>
              <q-item
                v-for="skill in leftColumnLearnedSkills"
                :key="skill.id"
                dense
                class="bg-grey-9"
              >
                <q-item-section>
                  <div class="row items-center">
                    <!-- Skill Name with specialization -->
                    <div class="col-5 text-body2">
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
                    <div class="col-1 text-right flex items-center justify-end q-gutter-xs">
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

        <!-- Right Column -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 text-grey-7 q-mb-sm">Grundfertigkeiten</div>
          <q-list bordered separator>
            <q-item
              v-for="(skill, index) in rightColumnBasicSkills"
              :key="index"
              dense
            >
              <q-item-section>
                <div class="row items-center">
                  <!-- Skill Name -->
                  <div class="col-5 text-body2">
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

          <!-- Learned Skills - Right Column -->
          <div v-if="rightColumnLearnedSkills.length > 0" class="q-mt-md">
            <div class="text-subtitle2 text-grey-7 q-mb-sm">Erlernte Fertigkeiten</div>
            <q-list bordered separator>
              <q-item
                v-for="skill in rightColumnLearnedSkills"
                :key="skill.id"
                dense
                class="bg-grey-9"
              >
                <q-item-section>
                  <div class="row items-center">
                    <!-- Skill Name with specialization -->
                    <div class="col-5 text-body2">
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
                    <div class="col-1 text-right flex items-center justify-end q-gutter-xs">
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
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const showAddSkillDialog = ref(false)
const newSkill = ref({
  name: '',
  specialization: '',
  attribute: 'IN',
  isBasic: false
})

const attributeOptions = ['KG', 'BF', 'ST', 'WI', 'GE', 'IN', 'WA', 'WK', 'CH']

// Split basic skills into two columns
const leftColumnBasicSkills = computed(() => {
  const half = Math.ceil(character.value.basicSkills.length / 2)
  return character.value.basicSkills.slice(0, half)
})

const rightColumnBasicSkills = computed(() => {
  const half = Math.ceil(character.value.basicSkills.length / 2)
  return character.value.basicSkills.slice(half)
})

// Split learned skills into two columns
const leftColumnLearnedSkills = computed(() => {
  const half = Math.ceil(character.value.learnedSkills.length / 2)
  return character.value.learnedSkills.slice(0, half)
})

const rightColumnLearnedSkills = computed(() => {
  const half = Math.ceil(character.value.learnedSkills.length / 2)
  return character.value.learnedSkills.slice(half)
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
      isBasic: false
    }

    showAddSkillDialog.value = false
  }
}

const removeSkill = (skillId) => {
  characterStore.removeLearnedSkill(skillId)
}
</script>

<style scoped>
.q-item {
  min-height: 50px;
}
</style>
