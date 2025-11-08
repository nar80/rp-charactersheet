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
  notes: '',

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

  // Combat & Physical Stats
  hitPoints: {
    current: 10,
    max: 10
  },

  // Movement (based on Agility Bonus)
  movement: {
    half: 0,
    full: 0,
    charge: 0,
    run: 0
  },

  // Carrying Capacity (based on Strength & Toughness)
  carryingCapacity: {
    lift: 0,
    carry: 0,
    push: 0
  },

  // Basic Skills (immer vorhanden, können mit halbem Attribut verwendet werden)
  basicSkills: [
    {
      name: 'Akrobatik',
      attribute: 'GE',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Ermöglicht akrobatische Stunts wie Saltos, Rollen und Balance-Akte. Wird für waghalsige Manöver und spektakuläre Bewegungen verwendet.'
    },
    {
      name: 'Aufmerksamkeit',
      attribute: 'WA',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Passives Wahrnehmen der Umgebung. Wird verwendet um versteckte Gefahren, Hinterhalte oder wichtige Details zu bemerken.'
    },
    {
      name: 'Ausweichen',
      attribute: 'GE',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Ermöglicht das Ausweichen von Angriffen im Nahkampf. Eine erfolgreiche Probe verhindert einen Treffer.'
    },
    {
      name: 'Befehligen',
      attribute: 'CH',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Führungsqualitäten und Autorität. Wird verwendet um NPCs zu befehligen, Moral zu stärken oder Untergebene zu koordinieren.'
    },
    {
      name: 'Beschatten',
      attribute: 'GE',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Ermöglicht das unauffällige Verfolgen einer Person durch Menschenmengen oder Umgebungen ohne entdeckt zu werden.'
    },
    {
      name: 'Charme',
      attribute: 'CH',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Freundliche und gewinnende Art. Wird verwendet um NSCs positiv zu beeinflussen, Sympathie zu gewinnen oder Gefallen zu erbitten.'
    },
    {
      name: 'Einschüchtern',
      attribute: 'ST',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Durch physische Präsenz oder Drohungen andere einschüchtern. Kann verwendet werden um Informationen zu erzwingen oder Gegner zu demoralisieren.'
    },
    {
      name: 'Klettern',
      attribute: 'ST',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Ermöglicht das Erklettern von Wänden, Felsen, Seilen und anderen Hindernissen. Schwierigkeit variiert je nach Oberfläche.'
    },
    {
      name: 'Schleichen',
      attribute: 'GE',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Leise und unauffällig bewegen. Wird verwendet um unentdeckt zu bleiben und sich an Feinden vorbeizuschleichen.'
    },
    {
      name: 'Schwimmen',
      attribute: 'ST',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Schwimmen und sich über Wasser halten. Wird in rauhem Gewässer, bei langen Distanzen oder unter schwierigen Bedingungen benötigt.'
    },
    {
      name: 'Zechen',
      attribute: 'WI',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Widerstandsfähigkeit gegen Alkohol und andere Rauschmittel. Auch nützlich um in Tavernen Informationen zu sammeln.'
    }
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
        const defaultChar = createDefaultCharacter()

        // Merge basic skills to ensure descriptions are added
        if (parsed.basicSkills) {
          parsed.basicSkills = parsed.basicSkills.map(skill => {
            const defaultSkill = defaultChar.basicSkills.find(s => s.name === skill.name)
            return {
              ...defaultSkill,
              ...skill,
              // Ensure description from default if not present
              description: skill.description || (defaultSkill?.description || '')
            }
          })
        }

        character.value = { ...defaultChar, ...parsed }
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
      bonus: 0,
      description: skillData.description || ''
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
