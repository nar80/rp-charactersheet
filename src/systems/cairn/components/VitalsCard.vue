<template>
  <q-card>
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Attribute</div>
      <q-space />
      <q-chip
        v-for="cond in store.conditions"
        :key="cond"
        dense
        square
        :removable="!!CLEARABLE[cond] && !!c[CLEARABLE[cond]]"
        :color="['Tod', 'Gelähmt', 'Delirium', 'Außer Gefecht', 'Verdammt'].includes(cond) ? 'negative' : 'warning'"
        :text-color="['Tod', 'Gelähmt', 'Delirium', 'Außer Gefecht', 'Verdammt'].includes(cond) ? 'white' : 'black'"
        @remove="c[CLEARABLE[cond]] = false"
      >
        {{ cond }}
        <q-tooltip v-if="CONDITION_HINTS[cond]">{{ CONDITION_HINTS[cond] }}</q-tooltip>
      </q-chip>
    </q-card-section>

    <!-- Attribute mit Rettungswurf -->
    <q-card-section class="row q-col-gutter-sm">
      <div v-for="attr in ATTRIBUTES" :key="attr.key" class="col-4">
        <div class="stat-box text-center" :class="{ 'stat-zero': c.attributes[attr.key].value <= 0 }">
          <div class="stat-label">{{ attr.key }}</div>
          <div class="row no-wrap items-center justify-center q-gutter-xs">
            <NumberInput v-model="c.attributes[attr.key].value" :min="0" :max="c.attributes[attr.key].max" vertical button-color="primary" text-color="var(--imperial-gold)" />
            <span class="text-grey-6">/</span>
            <NumberInput v-model="c.attributes[attr.key].max" :min="0" :max="30" class="stat-max" vertical button-color="grey-6" text-color="var(--imperial-brass)" />
          </div>
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            icon="casino"
            label="Rettungswurf"
            color="primary"
            :disable="!cairnDice.connected.value"
            @click="cairnDice.save(attr.key)"
          />
          <q-tooltip>{{ attr.name }}: {{ attr.hint }}. Bei 0: {{ attr.zero }}.</q-tooltip>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- TP, Rüstung, Bedrängt -->
    <q-card-section class="row q-col-gutter-sm items-stretch">
      <div class="col-6">
        <div class="stat-box text-center">
          <div class="stat-label">TP <span class="text-caption text-grey-6">(Trefferschutz)</span></div>
          <div class="row no-wrap items-center justify-center q-gutter-xs">
            <NumberInput v-model="c.hp.value" :min="0" :max="c.hp.max" vertical button-color="primary" text-color="var(--imperial-gold)" />
            <span class="text-grey-6">/</span>
            <NumberInput v-model="c.hp.max" :min="0" :max="99" class="stat-max" vertical button-color="grey-6" text-color="var(--imperial-brass)" />
          </div>
          <q-linear-progress
            :value="c.hp.max ? c.hp.value / c.hp.max : 0"
            :color="c.hp.value === 0 ? 'negative' : 'primary'"
            class="q-mt-xs"
            rounded
          />
        </div>
      </div>
      <div class="col-3">
        <div class="stat-box text-center">
          <div class="stat-label">Rüstung</div>
          <div class="stat-value">{{ store.armor }}</div>
          <q-tooltip>
            Summe der getragenen Rüstungsteile (Hände und Körper), höchstens {{ MAX_ARMOR }}
          </q-tooltip>
        </div>
      </div>
      <div class="col-3">
        <div
          class="stat-box text-center cursor-pointer"
          :class="{ 'stat-warn': c.deprived }"
          @click="c.deprived = !c.deprived"
        >
          <div class="stat-label">Bedrängt</div>
          <q-icon :name="c.deprived ? 'check_box' : 'check_box_outline_blank'" size="md" />
          <q-tooltip>
            Unerfüllte Bedürfnisse (Nahrung, Schlaf …): keine Erholung von TP und Attributen.
            Je Tag ohne Abhilfe eine Erschöpfung.
          </q-tooltip>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Schaden nehmen -->
    <q-card-section>
      <div class="text-subtitle2 q-mb-sm">Schaden nehmen</div>
      <div class="row q-col-gutter-sm items-center">
        <div class="col">
          <q-input
            v-model.number="damage"
            type="number"
            min="0"
            dense
            filled
            label="Gewürfelter Schaden"
            @keyup.enter="applyDamage"
          />
        </div>
        <div class="col-auto">
          <q-checkbox v-model="ignoreArmor" dense label="Rüstung ignorieren" />
        </div>
        <div class="col-auto">
          <q-btn color="negative" icon="heart_broken" label="Anwenden" :disable="!damage" @click="applyDamage" />
        </div>
      </div>
      <div class="text-caption text-grey-6 q-mt-xs">
        Rüstung ({{ store.armor }}) wird abgezogen, der Rest geht auf die TP. Was unter 0 geht, trifft die ST.
      </div>
    </q-card-section>

    <q-separator />

    <!-- Erholung -->
    <q-card-section class="row q-gutter-sm">
      <q-btn outline no-caps icon="water_drop" label="Kurze Rast" @click="rest('short')">
        <q-tooltip>Ausruhen und ein Schluck Wasser: TP voll</q-tooltip>
      </q-btn>
      <q-btn outline no-caps icon="bedtime" label="Sichere Nacht" @click="rest('safe')">
        <q-tooltip>Ganze Nacht an sicherem Ort: Erschöpfung weg, TP voll</q-tooltip>
      </q-btn>
      <q-btn outline no-caps icon="healing" label="Woche Ruhe" @click="rest('week')">
        <q-tooltip>Eine Woche Ruhe mit Heilkundigen: Attribute zurück auf Maximum</q-tooltip>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import NumberInput from '@/core/components/NumberInput.vue'
