<template>
  <div class="notes-flyout" :class="{ expanded }">
    <!-- Panel body (animates open from the right) -->
    <div class="notes-panel">
      <div class="notes-panel-inner">
        <q-card flat bordered class="notes-card">
          <!-- Header -->
          <div class="row items-center q-px-sm q-py-xs notes-header">
            <q-icon name="edit_note" color="cyan-4" size="xs" class="q-mr-xs" />
            <span class="text-caption text-bold text-cyan-4">Kampfnotizen</span>
            <q-space />
            <q-btn
              v-if="character.combatNotes"
              flat
              dense
              round
              size="sm"
              icon="backspace"
              color="grey-5"
              @click="clearNotes"
            >
              <q-tooltip>Notizen leeren</q-tooltip>
            </q-btn>
          </div>

          <q-separator />

          <!-- Notes field -->
          <q-input
            v-model="character.combatNotes"
            type="textarea"
            borderless
            dense
            class="notes-input-wrap"
            input-class="notes-input"
            input-style="height: 232px; resize: none;"
            placeholder="Gegner, Zustände, Reihenfolge, was auch immer gerade zählt …"
          />
        </q-card>
      </div>
    </div>

    <!-- Toggle tab (always visible at the right edge) -->
    <button class="notes-tab" @click="toggle">
      <q-icon :name="expanded ? 'chevron_right' : 'chevron_left'" size="sm" />
      <q-icon name="edit_note" size="xs" />
      <span v-if="!expanded && hasNotes" class="notes-tab-dot"></span>
      <q-tooltip>{{ expanded ? "Kampfnotizen einklappen" : "Kampfnotizen" }}</q-tooltip>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore";
import { useCombatFlyout } from "../composables/combatFlyout.js";

const characterStore = useCharacterStore();
const { character } = storeToRefs(characterStore);

// Teilt sich den Offen-Zustand mit den Buffs: immer hoechstens eins offen.
// Reiner UI-Zustand, wird in der Composable in localStorage gemerkt.
const { expanded, toggle } = useCombatFlyout("notes");

const hasNotes = computed(() => !!character.value.combatNotes?.trim());

const clearNotes = () => {
  character.value.combatNotes = "";
};
</script>

<style scoped>
/* Der Buffs-Reiter sitzt bei top 4px und ist 60px hoch, hier also 4 + 60 + 8 Abstand. */
.notes-flyout {
  position: absolute;
  top: 72px;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  z-index: 19;
  /* Wie beim Buffs-Flyout: der Container ist panelhoch und darf keine Klicks
     abfangen, sonst blockieren sich die gestapelten Reiter gegenseitig. */
  pointer-events: none;
}

.notes-tab,
.notes-panel {
  pointer-events: auto;
}

/* Feste Hoehe wie beim Buffs-Reiter - ohne align-self wuerde der Reiter
   auf die volle Panel-Hoehe gestreckt (Container hat align-items: stretch). */
.notes-tab {
  align-self: flex-start;
  height: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 26px;
  padding: 8px 0;
  background: rgba(20, 20, 24, 0.95);
  border: 1px solid rgba(77, 208, 225, 0.35);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: #4dd0e1;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.notes-tab:hover {
  background: rgba(40, 40, 48, 0.98);
  box-shadow: -2px 0 10px rgba(77, 208, 225, 0.25);
}

.notes-tab:focus-visible {
  outline: 2px solid #4dd0e1;
  outline-offset: 2px;
}

/* Marker, dass Notizen vorhanden sind, wenn das Panel zu ist.
   Absolut positioniert, damit er die feste Reiterhoehe nicht veraendert. */
.notes-tab-dot {
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4dd0e1;
}

/* Sliding panel */
.notes-panel {
  width: 0;
  opacity: 0;
  overflow: hidden;
  transition: width 0.25s ease, opacity 0.2s ease;
}

.notes-flyout.expanded .notes-panel {
  width: 290px;
  opacity: 1;
}

.notes-panel-inner {
  width: 290px;
}

.notes-card {
  background: rgba(18, 18, 22, 0.98);
  border-color: rgba(77, 208, 225, 0.3);
  border-radius: 8px 0 0 8px;
}

.notes-header {
  background: rgba(77, 208, 225, 0.06);
}

.notes-input-wrap {
  padding: 0 8px;
}

/* Feste Hoehe, langer Inhalt scrollt innerhalb des Feldes */
.notes-input-wrap :deep(.notes-input) {
  overflow-y: auto;
  line-height: 1.45;
  font-size: 0.82rem;
}

@media (prefers-reduced-motion: reduce) {
  .notes-panel {
    transition: none;
  }
}
</style>
