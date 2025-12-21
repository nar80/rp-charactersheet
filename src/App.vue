<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <div class="row items-center q-gutter-md no-wrap">
          <div>
            <div class="text-h6" style="font-family: 'Cinzel', serif; letter-spacing: 0.05em; line-height: 1.2;">
              ROGUE TRADER
            </div>
            <div class="imperial-motto" style="font-size: 0.65em; margin-top: -2px;">
              Per Aspera Ad Astra
            </div>
          </div>
          <q-separator vertical dark style="height: 40px;" />
          <router-link to="/" class="text-white text-decoration-none">
            <q-btn flat dense label="Charakterbogen" />
          </router-link>
          <router-link to="/settings" class="text-white text-decoration-none">
            <q-btn flat dense label="Einstellungen" />
          </router-link>
        </div>


        <q-space />

        <!-- Character Info in Center -->
        <div v-if="character.name" class="text-center q-mx-md">
          <div class="text-subtitle1 text-weight-medium" style="white-space: nowrap;">
            {{ character.name }}
            <span v-if="character.careerPath" class="text-grey-6">• {{ character.careerPath }}</span>
            <span class="text-grey-6">• Rang {{ calculatedRank }}</span>
          </div>
        </div>

        <q-space />

        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            dense
            round
            icon="upload_file"
            @click="handleImport"
          >
            <q-tooltip>Charakter importieren</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            round
            icon="download"
            @click="handleExport"
          >
            <q-tooltip>Charakter exportieren</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Import Dialog -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="onFileSelected"
    />
  </q-layout>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from './stores/characterStore'
import { useSettingsStore } from './stores/settingsStore'

const $q = useQuasar()
const characterStore = useCharacterStore()
const settingsStore = useSettingsStore()
const { character } = storeToRefs(characterStore)
const { settings } = storeToRefs(settingsStore)

// Update CSS variable for aquila opacity
watchEffect(() => {
  document.documentElement.style.setProperty(
    '--aquila-opacity',
    settings.value.aquilaOpacity / 100
  )
})

const fileInput = ref(null)

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
})

const handleExport = () => {
  const exportData = {
    character: characterStore.character,
    settings: settingsStore.settings
  }
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  // Build filename with optional timestamp
  let filename = exportData.character.name || 'character'
  if (settings.value.exportWithTimestamp) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}`
    filename = `${timestamp}_${filename}`
  }

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${filename}.json`
  link.click()

  $q.notify({
    type: 'positive',
    message: 'Charakter exportiert',
    position: 'top'
  })
}

const handleImport = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      // Support both old format (just character) and new format (character + settings)
      if (data.character) {
        // New format with character and settings
        characterStore.loadCharacter(data.character)
        if (data.settings) {
          Object.assign(settingsStore.settings, data.settings)
        }
      } else {
        // Old format - data is the character itself
        characterStore.loadCharacter(data)
      }

      $q.notify({
        type: 'positive',
        message: 'Charakter importiert',
        position: 'top'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Fehler beim Importieren',
        position: 'top'
      })
    }
  }
  reader.readAsText(file)

  // Reset input
  event.target.value = ''
}
</script>

<style>
body {
  font-family: 'Roboto', sans-serif;
}

.text-decoration-none {
  text-decoration: none;
}
</style>
