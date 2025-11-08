<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section class="q-pa-sm">
      <!-- First Row: Attributes -->
      <div class="row q-col-gutter-xs q-mb-sm">
        <div
          v-for="(value, attr) in character.attributes"
          :key="attr"
          class="col-auto"
        >
          <q-card bordered flat class="text-center" style="min-width: 70px;">
            <q-card-section class="q-pa-xs">
              <div class="text-caption text-grey-6">{{ attr }}</div>
              <div class="text-h6 text-bold">{{ value }}</div>
              <!-- Dots for increases -->
              <div class="flex justify-center q-gutter-xs" style="min-height: 12px;">
                <q-icon
                  v-for="i in 4"
                  :key="i"
                  :name="i <= character.attributeIncreases[attr] ? 'circle' : 'circle'"
                  :class="i <= character.attributeIncreases[attr] ? 'text-primary' : 'text-grey-7'"
                  size="8px"
                  style="cursor: pointer;"
                  @click="toggleIncrease(attr, i)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Second Row: Combat & Physical Stats -->
      <div class="row q-col-gutter-sm">
        <!-- Hit Points -->
        <div class="col-auto">
          <q-card bordered flat>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-6">Lebenspunkte</div>
              <div class="row q-gutter-xs items-center">
                <q-input
                  :model-value="character.hitPoints.current"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateHP('current', parseInt($event) || 0)"
                  style="width: 40px;"
                  input-class="text-center text-h6"
                />
                <div class="text-grey-6">/</div>
                <q-input
                  :model-value="character.hitPoints.max"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateHP('max', parseInt($event) || 0)"
                  style="width: 40px;"
                  input-class="text-center text-h6"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Movement -->
        <div class="col-auto">
          <q-card bordered flat>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-6">Bewegung (H/V/S/R)</div>
              <div class="row q-gutter-xs items-center">
                <q-input
                  :model-value="character.movement.half"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateMovement('half', parseInt($event) || 0)"
                  style="width: 35px;"
                  input-class="text-center"
                />
                <q-input
                  :model-value="character.movement.full"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateMovement('full', parseInt($event) || 0)"
                  style="width: 35px;"
                  input-class="text-center"
                />
                <q-input
                  :model-value="character.movement.charge"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateMovement('charge', parseInt($event) || 0)"
                  style="width: 35px;"
                  input-class="text-center"
                />
                <q-input
                  :model-value="character.movement.run"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateMovement('run', parseInt($event) || 0)"
                  style="width: 35px;"
                  input-class="text-center"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Carrying Capacity -->
        <div class="col-auto">
          <q-card bordered flat>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-6">Tragkraft (H/T/S)</div>
              <div class="row q-gutter-xs items-center">
                <q-input
                  :model-value="character.carryingCapacity.lift"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateCarrying('lift', parseInt($event) || 0)"
                  style="width: 40px;"
                  input-class="text-center"
                />
                <q-input
                  :model-value="character.carryingCapacity.carry"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateCarrying('carry', parseInt($event) || 0)"
                  style="width: 40px;"
                  input-class="text-center"
                />
                <q-input
                  :model-value="character.carryingCapacity.push"
                  type="number"
                  dense
                  borderless
                  @update:model-value="updateCarrying('push', parseInt($event) || 0)"
                  style="width: 40px;"
                  input-class="text-center"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Experience Points -->
        <div class="col-auto">
          <q-card bordered flat>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-6">Erfahrung (V/A)</div>
              <div class="row q-gutter-xs items-center">
                <q-input
                  :model-value="character.experience.spent"
                  type="number"
                  dense
                  borderless
                  @update:model-value="character.experience.spent = parseInt($event) || 0"
                  style="width: 50px;"
                  input-class="text-center"
                />
                <div class="text-grey-6">/</div>
                <div class="text-bold">{{ character.experience.total - character.experience.spent }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Profit Factor -->
        <div class="col-auto">
          <q-card bordered flat>
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-6">Profitfaktor</div>
              <q-input
                :model-value="character.profitFactor.current"
                type="number"
                dense
                borderless
                @update:model-value="character.profitFactor.current = parseInt($event) || 0"
                style="width: 50px;"
                input-class="text-center text-h6"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const toggleIncrease = (attr, level) => {
  const current = character.value.attributeIncreases[attr]
  const newValue = current === level ? level - 1 : level
  characterStore.updateAttributeIncrease(attr, Math.max(0, Math.min(4, newValue)))
}

const updateHP = (field, value) => {
  character.value.hitPoints[field] = value
}

const updateMovement = (field, value) => {
  character.value.movement[field] = value
}

const updateCarrying = (field, value) => {
  character.value.carryingCapacity[field] = value
}
</script>

<style scoped>
.q-icon {
  transition: all 0.2s ease;
}

.q-icon:hover {
  transform: scale(1.3);
}
</style>
