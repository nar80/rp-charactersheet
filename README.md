# RP Charakterbogen

Ein digitaler Charakterbogen für Pen&Paper-Rollenspiele mit mehreren Spielsystemen:

- **Rogue Trader** (Warhammer 40k) – `/rogue-trader`
- **Cairn** (dt. Ausgabe v1.13) – `/cairn`

Das System wird oben links gewechselt. Alle Systeme teilen sich Würfelraum, Export/Import und Einstellungen.

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
src/
├── App.vue              # Hülle: Header, Systemwechsel, Export/Import
├── router/              # Routen je System: /<slug> und /<slug>/einstellungen
├── core/                # gemeinsam für alle Systeme
│   ├── diceRoom.js      # Würfelraum-Verbindung (Auswertung macht das System)
│   ├── characterFile.js # Export/Import { system, character, settings }
│   ├── settingsStore.js
│   └── components/      # NumberInput, Würfelraum- und Export-Einstellungen
└── systems/
    ├── index.js         # Liste aller Systeme
    ├── rogueTrader/     # stores/, components/, views/, data/, composables/, assets/
    └── cairn/
```

### Neues System anlegen

1. Ordner `src/systems/<name>/` mit `index.js` anlegen (Vorlage: `systems/cairn/index.js`):
   `id`, `slug`, `name`, `motto`, `icon`, `useStore`, `isValidCharacter`, `sheet`, `settings`, `headerInfo`.
2. Der Store braucht `character`, `loadCharacter(data)` und `resetCharacter()` sowie einen eigenen
   localStorage-Schlüssel.
3. Würfe über `useDiceRoom()` aus `core/diceRoom.js`; die Auswertung kommt über `options.present(roll)`.
4. Das System in `src/systems/index.js` eintragen.

Optik: Themes hängen sich an `body[data-system="<id>"]`. Das Rogue-Trader-Theme ist das Grundtheme;
andere Systeme färben es über die CSS-Variablen um (siehe `systems/cairn/assets/cairn-theme.css`).

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
