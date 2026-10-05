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
        <q-btn unelevated icon="casino" :label="`Probe auf ${target}`" color="primary" @click="confirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  alwaysBonuses,
  bonusSum,
  formatBonus,
  optionalBonuses,
  rollLabel
} from '../composables/situationalBonuses'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  title: { type: String, default: '' },
  // Wert inklusive der "Immer"-Boni
  base: { type: Number, default: 0 },
  bonuses: { type: Array, default: () => [] }
})

// roll(target, label) – label nennt alle angewendeten Boni, z. B. "Tarnung (+10 Dunkelheit)"
const emit = defineEmits(['roll'])

const selection = ref([])
watch(open, (isOpen) => {
  if (isOpen) selection.value = []
})

const selected = computed(() =>
  optionalBonuses(props.bonuses).filter(b => selection.value.includes(b.id))
)
const target = computed(() => props.base + bonusSum(selected.value))

function confirm() {
  emit('roll', target.value, rollLabel(props.title, [...alwaysBonuses(props.bonuses), ...selected.value]))
  open.value = false
}
</script>