import { useCairnStore, ATTRIBUTES, MAX_ARMOR } from '../stores/characterStore'
import { useCairnDice, evaluateSave } from '../composables/dice'
import { scars } from '../data/tables'

const $q = useQuasar()
const store = useCairnStore()
const { character: c } = storeToRefs(store)
const cairnDice = useCairnDice()

const damage = ref(null)
const ignoreArmor = ref(false)

function applyDamage() {
  if (!damage.value) return
  const r = store.takeDamage(damage.value, { ignoreArmor: ignoreArmor.value })
  damage.value = null
  ignoreArmor.value = false

  const parts = [`${r.raw} Schaden${r.raw !== r.dealt ? ` − ${r.raw - r.dealt} Rüstung` : ''} = ${r.dealt}`]
  if (r.dealt === 0) parts.push('Die Rüstung fängt alles ab.')
  else parts.push(`TP ${r.before} → ${store.character.hp.value}`)
  if (r.overflow) parts.push(`${r.overflow} auf ST (jetzt ${store.character.attributes.ST.value})`)

  if (r.critical && store.character.attributes.ST.value <= 0) {
    // ST 0 bedeutet Tod (S. 18) – da gibt es keinen Rettungswurf mehr
    $q.dialog({
      title: 'Tod',
      message: `${parts.join(' · ')}<br><br>Die ST ist auf 0 gefallen: Die Figur stirbt.`,
      html: true
    })
  } else if (r.critical) {
    $q.dialog({
      title: 'Kritischer Schaden',
      message: `${parts.join(' · ')}<br><br>Rettungswurf auf ST, sonst bist du außer Gefecht und stirbst ohne Hilfe innerhalb einer Stunde.`,
      html: true,
      ok: { label: 'ST-Rettungswurf', color: 'primary' },
      cancel: { label: 'Später', flat: true }
    }).onOk(criticalSave)
  } else if (r.scar) {
    const index = Math.min(r.dealt, scars.length) - 1
    const scar = scars[index]
    $q.dialog({
      title: `Verletzung: ${scar.title}`,
      message: `${parts.join(' · ')}<br><br>Die TP sind genau auf 0 gefallen (${r.dealt} Schaden):<br><b>${scar.title}</b> – ${scar.text}`,
      html: true,
      ok: { label: 'Bei Verletzungen eintragen', color: 'primary' },
      cancel: { label: 'Nicht eintragen', flat: true }
    }).onOk(() => store.addScar(index))
  } else {
    $q.notify({ message: parts.join(' · '), color: 'grey-9', icon: 'heart_broken', position: 'top' })
  }
}

// Zustände, die man per Chip wieder entfernen kann (Feld im Charakter)
const CLEARABLE = { Tod: 'dead', 'Außer Gefecht': 'incapacitated', Verdammt: 'doomed', Bedrängt: 'deprived' }
const CONDITION_HINTS = {
  'Außer Gefecht': 'Kann nur kraftlos kriechen. Mit Hilfe und Ruhe stabilisiert, sonst Tod innerhalb einer Stunde.',
  Verdammt: 'Scheitert der nächste Rettungswurf gegen kritischen Schaden, stirbt die Figur.',
  Bedrängt: 'Keine Erholung von TP und Attributen.'
}

// Rettungswurf gegen kritischen Schaden (Würfelraum, sonst lokal) und Folgen eintragen
async function criticalSave() {
  const value = store.character.attributes.ST.value
  try {
    const r = await cairnDice.rollValue('1d20', `Rettungswurf gegen kritischen Schaden (ST ${value})`)
    const result = evaluateSave(r.total, value)
    const outcome = store.resolveCriticalSave(result.success)
    const caption = {
      ok: 'Du bleibst auf den Beinen.',
      down: 'Außer Gefecht: Ohne Hilfe stirbst du innerhalb einer Stunde.',
      survivedDoom: 'Verdammt überstanden! Würfle bei der Verletzung „Verdammt“ auf deine max. TP.',
      dead: 'Verdammt: Du stirbst auf schreckliche Weise.'
    }[outcome]
    $q.notify({
      position: 'top',
      icon: 'casino',
      timeout: outcome === 'ok' ? 5000 : 0,
      actions: outcome === 'ok' ? [] : [{ label: 'OK', color: 'white' }],
      color: result.success ? 'positive' : 'negative',
      message: `Kritischer Schaden – ST ${value}: ${r.total} (${result.text})`,
      caption
    })
  } catch (error) {
    $q.notify({ type: 'negative', position: 'top', message: `Wurf fehlgeschlagen: ${error.message}` })
  }
}

// Meldung sagt genau, was die Rast bewirkt hat und was nicht ging
function rest(kind) {
  const { done, blocked } = { short: store.shortRest, safe: store.safeRest, week: store.weekRest }[kind]()
  $q.notify({
    type: blocked.length ? 'warning' : 'positive',
    position: 'top',
    message: done.length ? done.join(', ') : 'Keine Erholung',
    caption: blocked.length ? `Nicht möglich: ${blocked.join(', ')}` : undefined
  })
}
</script>

<style scoped>
.stat-box {
  border: 1px solid rgba(var(--accent-rgb), 0.35);
  border-radius: 6px;
  padding: 6px 4px;
  height: 100%;
}
.stat-label {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.stat-value {
  font-size: 1.8em;
  font-weight: 700;
  line-height: 1.4;
}
.stat-max {
  opacity: 0.7;
}
.stat-zero {
  border-color: var(--q-negative);
  background: rgba(193, 0, 21, 0.15);
}
.stat-warn {
  border-color: var(--q-warning);
  background: rgba(242, 192, 55, 0.12);
}
</style>
