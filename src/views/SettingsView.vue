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
              label="Talente"
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
              v-model="settings.showAcquisitions"
              label="Beschaffungen"
              color="primary"
            >
              <q-icon name="inventory_2" class="q-ml-sm" size="sm" />
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

        </q-card>

      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Darstellung</div>
          <div class="text-subtitle2 text-grey-7">
            Visuelle Anpassungen
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="q-gutter-md">
            <div>
              <div class="text-subtitle2 q-mb-sm">
                Aquila Wasserzeichen
                <span class="text-grey-6">
                  ({{ settings.aquilaOpacity === 0 ? 'Aus' : settings.aquilaOpacity + '%' }})
                </span>
              </div>
              <q-slider
                v-model="settings.aquilaOpacity"
                :min="0"
                :max="10"
                :step="1"
                color="primary"
                label
                :label-value="settings.aquilaOpacity === 0 ? 'Aus' : settings.aquilaOpacity + '%'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md">
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
              Beispiel: 2025-12-02_14-30_Charaktername.json
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Spezialfunktionen</div>
          <div class="text-subtitle2 text-grey-7">
            Optionale Features für besondere Spielmechaniken
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="q-gutter-md">
            <q-toggle
              v-model="settings.enableWeaponStacks"
              label="Waffen-Stacks (Pistolen-Bonus)"
              color="primary"
            >
              <q-icon name="auto_awesome" class="q-ml-sm" size="sm" />
            </q-toggle>
            <div v-if="settings.enableWeaponStacks" class="text-caption text-grey-6 q-ml-lg">
              Zeigt einen Stack-Counter bei Waffen an. Jeder Stack erhöht den Schaden aller Pistolen um +1.
            </div>
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
