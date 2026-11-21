// Zufallshilfen für Name, Merkmale und Zauber (lokal, nicht über den Würfelraum)
import { firstNames, lastNames, traits, spells } from './tables'

export const d = (sides) => 1 + Math.floor(Math.random() * sides)
export const pick = (list) => list[Math.floor(Math.random() * list.length)]

export const randomName = () => `${pick(firstNames)} ${pick(lastNames)}`
export const randomTrait = (key) => pick(traits.find((t) => t.key === key).values)
export const randomSpell = () => spells[d(100) - 1]
