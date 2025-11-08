<template>
  <q-page padding>
    <div class="q-pa-md">
      <h4 class="q-mt-none">Einstellungen</h4>

      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Bogen-Template</div>
          <div class="text-subtitle2 text-grey-7">
            Wähle welche Sektionen im Charakterbogen angezeigt werden sollen
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="q-gutter-md">
            <q-toggle
              v-model="settings.showSkills"
              label="Fertigkeiten"
              color="primary"
            >
              <q-icon name="psychology" class="q-ml-sm" size="sm" />
            </q-toggle>
            <q-toggle
              v-model="settings.showTalents"
              label="Purity Seals & Talente"
              color="primary"
            >
              <q-icon name="military_tech" class="q-ml-sm" size="sm" />
            </q-toggle>
            <q-toggle
              v-model="settings.showPsiPowers"
              label="Psy-Kräfte"
              color="primary"
            >
              <q-icon name="local_fire_department" class="q-ml-sm" size="sm" />
            </q-toggle>
            <q-toggle
              v-model="settings.showEquipment"
              label="Ausrüstung"
              color="primary"
            >
              <q-icon name="shield" class="q-ml-sm" size="sm" />
            </q-toggle>
            <q-toggle
              v-model="settings.showNotes"
              label="Vox-Log"
              color="primary"
            >
              <q-icon name="library_books" class="q-ml-sm" size="sm" />
            </q-toggle>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 text-grey-7 q-mb-md">
            Weitere Optionen kommen in späteren Versionen
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Charakter zurücksetzen</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-btn
            color="negative"
            label="Charakter zurücksetzen"
            @click="confirmReset"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'
import { useSettingsStore } from '../stores/settingsStore'

const $q = useQuasar()
const characterStore = useCharacterStore()
const settingsStore = useSettingsStore()

const { settings } = storeToRefs(settingsStore)

const confirmReset = () => {
  $q.dialog({
    title: 'Bestätigen',
    message: 'Möchtest du wirklich den Charakter zurücksetzen? Alle Daten gehen verloren!',
    cancel: true,
    persistent: true
  }).onOk(() => {
    characterStore.resetCharacter()
    $q.notify({
      type: 'positive',
      message: 'Charakter wurde zurückgesetzt',
      position: 'top'
    })
  })
}
</script>
