<template>
  <div class="sticky-stats-wrapper">
    <q-card flat bordered class="q-mb-md">
      <q-card-section :class="attributesExpanded ? 'q-pa-md' : 'q-py-xs q-px-md'">
        <!-- Attributes Header with Toggle -->
        <div class="row items-center" :class="attributesExpanded ? 'q-mb-sm' : 'q-mb-xs'">
          <div class="col">
            <div class="text-caption text-grey-5">Attribute</div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              dense
              round
              size="sm"
              :icon="attributesExpanded ? 'expand_less' : 'expand_more'"
              @click="toggleAttributes"
            >
              <q-tooltip>{{ attributesExpanded ? 'Einklappen' : 'Ausklappen' }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Collapsed View: Compact single row -->
        <div v-if="!attributesExpanded" class="row items-center q-gutter-xs">
          <!-- Left side: HP and Exhaustion -->
          <div class="row items-center q-gutter-sm">
            <div class="column q-gutter-xs">
              <!-- HP Compact -->
              <div class="stat-compact">
                <q-icon name="favorite" size="xs" color="red" class="q-mr-xs" />
                <span class="text-caption text-grey-6 stat-label">{{ character.hitPoints.current }}/{{ character.hitPoints.max }}</span>
                <NumberInput
                  :model-value="character.hitPoints.current"
                  :min="-10"
                  :max="character.hitPoints.max"
                  button-color="red"
                  text-color="#ef5350"
                  @update:model-value="updateHP('current', $event)"
                />
              </div>
              <!-- Exhaustion Compact -->
              <div class="stat-compact" :class="{ 'stat-compact-danger': isUnconscious }">
                <q-icon name="local_fire_department" size="xs" color="orange" class="q-mr-xs" />
                <span class="text-caption text-grey-6 stat-label">{{ character.exhaustion }}/{{ toughnessBonus }}</span>
                <NumberInput
                  :model-value="character.exhaustion"
                  :min="0"
                  :max="99"
                  button-color="orange"
                  text-color="#ff9800"
                  @update:model-value="updateExhaustion($event)"
                />
              </div>
            </div>

            <!-- Status Badges -->
            <div class="column q-gutter-xs">
              <q-badge v-if="character.exhaustion > 0" color="red" class="text-caption">
                -10 Würfe
              </q-badge>
              <q-badge v-if="isUnconscious" color="negative" class="text-caption text-bold">
                BEWUSSTLOS!
              </q-badge>
            </div>
          </div>

          <!-- Center: Attributes -->
          <div class="row justify-center q-gutter-sm flex-grow">
            <div
              v-for="(value, attr) in character.attributes"
              :key="attr"
              class="attribute-compact"
            >
              <div class="text-overline text-grey-6 text-center">{{ attr }}</div>
              <div class="text-h6 text-bold text-primary text-center">{{ value }}</div>
              <!-- Small dots indicator -->
              <div class="flex justify-center q-gutter-xs" style="min-height: 12px">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="dot-indicator"
                  :class="{ 'dot-active': i <= character.attributeIncreases[attr] }"
                />
              </div>
            </div>
          </div>

          <!-- Right side: Ship Points & Initiative -->
          <div class="column q-gutter-xs">
            <!-- Ship Points -->
            <div class="stat-compact">
              <q-icon name="rocket_launch" size="xs" color="blue" class="q-mr-xs" />
              <span class="text-caption text-grey-6 stat-label">{{ character.shipPoints.current }}/{{ character.shipPoints.max }}</span>
              <NumberInput
                :model-value="character.shipPoints.current"
                :min="0"
                :max="character.shipPoints.max"
                button-color="blue"
                text-color="#42a5f5"
                @update:model-value="updateShipPoints('current', $event)"
              />
              <q-btn
                flat
                dense
                round
                size="xs"
                icon="refresh"
                color="blue"
                @click="resetShipPoints"
                class="q-ml-xs"
                style="width: 20px; height: 20px;"
              >
                <q-tooltip>Ship-Points auffüllen</q-tooltip>
              </q-btn>
            </div>
            <!-- Initiative -->
            <div class="stat-compact">
              <q-icon name="bolt" size="xs" color="amber" class="q-mr-xs" />
              <span class="text-caption text-grey-6">Mod:</span>
              <q-input
                :model-value="character.initiativeModifier ?? 0"
                @update:model-value="character.initiativeModifier = parseInt($event) || 0"
                type="number"
                dense
                borderless
                class="initiative-mod-input"
                input-class="text-center"
              >
                <q-tooltip>Modifikator (Talente etc.)</q-tooltip>
              </q-input>
              <span class="text-grey-6 q-mx-xs">|</span>
              <span class="text-caption text-grey-6">INI:</span>
              <span class="text-bold text-amber q-ml-xs" style="min-width: 40px;">
                1W10{{ (agilityBonus + (character.initiativeModifier || 0)) >= 0 ? '+' : '' }}{{ agilityBonus + (character.initiativeModifier || 0) }}
              </span>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="content_copy"
                color="amber"
                @click="rollInitiative"
                class="q-ml-xs"
              >
                <q-tooltip>Würfelbefehl kopieren (1W10 + {{ agilityBonus }} GEb + {{ character.initiativeModifier || 0 }} Mod)</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Expanded View: Full edit mode -->
        <div v-if="attributesExpanded" class="row justify-center q-col-gutter-md q-mb-md">
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

        <!-- Row 2: All Stats in one line (only when expanded) -->
        <div v-if="attributesExpanded" class="row justify-center q-col-gutter-md">
          <!-- Hit Points -->
          <div class="col-auto">
            <q-card bordered flat class="stat-card stat-card-compact">
              <q-card-section class="q-pa-sm stat-card-content">
                <div class="text-caption text-grey-5 q-mb-sm">
                  <q-icon name="favorite" size="xs" class="q-mr-xs" />
                  Lebenspunkte
                </div>
                <div
                  class="row q-gutter-xs items-center justify-center flex-grow"
                >
                  <NumberInput
                    :model-value="character.hitPoints.current"
                    :min="-10"
                    :max="character.hitPoints.max"
                    button-color="red"
                    text-color="#ef5350"
                    vertical
                    @update:model-value="updateHP('current', $event)"
                  />
                  <div class="text-body1 text-grey-6">/</div>
                  <NumberInput
                    :model-value="character.hitPoints.max"
                    :min="0"
                    :max="999"
                    button-color="red"
                    text-color="#ef5350"
                    vertical
                    @update:model-value="updateHP('max', $event)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Ship Points -->
          <div class="col-auto">
            <q-card bordered flat class="stat-card stat-card-compact">
              <q-card-section class="q-pa-sm stat-card-content">
                <div class="text-caption text-grey-5 q-mb-sm">
                  <q-icon name="rocket_launch" size="xs" class="q-mr-xs" />
                  Ship-Points
                  <q-btn
                    flat
                    dense
                    round
                    size="xs"
                    icon="refresh"
                    color="blue"
                    @click="resetShipPoints"
                    class="reset-btn-inline"
                  >
                    <q-tooltip>Ship-Points auffüllen</q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="row q-gutter-xs items-center justify-center flex-grow"
                >
                  <NumberInput
                    :model-value="character.shipPoints.current"
                    :min="0"
                    :max="character.shipPoints.max"
                    button-color="blue"
                    text-color="#42a5f5"
                    vertical
                    @update:model-value="updateShipPoints('current', $event)"
                  />
                  <div class="text-body1 text-grey-6">/</div>
                  <NumberInput
                    :model-value="character.shipPoints.max"
                    :min="0"
                    :max="999"
                    button-color="blue"
                    text-color="#42a5f5"
                    vertical
                    @update:model-value="updateShipPoints('max', $event)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Exhaustion -->
          <div class="col-auto">
            <q-card bordered flat class="stat-card stat-card-compact" :class="{ 'unconscious-card': isUnconscious }">
              <q-card-section class="q-pa-sm stat-card-content">
                <div class="text-caption text-grey-5 q-mb-sm">
                  <q-icon name="local_fire_department" size="xs" class="q-mr-xs" />
                  Erschöpfung (Max: {{ toughnessBonus }})
                </div>
                <div class="column items-center justify-center flex-grow q-gutter-xs">
                  <NumberInput
                    :model-value="character.exhaustion"
                    :min="0"
                    :max="99"
                    button-color="orange"
                    text-color="#ff9800"
                    vertical
                    @update:model-value="updateExhaustion($event)"
                  />
                  <div v-if="character.exhaustion > 0">
                    <q-badge color="red" class="text-caption">
                      -10 Würfe
                    </q-badge>
                  </div>
                  <div v-if="isUnconscious" class="text-caption text-red text-bold">
                    BEWUSSTLOS!
                  </div>
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
                      :model-value="formatNumber(character.experience.total)"
                      dense
                      filled
                      @update:model-value="
                        character.experience.total = parseFormattedNumber($event)
                      "
                      style="width: 80px"
                      input-class="text-center"
                    />
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Vergeben</div>
                    <q-input
                      :model-value="formatNumber(character.experience.spent)"
                      dense
                      filled
                      @update:model-value="
                        character.experience.spent = parseFormattedNumber($event)
                      "
                      style="width: 80px"
                      input-class="text-center"
                    />
                  </div>
                  <div class="column items-center">
                    <div class="text-caption text-grey-6">Rang</div>
                    <div
                      class="text-h6 text-bold metallic-text"
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
                      input-class="text-center"
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
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useCharacterStore } from "../stores/characterStore";
import NumberInput from "./NumberInput.vue";

