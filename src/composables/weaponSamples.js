// Echte Schuss-Samples aus public/sounds/weapons/.
//
// Bewusst NICHT gebundelt: die Dateien liegen in public/ und werden beim ersten
// Schuss nachgeladen. Das JS-Bundle bleibt unberuehrt, der Browser cacht danach.
//
// Lautstaerke wird beim Dekodieren automatisch normalisiert - die Rohdateien
// sind untereinander unterschiedlich laut und insgesamt zu laut. Statt an jeder
// Datei einzeln zu drehen, wird ihr Spitzenpegel gemessen und auf ein
// einheitliches Ziel gerechnet.

const BASE = 'sounds/weapons'

// Zielspitzenpegel nach Normalisierung. Die Rohdateien reichen von 0,32 bis
// 0,96 - ohne Angleichung waere Plasma dreimal so laut wie der Trockenschuss.
// Das ist die eine Schraube fuer "insgesamt zu laut / zu leise".
const TARGET_PEAK = 0.4

// Welche Dateien zu welchem Profil gehoeren. Mehrere Varianten werden reihum
// gespielt, damit Dauerfeuer nicht maschinell klingt.
const SAMPLE_SETS = {
  bolt: ['bolt-01', 'bolt-02', 'bolt-03', 'bolt-04', 'bolt-05'],
  boltheavy: ['boltheavy-01', 'boltheavy-02', 'boltheavy-03', 'boltheavy-04', 'boltheavy-05'],
  plasma: ['plasma-01'],
  melta: ['melta-01', 'melta-02'],
  shotgun: ['shotgun-01', 'shotgun-02'],
  // Volkite-Aufnahme dient als Las - klingt naeher am Las als die Synthese,
  // und zwei getrennte Energieprofile braucht niemand.
  laser: ['las-01'],
  graviton: ['graviton-01', 'graviton-02'],
  grenade: ['grenade-01'],
  dryfire: ['dryfire'],
  'reload:bolt': ['reload-bolt'],
  'reload:boltheavy': ['reload-boltheavy'],
  'reload:plasma': ['reload-plasma'],
  'reload:melta': ['reload-melta'],
  'reload:shotgun': ['reload-shotgun'],
  'reload:laser': ['reload-las'],
  'reload:graviton': ['reload-graviton'],
}

export const hasSamples = (key) => Array.isArray(SAMPLE_SETS[key])

const cache = new Map() // name -> { buffer, gain } | Promise
const rotation = new Map() // key -> naechster Variantenindex

const measureGain = (buffer) => {
  let peak = 0
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    // Schrittweite 4: bei 44,1 kHz genau genug und deutlich schneller
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.abs(data[i])
      if (v > peak) peak = v
    }
  }
  return peak > 0.0001 ? TARGET_PEAK / peak : 1
}

const loadSample = (audio, name) => {
  if (cache.has(name)) return cache.get(name)

  const pending = fetch(`${BASE}/${name}.ogg`)
    .then((res) => {
      if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`)
      return res.arrayBuffer()
    })
    .then((data) => audio.decodeAudioData(data))
    .then((buffer) => {
      const entry = { buffer, gain: measureGain(buffer) }
      cache.set(name, entry)
      return entry
    })
    .catch((err) => {
      // Fehlende oder kaputte Datei darf nicht das Feuern blockieren -
      // der Aufrufer faellt dann auf die Synthese zurueck.
      console.warn('[Waffensound] Sample nicht ladbar:', err.message)
      cache.set(name, null)
      return null
    })

  cache.set(name, pending)
  return pending
}

// Naechste Variante eines Sets, reihum.
const nextVariant = (key) => {
  const set = SAMPLE_SETS[key]
  if (!set || !set.length) return null
  const i = (rotation.get(key) || 0) % set.length
  rotation.set(key, i + 1)
  return set[i]
}

/**
 * Spielt ein Sample-Set ab.
 * shots  - Anzahl Schuesse (Varianten rotieren, Ueberlagerung wird gedaempft)
 * spacing- Abstand in Sekunden
 * detune - zufaellige Tonhoehenstreuung in Cent, bricht Wiederholungen auf
 * Liefert true, wenn abgespielt werden konnte.
 */
export const playSampleSet = async (audio, key, { shots = 1, spacing = 0, volume = 1, detune = 60 } = {}) => {
  if (!hasSamples(key)) return false

  const names = []
  for (let i = 0; i < shots; i++) names.push(nextVariant(key))
  const entries = await Promise.all(names.map((n) => loadSample(audio, n)))
  if (!entries.some(Boolean)) return false

  const start = audio.currentTime + 0.02
  entries.forEach((entry, i) => {
    if (!entry) return
    const src = audio.createBufferSource()
    src.buffer = entry.buffer

    // Nur eine Variante vorhanden? Dann leicht verstimmen, sonst klingt eine
    // Salve wie eine kopierte Datei - was sie ja auch waere.
    if (detune && SAMPLE_SETS[key].length < shots) {
      src.detune.value = (Math.random() * 2 - 1) * detune
    }

    const gain = audio.createGain()
    // Ueberlagerung nur daempfen, wenn die Schuesse wirklich dicht liegen -
    // sonst stapeln sich bei schnellem Dauerfeuer zehn Vollpegel-Schuesse.
    // Bei traegen Waffen (Bolter, halbe Sekunde Abstand) ist jeder Schuss ein
    // eigenes Ereignis und muss voll klingen, sonst verhungert die Salve.
    const dense = spacing > 0 && spacing < 0.25
    const overlap = !dense || i === 0 ? 1 : Math.max(0.35, 1 - i * 0.18)
    gain.gain.value = entry.gain * volume * overlap

    src.connect(gain).connect(audio.destination)
    src.start(start + i * spacing)
  })
  return true
}
