// Cairn (dt. Ausgabe v1.13): W20-Rettungswürfe, 3 Attribute, Inventarplätze
import './assets/cairn-theme.css'
import { useCairnStore } from './stores/characterStore'

export default {
  id: 'cairn',
  slug: 'cairn',
  name: 'Cairn',
  motto: 'Erforsche den dunklen Wald',
  icon: 'forest',
  useStore: useCairnStore,
  isValidCharacter: (data) => !!data?.attributes?.ST && !!data?.hp,
  sheet: () => import('./views/CairnSheetView.vue'),
  settings: () => import('./views/CairnSettingsView.vue'),
  headerInfo: () => import('./components/HeaderInfo.vue')
}
