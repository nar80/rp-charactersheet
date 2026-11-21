<template>
  <div class="portrait" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="modelValue" :src="modelValue" alt="Portrait" class="portrait-image" @click="pickFile" />
    <div v-else class="portrait-empty column flex-center cursor-pointer" @click="pickFile">
      <q-icon name="add_a_photo" size="md" />
      <div class="text-caption q-mt-xs">Portrait</div>
    </div>

    <q-btn v-if="modelValue" round dense size="sm" icon="more_vert" class="portrait-menu">
      <q-menu auto-close>
        <q-list dense style="min-width: 160px;">
          <q-item clickable @click="pickFile">
            <q-item-section avatar><q-icon name="photo_camera" /></q-item-section>
            <q-item-section>Neues Bild</q-item-section>
          </q-item>
          <q-item clickable class="text-negative" @click="emit('update:modelValue', '')">
            <q-item-section avatar><q-icon name="delete" /></q-item-section>
            <q-item-section>Entfernen</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <input ref="input" type="file" accept="image/*" style="display: none" @change="onFile" />
    <PortraitCropDialog :file="file" @save="onSave" @cancel="onCancel" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import PortraitCropDialog from './PortraitCropDialog.vue'

// Größere Dateien lehnen wir ab, damit der Browser beim Laden nicht hängt.
// Gespeichert wird ohnehin nur der Zuschnitt (256×256, ca. 15–40 KB).
const MAX_FILE_MB = 15

defineProps({
  modelValue: { type: String, default: '' }, // Data-URL
  size: { type: Number, default: 120 }
})
const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const input = ref(null)
const file = ref(null)

const pickFile = () => input.value.click()

function onFile(event) {
  const picked = event.target.files[0]
  event.target.value = ''
  if (!picked) return
  if (!picked.type.startsWith('image/')) {
    $q.notify({ type: 'negative', position: 'top', message: 'Das ist keine Bilddatei.' })
    return
  }
  if (picked.size > MAX_FILE_MB * 1024 * 1024) {
    $q.notify({ type: 'negative', position: 'top', message: `Das Bild ist zu groß (max. ${MAX_FILE_MB} MB).` })
    return
  }
  file.value = picked
}

function onSave(data) {
  emit('update:modelValue', data)
  file.value = null
}

function onCancel(message) {
  file.value = null
  if (message) $q.notify({ type: 'negative', position: 'top', message })
}
</script>

<style scoped>
.portrait {
  position: relative;
  flex-shrink: 0;
}
.portrait-image,
.portrait-empty {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid rgba(var(--accent-rgb), 0.5);
}
.portrait-image {
  object-fit: cover;
  cursor: pointer;
}
.portrait-empty {
  color: rgba(var(--accent-rgb), 0.7);
  background: rgba(var(--accent-rgb), 0.05);
}
.portrait-menu {
  position: absolute;
  right: 4px;
  bottom: 4px;
  background: rgba(0, 0, 0, 0.6);
}
</style>
