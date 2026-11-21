<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Export</div>
      <div class="text-subtitle2 text-grey-7">
        Einstellungen für den Charakter-Export
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="q-gutter-md">
        <q-toggle
          v-model="settings.exportWithTimestamp"
          label="Zeitstempel im Dateinamen"
          color="primary"
        >
          <q-icon name="schedule" class="q-ml-sm" size="sm" />
        </q-toggle>
        <div v-if="settings.exportWithTimestamp" class="text-caption text-grey-6 q-ml-lg">
          Beispiel: 2025-12-02_14-30-52_Charaktername.json
        </div>
      </div>
    </q-card-section>
  </q-card>

</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../settingsStore'

const { settings } = storeToRefs(useSettingsStore())
</script>
