<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          RP Charakterbogen
        </q-toolbar-title>

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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="250"
      :breakpoint="1024"
      bordered
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header>Navigation</q-item-label>

          <q-item
            clickable
            :to="{ name: 'characterSheet' }"
            exact
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Charakterbogen</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :to="{ name: 'settings' }"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Einstellungen</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

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

const leftDrawerOpen = ref(false)
const fileInput = ref(null)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

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
</style>
