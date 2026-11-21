// Alle Spielsysteme. Ein neues System = neuer Ordner unter systems/ mit index.js,
// der hier eingetragen wird. Der Kern (core/) muss dafür nicht angefasst werden.
import rogueTrader from './rogueTrader'
import cairn from './cairn'

export const systems = [rogueTrader, cairn]

export const DEFAULT_SYSTEM = rogueTrader

export function findSystem(id) {
  return systems.find((s) => s.id === id)
}
