<template>
  <div class="sticky-stats-wrapper">
    <q-card flat bordered class="q-mb-md">
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
                <div class="text-caption text-grey-5 q-mb-xs">
                  {{ getAttributeName(attr) }}
                </div>
                <div class="text-overline text-grey-6">{{ attr }}</div>
                <q-input
                  :model-value="value"
                  dense
                  borderless
                  @update:model-value="
                    updateAttribute(attr, parseInt($event) || 0)
                  "
                  input-class="text-center text-h5 text-bold text-primary"
                  class="centered-input"
                />
                <!-- Dots for increases -->
                <div
                  class="flex justify-center q-gutter-xs q-mt-xs"
                  style="min-height: 16px"
                >
                  <q-icon
                    v-for="i in 4"
                    :key="i"
                    :name="
                      i <= character.attributeIncreases[attr]
                        ? 'circle'
                        : 'circle'
                    "
                    :class="
                      i <= character.attributeIncreases[attr]
                        ? 'text-amber'
                        : 'text-grey-7'
                    "
                    size="10px"
                    style="cursor: pointer"
                    @click="toggleIncrease(attr, i)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Row 2: All Stats in one line -->
        <div class="row justify-center q-col-gutter-md">
          <!-- Hit Points -->
          <div class="col-auto">
            <q-card bordered flat class="stat-card">
              <q-card-section class="q-pa-sm stat-card-content">
                <div class="text-caption text-grey-5 q-mb-sm">
                  <q-icon name="favorite" size="xs" class="q-mr-xs" />
                  Lebenspunkte
                </div>
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <q-input
                    :model-value="character.hitPoints.current"
                    type="number"
                    dense
                    filled
                    @update:model-value="
                      updateHP('current', parseInt($event) || 0)
                    "
                    style="width: 60px"
                    input-class="text-center text-h6"
                  />
                  <div class="text-h6 text-grey-6">/</div>
                  <q-input
                    :model-value="character.hitPoints.max"
                    type="number"
                    dense
                    filled
                    @update:model-value="updateHP('max', parseInt($event) || 0)"
                    style="width: 60px"
                    input-class="text-center text-h6"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Ship Points -->
          <div class="col-auto">
            <q-card bordered flat class="stat-card">
              <q-card-section class="q-pa-sm stat-card-content">
                <div class="text-caption text-grey-5 q-mb-sm">
                  <q-icon name="rocket_launch" size="xs" class="q-mr-xs" />
                  Ship-Points
                </div>
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <q-input
                    :model-value="character.shipPoints.current"
                    type="number"
                    dense
                    filled
                    @update:model-value="
                      character.shipPoints.current = parseInt($event) || 0
                    "
                    style="width: 50px"
                    input-class="text-center text-h6"
                  />
                  <div class="text-h6 text-grey-6">/</div>
                  <q-input
                    :model-value="character.shipPoints.max"
                    type="number"
                    dense
                    filled
                    @update:model-value="
                      character.shipPoints.max = parseInt($event) || 0
                    "
                    style="width: 50px"
                    input-class="text-center text-h6"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="refresh"
                    color="primary"
                    @click="resetShipPoints"
                  >
                    <q-tooltip>Ship-Points auffüllen</q-tooltip>
                  </q-btn>
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
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Gesamt</div>
                    <q-input
                      :model-value="character.experience.total"
                      dense
                      filled
                      @update:model-value="
                        character.experience.total = parseInt($event) || 0
                      "
                      style="width: 70px"
                      input-class="text-center"
                    />
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Vergeben</div>
                    <q-input
                      :model-value="character.experience.spent"
                      dense
                      filled
                      @update:model-value="
                        character.experience.spent = parseInt($event) || 0
                      "
                      style="width: 70px"
                      input-class="text-center"
                    />
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Rang</div>
                    <div
                      class="text-h6 text-bold text-amber"
                      style="
                        min-height: 40px;
                        display: flex;
                        align-items: center;
                      "
                    >
                      {{ calculatedRank }}
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
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Anfänglich</div>
                    <q-input
                      :model-value="character.profitFactor.initial"
                      type="number"
                      dense
                      filled
                      @update:model-value="
                        character.profitFactor.initial = parseInt($event) || 0
                      "
                      style="width: 60px"
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
                      @update:model-value="
                        character.profitFactor.current = parseInt($event) || 0
                      "
                      style="width: 60px"
                      input-class="text-center text-h6 text-bold"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Movement -->
          <div class="col-auto">
            <q-card bordered flat class="stat-card">
              <q-card-section class="q-pa-sm stat-card-content">
                <div class="text-caption text-grey-5 q-mb-sm">
                  <q-icon name="directions_run" size="xs" class="q-mr-xs" />
                  Bewegung (GEb: {{ agilityBonus }})
                </div>
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Halbe</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 50px; text-align: center"
                    >
                      {{ halfMove }}
                    </div>
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Volle</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 50px; text-align: center"
                    >
                      {{ fullMove }}
                    </div>
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Sturm</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 50px; text-align: center"
                    >
                      {{ chargeMove }}
                    </div>
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Rennen</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 50px; text-align: center"
                    >
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
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Weitsprung</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 60px; text-align: center"
                    >
                      {{ longJump }}m
                    </div>
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Hochsprung</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 60px; text-align: center"
                    >
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
                <div
                  class="row q-gutter-sm items-center justify-center flex-grow"
                >
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Tragen</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 60px; text-align: center"
                    >
                      {{ calculatedCarry.carry }}kg
                    </div>
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Heben</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 60px; text-align: center"
                    >
                      {{ calculatedCarry.lift }}kg
                    </div>
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Schieben</div>
                    <div
                      class="text-h6 text-bold bg-grey-9 q-pa-xs rounded-borders"
                      style="min-width: 60px; text-align: center"
                    >
                      {{ calculatedCarry.push }}kg
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore";

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);

