import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'rp-combat-flyout'

// Welches Flyout auf der Ausruestungsseite offen ist: 'buffs' | 'notes' | null.
// Beide Panels sind gleich hoch und haengen am selben rechten Rand - zwei
// gleichzeitig offene wuerden sich ueberlagern, also ist immer hoechstens eins offen.
// Reiner UI-Zustand, gehoert deshalb in localStorage und nicht in den Charakter.
const openFlyout = ref(null)

try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'buffs' || stored === 'notes') openFlyout.value = stored
} catch {
  // localStorage nicht verfuegbar (Privatmodus o.ae.) - dann startet alles eingeklappt
}

watch(openFlyout, (val) => {
  try {
    if (val) localStorage.setItem(STORAGE_KEY, val)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Zustand geht dann nur nicht ueber einen Reload hinweg verloren
  }
})

export const useCombatFlyout = (id) => ({
  expanded: computed(() => openFlyout.value === id),
  toggle: () => {
    openFlyout.value = openFlyout.value === id ? null : id
  }
})
