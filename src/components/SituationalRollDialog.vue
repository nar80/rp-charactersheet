<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 340px">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div class="text-caption text-grey-6">Welche situativen Boni gelten?</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-py-sm">
        <div v-for="bonus in bonuses" :key="bonus.id">
          <q-checkbox
            v-if="bonus.always"
            :model-value="true"
            disable
            dense
            class="q-my-xs"
            :label="`${formatBonus(bonus.value)} ${bonus.label} (immer)`"
          />
          <q-checkbox
            v-else
            v-model="selection"
            :val="bonus.id"
            dense
            class="q-my-xs"
            :label="`${formatBonus(bonus.value)} ${bonus.label}`"
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
  bonuses: { type: Array, default: () => [] }
})

// roll(target, label) – target ist der Zielwert (Probe) oder der Würfelausdruck (Schaden);
// label nennt alle angewendeten Boni, z. B. "Tarnung (+10 Dunkelheit)"
const emit = defineEmits(['roll'])

const isDamage = computed(() => typeof props.base === 'string')

const selection = ref([])
watch(open, (isOpen) => {
  if (isOpen) selection.value = []
})

const selected = computed(() =>
  optionalBonuses(props.bonuses).filter(b => selection.value.includes(b.id))
)
const target = computed(() =>
  isDamage.value
    ? addToNotation(props.base, [...alwaysBonuses(props.bonuses), ...selected.value])
    : props.base + bonusSum(selected.value)
)

function confirm() {
  emit('roll', target.value, rollLabel(props.title, [...alwaysBonuses(props.bonuses), ...selected.value]))
  open.value = false
}
</script>
