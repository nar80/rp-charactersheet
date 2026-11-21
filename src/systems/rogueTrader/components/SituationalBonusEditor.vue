<template>
  <div>
    <div class="text-subtitle2">{{ title }}</div>
    <div class="text-caption text-grey-6 q-mb-sm">{{ hint }}</div>
    <div
      v-for="(bonus, i) in bonuses"
      :key="bonus.id"
      class="row items-center q-col-gutter-sm q-mb-xs"
    >
      <div class="col">
        <q-input v-model="bonus.label" label="Wann / wofür" filled dense maxlength="40" />
      </div>
      <div class="col-3">
        <!-- Schaden: auch Würfel wie "1W10" erlaubt -->
        <q-input
          v-if="allowDice"
          v-model="bonus.value"
          label="Wert"
          placeholder="+5 / 1W10"
          filled
          dense
          maxlength="12"
          input-style="text-align: center"
        />
        <q-input
          v-else
          v-model.number="bonus.value"
          type="number"
          label="Wert"
          filled
          dense
          input-style="text-align: center"
        />
      </div>
      <div class="col-auto">
        <q-checkbox v-model="bonus.always" label="Immer" dense size="sm" />
      </div>
      <div class="col-auto">
        <q-btn flat dense round size="sm" icon="delete" color="grey-6" @click="bonuses.splice(i, 1)" />
      </div>
    </div>
    <q-btn
      flat
      dense
      no-caps
      icon="add"
      label="Bonus hinzufügen"
      color="primary"
      @click="bonuses.push(newBonus(allowDice ? '' : 10))"
    />
  </div>
</template>

<script setup>
import { newBonus } from '../composables/situationalBonuses'

// Bearbeitet die übergebene Liste direkt; der Aufrufer reicht eine Kopie herein
// und speichert sie erst bei "Speichern" (mit cleanBonuses).
const bonuses = defineModel({ type: Array, required: true })

defineProps({
  title: { type: String, default: 'Situative Boni' },
  hint: {
    type: String,
    default: 'Werden beim Würfeln zur Auswahl angeboten. „Immer“ zählt bei jeder Probe.'
  },
  allowDice: { type: Boolean, default: false }
})
</script>
