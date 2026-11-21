<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 340px">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div class="text-caption text-grey-6">
          Welche situativen Boni gelten? „Immer“-Boni lassen sich für diesen Wurf abwählen.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-sm">
        <div v-for="bonus in bonuses" :key="bonus.id">
          <q-checkbox
            v-model="selection"
            :val="bonus.id"
            dense
            class="q-my-xs"
            :label="`${formatBonus(bonus.value)} ${bonus.label}${bonus.always ? ' (immer)' : ''}`"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Abbrechen" color="grey" v-close-popup />
        <q-btn
          unelevated
          icon="casino"
          :label="isDamage ? `Würfeln: ${target}` : `Probe auf ${target}`"
          color="primary"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  addToNotation,
  alwaysBonuses,
  bonusSum,
  formatBonus,
  optionalBonuses,
  rollLabel
} from '../composables/situationalBonuses'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  title: { type: String, default: '' },
  // Probe: Zielwert inklusive der "Immer"-Boni.
  // Schaden: Würfelausdruck ohne Boni (String), z. B. "2W10+4".
  base: { type: [Number, String], default: 0 },
  bonuses: { type: Array, default: () => [] },
  // Schon in base enthaltene, feste Modifikatoren (Buffs u. ä.) – nur für den Wurftext
  fixed: { type: Array, default: () => [] }
})

// roll(target, label) – target ist der Zielwert (Probe) oder der Würfelausdruck (Schaden);
// label nennt alle angewendeten Boni, z. B. "Tarnung (+10 Dunkelheit)"
const emit = defineEmits(['roll'])

const isDamage = computed(() => typeof props.base === 'string')

// "Immer"-Boni sind bei jedem Öffnen wieder vorausgewählt
const selection = ref([])
watch(open, (isOpen) => {
  if (isOpen) selection.value = alwaysBonuses(props.bonuses).map(b => b.id)
})

const chosen = computed(() => props.bonuses.filter(b => selection.value.includes(b.id)))
const droppedAlways = computed(() =>
  alwaysBonuses(props.bonuses).filter(b => !selection.value.includes(b.id))
)
const target = computed(() =>
  isDamage.value
    ? addToNotation(props.base, chosen.value)
    : props.base -
      bonusSum(droppedAlways.value) +
      bonusSum(optionalBonuses(props.bonuses).filter(b => selection.value.includes(b.id)))
)

function confirm() {
  emit('roll', target.value, rollLabel(props.title, [...props.fixed, ...chosen.value]))
  open.value = false
}
</script>