const attributeNames = {
  KG: "Kampfgeschick",
  BF: "Ballistische Fe",
  ST: "Stärke",
  WI: "Widerstand",
  GE: "Gewandtheit",
  IN: "Intelligenz",
  WA: "Wahrnehmung",
  WK: "Willenskraft",
  CH: "Charisma",
};

const getAttributeName = (attr) => {
  return attributeNames[attr] || attr;
};

const updateAttribute = (attr, value) => {
  characterStore.updateAttribute(attr, value);
};

const toggleIncrease = (attr, level) => {
  const current = character.value.attributeIncreases[attr];
  const newValue = current === level ? level - 1 : level;
  characterStore.updateAttributeIncrease(
    attr,
    Math.max(0, Math.min(4, newValue))
  );
};

const updateHP = (field, value) => {
  character.value.hitPoints[field] = value;
};

const updateCarrying = (field, value) => {
  character.value.carryingCapacity[field] = value;
};

const resetShipPoints = () => {
  character.value.shipPoints.current = character.value.shipPoints.max;
};

// Carrying capacity table (STb + WIb)
const carryingCapacityTable = {
  0: { carry: 0.9, lift: 2.25, push: 4.5 },
  1: { carry: 2.25, lift: 4.5, push: 9 },
  2: { carry: 4.5, lift: 9, push: 18 },
  3: { carry: 9, lift: 18, push: 36 },
  4: { carry: 18, lift: 36, push: 72 },
  5: { carry: 27, lift: 54, push: 108 },
  6: { carry: 36, lift: 72, push: 144 },
  7: { carry: 45, lift: 90, push: 180 },
  8: { carry: 56, lift: 112, push: 225 },
  9: { carry: 67, lift: 135, push: 270 },
  10: { carry: 78, lift: 157, push: 315 },
  11: { carry: 90, lift: 180, push: 360 },
  12: { carry: 112, lift: 225, push: 450 },
  13: { carry: 225, lift: 450, push: 900 },
  14: { carry: 337, lift: 675, push: 1350 },
  15: { carry: 450, lift: 900, push: 1800 },
  16: { carry: 675, lift: 1350, push: 2700 },
  17: { carry: 900, lift: 1800, push: 3600 },
  18: { carry: 1350, lift: 2700, push: 5400 },
  19: { carry: 1800, lift: 3600, push: 7200 },
  20: { carry: 2250, lift: 4500, push: 9000 },
};

// Computed bonuses
const agilityBonus = computed(() =>
  Math.floor(character.value.attributes.GE / 10)
);
const strengthBonus = computed(() =>
  Math.floor(character.value.attributes.ST / 10)
);
const toughnessBonus = computed(() =>
  Math.floor(character.value.attributes.WI / 10)
);
const carryBonus = computed(() => strengthBonus.value + toughnessBonus.value);

// Carrying capacity (automatically calculated from table)
const calculatedCarry = computed(() => {
  const bonus = Math.min(20, carryBonus.value);
  return carryingCapacityTable[bonus] || carryingCapacityTable[0];
});

// Movement calculations (based on Agility Bonus)
const halfMove = computed(() => agilityBonus.value * 1);
const fullMove = computed(() => agilityBonus.value * 2);
const chargeMove = computed(() => agilityBonus.value * 3);
const runMove = computed(() => agilityBonus.value * 6);

// Jump calculations (based on Strength Bonus)
const longJump = computed(() => strengthBonus.value * 1);
const highJump = computed(() => strengthBonus.value * 20);

// Rank calculation (based on spent XP)
const calculatedRank = computed(() => {
  const spent = character.value.experience.spent;

  if (spent < 5000) return 0;
  if (spent >= 5000 && spent <= 6999) return 1;
  if (spent >= 7000 && spent <= 9999) return 2;
  if (spent >= 10000 && spent <= 12999) return 3;
  if (spent >= 13000 && spent <= 16999) return 4;
  if (spent >= 17000 && spent <= 20999) return 5;
  if (spent >= 21000 && spent <= 24999) return 6;
  if (spent >= 25000 && spent <= 29999) return 7;
  if (spent >= 30000 && spent <= 34999) return 8;

  return 8; // Max rank
});
</script>

<style scoped>
.sticky-stats-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--q-dark);
  padding: 16px;
  margin: -16px -16px 16px -16px;
}

.attribute-card {
  width: 140px;
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
