<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Fertigkeiten</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row">
        <!-- Left Column -->
        <div class="col-12 col-md-6 q-pr-md">
          <q-list bordered separator>
            <q-item
              v-for="(skill, index) in leftColumnSkills"
              :key="index"
              dense
            >
              <q-item-section>
                <div class="row items-center no-wrap">
                  <!-- Skill Name -->
                  <div class="col-4 text-body2">
                    {{ skill.name }}
                  </div>

                  <!-- Attribute -->
                  <div class="col-1 text-caption text-grey-6 text-center">
                    ({{ skill.attribute }})
                  </div>

                  <!-- Checkboxes -->
                  <div class="col-5 flex justify-center q-gutter-xs">
                    <q-checkbox
                      :model-value="skill.type === 'basic'"
                      label="GF"
                      size="xs"
                      dense
                      disable
                    >
                      <q-tooltip>Grundfertigkeit</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.trained"
                      label="E"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill.name, { trained: $event })"
                    >
                      <q-tooltip>Erlernt</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus10"
                      label="+10"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill.name, { plus10: $event })"
                    >
                      <q-tooltip>+10%</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus20"
                      label="+20"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill.name, { plus20: $event })"
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
                      placeholder="Bonus"
                      @update:model-value="updateSkill(skill.name, { bonus: parseInt($event) || 0 })"
                      input-style="text-align: center;"
                    />
                  </div>
                </div>

                <!-- Calculated Value -->
                <div class="row q-mt-xs">
                  <div class="col-12 text-right text-caption text-primary">
                    Wert: {{ getSkillValue(skill) }}
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-6 q-pl-md">
          <q-list bordered separator>
            <q-item
              v-for="(skill, index) in rightColumnSkills"
              :key="index"
              dense
            >
              <q-item-section>
                <div class="row items-center no-wrap">
                  <!-- Skill Name -->
                  <div class="col-4 text-body2">
                    {{ skill.name }}
                  </div>

                  <!-- Attribute -->
                  <div class="col-1 text-caption text-grey-6 text-center">
                    ({{ skill.attribute }})
                  </div>

                  <!-- Checkboxes -->
                  <div class="col-5 flex justify-center q-gutter-xs">
                    <q-checkbox
                      :model-value="skill.type === 'basic'"
                      label="GF"
                      size="xs"
                      dense
                      disable
                    >
                      <q-tooltip>Grundfertigkeit</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.trained"
                      label="E"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill.name, { trained: $event })"
                    >
                      <q-tooltip>Erlernt</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus10"
                      label="+10"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill.name, { plus10: $event })"
                    >
                      <q-tooltip>+10%</q-tooltip>
                    </q-checkbox>

                    <q-checkbox
                      :model-value="skill.plus20"
                      label="+20"
                      size="xs"
                      dense
                      @update:model-value="updateSkill(skill.name, { plus20: $event })"
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
                      placeholder="Bonus"
                      @update:model-value="updateSkill(skill.name, { bonus: parseInt($event) || 0 })"
                      input-style="text-align: center;"
                    />
                  </div>
                </div>

                <!-- Calculated Value -->
                <div class="row q-mt-xs">
                  <div class="col-12 text-right text-caption text-primary">
                    Wert: {{ getSkillValue(skill) }}
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

// Split skills into two columns
const leftColumnSkills = computed(() => {
  const half = Math.ceil(character.value.skills.length / 2)
  return character.value.skills.slice(0, half)
})

const rightColumnSkills = computed(() => {
  const half = Math.ceil(character.value.skills.length / 2)
  return character.value.skills.slice(half)
})

const updateSkill = (skillName, updates) => {
  characterStore.updateSkill(skillName, updates)
}

const getSkillValue = (skill) => {
  return characterStore.getSkillValue(skill)
}
</script>

<style scoped>
.q-item {
  min-height: 60px;
}
</style>
