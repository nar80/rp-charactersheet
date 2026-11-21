<template>
  <!-- ellipsis: zu lange Namen enden mit „…“, statt die Kopfzeile zu sprengen -->
  <div v-if="character.name" class="text-subtitle1 text-weight-medium ellipsis" style="max-width: 100%;">
    <q-avatar v-if="character.portrait" size="32px" class="q-mr-sm" style="vertical-align: middle;"><img :src="character.portrait" alt="" /></q-avatar>
    {{ character.name }}
    <span v-if="character.careerPath" class="text-grey-6">• {{ character.careerPath }}</span>
    <span class="text-grey-6">• Rang {{ calculatedRank }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'

const { character } = storeToRefs(useCharacterStore())

// Rang nach ausgegebenen EP
const RANK_THRESHOLDS = [5000, 7000, 10000, 13000, 17000, 21000, 25000, 30000, 35000, 45000]
const calculatedRank = computed(() => {
  const spent = character.value.experience?.spent || 0
  const rank = RANK_THRESHOLDS.findIndex((min) => spent < min)
  return rank === -1 ? 10 : rank
})
</script>
