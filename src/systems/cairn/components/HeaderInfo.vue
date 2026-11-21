<template>
  <!-- ellipsis: zu lange Namen enden mit „…“, statt die Kopfzeile zu sprengen -->
  <div v-if="character.name" class="text-subtitle1 text-weight-medium ellipsis" style="max-width: 100%;">
    <q-avatar v-if="character.portrait" size="32px" class="q-mr-sm" style="vertical-align: middle;"><img :src="character.portrait" alt="" /></q-avatar>
    {{ character.name }}
    <span v-if="character.background" class="text-grey-6">• {{ character.background }}</span>
    <span class="text-grey-6">• TP {{ character.hp.value }}/{{ character.hp.max }}</span>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCairnStore } from '../stores/characterStore'

const { character } = storeToRefs(useCairnStore())
</script>
