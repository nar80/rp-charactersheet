<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="width: 460px; max-width: 95vw;">
      <q-card-section class="text-h6">{{ isNew ? 'Gegenstand hinzufügen' : 'Gegenstand bearbeiten' }}</q-card-section>

      <!-- Ein gemeinsames Raster: alle Zeilen gleich breit, gleiche Abstände -->
      <q-card-section class="row q-col-gutter-sm">
        <div v-if="isNew" class="col-12">
          <q-select
            :model-value="null"
            :options="itemTemplates"
            option-label="name"
            label="Aus der Ausrüstungsliste (optional)"
            filled
            dense
            clearable
            @update:model-value="applyTemplate"
          />
        </div>
        <div class="col-12">
          <q-input v-model="draft.name" label="Name" filled dense autofocus />
        </div>
        <div class="col-7">
          <q-select
            v-model="draft.type"
            :options="types"
            option-value="key"
            option-label="label"
            emit-value
            map-options
            label="Art"
            filled
            dense
          />
        </div>
        <div class="col-5 flex items-center">
          <q-toggle v-model="draft.bulky" label="Sperrig (2 Plätze)" dense :disable="draft.type === 'scroll'" />
        </div>

        <div v-if="draft.type === 'weapon' || draft.type === 'relic'" class="col-12">
          <q-select
            v-model="draft.damage"
            :options="['d4', 'd6', 'd8', 'd10', 'd12']"
            :option-label="(o) => o.toUpperCase().replace('D', 'W')"
            label="Schadenswürfel"
            filled
            dense
          />
        </div>
        <div v-if="draft.type === 'armor' || draft.type === 'relic'" class="col-12">
          <q-input
            v-model.number="draft.armor"
            type="number"
            min="0"
            max="3"
            label="Rüstung (+)"
            filled
            dense
          />
        </div>
        <!-- Zauber aus der Liste wählen oder eigenen eintragen (z. B. von der SL erfunden) -->
        <div v-if="draft.type === 'spellbook' || draft.type === 'scroll'" class="col-12">
          <q-select
            v-model="draft.spell"
            :options="spellOptions"
            label="Zauber"
            filled
            dense
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            new-value-mode="add-unique"
            :hint="spellTexts[draft.spell] || 'Aus der Liste wählen oder eigenen Zauber eintragen'"
            @filter="filterSpells"
            @input-value="(v) => (draft.spell = v)"
          >
            <template #append>
              <q-btn flat dense round size="sm" icon="casino" @click.stop="draft.spell = randomSpell()">
                <q-tooltip>Zauber auswürfeln (W100)</q-tooltip>
              </q-btn>
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt }}</q-item-label>
                  <q-item-label caption lines="2">{{ spellTexts[scope.opt] }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <template v-if="draft.type === 'relic'">
          <div class="col-4 flex items-center">
            <q-toggle v-model="hasCharges" label="Ladungen" dense />
          </div>
          <template v-if="draft.charges">
            <div class="col-4">
              <q-input v-model.number="draft.charges.value" type="number" min="0" label="Aktuell" filled dense />
            </div>
            <div class="col-4">
              <q-input v-model.number="draft.charges.max" type="number" min="0" label="Maximal" filled dense />
            </div>
          </template>
        </template>
        <div class="col-12">
          <q-input v-model="draft.notes" type="textarea" autogrow label="Notizen (z. B. Wiederaufladen, Effekt)" filled dense />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Abbrechen" v-close-popup />
        <q-btn color="primary" :label="isNew ? 'Hinzufügen' : 'Speichern'" :disable="!draft.name.trim()" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ITEM_TYPES, createItem } from '../stores/characterStore'
import { itemTemplates, spells, spellTexts } from '../data/tables'
import { randomSpell } from '../data/generator'

const props = defineProps({
  modelValue: Boolean,
  item: { type: Object, default: null } // null = neuer Gegenstand
})
const emit = defineEmits(['update:modelValue', 'save'])

const types = ITEM_TYPES.filter((t) => t.key !== 'fatigue')
const isNew = computed(() => !props.item)
const draft = ref(createItem())

watch(() => props.modelValue, (open) => {
  if (open) draft.value = props.item ? JSON.parse(JSON.stringify(props.item)) : createItem()
})

// Zauberliste beim Tippen filtern (Name oder Beschreibung)
const spellOptions = ref(spells)
function filterSpells(value, update) {
  const needle = value.toLowerCase()
  update(() => {
    spellOptions.value = needle
      ? spells.filter((s) => s.toLowerCase().includes(needle) || spellTexts[s]?.toLowerCase().includes(needle))
      : spells
  })
}

const hasCharges = computed({
  get: () => !!draft.value.charges,
  set: (on) => { draft.value.charges = on ? { value: 1, max: 1 } : null }
})

function applyTemplate(template) {
  if (!template) return
  draft.value = createItem({ ...template, spell: template.type === 'spellbook' ? randomSpell() : '' })
}

function save() {
  // Felder, die zur Art nicht passen, leeren (sonst zählt z. B. die Rüstung eines umgewidmeten Gegenstands weiter)
  const d = draft.value
  if (d.type !== 'armor' && d.type !== 'relic') d.armor = 0
  if (d.type !== 'relic') d.charges = null
  if (d.type !== 'spellbook' && d.type !== 'scroll') d.spell = ''
  if (d.type === 'scroll') d.bulky = false
  emit('save', d)
  emit('update:modelValue', false)
}
</script>
