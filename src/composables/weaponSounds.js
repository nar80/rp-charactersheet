import { ref, watch } from 'vue'
import { hasSamples, playSampleSet } from './weaponSamples.js'

// Waffengeraeusche werden zur Laufzeit synthetisiert (Web Audio API) statt aus
// Dateien geladen: keine Assets im Bundle, keine Lizenzfragen, offline nutzbar.
//
// Zwei unabhaengige Achsen bestimmen den Klang:
//   1. Profil  - WOMIT geschossen wird (Feststoff, Bolter, Las, Plasma, Melta)
//   2. Gewicht - WIE GROSS die Waffe ist, aus der Waffenkategorie abgeleitet
// Eine Plasmapistole und eine schwere Plasmakanone teilen sich also das Profil,
// klingen aber deutlich verschieden.

const STORAGE_KEY = 'rp-weapon-sound'

export const soundEnabled = ref(localStorage.getItem(STORAGE_KEY) !== '0')

watch(soundEnabled, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, val ? '1' : '0')
  } catch {
    // localStorage nicht verfuegbar - Einstellung gilt dann nur fuer diese Sitzung
  }
})

let ctx = null
let noiseBuffer = null
let reverb = null

// AudioContext erst beim ersten Schuss anlegen. Browser erlauben Audio nur nach
// einer Nutzeraktion - der Feuern-Klick ist genau das.
const getCtx = () => {
  const AudioCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioCtor) return null
  if (!ctx) ctx = new AudioCtor()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const getNoise = (audio) => {
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(audio.sampleRate * 0.5)
  noiseBuffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noiseBuffer
}

// Kurzer, synthetischer Raum. Ohne Nachhall klingt jeder Schuss, als waere er
// im Rechner passiert statt in einer Halle - das ist der "Arcade-Effekt".
const getReverb = (audio) => {
  if (reverb) return reverb
  const duration = 0.32
  const length = Math.floor(audio.sampleRate * duration)
  const impulse = audio.createBuffer(2, length, audio.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / length
      // Leichte Anfangsverzoegerung, damit der Raum hinter dem Schuss sitzt
      const preDelay = t < 0.04 ? t / 0.04 : 1
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.4) * preDelay
    }
  }
  reverb = audio.createConvolver()
  reverb.buffer = impulse
  return reverb
}

const decay = (param, from, to, at, dur) => {
  param.setValueAtTime(from, at)
  param.exponentialRampToValueAtTime(Math.max(to, 0.0001), at + dur)
}

const noiseBurst = (audio, out, at, o) => {
  const src = audio.createBufferSource()
  src.buffer = getNoise(audio)
  const filter = audio.createBiquadFilter()
  filter.type = o.filter || 'lowpass'
  if (o.q !== undefined) filter.Q.value = o.q
  decay(filter.frequency, o.freqFrom, o.freqTo, at, o.dur)
  const gain = audio.createGain()
  decay(gain.gain, o.gain, 0.001, at, o.dur)
  src.connect(filter).connect(gain).connect(out)
  src.start(at)
  src.stop(at + o.dur + 0.02)
}

const sweepOsc = (audio, out, at, o) => {
  const osc = audio.createOscillator()
  osc.type = o.type || 'sine'
  decay(osc.frequency, o.freqFrom, o.freqTo, at, o.dur)
  const gain = audio.createGain()
  if (o.swell) {
    // Anschwellen statt Abklingen - fuer die Plasma-Aufladung
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(o.gain, at + o.dur)
  } else {
    decay(gain.gain, o.gain, 0.001, at, o.dur)
  }
  if (o.detune) osc.detune.value = o.detune
  osc.connect(gain).connect(out)
  osc.start(at)
  osc.stop(at + o.dur + 0.02)
}

// Mechanischer Anschlag: sehr kurzer, harter Rauschimpuls. Das ist der Teil,
// der "Waffe" statt "Videospiel" signalisiert - Verschluss, Zuendung, Schlag.
const transient = (audio, out, at, amount) => {
  noiseBurst(audio, out, at, {
    filter: 'highpass', freqFrom: 7000, freqTo: 2500, dur: 0.012, gain: amount,
  })
}

