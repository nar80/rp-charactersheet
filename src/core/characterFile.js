// Export/Import von Charakteren als JSON-Datei, für jedes System gleich.
// Dateiformat: { system, character, settings }. Alte Dateien ohne "system" sind Rogue Trader.
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useSettingsStore } from './settingsStore'
import { systems, findSystem, DEFAULT_SYSTEM } from '../systems'

function timestamp() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  // Sekunden, damit mehrere Exporte innerhalb einer Minute nicht denselben
  // Dateinamen bekommen und sich gegenseitig überschreiben
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
}

// system: computed/ref auf das aktuell angezeigte System
export function useCharacterFile(system) {
  const $q = useQuasar()
  const router = useRouter()
  const settingsStore = useSettingsStore()

  function exportCharacter() {
    const store = system.value.useStore()
    const data = {
      system: system.value.id,
      character: store.character,
      settings: settingsStore.settings
    }
    let filename = store.character.name || 'character'
    if (settingsStore.settings.exportWithTimestamp) filename = `${timestamp()}_${filename}`

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    link.download = `${filename}.json`
    link.click()

    $q.notify({ type: 'positive', message: 'Charakter exportiert', position: 'top' })
  }

  function importFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        // Altes Format: nur der Charakter, ohne Hülle
        const charData = data.character || data
        // Ohne Angabe (alte Dateien, nackter Charakter): am Inhalt erkennen, Rogue Trader zuerst
        const target = data.system
          ? findSystem(data.system)
          : [DEFAULT_SYSTEM, ...systems].find((s) => s.isValidCharacter(charData)) || DEFAULT_SYSTEM
        if (!target) throw new Error(`Unbekanntes System „${data.system}“`)
        if (!charData || typeof charData !== 'object' || !target.isValidCharacter(charData)) {
          throw new Error('Ungültiges Charakter-Format')
        }

        target.useStore().loadCharacter(charData)
        if (data.character && data.settings) {
          // lastSystem ergibt sich aus dem Import selbst. Den Namen im Würfelraum nicht übernehmen:
          // Gibt die SL einem Spieler eine Datei, soll der nicht unter dem Namen der SL würfeln.
          const { lastSystem, dicePlayerName, ...rest } = data.settings
          Object.assign(settingsStore.settings, rest)
          // Alte Dateien kennen nur einen Raum: der gilt für das importierte System (wie früher)
          if (rest.diceRoom && !rest.diceRooms) {
            settingsStore.settings.diceRooms = { ...settingsStore.settings.diceRooms, [target.id]: rest.diceRoom }
          }
        }

        const switched = target.id !== system.value.id
        if (switched) router.push(`/${target.slug}`)
        $q.notify({
          type: 'positive',
          message: switched ? `Charakter importiert – gewechselt zu ${target.name}` : 'Charakter importiert',
          position: 'top'
        })
      } catch (error) {
        $q.notify({ type: 'negative', message: `Fehler beim Importieren: ${error.message}`, position: 'top' })
      }
    }
    reader.readAsText(file)
  }

  return { exportCharacter, importFile }
}
