<template>
  <q-card>
    <q-card-section class="row items-center q-pb-sm">
      <div class="text-h6">Charakter</div>
      <q-space />
      <q-btn flat dense no-caps icon="person_add" label="Neuer Charakter" color="primary" @click="wizardOpen = true" />
    </q-card-section>

    <!-- Portrait mit Name und Herkunft daneben, darunter Alter und Hintergrund über die volle Breite.
         Ein gemeinsames Raster je Block: gleiche Breiten, gleiche Abstände. -->
    <q-card-section class="q-pt-none">
      <div class="row no-wrap" style="gap: 12px;">
        <PortraitField v-model="c.portrait" :size="88" />
        <div class="col row q-col-gutter-sm content-start">
          <div class="col-12">
            <q-input v-model="c.name" label="Name" filled dense>
              <template #append>
                <q-btn flat dense round size="sm" icon="casino" @click="c.name = randomName()" />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <q-select
              v-model="c.origin"
              fill-input
              hide-selected
              @input-value="(v) => (c.origin = v)"
              :options="origins"
              label="Herkunft"
              filled
              dense
              use-input
              new-value-mode="add-unique"
            />
          </div>
        </div>
      </div>
      <div class="row q-col-gutter-sm" style="padding-top: 8px;">
        <div class="col-4">
          <q-input v-model.number="c.age" type="number" label="Alter" filled dense />
        </div>
        <div class="col-8">
          <q-select
            v-model="c.background"
              fill-input
              hide-selected
              @input-value="(v) => (c.background = v)"
            :options="backgrounds"
            label="Hintergrund"
            filled
            dense
            use-input
            new-value-mode="add-unique"
            hide-dropdown-icon
          />
        </div>
      </div>
    </q-card-section>

    <q-expansion-item dense icon="face" label="Merkmale" header-class="text-subtitle2" default-opened>
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-xs">
          <div v-for="t in traits" :key="t.key" class="col-6">
            <q-input v-model="c.traits[t.key]" :label="t.label" dense borderless class="trait-input">
              <template #append>
                <q-btn flat dense round size="xs" icon="casino" @click="c.traits[t.key] = randomTrait(t.key)" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-expansion-item>

    <q-separator />

    <q-card-section>
      <div class="text-subtitle2 q-mb-xs">Münzen</div>
      <div class="row q-col-gutter-sm">
        <q-input v-model.number="c.coins.gold" type="number" min="0" label="GM" filled dense class="col-4" />
        <q-input v-model.number="c.coins.silver" type="number" min="0" label="SM" filled dense class="col-4" />
        <q-input v-model.number="c.coins.copper" type="number" min="0" label="KM" filled dense class="col-4" />
      </div>
      <div class="text-caption text-grey-6 q-mt-xs">1 GM = 10 SM = 100 KM</div>
    </q-card-section>
    <CreationWizard v-model="wizardOpen" />
  </q-card>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCairnStore } from '../stores/characterStore'
import { backgrounds, origins, traits } from '../data/tables'
import { randomName, randomTrait } from '../data/generator'
import { useCreationWizard } from '../composables/creationWizard'
import CreationWizard from './CreationWizard.vue'
import PortraitField from '@/core/components/PortraitField.vue'

const store = useCairnStore()
const { character: c } = storeToRefs(store)
const { open: wizardOpen } = useCreationWizard()
</script>

<style scoped>
.trait-input :deep(.q-field__label) {
  font-size: 0.8em;
}
</style>