// Tiefbass-Schlag: gibt dem Schuss Koerper.
const thump = (audio, out, at, o) => {
  sweepOsc(audio, out, at, { type: 'sine', freqFrom: o.from, freqTo: o.to, dur: o.dur, gain: o.gain })
}

// --- Klangprofile -----------------------------------------------------------
// Jedes Profil bekommt (audio, at, out, w, isFirst). w skaliert Tonhoehe und
// Dauer nach Waffengewicht, isFirst markiert den ersten Schuss einer Salve.

const PROFILES = {
  // Projektilwaffe: Autogewehr, Stubber, Revolver.
  // Vier Schichten statt zwei - der alte Klang war nicht zu leise, sondern zu
  // duenn: ein Rauschimpuls plus Bass hat keinen Koerper und kein Nachrollen.
  solid(audio, at, out, w) {
    // Mechanischer Anschlag
    transient(audio, out, at, 1.0)
    // Resonantes Krack - der harte Knall des Ueberschallgeschosses
    noiseBurst(audio, out, at, {
      filter: 'bandpass', q: 2.2,
      freqFrom: 2200 * w.pitch, freqTo: 900 * w.pitch, dur: 0.05 * w.dur, gain: 1.6,
    })
    // Breitbandiger Muendungsknall
    noiseBurst(audio, out, at, {
      freqFrom: 3600 * w.pitch, freqTo: 260 * w.pitch, dur: 0.18 * w.dur, gain: 1.3,
    })
    // Nachrollen - gibt dem Schuss Groesse statt nur Lautstaerke
    noiseBurst(audio, out, at + 0.02 * w.dur, {
      freqFrom: 700 * w.pitch, freqTo: 110 * w.pitch, dur: 0.36 * w.dur, gain: 0.55,
    })
    // Tiefbass-Schlag, tiefer und laenger als zuvor
    thump(audio, out, at, {
      from: 170 * w.pitch, to: 34 * w.pitch, dur: 0.26 * w.dur, gain: 1.6,
    })
  },

  // Bolter: Abschuss wie Feststoff, dann die Detonation des Bolzens im Ziel.
  bolt(audio, at, out, w) {
    PROFILES.solid(audio, at, out, w)
    const delay = 0.075 * w.dur
    noiseBurst(audio, out, at + delay, {
      filter: 'bandpass', q: 0.7,
      freqFrom: 1700 * w.pitch, freqTo: 380 * w.pitch, dur: 0.24 * w.dur, gain: 0.85,
    })
    thump(audio, out, at + delay, {
      from: 110 * w.pitch, to: 38 * w.pitch, dur: 0.22 * w.dur, gain: 0.8,
    })
  },

  // Las: heller Abwaertssweep. Bewusst kaum veraendert - der klang schon gut,
  // er bekommt nur den Anschlag und den Raum dazu.
  laser(audio, at, out, w) {
    transient(audio, out, at, 0.45)
    sweepOsc(audio, out, at, {
      type: 'sawtooth', freqFrom: 2400 * w.pitch, freqTo: 320 * w.pitch, dur: 0.09 * w.dur, gain: 0.75,
    })
    noiseBurst(audio, out, at, {
      filter: 'highpass', freqFrom: 5000, freqTo: 2000, dur: 0.03 * w.dur, gain: 0.45,
    })
    thump(audio, out, at, { from: 90 * w.pitch, to: 50 * w.pitch, dur: 0.07 * w.dur, gain: 0.35 })
  },

  // Plasma: kurze Aufladung, dann die schwere Entladung. Deutlich mehr Wucht
  // als vorher - Tiefbass, laengerer Abfall, dritte Oszillatorschicht.
  plasma(audio, at, out, w, isFirst) {
    // Aufladung nur beim ersten Schuss einer Salve, sonst wird es albern
    if (isFirst) {
      const chargeDur = 0.13 * w.dur
      sweepOsc(audio, out, at - chargeDur, {
        type: 'triangle', freqFrom: 180 * w.pitch, freqTo: 950 * w.pitch,
        dur: chargeDur, gain: 0.3, swell: true,
      })
    }
    transient(audio, out, at, 0.5)
    sweepOsc(audio, out, at, {
      type: 'sawtooth', freqFrom: 820 * w.pitch, freqTo: 70 * w.pitch, dur: 0.34 * w.dur, gain: 0.8,
    })
    sweepOsc(audio, out, at, {
      type: 'square', freqFrom: 800 * w.pitch, freqTo: 68 * w.pitch, dur: 0.34 * w.dur, gain: 0.4, detune: -22,
    })
    noiseBurst(audio, out, at, {
      freqFrom: 2600 * w.pitch, freqTo: 200 * w.pitch, dur: 0.4 * w.dur, gain: 0.75,
    })
    thump(audio, out, at, { from: 130 * w.pitch, to: 34 * w.pitch, dur: 0.3 * w.dur, gain: 1.2 })
  },

  // Flammer: rauschendes Fauchen, kein klarer Anschlag.
  // Dient auch als Rueckfall fuer Melta, wenn dessen Samples fehlen.
  flammer(audio, at, out, w) {
    noiseBurst(audio, out, at, {
      filter: 'bandpass', q: 1.1,
      freqFrom: 260 * w.pitch, freqTo: 1900 * w.pitch, dur: 0.42 * w.dur, gain: 2.0,
    })
    thump(audio, out, at, { from: 65 * w.pitch, to: 150 * w.pitch, dur: 0.42 * w.dur, gain: 1.1 })
  },
}

