<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">
        <q-icon name="inventory_2" class="q-mr-sm" />
        Lager
      </div>
      <div class="text-caption text-grey-6">
        Eingelagerte Ausrüstung — nicht in der Kampfansicht aktiv
      </div>
    </q-card-section>

    <q-separator />

    <!-- Waffen -->
    <q-card-section>
      <div class="text-h6 q-mb-sm">
        <q-icon name="gavel" class="q-mr-xs" />
        Waffen
        <span class="text-caption text-grey-6"
          >({{ character.storedWeapons.length }})</span
        >
      </div>
      <div
        v-if="character.storedWeapons.length === 0"
        class="text-caption text-grey-6 q-pa-sm"
      >
        Keine Waffen eingelagert
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="(weapon, index) in character.storedWeapons" :key="index">
          <q-item-section>
            <q-item-label>{{ weapon.name }}</q-item-label>
            <q-item-label caption>
              {{ weapon.type || "Waffe"
              }}<span v-if="weapon.subtype"> ({{ weapon.subtype }})</span>
              <span v-if="weapon.damage"> • {{ weapon.damage }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="unarchive"
              label="Ausrüsten"
              @click="characterStore.unstoreWeapon(index)"
            >
              <q-tooltip>Zurück in die Kampfansicht</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-separator />

    <!-- Rüstung -->
    <q-card-section>
      <div class="text-h6 q-mb-sm">
        <q-icon name="shield" class="q-mr-xs" />
        Rüstung
        <span class="text-caption text-grey-6"
          >({{ character.storedArmor.length }})</span
        >
      </div>
      <div
        v-if="character.storedArmor.length === 0"
        class="text-caption text-grey-6 q-pa-sm"
      >
        Keine Rüstung eingelagert
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="(armor, index) in character.storedArmor" :key="index">
          <q-item-section>
            <q-item-label>{{ armor.name }}</q-item-label>
            <q-item-label caption>
              <span v-if="armor.ap">RP {{ armor.ap }}</span>
              <span v-if="armor.quality"> • {{ armor.quality }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="unarchive"
              label="Ausrüsten"
              @click="characterStore.unstoreArmor(index)"
            >
              <q-tooltip>Zurück in die Kampfansicht</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-separator />

    <!-- Ausrüstung -->
    <q-card-section>
      <div class="text-h6 q-mb-sm">
        <q-icon name="backpack" class="q-mr-xs" />
        Ausrüstung
        <span class="text-caption text-grey-6"
          >({{ character.storedGear.length }})</span
        >
      </div>
      <div
        v-if="character.storedGear.length === 0"
        class="text-caption text-grey-6 q-pa-sm"
      >
        Keine Gegenstände eingelagert
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="(item, index) in character.storedGear" :key="index">
          <q-item-section avatar>
            <q-avatar color="grey-8" text-color="white" size="sm">
              {{ item.quantity || 1 }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
            <q-item-label caption v-if="item.quality">
              Qualität: {{ item.quality }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="unarchive"
              label="Ausrüsten"
              @click="characterStore.unstoreGear(index)"
            >
              <q-tooltip>Zurück in die Kampfansicht</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../../stores/characterStore";

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);
</script>
