// Cairn-Würfe über den gemeinsamen Würfelraum
import { Notify } from 'quasar'
import { useDiceRoom } from '@/core/diceRoom'
import { useCairnStore, ATTRIBUTES } from '../stores/characterStore'
import { d } from '../data/generator'

export function rollLocal(notation) {
  const m = /^(\d*)d(\d+)(?:\+(\d+))?$/.exec(notation.replace(/\s/g, ''))
  if (!m) throw new Error(`Notation „${notation}“ wird lokal nicht unterstützt`)
  const values = Array.from({ length: Number(m[1] || 1) }, () => d(Number(m[2])))
  return { total: values.reduce((a, b) => a + b, 0) + Number(m[3] || 0), dice: values, room: false }
}

// Rettungswurf: 1W20 gleich oder unter dem Attribut. 1 gelingt immer, 20 misslingt immer.
export function evaluateSave(roll, value) {
  if (roll === 1) return { success: true, text: 'Erfolg (1 gelingt immer)' }
  if (roll === 20) return { success: false, text: 'Misserfolg (20 misslingt immer)' }
  return roll <= value ? { success: true, text: 'Erfolg' } : { success: false, text: 'Misserfolg' }
}

export function useCairnDice() {
  const dice = useDiceRoom()
  const store = useCairnStore()

  // Rettungswurf als Promise: { total, success, text, room }.
  // Neuer Würfelraum: als Cairn-Probe (Server wertet aus, im Verlauf sehen alle Erfolg/Misserfolg).
  // Älterer Würfelraum: freier W20, ausgewertet im Blatt. Ohne Verbindung: lokal.
  function saveValue(value, label) {
    if (dice.connected.value && dice.supportsChecks.value) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Keine Antwort vom Würfelraum')), 15000)
        const sent = dice.check('cairn', 'save', { target: value }, label, {
          present(roll) {
            clearTimeout(timer)
            const result = roll.outcome ?? evaluateSave(roll.total, value)
            resolve({ total: roll.total, ...result, room: true })
            return false
          },
          onError: (message) => {
            clearTimeout(timer)
            reject(new Error(message))
          }
        })
        if (!sent) {
          clearTimeout(timer)
          reject(new Error('Würfelraum nicht verbunden'))
        }
      })
    }
    return rollValue('1d20', `${label} (${value})`).then((r) => ({ ...r, ...evaluateSave(r.total, value) }))
  }

  // Rettungswurf-Knopf am Attribut: würfeln und Ergebnis einblenden
  async function save(key, { label, onResult } = {}) {
    const value = store.character.attributes[key].value
    const name = ATTRIBUTES.find((a) => a.key === key)?.name || key
    try {
      const r = await saveValue(value, label || `Rettungswurf ${name}`)
      onResult?.(r)
      Notify.create({
        message: `${label || `Rettungswurf ${name}`}: ${r.total} gegen ${value}`,
        caption: r.text,
        color: r.success ? 'positive' : 'negative',
        icon: 'casino',
        position: 'top'
      })
      return true
    } catch (error) {
      Notify.create({ type: 'negative', position: 'top', message: `Wurf fehlgeschlagen: ${error.message}` })
      return false
    }
  }

  // Angriff: beeinträchtigt = W4, verstärkt = W12, mehrere Waffen = höchster Würfel zählt (S. 18)
  function attack(weapons, mode = 'normal', { onResult } = {}) {
    const names = weapons.map((w) => w.name || 'Waffe').join(' + ')
    let notation
    let label
    if (mode === 'impaired') {
      notation = '1d4'
      label = `${names} (beeinträchtigt)`
    } else if (mode === 'enhanced') {
      notation = '1d12'
      label = `${names} (verstärkt)`
    } else {
      const each = weapons.map((w) => `1${w.damage || 'd4'}`)
      notation = each.length > 1 ? `max(${each.join(', ')})` : each[0]
      label = weapons.length > 1 ? `${names} (höchster zählt)` : names
    }
    return dice.roll(notation, `Schaden: ${label}`, { present: (roll) => { onResult?.(roll); return {} } })
  }

  function free(notation, label) {
    return dice.roll(notation, label)
  }

  // Wurf mit Ergebnis als Promise: { total, dice: [Einzelwürfe], room: true/false }.
  // room = true und verbunden: im Würfelraum (alle sehen es), ohne eigene Einblendung im Bogen.
  // Sonst lokal. Nur einfache Notation "NdS" oder "NdS+M".
  function rollValue(notation, label, { room = true } = {}) {
    if (room && dice.connected.value) {
      return new Promise((resolve, reject) => {
        // Antwortet der Server nicht, gibt die Oberfläche nach 15 s auf. Kommt das Ergebnis später
        // doch noch, wird es seinem eigenen (abgelaufenen) Eintrag zugeordnet und ignoriert.
        const timer = setTimeout(() => reject(new Error('Keine Antwort vom Würfelraum')), 15000)
        const sent = dice.roll(notation, label, {
          present(roll) {
            const values = [...(roll.output || '').matchAll(/\[([^\]]*)\]/g)]
              .flatMap(([, list]) => list.split(',').map((v) => parseInt(v, 10)))
              .filter(Number.isFinite)
            clearTimeout(timer)
            resolve({ total: roll.total, dice: values, room: true })
            return false
          },
          onError: (message) => {
            clearTimeout(timer)
            reject(new Error(message))
          }
        })
        if (!sent) {
          clearTimeout(timer)
          reject(new Error('Würfelraum nicht verbunden'))
        }
      })
    }
    return Promise.resolve(rollLocal(notation))
  }

  return { connected: dice.connected, save, saveValue, attack, free, rollValue }
}
