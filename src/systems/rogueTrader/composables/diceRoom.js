// Rogue-Trader-Auswertung für den gemeinsamen Würfelraum (Kern: core/diceRoom.js).
// Gleiche Schnittstelle wie früher, damit die Sections unverändert bleiben.
import { useDiceRoom as useCoreDiceRoom, diceHtml, escapeHtml } from '@/core/diceRoom'
import { useCharacterStore } from '../stores/characterStore'

// W100 gleich oder unter Zielwert, je volle 10 Punkte Abstand = 1 Grad.
// Ab AUTO_FAIL_FROM misslingt immer, 01 gelingt immer (gleich wie im Würfelraum).
const AUTO_FAIL_FROM = 95

export function evaluateTest(roll, target) {
  const success = roll < AUTO_FAIL_FROM && (roll === 1 || roll <= target)
  // Automatischer Erfolg/Misserfolg gegen den Zielwert hat keine Grade
  const degrees = success === (roll <= target) ? Math.floor(Math.abs(target - roll) / 10) : 0
  const word = success
    ? degrees === 1 ? 'Erfolgsgrad' : 'Erfolgsgrade'
    : degrees === 1 ? 'Misserfolgsgrad' : 'Misserfolgsgrade'
  return {
    success,
    degrees,
    text: `${success ? 'Erfolg' : 'Misserfolg'}${degrees ? ` · ${degrees} ${word}` : ''}`
  }
}

function hasNaturalTen(output) {
  return [...output.matchAll(/\[([^\]]*)\]/g)].some(([, dice]) =>
    dice.split(',').some((d) => !d.trim().endsWith('d') && parseInt(d, 10) === 10)
  )
}

export function useDiceRoom() {
  const core = useCoreDiceRoom()
  const characterStore = useCharacterStore()

  // Probe auf einen Zielwert. Erschöpfung (-10) wird automatisch abgezogen,
  // außer bei Proben, die nicht vom Charakter abhängen (exhaustion: false, z. B. Beschaffung).
  // onResult(roll, evaluation) wird nach dem eigenen Wurf aufgerufen.
  function test(target, label, { onResult, exhaustion = true } = {}) {
    let finalTarget = Number(target) || 0
    let finalLabel = label
    if (exhaustion && characterStore.character.exhaustion > 0) {
      finalTarget -= 10
      finalLabel = `${label} (−10 Erschöpfung)`
    }
    return core.test(finalTarget, finalLabel, {
      present(roll) {
        const result = evaluateTest(roll.total, roll.target)
        onResult?.(roll, result)
        return {
          html: false,
          message: `${roll.label || 'Probe'}: ${String(roll.total).padStart(2, '0')} gegen ${roll.target}`,
          caption: result.text,
          color: result.success ? 'positive' : 'negative'
        }
      }
    })
  }

  // fury: eine gewürfelte 10 hervorheben; onFury(roll): Handler für "Bestätigen".
  // onResult(roll) wird nach dem eigenen Wurf aufgerufen.
  function roll(notation, label, { fury = false, onFury, onResult } = {}) {
    return core.roll(notation, label, {
      present(roll) {
        onResult?.(roll)
        if (!fury || !hasNaturalTen(roll.output)) return {}
        const needsAnswer = !!onFury
        return {
          message: escapeHtml(`${roll.label || 'Wurf'}: ${roll.total}`),
          caption: `${diceHtml(roll.output)} · 10 gewürfelt – Zorn des Imperators möglich!`,
          color: 'deep-orange',
          icon: 'local_fire_department',
          // Bestätigungsanfragen bleiben stehen, bis man einen der Buttons klickt
          timeout: needsAnswer ? 0 : 15000,
          actions: needsAnswer
            ? [
                { label: 'Bestätigen', color: 'white', handler: () => onFury(roll) },
                { label: 'Ignorieren', color: 'white' }
              ]
            : []
        }
      }
    })
  }

  return { ...core, test, roll }
}
