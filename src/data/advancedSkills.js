// Ausbau-Fertigkeiten aus dem Rogue Trader Regelwerk
// Skills mit * benötigen eine Spezialisierung

export const advancedSkills = [
  {
    name: 'Akrobatik',
    attribute: 'GE',
    category: 'Bewegung',
    requiresSpecialization: false,
    description: 'Ermöglicht akrobatische Stunts wie Saltos, Rollen und Balance-Akte.'
  },
  {
    name: 'Allgemeinbildung',
    attribute: 'IN',
    category: 'Ermittlung',
    requiresSpecialization: true,
    description: 'Wissen über verschiedene Themengebiete. Erfordert Spezialisierung (z.B. Geschichte, Geographie).'
  },
  {
    name: 'Anführung',
    attribute: 'CH',
    category: null,
    requiresSpecialization: false,
    description: 'Große Gruppen führen und inspirieren.'
  },
  {
    name: 'Beruf',
    attribute: 'IN',
    category: 'Handwerk, Erforschung',
    requiresSpecialization: true,
    description: 'Kenntnisse in einem spezifischen Beruf. Erfordert Spezialisierung (z.B. Koch, Schmied).'
  },
  {
    name: 'Beschatten',
    attribute: 'GE',
    category: null,
    requiresSpecialization: false,
    description: 'Unauffälliges Verfolgen einer Person.'
  },
  {
    name: 'Chem-Gebrauch',
    attribute: 'IN',
    category: 'Ermittlung, Handwerk',
    requiresSpecialization: false,
    description: 'Herstellung und Anwendung von Chemikalien und Drogen.'
  },
  {
    name: 'Fahren',
    attribute: 'GE',
    category: 'Bedienung',
    requiresSpecialization: true,
    description: 'Fahren von Landfahrzeugen. Erfordert Spezialisierung (z.B. Rad, Kette).'
  },
  {
    name: 'Fingerfertigkeit',
    attribute: 'GE',
    category: null,
    requiresSpecialization: false,
    description: 'Taschendiebstahl, Schlosser und andere feine Handarbeit.'
  },
  {
    name: 'Geheimsprache',
    attribute: 'IN',
    category: null,
    requiresSpecialization: true,
    description: 'Verstehen und Sprechen von Geheimsprachen. Erfordert Spezialisierung (z.B. Gaunerzinken, Militärcode).'
  },
  {
    name: 'Geheimzeichen',
    attribute: 'IN',
    category: null,
    requiresSpecialization: true,
    description: 'Lesen und Verwenden geheimer Zeichen und Symbole. Erfordert Spezialisierung.'
  },
  {
    name: 'Handel',
    attribute: 'CH',
    category: null,
    requiresSpecialization: false,
    description: 'Kenntnisse über Handelswege, Märkte und Warenverkehr.'
  },
  {
    name: 'Kunst',
    attribute: 'CH',
    category: null,
    requiresSpecialization: true,
    description: 'Künstlerische Fähigkeiten. Erfordert Spezialisierung (z.B. Malen, Musik, Tanz).'
  },
  {
    name: 'Lesen/Schreiben',
    attribute: 'IN',
    category: null,
    requiresSpecialization: false,
    description: 'Lesen und Schreiben in bekannten Sprachen.'
  },
  {
    name: 'Medizin',
    attribute: 'IN',
    category: null,
    requiresSpecialization: false,
    description: 'Behandlung von Verletzungen und Krankheiten.'
  },
  {
    name: 'Navigation',
    attribute: 'IN',
    category: 'Erforschung',
    requiresSpecialization: true,
    description: 'Orientierung und Routenplanung. Erfordert Spezialisierung (z.B. Stellar, Oberfläche).'
  },
  {
    name: 'Pilot',
    attribute: 'GE',
    category: 'Bedienung',
    requiresSpecialization: true,
    description: 'Steuern von Luft- und Raumfahrzeugen. Erfordert Spezialisierung (z.B. Raumschiff, Flyer).'
  },
  {
    name: 'Psi-Gespür',
    attribute: 'WA',
    category: null,
    requiresSpecialization: false,
    description: 'Spüren von psionischen Kräften und Warp-Präsenz.'
  },
  {
    name: 'Redeschwall',
    attribute: 'CH',
    category: 'Interaktion',
    requiresSpecialization: false,
    description: 'Eloquent reden und überzeugen durch viele Worte.'
  },
  {
    name: 'Scholastisches Wissen',
    attribute: 'IN',
    category: 'Ermittlung',
    requiresSpecialization: true,
    description: 'Akademisches Wissen. Erfordert Spezialisierung (z.B. Imperium, Xenologie, Theologie).'
  },
  {
    name: 'Sicherheit',
    attribute: 'GE',
    category: 'Erforschung',
    requiresSpecialization: false,
    description: 'Schlösser öffnen und Sicherheitssysteme überwinden.'
  },
  {
    name: 'Sprache',
    attribute: 'IN',
    category: null,
    requiresSpecialization: true,
    description: 'Sprechen fremder Sprachen. Erfordert Spezialisierung (z.B. Hochgotisch, Xenos-Sprache).'
  },
  {
    name: 'Sprengstoffgebrauch',
    attribute: 'IN',
    category: 'Handwerk',
    requiresSpecialization: false,
    description: 'Umgang mit Sprengstoffen und Entschärfung.'
  },
  {
    name: 'Spuren lesen',
    attribute: 'IN',
    category: 'Erforschung',
    requiresSpecialization: false,
    description: 'Spuren verfolgen und interpretieren.'
  },
  {
    name: 'Tech-Gebrauch',
    attribute: 'IN',
    category: 'Erforschung',
    requiresSpecialization: false,
    description: 'Bedienen und Verstehen von Technologie.'
  },
  {
    name: 'Überleben',
    attribute: 'IN',
    category: 'Erforschung',
    requiresSpecialization: false,
    description: 'Überleben in feindlichen Umgebungen.'
  },
  {
    name: 'Umgang mit Tieren',
    attribute: 'IN',
    category: null,
    requiresSpecialization: false,
    description: 'Tiere trainieren, beruhigen und kontrollieren.'
  },
  {
    name: 'Verbotenes Wissen',
    attribute: 'IN',
    category: 'Ermittlung',
    requiresSpecialization: true,
    description: 'Gefährliches Wissen über Chaos, Dämonen etc. Erfordert Spezialisierung (z.B. Chaos, Xenos, Warp).'
  },
  {
    name: 'Verhör',
    attribute: 'WK',
    category: 'Ermittlung',
    requiresSpecialization: false,
    description: 'Informationen durch Befragung extrahieren.'
  }
];
