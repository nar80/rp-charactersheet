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

  // Basic Skills (immer vorhanden, können mit halbem Attribut verwendet werden)
  basicSkills: [
    { name: 'Akrobatik', attribute: 'GE', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Aufmerksamkeit', attribute: 'WA', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Ausweichen', attribute: 'GE', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Befehligen', attribute: 'CH', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Beschatten', attribute: 'GE', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Charme', attribute: 'CH', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Einschüchtern', attribute: 'ST', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Klettern', attribute: 'ST', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Schleichen', attribute: 'GE', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Schwimmen', attribute: 'ST', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 },
    { name: 'Zechen', attribute: 'WI', isBasic: true, trained: false, plus10: false, plus20: false, bonus: 0 }
  ],

  // Learned Skills (erlernte Fertigkeiten - werden nur angezeigt wenn hinzugefügt)
  learnedSkills: [],

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

  const updateBasicSkill = (skillName, updates) => {
    const skill = character.value.basicSkills.find(s => s.name === skillName)
    if (skill) {
      Object.assign(skill, updates)
    }
  }

  const updateLearnedSkill = (skillId, updates) => {
    const skill = character.value.learnedSkills.find(s => s.id === skillId)
    if (skill) {
      Object.assign(skill, updates)
    }
  }

  const addLearnedSkill = (skillData) => {
    // Create unique ID for the skill
    const id = Date.now() + Math.random()
    character.value.learnedSkills.push({
      id,
      name: skillData.name,
      attribute: skillData.attribute,
      specialization: skillData.specialization || '',
      isBasic: skillData.isBasic || false, // Kann als Grundfertigkeit markiert werden
      trained: true, // Erlernte Skills sind immer trained
      plus10: false,
      plus20: false,
      bonus: 0
    })
  }

  const removeLearnedSkill = (skillId) => {
    const index = character.value.learnedSkills.findIndex(s => s.id === skillId)
    if (index !== -1) {
      character.value.learnedSkills.splice(index, 1)
    }
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
    const baseAttribute = character.value.attributes[skill.attribute] || 0

    // Grundfertigkeiten ohne Training: halbes Attribut (abgerundet)
    // Grundfertigkeiten mit Training oder erlernte Fertigkeiten: volles Attribut
    const baseValue = (skill.isBasic && !skill.trained)
      ? Math.floor(baseAttribute / 2)
      : baseAttribute

    let modifier = 0
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
    updateBasicSkill,
    updateLearnedSkill,
    addLearnedSkill,
    removeLearnedSkill,
    addTalent,
    removeTalent,
    loadCharacter,
    resetCharacter,
    getSkillValue
  }
})
