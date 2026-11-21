// Rogue Trader (Warhammer 40k, W100-System)
import './assets/wh40k-theme.css'
import { useCharacterStore } from './stores/characterStore'

export default {
  id: 'rogueTrader',
  slug: 'rogue-trader',
  name: 'Rogue Trader',
  motto: 'Per Aspera Ad Astra',
  icon: 'rocket_launch',
  // Store muss character, loadCharacter(data) und resetCharacter() liefern
  useStore: useCharacterStore,
  // KG gibt es nur bei Rogue Trader (Cairn hat auch attributes, aber nur ST/GE/WK)
  isValidCharacter: (data) => data?.attributes?.KG != null,
  sheet: () => import('./views/CharacterSheetView.vue'),
  settings: () => import('./views/SettingsView.vue'),
  headerInfo: () => import('./components/HeaderInfo.vue')
}
