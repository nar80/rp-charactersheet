<template>
  <q-card>
    <q-card-section class="row items-center q-pb-sm">
      <div class="text-h6">Inventar</div>
      <q-chip dense square :color="store.inventoryFull ? 'negative' : 'grey-8'" class="q-ml-sm">
        {{ store.totalSlots }} / {{ INVENTORY_SLOTS }} Plätze
      </q-chip>
      <q-chip v-if="store.fatigue" dense square color="warning" text-color="black" icon="bedtime">
        {{ store.fatigue }} Erschöpfung
      </q-chip>
      <q-space />
      <q-btn flat dense no-caps icon="bedtime" label="+ Erschöpfung" @click="store.addFatigue()" />
      <q-btn flat dense no-caps icon="add" label="Gegenstand" color="primary" @click="openNew" />
    </q-card-section>

    <q-banner v-if="store.inventoryFull" dense class="bg-negative text-white q-mx-md q-mb-sm" rounded>
      Alle {{ INVENTORY_SLOTS }} Plätze belegt: TP fallen auf 0 und können sich nicht erholen.
    </q-banner>

    <q-card-section v-for="loc in LOCATIONS" :key="loc.key" class="q-pt-none">
      <div class="row items-center q-mb-xs">
        <q-icon :name="loc.icon" class="q-mr-xs" />
        <span class="text-subtitle2">{{ loc.label }}</span>
        <span class="q-ml-sm text-caption" :class="store.usedSlots[loc.key] > loc.capacity ? 'text-negative' : 'text-grey-6'">
          {{ store.usedSlots[loc.key] }} / {{ loc.capacity }}
        </span>
        <span class="slot-pips q-ml-sm">
          <span
            v-for="n in Math.max(loc.capacity, store.usedSlots[loc.key])"
            :key="n"
            class="slot-pip"
            :class="{ used: n <= store.usedSlots[loc.key], over: n > loc.capacity }"
          />
        </span>
      </div>

      <q-list dense bordered separator class="rounded-borders">
        <q-item v-for="item in itemsIn(loc.key)" :key="item.id" :class="{ 'fatigue-item': item.type === 'fatigue' }">
          <q-item-section avatar style="min-width: 32px;">
            <q-icon :name="typeOf(item).icon" :color="item.type === 'fatigue' ? 'warning' : 'grey-5'" size="sm" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ item.name }}
              <span v-if="item.spell" class="text-grey-5"> – {{ item.spell }}</span>
            </q-item-label>
            <q-item-label caption>
              <span v-if="item.type === 'weapon' || (item.type === 'relic' && item.damage && item.armor === 0)">{{ dieLabel(item.damage) }} </span>
              <span v-if="item.armor">+{{ item.armor }} Rüstung </span>
              <span v-if="item.bulky">· sperrig </span>
              <span v-if="item.charges">· {{ item.charges.value }}/{{ item.charges.max }} Ladungen </span>
              <span v-if="item.type === 'scroll'">· kein Platz, einmalig </span>
              <span v-if="item.notes" class="text-grey-6">· {{ item.notes }}</span>
            </q-item-label>
            <q-item-label v-if="spellTexts[item.spell]" caption class="spell-text">
              <q-icon name="auto_fix_high" size="xs" class="q-mr-xs" />{{ spellTexts[item.spell] }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row no-wrap items-center">
              <q-btn
                v-if="item.type === 'weapon'"
                flat dense round size="sm" icon="casino" color="primary"
                :disable="!cairnDice.connected.value"
                @click="cairnDice.attack([item], attackMode)"
              >
                <q-tooltip>Schaden würfeln ({{ attackModeLabel }})</q-tooltip>
              </q-btn>
              <q-btn
                v-if="item.type === 'spellbook' || item.type === 'scroll'"
                flat dense round size="sm" icon="auto_fix_high" color="primary"
                @click="cast(item)"
              >
                <q-tooltip>Zauber wirken</q-tooltip>
              </q-btn>
              <q-btn
                v-if="item.charges"
                flat dense round size="sm" icon="bolt"
                :disable="item.charges.value <= 0"
                @click="item.charges.value--"
              >
                <q-tooltip>Ladung verbrauchen</q-tooltip>
              </q-btn>
              <q-btn flat dense round size="sm" icon="more_vert">
                <q-menu auto-close>
                  <q-list dense style="min-width: 180px;">
                    <q-item v-if="item.type !== 'fatigue'" clickable @click="openEdit(item)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Bearbeiten</q-item-section>
                    </q-item>
                    <q-item
                      v-for="target in LOCATIONS.filter((l) => l.key !== item.location)"
                      :key="target.key"
                      clickable
                      @click="item.location = target.key"
                    >
                      <q-item-section avatar><q-icon :name="target.icon" /></q-item-section>
                      <q-item-section>Nach: {{ target.label }}</q-item-section>
                    </q-item>
                    <q-item v-if="item.type !== 'fatigue' && c.carriers.length" clickable @click="store.moveToTransport(item.id)">
                      <q-item-section avatar><q-icon name="agriculture" /></q-item-section>
                      <q-item-section>Aufs Transportmittel</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable class="text-negative" @click="store.removeItem(item.id)">
                      <q-item-section avatar><q-icon name="delete" /></q-item-section>
                      <q-item-section>{{ item.type === 'fatigue' ? 'Erschöpfung entfernen' : 'Wegwerfen' }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="!itemsIn(loc.key).length">
          <q-item-section class="text-grey-7 text-caption">leer</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-separator />

    <!-- Angriff -->
    <q-card-section>
      <div class="text-subtitle2 q-mb-sm">Angriff</div>
      <q-btn-toggle
        v-model="attackMode"
        dense
        no-caps
        toggle-color="primary"
        :options="[
          { label: 'Normal', value: 'normal' },
          { label: 'Beeinträchtigt (W4)', value: 'impaired' },
          { label: 'Verstärkt (W12)', value: 'enhanced' }
        ]"
      />
      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          v-if="handWeapons.length > 1"
          outline no-caps icon="casino" label="Beide Waffen (höchster zählt)"
          :disable="!cairnDice.connected.value"
          @click="cairnDice.attack(handWeapons, attackMode)"
        />
        <q-btn
          outline no-caps icon="sports_mma" label="Unbewaffnet (W4)"
          :disable="!cairnDice.connected.value"
          @click="cairnDice.attack([{ name: 'Unbewaffnet', damage: 'd4' }], attackMode === 'enhanced' ? 'enhanced' : 'normal')"
        />
      </div>
      <div class="text-caption text-grey-6 q-mt-xs">
        Beeinträchtigt: aus schwacher Position (Deckung, gefesselt). Verstärkt: aus vorteilhafter Position
        (hilfloses Ziel, gewagtes Manöver). Würfelknopf direkt an der Waffe.
        <template v-if="!cairnDice.connected.value"> Würfeln geht nur mit verbundenem Würfelraum.</template>
      </div>
    </q-card-section>

    <ItemDialog v-model="dialogOpen" :item="editing" @save="saveItem" />
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useCairnStore, LOCATIONS, INVENTORY_SLOTS, ITEM_TYPES } from '../stores/characterStore'
import { useCairnDice } from '../composables/dice'
import ItemDialog from './ItemDialog.vue'
import { spellTexts } from '../data/tables'