const $q = useQuasar();

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);

// Attributes expand/collapse state
const attributesExpanded = ref(false);

// Load state from localStorage
onMounted(() => {
  const saved = localStorage.getItem('attributes-expanded');
  if (saved !== null) {
    attributesExpanded.value = saved === 'true';
  }
});

// Save state to localStorage
watch(attributesExpanded, (newValue) => {
  localStorage.setItem('attributes-expanded', newValue.toString());
});

const toggleAttributes = () => {
  attributesExpanded.value = !attributesExpanded.value;
};

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
  if (field === "current") {
    // Ensure current HP doesn't exceed max HP
    character.value.hitPoints[field] = Math.min(
      value,
      character.value.hitPoints.max
    );
  } else {
    character.value.hitPoints[field] = value;
    // If max is reduced below current, adjust current
    if (character.value.hitPoints.current > value) {
      character.value.hitPoints.current = value;
    }
  }
};

const updateShipPoints = (field, value) => {
  if (field === "current") {
    // Ensure current ship points don't exceed max
    character.value.shipPoints[field] = Math.min(
      value,
      character.value.shipPoints.max
    );
  } else {
    character.value.shipPoints[field] = value;
    // If max is reduced below current, adjust current
    if (character.value.shipPoints.current > value) {
      character.value.shipPoints.current = value;
    }
  }
};

