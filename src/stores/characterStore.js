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
      name: 'Feilschen',
      attribute: 'CH',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Geschickt handeln und bessere Preise aushandeln. Wird beim Kaufen und Verkaufen von Waren verwendet.'
    },
    {
      name: 'Forschender Blick',
      attribute: 'WA',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Schnelles Erfassen von Details und Situationen auf einen Blick.'
    },
    {
      name: 'Glücksspiel',
      attribute: 'IN',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Kenntnisse über Glücksspiele und die Fähigkeit, beim Spiel zu gewinnen.'
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
      name: 'Logik',
      attribute: 'IN',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Logisches Denken und Problemlösung. Wird verwendet um Rätsel zu lösen oder komplexe Zusammenhänge zu verstehen.'
    },
    {
      name: 'Nachforschen',
      attribute: 'CH',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Informationen durch Befragung und Recherche sammeln.'
    },
    {
      name: 'Schätzen',
      attribute: 'IN',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Den Wert von Gegenständen einschätzen können.'
    },
    {
      name: 'Schlangenmensch',
      attribute: 'GE',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Körper verdrehen und durch enge Räume zwängen.'
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
      name: 'Suchen',
      attribute: 'WA',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Aktives Durchsuchen von Räumen und Gegenständen um versteckte Objekte zu finden.'
    },
    {
      name: 'Tarnung',
      attribute: 'GE',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Sich und Ausrüstung in der Umgebung tarnen und verbergen.'
    },
    {
      name: 'Verkleiden',
      attribute: 'CH',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Aussehen und Identität durch Kostüme und Maskierung verändern.'
    },
    {
      name: 'Vorgaukeln',
      attribute: 'CH',
      isBasic: true,
      trained: false,
      plus10: false,
      plus20: false,
      bonus: 0,
      description: 'Lügen und täuschen. Wird verwendet um falsche Informationen glaubhaft zu vermitteln.'
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

  // Ship Points (Rogue Trader specific)
  shipPoints: {
    current: 0,
    max: 0
  },

  // Insanity (Wahnsinn)
  insanity: {
    points: 0,
    degree: 0,
    disorders: [] // Geisteskrankheiten
  },

  // Corruption (Verderbniss)
  corruption: {
    points: 0,
    degree: 0,
    malignancies: [] // Metastasen
  },

  // Talents & Traits
  talents: [],

  // Special Abilities
  specialAbilities: [],

  // Psi Powers
  psiPowers: [],

  // Equipment
  weapons: [],
  armor: [],
  gear: [],

  // Acquisitions (Beschaffungen)
  acquisitions: [],

  // Notes
  notes: []
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

        // Merge basic skills to ensure descriptions are added and new skills are included
        if (parsed.basicSkills) {
          // Remove skills that are no longer basic skills or have been renamed
          const removedBasicSkills = ['Akrobatik', 'Beschatten', 'Flinkender Blick']
          parsed.basicSkills = parsed.basicSkills.filter(
            skill => !removedBasicSkills.includes(skill.name)
          )

          // First, update existing skills
          parsed.basicSkills = parsed.basicSkills.map(skill => {
            const defaultSkill = defaultChar.basicSkills.find(s => s.name === skill.name)
            return {
              ...defaultSkill,
              ...skill,
              // Ensure description from default if not present
              description: skill.description || (defaultSkill?.description || '')
            }
          })

          // Then, add new skills from default that are not in parsed
          const existingSkillNames = parsed.basicSkills.map(s => s.name)
          const newSkills = defaultChar.basicSkills.filter(
            defaultSkill => !existingSkillNames.includes(defaultSkill.name)
          )

          // Add new skills to the list
          parsed.basicSkills = [...parsed.basicSkills, ...newSkills]
        } else {
          // If no basicSkills at all, use default
          parsed.basicSkills = defaultChar.basicSkills
        }

        // Ensure notes is an array (migrate from old string format)
        if (typeof parsed.notes === 'string') {
          parsed.notes = []
        } else if (!Array.isArray(parsed.notes)) {
          parsed.notes = []
        }

        // Ensure psiPowers is an array (migrate from old object format)
        if (parsed.psiPowers && typeof parsed.psiPowers === 'object' && !Array.isArray(parsed.psiPowers)) {
          parsed.psiPowers = []
        } else if (!Array.isArray(parsed.psiPowers)) {
          parsed.psiPowers = []
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

    // Wenn isBasic=true, dann trained=false (erscheint in Grundfertigkeiten)
    // Wenn isBasic=false, dann trained=true (erscheint in erlernten Fertigkeiten)
    const trained = !skillData.isBasic

    character.value.learnedSkills.push({
      id,
      name: skillData.name,
      attribute: skillData.attribute,
      specialization: skillData.specialization || '',
      isBasic: skillData.isBasic || false,
      trained: trained,
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

  const addWeapon = (weapon) => {
    character.value.weapons.push(weapon)
  }

  const updateWeapon = (index, updates) => {
    if (character.value.weapons[index]) {
      Object.assign(character.value.weapons[index], updates)
    }
  }

  const removeWeapon = (index) => {
    character.value.weapons.splice(index, 1)
  }

  const addArmor = (armor) => {
    character.value.armor.push(armor)
  }

  const updateArmor = (index, updates) => {
    if (character.value.armor[index]) {
      Object.assign(character.value.armor[index], updates)
    }
  }

  const removeArmor = (index) => {
    character.value.armor.splice(index, 1)
  }

  const addGear = (gear) => {
    character.value.gear.push(gear)
  }

  const updateGear = (index, updates) => {
    if (character.value.gear[index]) {
      Object.assign(character.value.gear[index], updates)
    }
  }

  const removeGear = (index) => {
    character.value.gear.splice(index, 1)
  }

  const addNote = (note) => {
    character.value.notes.push(note)
  }

  const updateNote = (index, updates) => {
    if (character.value.notes[index]) {
      Object.assign(character.value.notes[index], updates)
    }
  }

  const removeNote = (index) => {
    character.value.notes.splice(index, 1)
  }

  const addPsiPower = (power) => {
    character.value.psiPowers.push(power)
  }

  const updatePsiPower = (index, updates) => {
    if (character.value.psiPowers[index]) {
      Object.assign(character.value.psiPowers[index], updates)
    }
  }

  const removePsiPower = (index) => {
    character.value.psiPowers.splice(index, 1)
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
    addWeapon,
    updateWeapon,
    removeWeapon,
    addArmor,
    updateArmor,
    removeArmor,
    addGear,
    updateGear,
    removeGear,
    addNote,
    updateNote,
    removeNote,
    addPsiPower,
    updatePsiPower,
    removePsiPower,
    loadCharacter,
    resetCharacter,
    getSkillValue
  }
})
