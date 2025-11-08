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

    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Experience Points -->
        <div class="col-12 col-md-4">
          <q-input
            v-model.number="character.experience.total"
            label="Gesamt EP"
            type="number"
            filled
            dense
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model.number="character.experience.spent"
            label="Vergebene EP"
            type="number"
            filled
            dense
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            :model-value="character.experience.total - character.experience.spent"
            label="Verfügbare EP"
            type="number"
            filled
            dense
            readonly
            bg-color="grey-9"
          />
        </div>

        <!-- Profit Factor (Rogue Trader specific) -->
        <div class="col-12 col-md-6">
          <q-input
            v-model.number="character.profitFactor.initial"
            label="Anfänglicher Profitfaktor"
            type="number"
            filled
            dense
          />
        </div>

        <div class="col-12 col-md-6">
          <q-input
            v-model.number="character.profitFactor.current"
            label="Gegenwärtiger Profitfaktor"
            type="number"
            filled
            dense
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const updateField = (field, value) => {
  characterStore.updateBasicInfo(field, value)
}
</script>
