# RP Charakterbogen

Ein digitaler Charakterbogen für Pen&Paper-Rollenspiele, primär für Warhammer 40k Rogue Trader.

## Features

### Phase 1 (Aktuell)
- ✅ Basis-Charakterinformationen (Name, Karriere, Heimatwelt, etc.)
- ✅ 9 Hauptattribute mit Erhöhungs-Tracking
- ✅ Umfassende Fertigkeitenliste mit Progression-System
- ✅ Erfahrungspunkte-Verwaltung
- ✅ Profitfaktor (Rogue Trader spezifisch)
- ✅ Automatisches Speichern im localStorage
- ✅ JSON Export/Import für Charaktere

### Geplant
- Talente & Eigenschaften
- Waffen & Ausrüstung
- Rüstungssystem mit Trefferzonen
- Psi-Kräfte
- Wahnsinn & Verderbnis
- Anpassbare Bogen-Templates
- Mehrere Charaktere verwalten
- PDF-Export

## Tech Stack

- **Vue 3** mit Composition API
- **Quasar Framework** für UI-Komponenten
- **Pinia** für State Management
- **Vite** als Build-Tool
- **localStorage** für Persistenz

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Der Dev-Server läuft auf Port 3003 (oder nächster verfügbarer Port).

## Build

```bash
npm run build
```

## Deployment

Das Projekt kann einfach auf Netlify deployt werden:

1. Repository auf GitHub pushen
2. Netlify mit GitHub-Repository verbinden
3. Build-Command: `npm run build`
4. Publish-Directory: `dist`

## Projektstruktur

```
rp-charactersheet/
├── src/
│   ├── stores/              # Pinia Stores
│   │   └── characterStore.js
│   ├── views/               # Haupt-Ansichten
│   │   ├── CharacterSheetView.vue
│   │   └── SettingsView.vue
│   ├── components/
│   │   └── sections/        # Bogen-Sektionen
│   │       ├── BasicInfoSection.vue
│   │       ├── AttributesSection.vue
│   │       └── SkillsSection.vue
│   ├── router/              # Vue Router
│   └── main.js
├── index.html
└── vite.config.js
```

## Verwendung

### Charakter erstellen
1. Gib die Basis-Informationen ein
2. Setze die Attributwerte
3. Klicke auf die Punkte unter den Attributen für Erhöhungen
4. Markiere erlernte Fertigkeiten und deren Progression

### Export/Import
- **Export**: Klicke auf das Download-Icon in der Toolbar
- **Import**: Klicke auf das Upload-Icon und wähle eine JSON-Datei

### Zurücksetzen
Gehe zu Einstellungen → "Charakter zurücksetzen"

## Lizenz

MIT
