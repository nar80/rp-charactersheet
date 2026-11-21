<template>
  <q-item class="q-px-none">
    <q-item-section>
      <q-item-label>{{ scar.title }}</q-item-label>
      <q-item-label caption>{{ scar.text }}</q-item-label>

      <!-- Würfe aus dem Regeltext, je Schritt einmal -->
      <div class="q-mt-xs column q-gutter-y-xs">
        <div v-for="step in scar.steps" :key="step.key" class="row items-center no-wrap q-gutter-x-sm">
          <template v-if="entry.results?.[step.key]">
            <q-icon :name="resultIcon(step)" :color="resultColor(step)" size="xs" />
            <span class="text-caption">
              {{ step.label }}: <b>{{ entry.results[step.key].text }}</b>
              <span class="text-grey-6"> (Wurf {{ entry.results[step.key].roll }})</span>
            </span>
          </template>
          <template v-else-if="available(step)">
            <q-btn
              outline dense no-caps size="sm" icon="casino"
              :label="`${step.label} (${dieLabel(step)})`"
              :loading="busy"
              @click="roll(step)"
            />
          </template>
          <span v-else class="text-caption text-grey-7">{{ step.label }}: {{ blockedText(step) }}</span>
        </div>
      </div>

      <q-input v-model="entry.note" dense borderless placeholder="Notiz (z. B. Narbe am Hals)" class="text-caption" />
    </q-item-section>
    <q-item-section side top>
      <q-btn flat dense round size="sm" icon="close" @click="emit('remove')" />
    </q-item-section>
  </q-item>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCairnStore } from '../stores/characterStore'
import { useCairnDice } from '../composables/dice'
import { scars } from '../data/tables'

const props = defineProps({ entry: { type: Object, required: true } })
const emit = defineEmits(['remove'])

const $q = useQuasar()
const store = useCairnStore()
const cairnDice = useCairnDice()
const busy = ref(false)

const scar = computed(() => scars[props.entry.index] || { title: '?', text: '', steps: [] })

const dieLabel = (step) => (step.type === 'save' ? 'W20' : step.notation.toUpperCase().replace('D', 'W'))

// Auf ein Attribut aus einem früheren Schritt würfeln geht erst, wenn das feststeht;
// "Bei Erfolg"-Schritte erst nach gelungenem Rettungswurf
function available(step) {
  const results = props.entry.results || {}
  if (step.target === 'rolled' && !results.where) return false
  if (step.needsSave) return results.save?.success === true
  if (step.needsDoomSurvived) return !store.character.doomed && !store.character.dead
  return true
}
function blockedText(step) {
  const results = props.entry.results || {}
  if (step.needsSave && results.save) return 'entfällt (Rettungswurf misslungen)'
  if (step.needsSave) return 'erst nach gelungenem Rettungswurf'
  if (step.needsDoomSurvived) return store.character.dead ? 'entfällt (gestorben)' : 'erst nach überlebtem kritischem Rettungswurf'
  return 'erst nach dem Wurf darüber'
}
const resultIcon = (step) => {
  const r = props.entry.results[step.key]
  return step.type === 'save' ? (r.success ? 'check_circle' : 'cancel') : 'check'
}
const resultColor = (step) => {
  const r = props.entry.results[step.key]
  return step.type === 'save' ? (r.success ? 'positive' : 'negative') : 'grey-5'
}

async function roll(step) {
  busy.value = true
  try {
    const label = `Verletzung ${scar.value.title}: ${step.label}`
    if (step.type === 'save') {
      const value = store.character.attributes.WK.value
      const result = await cairnDice.saveValue(value, `${label} (WK)`)
      const r = result
      store.applyScarStep(props.entry.id, step, r.total, { success: result.success })
      notify(`${step.label}: ${r.total} gegen ${value}`, result.text, result.success ? 'positive' : 'negative')
    } else {
      const r = await cairnDice.rollValue(step.notation, label)
      const text = store.applyScarStep(props.entry.id, step, r.total)
      notify(`${step.label}: ${r.total}`, text)
    }
  } catch (error) {
    notify('Wurf fehlgeschlagen', error.message, 'negative')
  } finally {
    busy.value = false
  }
}

function notify(message, caption, color = 'grey-9') {
  $q.notify({ message, caption, color, icon: 'casino', position: 'top' })
}
</script>
