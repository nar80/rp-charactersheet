<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <!-- Auf dem Handy (xs) nur Icons, ohne Motto und Charakter-Info, damit nichts überläuft -->
        <div class="row items-center no-wrap" :class="$q.screen.gt.xs ? 'q-gutter-md' : 'q-gutter-xs'">
          <q-btn-dropdown flat dense no-caps class="system-switch" dropdown-icon="expand_more">
            <template #label>
              <div class="text-left">
                <div class="system-title" :class="$q.screen.gt.xs ? 'text-h6' : 'text-subtitle1'">{{ system.name.toUpperCase() }}</div>
                <div v-if="$q.screen.gt.xs" class="imperial-motto system-motto">{{ system.motto }}</div>
              </div>
            </template>
            <q-list>
              <q-item-label header>System wechseln</q-item-label>
              <q-item
                v-for="s in systems"
                :key="s.id"
                v-close-popup
                clickable
                :active="s.id === system.id"
                :to="`/${s.slug}`"
              >
                <q-item-section avatar><q-icon :name="s.icon" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ s.name }}</q-item-label>
                  <q-item-label caption>{{ s.motto }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-separator v-if="$q.screen.gt.xs" vertical dark style="height: 40px;" />
          <q-btn
            flat dense
            :round="!$q.screen.gt.xs"
            :icon="$q.screen.gt.xs ? undefined : 'description'"
            :label="$q.screen.gt.xs ? 'Charakterbogen' : undefined"
            :to="`/${system.slug}`"
          >
            <q-tooltip v-if="!$q.screen.gt.xs">Charakterbogen</q-tooltip>
          </q-btn>
          <q-btn
            flat dense
            :round="!$q.screen.gt.xs"
            :icon="$q.screen.gt.xs ? undefined : 'settings'"
            :label="$q.screen.gt.xs ? 'Einstellungen' : undefined"
            :to="`/${system.slug}/einstellungen`"
          >
            <q-tooltip v-if="!$q.screen.gt.xs">Einstellungen</q-tooltip>
          </q-btn>
        </div>

        <!-- Charakter-Info nimmt den freien Platz und wird bei Platzmangel abgeschnitten statt überzulaufen;
             auf dem Handy (xs) ausgeblendet, dort steht der Name im Bogen -->
        <div v-if="$q.screen.gt.xs" class="col row justify-center q-mx-md header-info">
          <component :is="headerInfo" />
        </div>
        <q-space v-else />

        <div class="row items-center no-wrap" :class="$q.screen.gt.xs ? 'q-gutter-sm' : ''">
          <q-btn
            flat
            dense
            round
            icon="casino"
            :color="settings.diceEnabled ? diceStatusColor : 'grey-7'"
            v-bind="settings.diceEnabled && !dice.nameMissing.value ? { href: dice.roomUrl.value, target: '_blank' } : { to: `/${system.slug}/einstellungen` }"
          >
            <q-tooltip>
              <template v-if="!settings.diceEnabled">Würfelraum aus – in den Einstellungen aktivieren</template>
              <template v-else-if="dice.nameMissing.value">„Name im Würfelraum“ fehlt – in den Einstellungen eintragen</template>
              <template v-else>
                Würfelraum „{{ dice.slugifyRoom(settingsStore.currentRoom) }}“:
                {{ { connected: 'verbunden', connecting: 'verbinde …', disconnected: 'getrennt' }[dice.state.status] }}
                <div v-if="dice.state.players.length">Online: {{ dice.state.players.join(', ') }}</div>
                <div v-if="roomMismatch" class="text-warning">
                  Achtung: Der Raum spielt {{ roomMismatch }} – Proben werden trotzdem richtig ausgewertet
                </div>
                <div>Klick öffnet den Verlauf</div>
              </template>
            </q-tooltip>
          </q-btn>

          <q-btn flat dense round icon="upload_file" @click="fileInput.click()">
            <q-tooltip>Charakter importieren</q-tooltip>
          </q-btn>

          <q-btn flat dense round icon="download" @click="exportCharacter">
            <q-tooltip>Charakter exportieren</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

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
import { ref, computed, watch, watchEffect, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from './core/settingsStore'
import { initDiceRoom, useDiceRoom, setDiceAvatar, makeThumbnail } from './core/diceRoom'
import { useCharacterFile } from './core/characterFile'
import { systems, findSystem, DEFAULT_SYSTEM } from './systems'

const $q = useQuasar()
const route = useRoute()
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const system = computed(() => findSystem(route.meta.system) || DEFAULT_SYSTEM)

// Header-Info je System nur einmal laden
const headerInfos = Object.fromEntries(
  systems.map((s) => [s.id, s.headerInfo ? defineAsyncComponent(s.headerInfo) : null])
)
const headerInfo = computed(() => headerInfos[system.value.id])

initDiceRoom()
const dice = useDiceRoom()
// Portrait des offenen Bogens als Avatar im Würfelraum (auch nach System- oder Charakterwechsel)
watch(
  () => system.value.useStore().character.portrait,
  async (portrait) => {
    const thumbnail = portrait ? await makeThumbnail(portrait) : ''
    // Inzwischen geändert? Dann gilt der neuere Aufruf
    if (portrait === system.value.useStore().character.portrait) setDiceAvatar(thumbnail)
  },
  { immediate: true }
)

// Spielt der Raum ein anderes System als der offene Bogen? (Name des Raum-Systems oder '')
const roomMismatch = computed(() => {
  const roomSystem = dice.state.roomSystem
  if (!roomSystem || roomSystem === system.value.id) return ''
  return dice.state.server?.systems?.find((s) => s.id === roomSystem)?.name || roomSystem
})
const diceStatusColor = computed(() =>
  dice.state.status === 'connected' && roomMismatch.value
    ? 'warning'
    : { connected: 'positive', connecting: 'warning', disconnected: 'negative' }[dice.state.status]
)

// Systemabhängige Optik: Themes hängen sich an body[data-system]
watchEffect(() => {
  document.body.dataset.system = system.value.id
  document.title = `${system.value.name} – Charakterbogen`
})

// Aquila-Wasserzeichen (Rogue Trader)
watchEffect(() => {
  document.documentElement.style.setProperty(
    '--aquila-opacity',
    system.value.id === 'rogueTrader' ? settings.value.aquilaOpacity / 100 : 0
  )
})

const fileInput = ref(null)
const { exportCharacter, importFile } = useCharacterFile(system)

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) importFile(file)
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

.header-info {
  min-width: 0;
  overflow: hidden;
}

.system-title {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.system-motto {
  font-size: 0.65em;
  margin-top: -2px;
  text-transform: none;
}
</style>
