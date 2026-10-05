// Situative Boni für Fertigkeiten, Attribute und Psy-Kräfte: [{ id, label, value, always }].
// "Immer"-Boni zählen bei jeder Probe, die übrigen werden beim Würfeln zur Auswahl angeboten.
// value ist eine Zahl; bei Schadenswürfen darf es auch ein Würfelausdruck sein ("1W10").

export const isDiceValue = (value) => /\d*[wd]\d/i.test(String(value ?? ''))

export const bonusSum = (bonuses = []) =>
  bonuses.reduce((sum, b) => sum + (isDiceValue(b.value) ? 0 : Number(b.value) || 0), 0)

export const alwaysBonuses = (bonuses = []) => bonuses.filter(b => b.always)

export const optionalBonuses = (bonuses = []) => bonuses.filter(b => !b.always)

export const formatBonus = (value) => {
  if (isDiceValue(value)) {
    const text = String(value).trim()
    return text.startsWith('-') ? text.replace('-', '−') : `+${text.replace(/^\+/, '')}`
  }
  return Number(value) < 0 ? `−${Math.abs(value)}` : `+${Number(value) || 0}`
}

// Schaden: Grundausdruck plus Boni, z. B. "2W10+4" + [1W10, -2] -> "2W10+4+1W10-2"
export const addToNotation = (base, bonuses = []) =>
  bonuses.reduce((notation, b) => {
    const text = String(b.value).trim().replace(/^\+/, '')
    if (!text || text === '0') return notation
    return text.startsWith('-') ? `${notation}${text}` : `${notation}+${text}`
  }, String(base).trim())

// Wurftext mit allen angewendeten Boni: "Tarnung (+10 Tarnumhang, +10 Dunkelheit)"
export const rollLabel = (name, applied = []) =>
  applied.length
    ? `${name} (${applied.map(b => `${formatBonus(b.value)} ${b.label}`).join(', ')})`
    : name

export const newBonus = (value = 10) => ({
  id: Date.now() + Math.random(),
  label: '',
  value,
  always: false
})

// Zum Speichern: leere Bezeichnungen und Wert 0 fallen weg
export const cleanBonuses = (bonuses = []) =>
  bonuses
    .map(b => ({
      ...b,
      label: String(b.label || '').trim(),
      value: isDiceValue(b.value)
        ? String(b.value).trim().replace(/d/gi, 'W').replace(/^\+/, '')
        : Number(b.value) || 0
    }))
    .filter(b => b.label && b.value)
