// Voreingetragene Buffs & Stimulanzen
// effects: ALL = Bonus auf alle 9 Attribute, je Attribut zusätzlich einzeln, INI = Initiative-Mod
// note: rein informativ (z.B. TP / Temp-TP), wird vom Spieler manuell verwaltet
// duration: Laufzeit in Runden (0 = unbegrenzt). Zählt beim Hochzählen des Rundenzählers runter.
// remaining: verbleibende Runden während aktiv (Laufzeit-Restwert)

export const ATTRIBUTE_KEYS = ['KG', 'BF', 'ST', 'WI', 'GE', 'IN', 'WA', 'WK', 'CH']

export const createEmptyEffects = () => ({
  ALL: 0,
  KG: 0,
  BF: 0,
  ST: 0,
  WI: 0,
  GE: 0,
  IN: 0,
  WA: 0,
  WK: 0,
  CH: 0,
  INI: 0
})

export const defaultBuffs = [
  {
    id: 'apexalium',
    name: 'Apexalium',
    description: 'Mächtiges Kampfstimulans. Steigert kurzzeitig Stärke und Gewandtheit massiv.',
    icon: 'science',
    color: 'red',
    note: '+2 TP (manuell)',
    active: false,
    preset: true,
    duration: 4,
    remaining: 0,
    effects: { ...createEmptyEffects(), ST: 20, GE: 20 }
  },
  {
    id: 'navigator-segen',
    name: 'Navigator-Segen',
    description: 'Kraft des Navigators: erhebt einen Verbündeten über sich selbst und gewährt temporäre Trefferpunkte.',
    icon: 'visibility',
    color: 'purple',
    note: '+X Temp-TP (manuell eintragen)',
    active: false,
    preset: true,
    duration: 1,
    remaining: 0,
    effects: { ...createEmptyEffects(), ALL: 10 }
  }
]
