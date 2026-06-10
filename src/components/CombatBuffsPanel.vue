<template>
  <div class="buffs-flyout" :class="{ expanded }">
    <!-- Panel body (animates open from the right) -->
    <div class="buffs-panel">
      <div class="buffs-panel-inner">
        <q-card flat bordered class="buffs-card">
          <!-- Header -->
          <div class="row items-center q-px-sm q-py-xs buffs-header">
            <q-icon name="local_pharmacy" color="amber" size="xs" class="q-mr-xs" />
            <span class="text-caption text-bold text-amber">Buffs & Stimulanzen</span>
            <q-space />
            <q-btn
              flat
              dense
              round
              size="sm"
              :icon="editMode ? 'check' : 'edit'"
              :color="editMode ? 'positive' : 'grey-5'"
              @click="editMode = !editMode"
            >
              <q-tooltip>{{ editMode ? "Bearbeiten beenden" : "Bearbeiten" }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="activeCount > 0"
              flat
              dense
              round
              size="sm"
              icon="flash_off"
              color="grey-5"
              @click="characterStore.deactivateAllBuffs()"
            >
              <q-tooltip>Alle Buffs deaktivieren</q-tooltip>
            </q-btn>
          </div>

          <q-separator />

          <!-- Buff list -->
          <q-scroll-area class="buffs-scroll">
            <div class="q-pa-xs">
              <div
                v-for="buff in character.buffs"
                :key="buff.id"
                class="buff-item"
                :class="{ 'buff-item--active': buff.active }"
                @click="!editMode && characterStore.toggleBuff(buff.id)"
              >
                <div class="row items-center no-wrap">
                  <q-icon
                    :name="buff.icon || 'bolt'"
                    :color="buff.active ? buff.color || 'amber' : 'grey-6'"
                    size="sm"
                    class="q-mr-xs"
                  />
                  <div class="col">
                    <div
                      class="text-caption text-bold"
                      :class="buff.active ? 'text-white' : 'text-grey-4'"
                    >
                      {{ buff.name }}
                    </div>
                    <div class="buff-effects text-grey-5">
                      {{ formatEffects(buff) || "keine Attributs-Effekte" }}
                    </div>
                    <div
                      v-if="buff.active && buff.duration > 0"
                      class="buff-duration text-cyan-4"
                    >
                      <q-icon name="schedule" size="11px" />
                      noch {{ buff.remaining }} {{ buff.remaining === 1 ? "Runde" : "Runden" }}
                    </div>
                    <div
                      v-else-if="buff.duration > 0"
                      class="buff-duration text-grey-6"
                    >
                      <q-icon name="schedule" size="11px" /> {{ buff.duration }} Runden Laufzeit
                    </div>
                    <div v-if="buff.note" class="buff-note text-amber-4">
                      <q-icon name="sticky_note_2" size="11px" /> {{ buff.note }}
                    </div>
                  </div>
                  <!-- View mode: active indicator -->
                  <q-icon
                    v-if="!editMode"
                    :name="buff.active ? 'check_circle' : 'radio_button_unchecked'"
                    :color="buff.active ? 'positive' : 'grey-7'"
                    size="xs"
                    class="q-ml-xs"
                  />
                  <!-- Edit mode: edit / delete -->
                  <template v-else>
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      icon="tune"
                      color="cyan"
                      @click.stop="openEditor(buff)"
                    >
                      <q-tooltip>Werte bearbeiten</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      size="sm"
                      icon="delete"
                      color="negative"
                      @click.stop="confirmDelete(buff)"
                    >
                      <q-tooltip>Löschen</q-tooltip>
                    </q-btn>
                  </template>
                </div>
              </div>

              <div
                v-if="character.buffs.length === 0"
                class="text-center text-grey-6 q-pa-md text-caption"
              >
                Noch keine Buffs angelegt
              </div>

              <!-- Add button (edit mode) -->
              <q-btn
                v-if="editMode"
                flat
                dense
                no-caps
                size="sm"
                icon="add"
                label="Buff hinzufügen"
                color="amber"
                class="full-width q-mt-xs"
                @click="addNewBuff"
              />
            </div>
          </q-scroll-area>
        </q-card>
      </div>
    </div>

    <!-- Toggle tab (always visible at the right edge) -->
    <button class="buffs-tab" @click="expanded = !expanded">
      <q-icon :name="expanded ? 'chevron_right' : 'chevron_left'" size="sm" />
      <q-icon name="local_pharmacy" size="xs" />
      <span v-if="activeCount > 0" class="buffs-tab-count">{{ activeCount }}</span>
      <q-tooltip>{{ expanded ? "Buffs einklappen" : "Buffs & Stimulanzen" }}</q-tooltip>
    </button>

    <!-- Editor dialog -->
    <q-dialog v-model="editorOpen">
      <q-card style="min-width: 340px; max-width: 95vw" class="bg-grey-10">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Buff bearbeiten</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-sm" v-if="editing">
          <q-input v-model="editing.name" label="Name" dense filled />
          <q-input
            v-model="editing.description"
            label="Beschreibung"
            type="textarea"
            autogrow
            dense
            filled
          />
          <q-input
            v-model="editing.note"
            label="Notiz (z.B. +2 TP, Temp-TP) – nur Anzeige"
            dense
            filled
            hint="Wird nicht automatisch berechnet, nur angezeigt"
          />

          <q-input
            v-model.number="editing.duration"
            type="number"
            min="0"
            label="Laufzeit (Runden)"
            dense
            filled
            hint="0 = unbegrenzt. Zählt beim Hochzählen der Runde runter, bei 0 endet der Buff."
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                v-model="editing.icon"
                :options="iconOptions"
                label="Icon"
                dense
                filled
                emit-value
                map-options
              >
                <template #selected>
                  <q-icon :name="editing.icon" class="q-mr-xs" /> {{ editing.icon }}
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.value" />
                    </q-item-section>
                    <q-item-section>{{ scope.opt.label }}</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-6">
              <q-select
                v-model="editing.color"
                :options="colorOptions"
                label="Farbe"
                dense
                filled
                emit-value
                map-options
              />
            </div>
          </div>

          <q-separator class="q-my-sm" />
          <div class="text-caption text-grey-5 q-mb-xs">
            Effekte (werden bei aktivem Buff auf die Attribute angewendet)
          </div>

          <!-- ALL + INI -->
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model.number="editing.effects.ALL"
                type="number"
                label="Alle Attribute"
                dense
                filled
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="editing.effects.INI"
                type="number"
                label="Initiative"
                dense
                filled
              />
            </div>
          </div>

          <!-- Single attributes -->
          <div class="row q-col-gutter-xs q-mt-xs">
            <div v-for="attr in attributeKeys" :key="attr" class="col-4">
              <q-input
                v-model.number="editing.effects[attr]"
                type="number"
                :label="attr"
                dense
                filled
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Abbrechen" color="grey" v-close-popup />
          <q-btn unelevated label="Speichern" color="primary" @click="saveEditor" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore";
import { ATTRIBUTE_KEYS, createEmptyEffects } from "../data/buffs.js";

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);

