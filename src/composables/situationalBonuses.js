// Situative Boni für Fertigkeiten und Attribute: [{ id, label, value, always }].
// "Immer"-Boni zählen bei jeder Probe, die übrigen werden beim Würfeln zur Auswahl angeboten.

export const bonusSum = (bonuses = []) =>
  bonuses.reduce((sum, b) => sum + (Number(b.value) || 0), 0)

export const alwaysBonuses = (bonuses = []) => bonuses.filter(b => b.always)

export const optionalBonuses = (bonuses = []) => bonuses.filter(b => !b.always)

export const formatBonus = (value) =>
  Number(value) < 0 ? `−${Math.abs(value)}` : `+${Number(value) || 0}`

// Wurftext mit allen angewendeten Boni: "Tarnung (+10 Tarnumhang, +10 Dunkelheit)"
export const rollLabel = (name, applied = []) =>
  applied.length
    ? `${name} (${applied.map(b => `${formatBonus(b.value)} ${b.label}`).join(', ')})`
    : name

export const newBonus = () => ({
  id: Date.now() + Math.random(),
  label: '',
  value: 10,
  always: false
})

// Zum Speichern: leere Bezeichnungen und Wert 0 fallen weg
export const cleanBonuses = (bonuses = []) =>
  bonuses
    .map(b => ({ ...b, label: String(b.label || '').trim(), value: Number(b.value) || 0 }))
    .filter(b => b.label && b.value)
