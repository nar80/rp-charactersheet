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
              v-model="settings.showBasicInfo"
              label="Basis-Informationen"
              color="primary"
            />
            <q-toggle
              v-model="settings.showAttributes"
              label="Attribute"
              color="primary"
            />
            <q-toggle
              v-model="settings.showSkills"
              label="Fertigkeiten"
              color="primary"
            />
            <q-toggle
              v-model="settings.showTalents"
              label="Talente & Eigenschaften"
              color="primary"
              disable
            />
            <q-toggle
              v-model="settings.showWeapons"
              label="Waffen"
              color="primary"
              disable
            />
            <q-toggle
              v-model="settings.showPsiPowers"
              label="Psi-Kräfte"
              color="primary"
              disable
            />
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCharacterStore } from '../stores/characterStore'

const $q = useQuasar()
const characterStore = useCharacterStore()

// Settings (placeholder for now)
const settings = ref({
  showBasicInfo: true,
  showAttributes: true,
  showSkills: true,
  showTalents: true,
  showWeapons: true,
  showPsiPowers: true
})

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
