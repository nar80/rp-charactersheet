import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'rp-character'

// Default character template
const createDefaultCharacter = () => ({
  // Basic Info
  name: '',
  player: '',
  careerPath: '',
  rank: '',
  homeworld: '',
  motivation: '',
  description: '',

  // Attributes (WH40k Rogue Trader)
  attributes: {
    KG: 30,  // Kampfgeschick (Weapon Skill)
    BF: 30,  // Ballistische Fertigkeit (Ballistic Skill)
    ST: 30,  // Stärke (Strength)
    WI: 30,  // Widerstand (Toughness)
    GE: 30,  // Gewandtheit (Agility)
    IN: 30,  // Intelligenz (Intelligence)
    WA: 30,  // Wahrnehmung (Perception)
    WK: 30,  // Willenskraft (Willpower)
    CH: 30   // Charisma (Fellowship)
  },

  // Attribute increases (dots)
  attributeIncreases: {
    KG: 0,
    BF: 0,
    ST: 0,
    WI: 0,
    GE: 0,
    IN: 0,
    WA: 0,
    WK: 0,
    CH: 0
  },

  // Skills
  skills: [
    // Basic Skills
    { name: 'Akrobatik', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Aufmerksamkeit', attribute: 'WA', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Ausweichen', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Befehligen', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Beschatten', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Charme', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Einschüchtern', attribute: 'ST', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Feilschen', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Fingerfertigkeit', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Forschender Blick', attribute: 'WA', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Glücksspiel', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Handel', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Klettern', attribute: 'ST', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Lesen/schreiben', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Logik', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Medizin', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Nachforschen', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Navigation', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Redeschwall', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Schätzen', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Schlangenmensch', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Schleichen', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Schwimmen', attribute: 'ST', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Sicherheit', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Suchen', attribute: 'WA', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Tarnung', attribute: 'GE', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Tech-Gebrauch', attribute: 'IN', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Verhör', attribute: 'WK', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Verkleiden', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Vorgaukeln', attribute: 'CH', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Zechen', attribute: 'WI', type: 'basic', trained: false, plus10: false, plus20: false, bonus: 0 }
  ],

  // Advanced Skills (can be added)
  advancedSkills: [],

  // Experience
  experience: {
    total: 0,
    spent: 0,
    available: 0
  },

  // Profit Factor (Rogue Trader specific)
  profitFactor: {
    initial: 0,
    current: 0,
    fatePoints: 0
  },

  // Talents & Traits
  talents: [],

  // Special Abilities
  specialAbilities: [],

  // Psi Powers (if applicable)
  psiPowers: {
    disciplines: [],
    techniques: []
  }
})

export const useCharacterStore = defineStore('character', () => {
  const character = ref(createDefaultCharacter())

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        character.value = { ...createDefaultCharacter(), ...parsed }
      } catch (error) {
        console.error('Error loading character:', error)
      }
    }
  }

  // Save to localStorage on changes
  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character.value))
  }

  // Watch for changes and auto-save
  watch(
    character,
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  // Actions
  const updateBasicInfo = (field, value) => {
    character.value[field] = value
  }

  const updateAttribute = (attr, value) => {
    character.value.attributes[attr] = value
  }

  const updateAttributeIncrease = (attr, value) => {
    character.value.attributeIncreases[attr] = value
  }

  const updateSkill = (skillName, updates) => {
    const skill = character.value.skills.find(s => s.name === skillName)
    if (skill) {
      Object.assign(skill, updates)
    }
  }

  const addAdvancedSkill = (skillData) => {
    character.value.advancedSkills.push(skillData)
  }

  const removeAdvancedSkill = (index) => {
    character.value.advancedSkills.splice(index, 1)
  }

  const addTalent = (talent) => {
    character.value.talents.push(talent)
  }

  const removeTalent = (index) => {
    character.value.talents.splice(index, 1)
  }

  const loadCharacter = (data) => {
    character.value = { ...createDefaultCharacter(), ...data }
  }

  const resetCharacter = () => {
    character.value = createDefaultCharacter()
  }

  const getSkillValue = (skill) => {
    const baseValue = character.value.attributes[skill.attribute] || 0
    let modifier = 0

    if (skill.trained) modifier += 0
    if (skill.plus10) modifier += 10
    if (skill.plus20) modifier += 20
    modifier += skill.bonus || 0

    return baseValue + modifier
  }

  // Initialize
  loadFromStorage()

  return {
    character,
    updateBasicInfo,
    updateAttribute,
    updateAttributeIncrease,
    updateSkill,
    addAdvancedSkill,
    removeAdvancedSkill,
    addTalent,
    removeTalent,
    loadCharacter,
    resetCharacter,
    getSkillValue
  }
})