// --- Profil- und Gewichtsbestimmung -----------------------------------------

// Profile mit echten Samples sind markiert - der Rest laeuft ueber die Synthese.
export const SOUND_PROFILE_OPTIONS = [
  { label: 'Automatisch', value: 'auto' },
  { label: 'Bolter ♪', value: 'bolt' },
  { label: 'Las / Volkite ♪', value: 'laser' },
  { label: 'Plasma ♪', value: 'plasma' },
  { label: 'Melta ♪', value: 'melta' },
  { label: 'Schrotflinte ♪', value: 'shotgun' },
  { label: 'Graviton / Railgun ♪', value: 'graviton' },
  { label: 'Granatwerfer ♪', value: 'grenade' },
  // Wert bleibt 'solid', damit bereits gespeicherte Waffen weiterlaufen -
  // nur die Beschriftung wird ehrlicher. "Feststoff" beschrieb das Geschoss,
  // gemeint ist die konventionelle Feuerwaffe.
  { label: 'Projektilwaffe', value: 'solid' },
  { label: 'Flammer', value: 'flammer' },
  { label: 'Stumm', value: 'none' },
]

// Ohne das Sample-Zeichen - das gehoert in die Auswahlliste, nicht in Fliesstext
const PROFILE_LABELS = Object.fromEntries(
  SOUND_PROFILE_OPTIONS.map((o) => [o.value, o.label.replace(' ♪', '')])
)

// Schadensart als Rueckfallebene: grob, aber besser als blind "Feststoff".
// E (Energie) deckt Las/Plasma/Melta ab, deshalb dort nur die haeufigste Wahl.
const DAMAGE_TYPE_PROFILES = { e: 'laser', x: 'bolt', r: 'solid', i: 'solid' }

const inferProfile = (weapon) => {
  const hay = `${weapon?.name || ''} ${weapon?.type || ''}`.toLowerCase()
  if (/plasma/.test(hay)) return 'plasma'
  if (/melta|schmelz/.test(hay)) return 'melta'
  if (/flamm|flamer|brenner/.test(hay)) return 'flammer'
  if (/schrot|flinte|shotgun/.test(hay)) return 'shotgun'
  if (/granat|grenade|werfer/.test(hay)) return 'grenade'
  if (/gravit|railgun|rail|gauss|magnet/.test(hay)) return 'graviton'
  if (/\blas|laser|volkite|strahl/.test(hay)) return 'laser'
  if (/bolt|bolter|bolzen/.test(hay)) return 'bolt'

  const art = String(weapon?.damageType || '').trim().match(/^[eirx]/i)
  if (art) return DAMAGE_TYPE_PROFILES[art[0].toLowerCase()] || 'solid'
  return 'solid'
}

