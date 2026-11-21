<template>
  <q-card>
    <!-- Verletzungen -->
    <q-card-section class="row items-center q-pb-sm">
      <div class="text-h6">Verletzungen</div>
      <q-space />
      <q-btn flat dense round icon="add" color="primary">
        <q-tooltip>Verletzung eintragen</q-tooltip>
        <q-menu auto-close>
          <q-list dense style="max-width: 320px;">
            <q-item v-for="(scar, index) in scars" :key="index" clickable @click="store.addScar(index)">
              <q-item-section avatar class="text-grey-6">{{ index + 1 }}</q-item-section>
              <q-item-section>{{ scar.title }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <div v-if="!c.scars.length" class="text-caption text-grey-6">
        Fallen die TP durch einen Angriff genau auf 0, gibt es eine Verletzung nach erlittenem Schaden.
      </div>
      <q-list dense separator>
        <ScarEntry
          v-for="s in c.scars"
          :key="s.id"
          :entry="s"
          @remove="c.scars = c.scars.filter((x) => x.id !== s.id)"
        />
      </q-list>
    </q-card-section>

    <q-separator />

    <!-- Transportmittel -->
    <q-card-section class="row items-center q-pb-sm">
      <div class="text-h6">Transportmittel</div>
      <q-chip v-if="c.carriers.length" dense square :color="store.transportUsed > store.transportCapacity ? 'negative' : 'grey-8'" class="q-ml-sm">
        {{ store.transportUsed }} / {{ store.transportCapacity }} Plätze
      </q-chip>
      <q-space />
      <q-btn flat dense round icon="add" color="primary">
        <q-tooltip>Transportmittel hinzufügen</q-tooltip>
        <q-menu auto-close>
          <q-list dense>
            <q-item v-for="t in carrierTemplates" :key="t.name" clickable @click="addCarrier(t)">
              <q-item-section>{{ t.name }}</q-item-section>
              <q-item-section side>+{{ t.capacity }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <div v-if="!c.carriers.length" class="text-caption text-grey-6">
        Pferd und Karren +4, Maultier +6, Wagen +8 Plätze. Gegenstände kommen über das Menü im Inventar hierher.
      </div>
      <div class="row q-gutter-xs q-mb-sm">
        <q-chip
          v-for="carrier in c.carriers"
          :key="carrier.id"
          removable
          dense
          icon="agriculture"
          @remove="store.removeCarrier(carrier.id)"
        >{{ carrier.name }} (+{{ carrier.capacity }})</q-chip>
      </div>
      <q-list v-if="c.transportItems.length" dense bordered separator class="rounded-borders">
        <q-item v-for="item in c.transportItems" :key="item.id">
          <q-item-section>
            {{ item.name }}<span v-if="item.bulky" class="text-grey-6"> · sperrig</span>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense round size="sm" icon="backpack" @click="store.moveFromTransport(item.id)">
              <q-tooltip>Ins Inventar nehmen</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-separator />

    <!-- Notizen -->
    <q-card-section>
      <div class="text-h6 q-mb-sm">Notizen</div>
      <q-input v-model="c.notes" type="textarea" autogrow filled placeholder="Gefährten, Gerüchte, Schätze, Ziele …" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCairnStore, newId } from '../stores/characterStore'
import { scars, carrierTemplates } from '../data/tables'
import ScarEntry from './ScarEntry.vue'

const store = useCairnStore()
const { character: c } = storeToRefs(store)

function addCarrier(template) {
  c.value.carriers.push({ id: newId(), ...template })
}
</script>
