<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Würfelraum</div>
      <div class="text-subtitle2 text-grey-7">
        Würfe direkt aus dem Bogen – alle im selben Raum sehen sie sofort
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-gutter-md">
      <q-toggle
        v-model="settings.diceEnabled"
        label="Mit Würfelraum verbinden"
        color="primary"
      >
        <q-icon name="casino" class="q-ml-sm" size="sm" />
      </q-toggle>
      <div class="row q-col-gutter-md">
        <q-input
          v-model="settingsStore.currentRoom"
          :label="`Raum für ${systemName}`"
          filled
          dense
          maxlength="40"
          class="col-12 col-sm-6"
          :hint="`Raum: ${dice.slugifyRoom(settingsStore.currentRoom) || '–'} – gilt nur für ${systemName}`"
        />
        <q-input
          v-model="settings.dicePlayerName"
          label="Name im Würfelraum"
          filled
          dense
          maxlength="30"
          class="col-12 col-sm-6"
          hint="Pflichtfeld – so heißt du im Würfelraum"
          :error="settings.diceEnabled && dice.nameMissing.value"
          error-message="Ohne Namen wird nicht verbunden"
        />
      </div>
      <div class="row items-center q-gutter-sm">
        <q-icon
          :name="dice.connected.value ? 'wifi' : 'wifi_off'"
          :color="dice.connected.value ? 'positive' : dice.state.status === 'connecting' ? 'warning' : 'grey-6'"
        />
        <span class="text-grey-5">
          {{ { connected: 'Verbunden', connecting: 'Verbinde …', disconnected: 'Nicht verbunden' }[dice.state.status] }}
          <template v-if="dice.state.players.length"> · Online: {{ dice.state.players.join(', ') }}</template>
        </span>
        <q-space />
        <q-btn
          flat
          dense
          no-caps
          icon="open_in_new"
          label="Würfelraum öffnen"
          color="primary"
          :href="dice.roomUrl.value"
          target="_blank"
          :disable="dice.nameMissing.value"
        />
      </div>
    </q-card-section>
  </q-card>

</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../settingsStore'
import { useDiceRoom } from '../diceRoom'
import { computed } from 'vue'
import { findSystem } from '../../systems'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const systemName = computed(() => findSystem(settings.value.lastSystem)?.name || '')
const dice = useDiceRoom()
</script>
