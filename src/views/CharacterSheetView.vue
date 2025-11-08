<template>
  <q-page>
    <!-- Basic Info Section - Always visible at top -->
    <div class="q-pa-md">
      <BasicInfoSection />
    </div>

    <!-- Tabs for different sections -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="center"
      narrow-indicator
    >
      <q-tab name="attributes" icon="psychology" label="Attribute" />
      <q-tab name="skills" icon="school" label="Fertigkeiten" />
      <q-tab name="talents" icon="stars" label="Talente" />
      <q-tab name="equipment" icon="inventory_2" label="Ausrüstung" />
      <q-tab name="notes" icon="notes" label="Notizen" />
    </q-tabs>

    <q-separator />

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="attributes">
        <AttributesSection />
      </q-tab-panel>

      <q-tab-panel name="skills">
        <SkillsSection />
      </q-tab-panel>

      <q-tab-panel name="talents">
        <TalentsSection />
      </q-tab-panel>

      <q-tab-panel name="equipment">
        <EquipmentSection />
      </q-tab-panel>

      <q-tab-panel name="notes">
        <NotesSection />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import BasicInfoSection from '../components/sections/BasicInfoSection.vue'
import AttributesSection from '../components/sections/AttributesSection.vue'
import SkillsSection from '../components/sections/SkillsSection.vue'
import TalentsSection from '../components/sections/TalentsSection.vue'
import EquipmentSection from '../components/sections/EquipmentSection.vue'
import NotesSection from '../components/sections/NotesSection.vue'

const activeTab = ref('attributes')
</script>

<style scoped>
.q-tab-panels {
  background: transparent;
}
</style>