const updateCarrying = (field, value) => {
  character.value.carryingCapacity[field] = value;
};

const resetShipPoints = () => {
  character.value.shipPoints.current = character.value.shipPoints.max;
};

// Copy initiative roll command to clipboard
const rollInitiative = async () => {
  const modifier = character.value.initiativeModifier || 0;
  const totalMod = agilityBonus.value + modifier;

  let diceCode = "1d10";
  if (totalMod > 0) {
    diceCode = `1d10+${totalMod}`;
  } else if (totalMod < 0) {
    diceCode = `1d10${totalMod}`;
  }

  const command = `/würfle generic eingabe: ${diceCode}`;

  try {
    await navigator.clipboard.writeText(command);
    $q.notify({
      message: `Kopiert: ${command}`,
      color: "positive",
      icon: "content_copy",
      timeout: 2000,
    });
  } catch (error) {
    console.error("Failed to copy:", error);
    $q.notify({
      message: "Kopieren fehlgeschlagen",
      color: "negative",
      icon: "error",
      timeout: 2000,
    });
  }
};

// Number formatting functions
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseFormattedNumber = (value) => {
  if (!value) return 0;
  // Remove dots (thousand separators) and parse
  const cleaned = value.toString().replace(/\./g, "");
  return parseInt(cleaned) || 0;
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
const willpowerBonus = computed(() =>
  Math.floor(character.value.attributes.WK / 10)
);
const carryBonus = computed(() => strengthBonus.value + toughnessBonus.value);

// Exhaustion system
const isUnconscious = computed(() =>
  character.value.exhaustion > toughnessBonus.value
);

const updateExhaustion = (value) => {
  character.value.exhaustion = value;
};

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
  if (spent >= 35000 && spent <= 44999) return 9;

  return 10; // Max rank
});
</script>

<style scoped>
.sticky-stats-wrapper {
  position: sticky;
  top: 50px;
  z-index: 999;
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

.stat-card-compact {
  min-width: 120px;
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

.reset-btn {
  transition: all 0.2s ease;
  margin-left: 4px;
}

.reset-btn:hover {
  transform: rotate(180deg) scale(1.1);
}

.reset-btn-inline {
  transition: all 0.2s ease;
  margin-left: 4px;
  vertical-align: middle;
}

.reset-btn-inline:hover {
  transform: rotate(180deg) scale(1.1);
}

/* Compact attribute view */
.attribute-compact {
  min-width: 60px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 213, 79, 0.2);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.attribute-compact:hover {
  border-color: rgba(255, 213, 79, 0.4);
  box-shadow: 0 0 8px rgba(255, 213, 79, 0.2);
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(158, 158, 158, 0.5);
  transition: all 0.2s ease;
}

.dot-active {
  background: #ffd54f;
  box-shadow: 0 0 4px #ffd54f;
}

/* Compact stat display in collapsed view */
.stat-compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 213, 79, 0.2);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.stat-compact:hover {
  border-color: rgba(255, 213, 79, 0.4);
  box-shadow: 0 0 8px rgba(255, 213, 79, 0.2);
}

.stat-compact-danger {
  border-color: rgba(244, 67, 54, 0.5) !important;
  background: rgba(244, 67, 54, 0.1) !important;
  animation: pulse-red 2s ease-in-out infinite;
}

.stat-label {
  display: inline-block;
  min-width: 36px;
  text-align: right;
}

.initiative-mod-input {
  width: 45px;
}

.initiative-mod-input :deep(input) {
  text-align: center;
  font-weight: bold;
  color: #ffd54f;
  padding: 0 4px;
}

.unconscious-card {
  border: 2px solid #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
  animation: pulse-red 2s ease-in-out infinite;
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 5px rgba(244, 67, 54, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(244, 67, 54, 0.8);
  }
}
</style>
