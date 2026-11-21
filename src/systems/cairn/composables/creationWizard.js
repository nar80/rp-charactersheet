// Ein gemeinsamer Schalter für den Erschaffungs-Assistenten (Banner im Bogen und Knopf in der Charakterkarte)
import { ref } from 'vue'

const open = ref(false)

export function useCreationWizard() {
  return { open }
}
