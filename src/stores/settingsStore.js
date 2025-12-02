import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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
    exportWithTimestamp: false // Add timestamp to exported filename
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
    exportWithTimestamp: false
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

  return {
    settings
  }
})