const $q = useQuasar()
const store = useCairnStore()
const { character: c } = storeToRefs(store)
const cairnDice = useCairnDice()

const attackMode = ref('normal')
const attackModeLabel = computed(() => ({ normal: 'normal', impaired: 'beeinträchtigt: W4', enhanced: 'verstärkt: W12' })[attackMode.value])

const itemsIn = (location) => c.value.inventory.filter((i) => i.location === location)
const typeOf = (item) => ITEM_TYPES.find((t) => t.key === item.type) || ITEM_TYPES[0]
const dieLabel = (die) => (die || '').toUpperCase().replace('D', 'W')
const handWeapons = computed(() => itemsIn('hands').filter((i) => i.type === 'weapon'))

const dialogOpen = ref(false)
const editing = ref(null)

function openNew() {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(item) {
  editing.value = item
  dialogOpen.value = true
}

function saveItem(data) {
  if (editing.value) Object.assign(editing.value, data)
  else store.addItem({ ...data, location: undefined })
}

function cast(item) {
  const scroll = item.type === 'scroll'
  if (!scroll && item.location !== 'hands') {
    $q.notify({ type: 'warning', position: 'top', message: 'Zum Zaubern muss das Zauberbuch in beiden Händen gehalten werden.' })
  }
  store.castSpell(item.id)
  $q.notify({
    position: 'top',
    color: 'grey-9',
    icon: 'auto_fix_high',
    message: `${item.spell || item.name} gewirkt`,
    multiLine: true,
    timeout: 8000,
    html: false,
    caption: [
      spellTexts[item.spell],
      scroll
        ? 'Die Schriftrolle zerfällt.'
        : 'Eine Erschöpfung kommt ins Inventar. In Gefahr oder Bedrängnis kann die SL einen WK-Rettungswurf verlangen.'
    ].filter(Boolean).join(' – ')
  })
}
</script>

<style scoped>
.slot-pips {
  display: inline-flex;
  gap: 3px;
}
.slot-pip {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid rgba(var(--accent-rgb), 0.5);
}
.slot-pip.used {
  background: rgba(var(--accent-rgb), 0.7);
}
.slot-pip.over {
  border-color: var(--q-negative);
  background: var(--q-negative);
}
.spell-text {
  font-style: italic;
  color: rgba(var(--accent-rgb), 0.85);
}
.fatigue-item {
  background: rgba(242, 192, 55, 0.08);
}
</style>