// Explizite Wahl schlaegt immer die Erkennung. "auto" (oder leer, bei Waffen
// aus der Zeit vor diesem Feld) faellt auf die Erkennung zurueck.
export const resolveSoundProfile = (weapon) => {
  const chosen = weapon?.soundProfile
  if (chosen && chosen !== 'auto') return chosen
  return inferProfile(weapon)
}

// Gewicht aus der Waffenkategorie. Anders als die Technologie laesst sich die
// Groesse aus den vorhandenen Feldern zuverlaessig ablesen.
// spacing wirkt bewusst schwach: die mechanische Schussfolge haengt kaum an der
// Waffengroesse, die steckt schon im Profil-Intervall. Tonhoehe und Laenge
// duerfen dagegen deutlich streuen.
const CATEGORY_WEIGHT = {
  pistolen: { pitch: 1.3, dur: 0.8, spacing: 0.95 },
  'leichte waffen': { pitch: 1.05, dur: 0.95, spacing: 1.0 },
  basiswaffen: { pitch: 1.0, dur: 1.0, spacing: 1.0 },
  wurfwaffen: { pitch: 0.95, dur: 1.1, spacing: 1.0 },
  'schwere waffen': { pitch: 0.7, dur: 1.45, spacing: 1.1 },
  'exotische waffen': { pitch: 1.0, dur: 1.0, spacing: 1.0 },
}

export const resolveSoundWeight = (weapon) =>
  CATEGORY_WEIGHT[String(weapon?.type || '').toLowerCase()] || {
    pitch: 1, dur: 1, spacing: 1,
  }

const WEIGHT_LABELS = {
  pistolen: 'Pistole',
  'leichte waffen': 'leicht',
  'schwere waffen': 'schwer',
}

// Fuer den Tooltip: "Plasma, schwer" bzw. "Las (automatisch)"
export const describeWeaponSound = (weapon) => {
  if (!weapon) return ''
  const profile = resolveSoundProfile(weapon)
  if (profile === 'none') return 'stumm'
  const isAuto = !weapon.soundProfile || weapon.soundProfile === 'auto'
  const weight = WEIGHT_LABELS[String(weapon.type || '').toLowerCase()]
  const base = PROFILE_LABELS[profile] || profile
  return `${base}${weight ? ', ' + weight : ''}${isAuto ? ' (automatisch)' : ''}`
}

// --- Wiedergabe -------------------------------------------------------------

// Der Modus bestimmt nur noch, WIE VIELE Schuesse fallen - nicht wie schnell.
const MODE_PATTERN = {
  single: { shots: 1 },
  salvo: { shots: 3 },
  auto: { shots: 6 },
}

// Absoluter Schussabstand je Profil in Sekunden.
//
// Frueher haengte der Abstand am Feuermodus, Salve war schneller als Automatik.
// Das ist falsch: eine Waffe hat EINE mechanische Schussfolge. Ob drei oder acht
// Schuss fallen, aendert die Laenge der Salve, nicht ihren Takt.
const PROFILE_INTERVAL = {
  bolt: 0.55, // Bolter tackern schwer und langsam, ~2 Schuss/s
  boltheavy: 0.2, // schwerer Bolter deutlich schneller
  plasma: 0.6, // jeder Schuss ist eine eigene Entladung
  melta: 0.8,
  shotgun: 0.85, // dazwischen wird repetiert
  grenade: 1.0,
  graviton: 0.45,
  laser: 0.09,
  solid: 0.08,
  flammer: 0.12,
}

