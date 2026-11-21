<template>
  <q-page padding>
    <div class="q-pa-md">
      <h4 class="q-mt-none">Einstellungen</h4>

      <DiceRoomSettingsCard class="q-mt-md" />
      <ExportSettingsCard class="q-mt-md" />

      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Charakter zurücksetzen</div>
          <div class="text-subtitle2 text-grey-7">Betrifft nur den Cairn-Charakter</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-btn color="negative" label="Charakter zurücksetzen" @click="confirmReset" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import DiceRoomSettingsCard from '@/core/components/DiceRoomSettingsCard.vue'
import ExportSettingsCard from '@/core/components/ExportSettingsCard.vue'
import { useCairnStore } from '../stores/characterStore'

const $q = useQuasar()
const store = useCairnStore()

function confirmReset() {
  $q.dialog({
    title: 'Bestätigen',
    message: 'Möchtest du den Cairn-Charakter wirklich zurücksetzen? Alle Daten gehen verloren!',
    cancel: true,
    persistent: true
  }).onOk(() => {
    store.resetCharacter()
    $q.notify({ type: 'positive', message: 'Charakter wurde zurückgesetzt', position: 'top' })
  })
}
</script>
