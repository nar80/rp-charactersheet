<template>
  <q-page padding>
    <q-banner v-if="!store.character.name && !store.character.inventory.length" rounded class="q-mb-md new-banner">
      <template #avatar><q-icon name="forest" size="md" /></template>
      Noch kein Charakter. Der Assistent führt durch die Erschaffung nach den Regeln und trägt alles ein.
      <template #action>
        <q-btn color="primary" no-caps icon="person_add" label="Charakter erschaffen" @click="wizardOpen = true" />
      </template>
    </q-banner>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6 col-lg-4">
        <VitalsCard />
      </div>
      <div class="col-12 col-md-6 col-lg-5">
        <InventoryCard />
      </div>
      <div class="col-12 col-lg-3">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6 col-lg-12">
            <IdentityCard />
          </div>
          <div class="col-12 col-md-6 col-lg-12">
            <ExtrasCard />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useCairnStore } from '../stores/characterStore'
import { useCreationWizard } from '../composables/creationWizard'
import VitalsCard from '../components/VitalsCard.vue'
import InventoryCard from '../components/InventoryCard.vue'
import IdentityCard from '../components/IdentityCard.vue'
import ExtrasCard from '../components/ExtrasCard.vue'

const store = useCairnStore()
const { open: wizardOpen } = useCreationWizard()
</script>

<style scoped>
.new-banner {
  border: 1px solid rgba(var(--accent-rgb), 0.5);
  background: rgba(var(--accent-rgb), 0.08);
}
</style>