const intervalFor = (key) => PROFILE_INTERVAL[key] || 0.1

// Welcher Sample-Satz zu Profil und Gewicht passt. Der Bolter ist der einzige,
// bei dem die Kategorie die Datei wechselt - fuer den schweren Bolter gibt es
// eigene Aufnahmen, was den Groessenunterschied ueberzeugender macht als jede
// Tonhoehenverschiebung.
const sampleKeyFor = (weapon, profileKey) => {
  if (profileKey === 'bolt' && /schwere/i.test(weapon?.type || '')) {
    return hasSamples('boltheavy') ? 'boltheavy' : 'bolt'
  }
  return profileKey
}

export const playWeaponSound = (weapon, mode, shotCount) => {
  if (!soundEnabled.value) return

  const profileKey = resolveSoundProfile(weapon)
  if (profileKey === 'none') return

  const audio = getCtx()
  if (!audio) return

  const w = resolveSoundWeight(weapon)
  const pattern = MODE_PATTERN[mode] || MODE_PATTERN.single

  // Echte Schusszahl der Waffe nutzen, wenn bekannt - eine 10er-Salve klingt
  // anders als eine 3er. Nach oben begrenzt, sonst wird es albern lang.
  const shots = Math.min(Math.max(shotCount || pattern.shots, 1), 10)

  // Erst echte Aufnahmen versuchen, sonst synthetisieren. Das Laden ist
  // asynchron, deshalb wird die Synthese im Fehlerfall nachgereicht.
  const sampleKey = sampleKeyFor(weapon, profileKey)

  // Abstand richtet sich nach dem tatsaechlich klingenden Satz - der schwere
  // Bolter hat eine andere Schussfolge als der Boltgun.
  const spacing = intervalFor(sampleKey) * w.spacing
  if (hasSamples(sampleKey)) {
    playSampleSet(audio, sampleKey, { shots, spacing }).then((played) => {
      if (!played) synthesize(audio, profileKey, shots, spacing, w)
    })
    return
  }
  synthesize(audio, profileKey, shots, spacing, w)
}

const synthesize = (audio, profileKey, shots, spacing, w) => {
  // Melta ohne Samples faellt auf das Flammer-Fauchen zurueck
  const profile = PROFILES[profileKey] || PROFILES[profileKey === 'melta' ? 'flammer' : 'solid'] || PROFILES.solid

  const master = audio.createGain()
  master.gain.value = 0.2
  master.connect(audio.destination)

  // Hallanteil parallel zum Direktschall
  const send = audio.createGain()
  send.gain.value = 0.3
  master.connect(send)
  send.connect(getReverb(audio)).connect(audio.destination)

  // Vorlauf gross genug, dass die Plasma-Aufladung vor dem Schuss Platz hat
  const start = audio.currentTime + 0.2
  for (let i = 0; i < shots; i++) {
    profile(audio, start + i * spacing, master, w, i === 0)
  }
}

// Nachladen: eigenes Sample je Waffenart, sonst still (dafuer gibt es keine
// sinnvolle Synthese - ein synthetisches Klicken klaenge nach nichts).
export const playReloadSound = (weapon) => {
  if (!soundEnabled.value) return
  const profileKey = resolveSoundProfile(weapon)
  if (profileKey === 'none') return
  const audio = getCtx()
  if (!audio) return

  const key = `reload:${sampleKeyFor(weapon, profileKey)}`
  if (hasSamples(key)) {
    playSampleSet(audio, key, { volume: 0.9 })
  } else if (hasSamples('reload:bolt')) {
    // Generisches Nachladen fuer alles ohne eigene Aufnahme
    playSampleSet(audio, 'reload:bolt', { volume: 0.75 })
  }
}

// Leeres Magazin: das Klicken, wenn abgedrueckt wird und nichts kommt.
export const playDryFireSound = () => {
  if (!soundEnabled.value) return
  const audio = getCtx()
  if (!audio) return
  playSampleSet(audio, 'dryfire', { volume: 0.85 })
}
