<template>
  <q-page class="page-wrapper">
    <!-- Permanent Stats Section - Always visible at top -->
    <CharacterStats />

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
      <q-tab name="info" icon="person" label="Charakter" />
      <q-tab v-if="settings.showSkills" name="skills" icon="psychology" label="Fertigkeiten" />
      <q-tab v-if="settings.showTalents" name="talents" icon="military_tech" label="Talente" />
      <q-tab v-if="settings.showPsiPowers" name="psi" icon="local_fire_department" label="Psy-Kräfte" />
      <q-tab v-if="settings.showEquipment" name="equipment" icon="shield" label="Ausrüstung" />
      <q-tab v-if="settings.showAcquisitions" name="acquisitions" icon="inventory_2" label="Beschaffungen" />
      <q-tab v-if="settings.showNotes" name="notes" icon="library_books" label="Vox-Log" />
    </q-tabs>

    <q-separator />

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="info">
        <BasicInfoSection />
      </q-tab-panel>

      <q-tab-panel v-if="settings.showSkills" name="skills">
        <SkillsSection />
      </q-tab-panel>

      <q-tab-panel v-if="settings.showTalents" name="talents">
        <TalentsSection />
      </q-tab-panel>

      <q-tab-panel v-if="settings.showPsiPowers" name="psi">
        <PsyPowersSection />
      </q-tab-panel>

      <q-tab-panel v-if="settings.showEquipment" name="equipment">
        <EquipmentSection />
      </q-tab-panel>

      <q-tab-panel v-if="settings.showAcquisitions" name="acquisitions">
        <AcquisitionsSection />
      </q-tab-panel>

      <q-tab-panel v-if="settings.showNotes" name="notes">
        <NotesSection />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settingsStore'
import CharacterStats from '../components/CharacterStats.vue'
import BasicInfoSection from '../components/sections/BasicInfoSection.vue'
import SkillsSection from '../components/sections/SkillsSection.vue'
import TalentsSection from '../components/sections/TalentsSection.vue'
import PsyPowersSection from '../components/sections/PsyPowersSection.vue'
import EquipmentSection from '../components/sections/EquipmentSection.vue'
import AcquisitionsSection from '../components/sections/AcquisitionsSection.vue'
import NotesSection from '../components/sections/NotesSection.vue'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const activeTab = ref('info')
</script>

<style scoped>
.page-wrapper {
  overflow: visible;
}

.q-tab-panels {
  background: transparent;
}
</style>
