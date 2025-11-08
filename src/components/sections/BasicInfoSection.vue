<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Charakterinformationen</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Name -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="character.name"
            label="Charaktername"
            filled
            dense
            @update:model-value="updateField('name', $event)"
          />
        </div>

        <!-- Player -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="character.player"
            label="Spielername"
            filled
            dense
            @update:model-value="updateField('player', $event)"
          />
        </div>

        <!-- Career Path -->
        <div class="col-12 col-md-4">
          <q-input
            v-model="character.careerPath"
            label="Karrierepfad"
            filled
            dense
            @update:model-value="updateField('careerPath', $event)"
          />
        </div>

        <!-- Rank -->
        <div class="col-12 col-md-4">
          <q-input
            v-model="character.rank"
            label="Rang"
            filled
            dense
            @update:model-value="updateField('rank', $event)"
          />
        </div>

        <!-- Homeworld -->
        <div class="col-12 col-md-4">
          <q-input
            v-model="character.homeworld"
            label="Heimatwelt"
            filled
            dense
            @update:model-value="updateField('homeworld', $event)"
          />
        </div>

        <!-- Motivation -->
        <div class="col-12">
          <q-input
            v-model="character.motivation"
            label="Motivation"
            filled
            dense
            @update:model-value="updateField('motivation', $event)"
          />
        </div>

        <!-- Description -->
        <div class="col-12">
          <q-input
            v-model="character.description"
            label="Beschreibung"
            type="textarea"
            filled
            rows="3"
            @update:model-value="updateField('description', $event)"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Wahnsinn und Verderbniss -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Insanity (Wahnsinn) -->
        <div class="col-12 col-md-6">
          <q-card bordered flat>
            <q-card-section class="bg-grey-9">
              <div class="text-h6">
                <q-icon name="psychology" class="q-mr-sm" />
                Wahnsinn
              </div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                  <q-input
                    v-model.number="character.insanity.points"
                    label="Punkte"
                    type="number"
                    filled
                    dense
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="character.insanity.degree"
                    label="Grad"
                    type="number"
                    filled
                    dense
                  />
                </div>
              </div>

              <div class="text-subtitle2 q-mb-sm">Geisteskrankheiten</div>
              <q-list bordered>
                <q-item v-for="(disorder, index) in character.insanity.disorders" :key="index">
                  <q-item-section>
                    <q-item-label>{{ disorder }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      size="sm"
                      @click="removeDisorder(index)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <q-input
                v-model="newDisorder"
                label="Neue Geisteskrankheit"
                filled
                dense
                class="q-mt-md"
                @keyup.enter="addDisorder"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="add"
                    @click="addDisorder"
                  />
                </template>
              </q-input>
            </q-card-section>
          </q-card>
        </div>

        <!-- Corruption (Verderbniss) -->
        <div class="col-12 col-md-6">
          <q-card bordered flat>
            <q-card-section class="bg-grey-9">
              <div class="text-h6">
                <q-icon name="coronavirus" class="q-mr-sm" />
                Verderbniss
              </div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                  <q-input
                    v-model.number="character.corruption.points"
                    label="Punkte"
                    type="number"
                    filled
                    dense
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="character.corruption.degree"
                    label="Grad"
                    type="number"
                    filled
                    dense
                  />
                </div>
              </div>

              <div class="text-subtitle2 q-mb-sm">Metastasen</div>
              <q-list bordered>
                <q-item v-for="(malignancy, index) in character.corruption.malignancies" :key="index">
                  <q-item-section>
                    <q-item-label>{{ malignancy }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      size="sm"
                      @click="removeMalignancy(index)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <q-input
                v-model="newMalignancy"
                label="Neue Metastase"
                filled
                dense
                class="q-mt-md"
                @keyup.enter="addMalignancy"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="add"
                    @click="addMalignancy"
                  />
                </template>
              </q-input>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const newDisorder = ref('')
const newMalignancy = ref('')

const updateField = (field, value) => {
  characterStore.updateBasicInfo(field, value)
}

const addDisorder = () => {
  if (newDisorder.value.trim()) {
    character.value.insanity.disorders.push(newDisorder.value.trim())
    newDisorder.value = ''
  }
}

const removeDisorder = (index) => {
  character.value.insanity.disorders.splice(index, 1)
}

const addMalignancy = () => {
  if (newMalignancy.value.trim()) {
    character.value.corruption.malignancies.push(newMalignancy.value.trim())
    newMalignancy.value = ''
  }
}

const removeMalignancy = (index) => {
  character.value.corruption.malignancies.splice(index, 1)
}
</script>
