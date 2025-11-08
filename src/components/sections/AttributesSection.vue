<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Attribute</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div
          v-for="(value, attr) in character.attributes"
          :key="attr"
          class="col-6 col-sm-4 col-md-3"
        >
          <q-card bordered flat>
            <q-card-section class="text-center">
              <div class="text-h6 text-grey-7">
                {{ getAttributeName(attr) }}
              </div>
              <div class="text-caption text-grey-6">({{ attr }})</div>

              <!-- Attribute Value -->
              <div class="q-mt-md">
                <q-input
                  :model-value="value"
                  type="number"
                  filled
                  dense
                  class="text-h4 text-center"
                  @update:model-value="
                    updateAttribute(attr, parseInt($event) || 0)
                  "
                  input-style="text-align: center; font-size: 2rem; font-weight: bold;"
                />
              </div>

              <!-- Increases (Dots) -->
              <div class="q-mt-sm">
                <div class="text-caption text-grey-6">Erhöhungen</div>
                <div class="flex justify-center q-mt-xs q-gutter-xs">
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
                        ? 'text-primary'
                        : 'text-grey-7'
                    "
                    size="sm"
                    style="cursor: pointer"
                    @click="toggleIncrease(attr, i)"
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
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../../stores/characterStore";

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
  // If clicking the same level, decrease by 1, otherwise set to that level
  const newValue = current === level ? level - 1 : level;
  characterStore.updateAttributeIncrease(
    attr,
    Math.max(0, Math.min(4, newValue))
  );
};
</script>

<style scoped>
.q-icon {
  transition: all 0.2s ease;
}

.q-icon:hover {
  transform: scale(1.2);
}
</style>
