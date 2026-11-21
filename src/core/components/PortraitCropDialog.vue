<template>
  <q-dialog :model-value="!!file" persistent @update:model-value="(v) => !v && emit('cancel')">
    <q-card style="width: 360px; max-width: 95vw;">
      <q-card-section class="text-h6 q-pb-sm">Portrait zuschneiden</q-card-section>

      <q-card-section class="q-pt-none column items-center">
        <div
          ref="viewport"
          class="crop-viewport"
          :style="{ width: `${VIEW}px`, height: `${VIEW}px` }"
          @pointerdown="startDrag"
          @pointermove="drag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @wheel.prevent="onWheel"
        >
          <img
            v-if="src"
            :src="src"
            alt=""
            draggable="false"
            class="crop-image"
            :style="{ width: `${img.w * scale}px`, height: `${img.h * scale}px`, transform: `translate(${pos.x}px, ${pos.y}px)` }"
          />
          <q-inner-loading :showing="!src" />
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">Ziehen zum Verschieben, Regler oder Mausrad zum Zoomen</div>
        <q-slider
          v-model="zoom"
          :min="1"
          :max="4"
          :step="0.01"
          class="q-mt-sm"
          style="width: 100%;"
          @update:model-value="zoomTo"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Abbrechen" @click="emit('cancel')" />
        <q-btn color="primary" label="Übernehmen" :disable="!src" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'

// Ergebnis: quadratisches Bild mit OUTPUT Pixeln Kantenlänge
const VIEW = 280
const OUTPUT = 256

const props = defineProps({ file: { type: Object, default: null } }) // File oder null
const emit = defineEmits(['save', 'cancel'])

const src = ref('')
const img = reactive({ w: 1, h: 1 })
const pos = reactive({ x: 0, y: 0 })
const zoom = ref(1)
let image = null

// Bei Zoom 1 füllt das Bild den Rahmen gerade so aus
const baseScale = computed(() => VIEW / Math.min(img.w, img.h))
const scale = computed(() => baseScale.value * zoom.value)

// Das Bild darf den Rahmen nie freilegen
function clamp() {
  pos.x = Math.min(0, Math.max(VIEW - img.w * scale.value, pos.x))
  pos.y = Math.min(0, Math.max(VIEW - img.h * scale.value, pos.y))
}

watch(() => props.file, (file) => {
  if (src.value) URL.revokeObjectURL(src.value)
  src.value = ''
  if (!file) return
  const url = URL.createObjectURL(file)
  const loading = new Image()
  image = loading
  loading.onload = () => {
    // Inzwischen ein anderes Bild gewählt oder abgebrochen: dieses verwerfen
    if (image !== loading || props.file !== file) {
      URL.revokeObjectURL(url)
      return
    }
    img.w = image.naturalWidth || VIEW
    img.h = image.naturalHeight || VIEW
    zoom.value = 1
    pos.x = (VIEW - img.w * scale.value) / 2
    pos.y = (VIEW - img.h * scale.value) / 2
    src.value = url
  }
  loading.onerror = () => {
    URL.revokeObjectURL(url)
    if (image === loading) emit('cancel', 'Das Bild konnte nicht gelesen werden.')
  }
  loading.src = url
}, { immediate: true })

onBeforeUnmount(() => src.value && URL.revokeObjectURL(src.value))

// Zoomen um die Mitte des Rahmens
let lastZoom = 1
function zoomTo(value) {
  const center = VIEW / 2
  const factor = value / lastZoom
  pos.x = center - (center - pos.x) * factor
  pos.y = center - (center - pos.y) * factor
  lastZoom = value
  clamp()
}
watch(src, () => { lastZoom = 1 })

function onWheel(event) {
  zoom.value = Math.min(4, Math.max(1, zoom.value * (event.deltaY < 0 ? 1.08 : 1 / 1.08)))
  zoomTo(zoom.value)
}

let dragStart = null
function startDrag(event) {
  dragStart = { x: event.clientX - pos.x, y: event.clientY - pos.y }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function drag(event) {
  if (!dragStart) return
  pos.x = event.clientX - dragStart.x
  pos.y = event.clientY - dragStart.y
  clamp()
}
function endDrag() {
  dragStart = null
}

function save() {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT
  canvas.height = OUTPUT
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  const s = scale.value
  ctx.drawImage(image, -pos.x / s, -pos.y / s, VIEW / s, VIEW / s, 0, 0, OUTPUT, OUTPUT)
  // WebP, falls der Browser es nicht kann (liefert dann PNG): JPEG
  let data = canvas.toDataURL('image/webp', 0.85)
  if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', 0.85)
  emit('save', data)
}
</script>

<style scoped>
.crop-viewport {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #111;
  cursor: grab;
  touch-action: none;
  outline: 2px solid rgba(var(--accent-rgb), 0.6);
}
.crop-viewport:active {
  cursor: grabbing;
}
.crop-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  user-select: none;
  pointer-events: none;
}
</style>
