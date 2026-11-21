import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'rp-settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    showSkills: true,
    showTalents: true,
    showPsiPowers: true,
    showEquipment: true,
    showAcquisitions: true,
    showNotes: true,
    aquilaOpacity: 3, // 0-10, where 0 = off
    enableWeaponStacks: false, // Special feature for pistol damage stacks
    exportWithTimestamp: false, // Add timestamp to exported filename
    enableAttributeSwap: false, // Allow swapping KG/BF base attribute (e.g. use Wahrnehmung instead)
    diceEnabled: false,
    diceRoom: 'gruppe', // Vorgabe für Systeme ohne eigenen Raum (und Wert aus der Zeit vor diceRooms)
    diceRooms: {}, // Würfelraum je System, z. B. { rogueTrader: 'gruppe', cairn: 'wald' }
    dicePlayerName: '',
    lastSystem: 'rogueTrader'
  })

  // Default values for new settings
  const defaults = {
    showSkills: true,
    showTalents: true,
    showPsiPowers: true,
    showEquipment: true,
    showAcquisitions: true,
    showNotes: true,
    aquilaOpacity: 3,
    enableWeaponStacks: false,
    exportWithTimestamp: false,
    enableAttributeSwap: false,
    diceEnabled: false,
    diceRoom: 'gruppe', // Vorgabe für Systeme ohne eigenen Raum (und Wert aus der Zeit vor diceRooms)
    diceRooms: {}, // Würfelraum je System, z. B. { rogueTrader: 'gruppe', cairn: 'wald' }
    dicePlayerName: '',
    lastSystem: 'rogueTrader'
  }

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure new settings have default values
        settings.value = { ...defaults, ...parsed }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }

  // Save to localStorage on changes
  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }

  // Watch for changes and auto-save
  watch(
    settings,
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  // Initialize
  loadFromStorage()

  // Raum des aktuell angezeigten Systems (lastSystem setzt der Router). Ändern betrifft nur dieses System.
  const roomFor = (systemId) => settings.value.diceRooms?.[systemId] ?? settings.value.diceRoom
  const currentRoom = computed({
    get: () => roomFor(settings.value.lastSystem),
    set: (value) => {
      settings.value.diceRooms = { ...settings.value.diceRooms, [settings.value.lastSystem]: value }
    }
  })

  return {
    settings,
    roomFor,
    currentRoom
  }
})