const expanded = ref(false);
const editMode = ref(false);
const editorOpen = ref(false);
const editing = ref(null);
const editingId = ref(null);

const attributeKeys = ATTRIBUTE_KEYS;

const activeCount = computed(
  () => (character.value.buffs || []).filter((b) => b.active).length
);

const iconOptions = [
  { label: "Blitz", value: "bolt" },
  { label: "Spritze", value: "vaccines" },
  { label: "Wissenschaft", value: "science" },
  { label: "Auge", value: "visibility" },
  { label: "Schild", value: "shield" },
  { label: "Herz", value: "favorite" },
  { label: "Flamme", value: "local_fire_department" },
  { label: "Stern", value: "auto_awesome" },
  { label: "Apotheke", value: "local_pharmacy" },
  { label: "Muskel", value: "fitness_center" },
];

const colorOptions = [
  { label: "Rot", value: "red" },
  { label: "Lila", value: "purple" },
  { label: "Blau", value: "blue" },
  { label: "Cyan", value: "cyan" },
  { label: "Grün", value: "green" },
  { label: "Amber", value: "amber" },
  { label: "Orange", value: "orange" },
  { label: "Pink", value: "pink" },
];

// Build a short summary of a buff's attribute effects
const formatEffects = (buff) => {
  const e = buff.effects || {};
  const parts = [];
  if (e.ALL) parts.push(`${e.ALL > 0 ? "+" : ""}${e.ALL} alle`);
  for (const attr of ATTRIBUTE_KEYS) {
    if (e[attr]) parts.push(`${e[attr] > 0 ? "+" : ""}${e[attr]} ${attr}`);
  }
  if (e.INI) parts.push(`${e.INI > 0 ? "+" : ""}${e.INI} Ini`);
  return parts.join(", ");
};

