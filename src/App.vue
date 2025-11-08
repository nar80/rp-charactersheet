<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-toolbar-title>
          <div class="row items-center q-gutter-md">
            <div>RP Charakterbogen</div>
            <q-separator vertical dark />
            <router-link to="/" class="text-white text-decoration-none">
              <q-btn flat dense label="Charakterbogen" />
            </router-link>
            <router-link to="/settings" class="text-white text-decoration-none">
              <q-btn flat dense label="Einstellungen" />
            </router-link>
          </div>
        </q-toolbar-title>

        <q-space />

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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCharacterStore } from './stores/characterStore'

const $q = useQuasar()
const characterStore = useCharacterStore()

const fileInput = ref(null)

const handleExport = () => {
  const character = characterStore.character
  const dataStr = JSON.stringify(character, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${character.name || 'character'}.json`
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
      const character = JSON.parse(e.target.result)
      characterStore.loadCharacter(character)

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
