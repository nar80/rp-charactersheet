<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Notizen</div>
      <div class="text-caption text-grey-6">
        Halte wichtige Informationen, Questnotizen oder Charakterhintergründe fest
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input
        v-model="notes"
        type="textarea"
        filled
        placeholder="Hier kannst du deine Notizen eingeben..."
        rows="20"
        @update:model-value="updateNotes"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '../../stores/characterStore'

const characterStore = useCharacterStore()
const { character } = storeToRefs(characterStore)

const notes = ref('')

onMounted(() => {
  notes.value = character.value.notes || ''
})

const updateNotes = (value) => {
  character.value.notes = value
}
</script>