const addNewBuff = () => {
  characterStore.addBuff({ name: "Neuer Buff" });
  // Open editor for the just-added buff (last in list)
  const last = character.value.buffs[character.value.buffs.length - 1];
  if (last) openEditor(last);
};

const openEditor = (buff) => {
  editingId.value = buff.id;
  editing.value = {
    name: buff.name,
    description: buff.description || "",
    note: buff.note || "",
    icon: buff.icon || "bolt",
    color: buff.color || "amber",
    duration: Number(buff.duration) || 0,
    effects: { ...createEmptyEffects(), ...(buff.effects || {}) },
  };
  editorOpen.value = true;
};

const saveEditor = () => {
  if (!editingId.value || !editing.value) return;
  // Coerce all effect values to numbers
  const effects = { ...editing.value.effects };
  for (const key of Object.keys(effects)) {
    effects[key] = Number(effects[key]) || 0;
  }
  const duration = Math.max(0, Number(editing.value.duration) || 0);
  const updates = {
    name: editing.value.name || "Buff",
    description: editing.value.description,
    note: editing.value.note,
    icon: editing.value.icon,
    color: editing.value.color,
    duration,
    effects,
  };
  // If the buff is currently active, restart its countdown with the new duration
  const current = character.value.buffs.find((b) => b.id === editingId.value);
  if (current && current.active) {
    updates.remaining = duration;
  }
  characterStore.updateBuff(editingId.value, updates);
  editorOpen.value = false;
};

const confirmDelete = (buff) => {
  if (window.confirm(`Buff "${buff.name}" wirklich löschen?`)) {
    characterStore.removeBuff(buff.id);
  }
};
</script>

<style scoped>
.buffs-flyout {
  position: absolute;
  top: 4px;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  z-index: 20;
}

/* Toggle tab */
.buffs-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 26px;
  padding: 8px 0;
  background: rgba(20, 20, 24, 0.95);
  border: 1px solid rgba(255, 213, 79, 0.35);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: #ffd54f;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.buffs-tab:hover {
  background: rgba(40, 40, 48, 0.98);
  box-shadow: -2px 0 10px rgba(255, 213, 79, 0.25);
}

.buffs-tab-count {
  font-size: 0.7rem;
  font-weight: bold;
  background: #21ba45;
  color: #fff;
  border-radius: 8px;
  padding: 0 4px;
  line-height: 1.3;
}

/* Sliding panel */
.buffs-panel {
  width: 0;
  opacity: 0;
  overflow: hidden;
  transition: width 0.25s ease, opacity 0.2s ease;
}

.buffs-flyout.expanded .buffs-panel {
  width: 290px;
  opacity: 1;
}

.buffs-panel-inner {
  width: 290px;
}

.buffs-card {
  background: rgba(18, 18, 22, 0.98);
  border-color: rgba(255, 213, 79, 0.3);
  border-radius: 8px 0 0 8px;
}

.buffs-header {
  background: rgba(255, 213, 79, 0.06);
}

.buffs-scroll {
  height: 240px;
}

/* Buff item */
.buff-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.buff-item:hover {
  border-color: rgba(255, 213, 79, 0.4);
  background: rgba(255, 255, 255, 0.03);
}

.buff-item--active {
  border-color: rgba(33, 186, 69, 0.7);
  background: rgba(33, 186, 69, 0.12);
}

.buff-effects {
  font-size: 0.7rem;
  line-height: 1.2;
}

.buff-note {
  font-size: 0.7rem;
  line-height: 1.2;
  margin-top: 2px;
}

.buff-duration {
  font-size: 0.7rem;
  line-height: 1.2;
  margin-top: 2px;
  font-weight: 600;
}
</style>
