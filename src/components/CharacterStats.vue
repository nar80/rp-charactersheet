<template>
  <q-card flat bordered class="sticky-stats q-mb-md">
    <q-card-section class="q-pa-md">
      <!-- Row 1: Attributes -->
      <div class="row justify-center q-col-gutter-md q-mb-md">
        <div
          v-for="(value, attr) in character.attributes"
          :key="attr"
          class="col-auto"
        >
          <q-card bordered flat class="text-center attribute-card">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-5 q-mb-xs">{{ getAttributeName(attr) }}</div>
              <div class="text-overline text-grey-6">{{ attr }}</div>
              <q-input
                :model-value="value"
                type="number"
                dense
                borderless
                @update:model-value="updateAttribute(attr, parseInt($event) || 0)"
                input-class="text-center text-h5 text-bold text-primary"
                class="centered-input"
              />
              <!-- Dots for increases -->
              <div class="flex justify-center q-gutter-xs q-mt-xs" style="min-height: 16px;">
                <q-icon
                  v-for="i in 4"
                  :key="i"
                  :name="i <= character.attributeIncreases[attr] ? 'circle' : 'circle'"
                  :class="i <= character.attributeIncreases[attr] ? 'text-amber' : 'text-grey-7'"
                  size="10px"
                  style="cursor: pointer;"
                  @click="toggleIncrease(attr, i)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Row 2: Combat Stats -->
      <div class="row justify-evenly q-col-gutter-md q-mb-md">
        <!-- Hit Points -->
        <div class="col-auto">
          <q-card bordered flat class="stat-card">
            <q-card-section class="q-pa-sm stat-card-content">
              <div class="text-caption text-grey-5 q-mb-sm">
                <q-icon name="favorite" size="xs" class="q-mr-xs" />
                Lebenspunkte
              </div>
              <div class="row q-gutter-sm items-center justify-center flex-grow">
                <q-input
                  :model-value="character.hitPoints.current"
                  type="number"
                  dense
                  filled
                  @update:model-value="updateHP('current', parseInt($event) || 0)"
                  style="width: 60px;"
                  input-class="text-center text-h6"
                />
                <div class="text-h6 text-grey-6">/</div>
                <q-input
                  :model-value="character.hitPoints.max"
                  type="number"
                  dense
                  filled
                  @update:model-value="updateHP('max', parseInt($event) || 0)"
                  style="width: 60px;"
                  input-class="text-center text-h6"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Experience Points -->
        <div class="col-auto">
          <q-card bordered flat class="stat-card">
            <q-card-section class="q-pa-sm stat-card-content">
              <div class="text-caption text-grey-5 q-mb-sm">
                <q-icon name="emoji_events" size="xs" class="q-mr-xs" />
                Erfahrungspunkte
              </div>
              <div class="row q-gutter-sm items-center justify-center flex-grow">
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Gesamt</div>
                  <q-input
                    :model-value="character.experience.total"
                    type="number"
                    dense
                    filled
                    @update:model-value="character.experience.total = parseInt($event) || 0"
                    style="width: 70px;"
                    input-class="text-center"
                  />
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Vergeben</div>
                  <q-input
                    :model-value="character.experience.spent"
                    type="number"
                    dense
                    filled
                    @update:model-value="character.experience.spent = parseInt($event) || 0"
                    style="width: 70px;"
                    input-class="text-center"
                  />
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Verfügbar</div>
                  <div class="text-h6 text-bold text-positive" style="min-height: 40px; display: flex; align-items: center;">
                    {{ character.experience.total - character.experience.spent }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Profit Factor -->
        <div class="col-auto">
          <q-card bordered flat class="stat-card">
            <q-card-section class="q-pa-sm stat-card-content">
              <div class="text-caption text-grey-5 q-mb-sm">
                <q-icon name="monetization_on" size="xs" class="q-mr-xs" />
                Profitfaktor
              </div>
              <div class="row q-gutter-sm items-center justify-center flex-grow">
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Anfänglich</div>
                  <q-input
                    :model-value="character.profitFactor.initial"
                    type="number"
                    dense
                    filled
                    @update:model-value="character.profitFactor.initial = parseInt($event) || 0"
                    style="width: 60px;"
                    input-class="text-center"
                  />
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Aktuell</div>
                  <q-input
                    :model-value="character.profitFactor.current"
                    type="number"
                    dense
                    filled
                    @update:model-value="character.profitFactor.current = parseInt($event) || 0"
                    style="width: 60px;"
                    input-class="text-center text-h6 text-bold"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Row 3: Movement & Carrying -->
      <div class="row justify-evenly q-col-gutter-md">
        <!-- Movement -->
        <div class="col-auto">
          <q-card bordered flat class="stat-card">
            <q-card-section class="q-pa-sm stat-card-content">
              <div class="text-caption text-grey-5 q-mb-sm">
                <q-icon name="directions_run" size="xs" class="q-mr-xs" />
                Bewegung (GEb: {{ agilityBonus }})
              </div>
              <div class="row q-gutter-sm items-center justify-center flex-grow">
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Halbe</div>
                  <div class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders" style="min-width: 50px; text-align: center;">
                    {{ halfMove }}
                  </div>
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Volle</div>
                  <div class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders" style="min-width: 50px; text-align: center;">
                    {{ fullMove }}
                  </div>
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Sturm</div>
                  <div class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders" style="min-width: 50px; text-align: center;">
                    {{ chargeMove }}
                  </div>
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Rennen</div>
                  <div class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders" style="min-width: 50px; text-align: center;">
                    {{ runMove }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Jumps -->
        <div class="col-auto">
          <q-card bordered flat class="stat-card">
            <q-card-section class="q-pa-sm stat-card-content">
              <div class="text-caption text-grey-5 q-mb-sm">
                <q-icon name="flight_takeoff" size="xs" class="q-mr-xs" />
                Sprünge (STb: {{ strengthBonus }})
              </div>
              <div class="row q-gutter-sm items-center justify-center flex-grow">
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Weitsprung</div>
                  <div class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders" style="min-width: 60px; text-align: center;">
                    {{ longJump }}m
                  </div>
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Hochsprung</div>
                  <div class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders" style="min-width: 60px; text-align: center;">
                    {{ highJump }}cm
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Carrying Capacity -->
        <div class="col-auto">
          <q-card bordered flat class="stat-card">
            <q-card-section class="q-pa-sm stat-card-content">
              <div class="text-caption text-grey-5 q-mb-sm">
                <q-icon name="fitness_center" size="xs" class="q-mr-xs" />
                Tragkraft (STb + WIb: {{ carryBonus }})
              </div>
              <div class="row q-gutter-sm items-center justify-center flex-grow">
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Heben</div>
                  <q-input
                    :model-value="character.carryingCapacity.lift"
                    type="number"
                    dense
                    filled
                    @update:model-value="updateCarrying('lift', parseInt($event) || 0)"
                    style="width: 60px;"
                    input-class="text-center"
                  />
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Tragen</div>
                  <q-input
                    :model-value="character.carryingCapacity.carry"
                    type="number"
                    dense
                    filled
                    @update:model-value="updateCarrying('carry', parseInt($event) || 0)"
                    style="width: 60px;"
                    input-class="text-center"
                  />
                </div>
                <div class="column items-center">
                  <div class="text-caption text-grey-6">Schieben</div>
                  <q-input
                    :model-value="character.carryingCapacity.push"
                    type="number"
                    dense
                    filled
                    @update:model-value="updateCarrying('push', parseInt($event) || 0)"
                    style="width: 60px;"
                    input-class="text-center"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const attributeNames = {
  KG: 'Kampfgeschick',
  BF: 'Ballistische Fertigkeit',
  ST: 'Stärke',
  WI: 'Widerstand',
  GE: 'Gewandtheit',
  IN: 'Intelligenz',
  WA: 'Wahrnehmung',
  WK: 'Willenskraft',
  CH: 'Charisma'
}

const getAttributeName = (attr) => {
  return attributeNames[attr] || attr
}

const updateAttribute = (attr, value) => {
  characterStore.updateAttribute(attr, value)
}

const toggleIncrease = (attr, level) => {
  const current = character.value.attributeIncreases[attr]
  const newValue = current === level ? level - 1 : level
  characterStore.updateAttributeIncrease(attr, Math.max(0, Math.min(4, newValue)))
}

const updateHP = (field, value) => {
  character.value.hitPoints[field] = value
}

const updateCarrying = (field, value) => {
  character.value.carryingCapacity[field] = value
}

// Computed bonuses
const agilityBonus = computed(() => Math.floor(character.value.attributes.GE / 10))
const strengthBonus = computed(() => Math.floor(character.value.attributes.ST / 10))
const toughnessBonus = computed(() => Math.floor(character.value.attributes.WI / 10))
const carryBonus = computed(() => strengthBonus.value + toughnessBonus.value)

// Movement calculations (based on Agility Bonus)
const halfMove = computed(() => agilityBonus.value * 1)
const fullMove = computed(() => agilityBonus.value * 2)
const chargeMove = computed(() => agilityBonus.value * 3)
const runMove = computed(() => agilityBonus.value * 6)

// Jump calculations (based on Strength Bonus)
const longJump = computed(() => strengthBonus.value * 1)
const highJump = computed(() => strengthBonus.value * 20)
</script>

<style scoped>
.sticky-stats {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--q-dark);
}

.attribute-card {
  width: 110px;
  height: 140px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.attribute-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.centered-input {
  width: 100%;
}

.centered-input >>> input {
  text-align: center !important;
}

.stat-card {
  min-width: 200px;
  height: 120px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.stat-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.flex-grow {
  flex-grow: 1;
}

.q-icon {
  transition: all 0.2s ease;
}

.q-icon:hover {
  transform: scale(1.3);
}

.rounded-borders {
  border-radius: 4px;
}
</style>
