// Tabellen aus Cairn (dt. Ausgabe v1.13, CC BY-SA 4.0), Seitenzahlen in Klammern

// Name & Hintergrund (S. 7)
export const firstNames = [
  ['Agune', 'Arwel', 'Aeron'], ['Beatrice', 'Bevan', 'Anhun'], ['Breagan', 'Boroth', 'Avalon'],
  ['Bronwyn', 'Borrid', 'Bera'], ['Cannora', 'Breagle', 'Bevan'], ['Drelil', 'Breglor', 'Cayne'],
  ['Elgile', 'Canhoreal', 'Dwyryd'], ['Esme', 'Emrys', 'Eilir'], ['Griya', 'Ethex', 'Emlyn'],
  ['Henaine', 'Gringle', 'Glyn'], ['Lirann', 'Grinwit', 'Hafgan'], ['Lirathil', 'Gruwid', 'Kendal'],
  ['Lisabeth', 'Gruwth', 'Luan'], ['Moralil', 'Gwestin', 'Mael'], ['Morgwen', 'Mannog', 'Morgan'],
  ['Sybil', 'Melnax', 'Mostyn'], ['Theune', 'Orthax', 'Tirion'], ['Wenain', 'Triunein', 'Von'],
  ['Ygwal', 'Wenlan', 'Winnie'], ['Yslen', 'Yirmeor', 'Yale']
].flat()

export const lastNames = [
  'Abernathy', 'Addercap', 'Burl', 'Candlewick', 'Cormick', 'Crumwaller', 'Dunswallow', 'Getri',
  'Glass', 'Harkness', 'Harper', 'Loomer', 'Malksmilk', 'Smythe', 'Sunderman', 'Swinney',
  'Thatcher', 'Tolmen', 'Weaver', 'Wolder'
]

export const backgrounds = [
  'Alchemie', 'Schmieden', 'Einbruch', 'Metzgerei', 'Schreinerei', 'Klerus', 'Glücksspiel',
  'Bestattung', 'Kräuterkunde', 'Jagd', 'Magie', 'Militär', 'Handel', 'Bergbau', 'Raub',
  'Gaukelei', 'Diebstahl', 'Schmuggel', 'Gesinde', 'Wildtierhütung'
]

export const origins = ['Stadt', 'Gosse', 'Bauernhof', 'Dorf', 'auf Reisen', 'Kaserne', 'am Hofe', 'Holzfällerlager']

// Merkmale (S. 8)
export const traits = [
  { key: 'physique', label: 'Körperbau', values: ['dürr', 'kurz', 'kräftig', 'robust', 'schlaksig', 'groß', 'bullig', 'athletisch', 'statuenhaft', 'schwabbelig'] },
  { key: 'clothing', label: 'Kleidung', values: ['ranzig', 'elegant', 'dreckig', 'widerlich', 'altbacken', 'fremdartig', 'traditionell', 'ausgefranst', 'altertümlich', 'blutverschmiert'] },
  { key: 'hair', label: 'Haar', values: ['lang', 'dünn', 'kraus', 'fettig', 'Glatze', 'üppig', 'lockig', 'verfilzt', 'gewellt', 'geflochten'] },
  { key: 'hairColor', label: 'Haarfarbe', values: ['blond', 'schwarz', 'weiß', 'grau', 'brünett', 'kupferrot'] },
  { key: 'face', label: 'Gesicht', values: ['blass', 'eckig', 'kantig', 'perfekt', 'länglich', 'knochig', 'rattenhaft', 'deformiert', 'schneidend', 'eingefallen'] },
  { key: 'skin', label: 'Haut', values: ['rosig', 'weich', 'dunkel', 'fleckig', 'trocken', 'gebräunt', 'tätowiert', 'glänzend', 'wettergegerbt', 'pockennarbig'] },
  { key: 'eyes', label: 'Augen', values: ['grau', 'rot', 'blau', 'gelb', 'braun', 'grün'] },
  { key: 'speech', label: 'Sprechweise', values: ['heiser', 'präzise', 'piepsig', 'formal', 'schroff', 'kryptisch', 'flüsternd', 'stotternd', 'dröhnend', 'brummend'] },
  { key: 'virtue', label: 'Tugend', values: ['tapfer', 'gnädig', 'gesellig', 'tolerant', 'gelassen', 'ehrenvoll', 'umsichtig', 'bescheiden', 'diszipliniert', 'ambitioniert'] },
  { key: 'vice', label: 'Laster', values: ['faul', 'feige', 'nervös', 'aggressiv', 'habgierig', 'verbittert', 'hinterlistig', 'eingebildet', 'ungehobelt', 'nachtragend'] },
  { key: 'reputation', label: 'Ruf', values: ['weise', 'ehrlich', 'faul', 'rüpelhaft', 'gefährlich', 'sonderbar', 'abstoßend', 'respektiert', 'ambitioniert', 'unterhaltsam'] },
  { key: 'misfortune', label: 'Unglück', values: ['enterbt', 'süchtig', 'erpresst', 'verrufen', 'verflucht', 'verurteilt', 'betrogen', 'verbannt', 'verlassen', 'degradiert'] }
]

// Startausrüstung (S. 9)
export const expeditionGear = [
  'Fernrohr', 'Dietriche', 'Lampenöl', 'Gegengift', 'Pulverfass', 'Spitzhacke', 'Enterhaken',
  'Falle (groß)', 'Flaschenzug', 'Großer Sack', 'Handschellen', 'Seil (8 m)', 'Abwehrmittel',
  'Schutzzeichen', 'Schwimmhilfe', 'Wünschelrute', 'Eisenhut (Gift)', 'Kette (3 m)', 'Stange (3 m)',
  { name: 'Karren (+4 Plätze)', bulky: true }
]

export const tools = [
  'Fett', 'Pech', 'Leim', 'Netz', 'Säge', 'Nägel', 'Eimer', 'Kreide', 'Meißel', 'Zangen',
  'Schaufel', 'Hammer', 'Blasebalg', 'Angelrute', 'Kochtöpfe', 'Metallfeile', 'Krähenfüße',
  'Handbohrer', 'Brechstange', 'Stundenglas'
]

export const trinkets = [
  'Horn', 'Linse', 'Seife', 'Spiegel', 'Parfüm', 'Flasche', 'Teertopf', 'Murmeln', 'Würfelset',
  'Salzbeutel', 'Schwamm', 'Bindfaden', 'Kartenspiel', 'Weihrauch', 'Instrument', 'Signalpfeife',
  'kleine Glocke', 'falsche Juwelen', 'Federkiel & Tinte', 'Gesichtsbemalung'
]

// [von, bis, Gegenstände zur Auswahl]
export const weaponTable = [
  [1, 5, [{ name: 'Stab', damage: 'd6' }, { name: 'Knüppel', damage: 'd6' }, { name: 'Dolch', damage: 'd6' }]],
  [6, 14, [{ name: 'Axt', damage: 'd8' }, { name: 'Streitkolben', damage: 'd8' }, { name: 'Bastardschwert', damage: 'd8' }]],
  [15, 19, [{ name: 'Armbrust', damage: 'd8', bulky: true }, { name: 'Bogen', damage: 'd6', bulky: true }, { name: 'Schleuder', damage: 'd4' }]],
  [20, 20, [{ name: 'Hellebarde', damage: 'd10', bulky: true }, { name: 'Kriegshammer', damage: 'd10', bulky: true }, { name: 'Streitaxt', damage: 'd10', bulky: true }]]
]

export const armorTable = [
  [1, 3, []],
  [4, 14, [{ name: 'Brigantine', armor: 1, bulky: true }]],
  [15, 19, [{ name: 'Kettenhemd', armor: 2, bulky: true }]],
  [20, 20, [{ name: 'Plattenrüstung', armor: 3, bulky: true }]]
]

export const helmShieldTable = [
  [1, 13, []],
  [14, 16, [{ name: 'Helm', armor: 1 }]],
  [17, 19, [{ name: 'Schild', armor: 1 }]],
  [20, 20, [{ name: 'Helm', armor: 1 }, { name: 'Schild', armor: 1 }]]
]

// Zauberbücher (W100, S. 10)
export const spells = [
  'Abdunkeln', 'Abstoßen', 'Amöbenform', 'Anthropomorphisieren', 'Anwesen', 'Anziehung', 'Astralgefängnis',
  'Aufspüren', 'Ausspähen', 'Befehl', 'Benebelt', 'Beschwichtigen', 'Besitz identifizieren', 'Bestiengestalt',
  'Bezaubern', 'Dickicht', 'Diebstahl', 'Dingsbums', 'Drahtseil', 'Eisige Berührung', 'Elastizität',
  'Elementarwand', 'Erdbeben', 'Evolution', 'Flüssige Luft', 'Gedanken erkennen', 'Gegenstand beleben',
  'Gegenstand bewegen', 'Geister erwecken', 'Geisterhaftes Geräusch', 'Gier', 'Glätten', 'Grube', 'Hass',
  'Hast', 'Hypnose', 'Idol beschwören', 'Kleber', 'Klopfen', 'Köderblume', 'Körpertausch', 'Lauschen',
  'Leuchtsignal', 'Lichtkugel', 'Magie erkennen', 'Magiedämpfer', 'Magiemagnet', 'Magisches Auge',
  'Magisches Zeichen', 'Maskerade', 'Modellieren', 'Murmelrausch', 'Nebelschwade', 'Netz', 'Objektwerdung',
  'Optische Illusion', 'Pflanzen beherrschen', 'Phobie', 'Plappern', 'Quelle', 'Raserei', 'Rauchgestalt',
  'Röntgenblick', 'Schaumkanone', 'Schild', 'Schlaf', 'Schleier', 'Schnüffel', 'Schutzkreis', 'Schwarm',
  'Schweben', 'Schwerkraftverschiebung', 'Sortieren', 'Spektakel', 'Sphäre der Nacht', 'Spiegelbild',
  'Spiegelgang', 'Spinnenklettern', 'Sprung', 'Taubheit', 'Telekinese', 'Telepathie', 'Teleportieren', 'Tor',
  'Tote erwecken', 'Trugbild', 'Unkrautvernichter', 'Unsichtbare Fessel', 'Verkleiden', 'Verkleinern',
  'Versatz', 'Verstehen', 'Wahrer Blick', 'Wechsel', 'Wetterkontrolle', 'Wunden heilen', 'Würfel beschwören',
  'Zeitkontrolle', 'Zerlegen', 'Zusätzlicher Arm'
]

// Zauberbeschreibungen (S. 24–28), nach Namen. Die Nummern der Beschreibungen weichen bei
// 45/46 von der Würfeltabelle ab – gewürfelt wird nach der Tabelle oben (spells).
export const spellTexts = {
  "Abdunkeln": "Die Quelle jedes natürlichen Lichts in Sichtweite wird abgedunkelt.",
  "Abstoßen": "Zwei Objekte in einem Umkreis von 10ft (3m) werden ähnlich Magneten stark voneinander abgestossen.",
  "Amöbenform": "Du verwandelst dich in eine Amöbe.",
  "Anthropomorphisieren": "Ein Tier erhält für einen Tag das Aussehen oder die Intelligenz eines Menschen.",
  "Anwesen": "Ein robustes möbliertes Anwesen erscheint für einige Stunden. Du kannst entscheiden, wem du Zutritt gewährst oder verbietest.",
  "Anziehung": "Zwei Objekte ziehen sich wie magnetisch an, kommen sie sich näher als 15ft (5m).",
  "Astralgefängnis": "Ein Objekt wird außerhalb von Raum und Zeit in einem unzerstörbaren Kristall eingeschlossen.",
  "Aufspüren": "Du erspürst das nächstgelegene Objekt deiner Wahl (Schlüssel, Gold, Pfeil, Krug, etc.).",
  "Ausspähen": "Du kannst durch die Augen einer Kreatur sehen, die du heute bereits berührt hast.",
  "Befehl": "Das Ziel befolgt einen einzelnen Drei-Wort-Befehl, der ihm keinen Schaden zufügt.",
  "Benebelt": "Eine Kreatur ist für die Dauer des Zaubers nicht mehr in der Lage, sich etwas Neues zu merken.",
  "Beschwichtigen": "Eine Kreatur in deiner Nähe hegt nun eine Abneigung gegen Gewalt.",
  "Besitz identifizieren": "Falls Besitzansprüche bestehen, erscheint über dem berührten Gegenstand der Name des Besitzers.",
  "Bestiengestalt": "Du verwandelst dich samt Ausrüstung und Gepäck in ein gewöhnliches Tier.",
  "Bezaubern": "Eine Kreatur in Sichtweite, behandelt dich wie einen Freund.",
  "Dickicht": "Ein Dickicht aus Bäumen und dichtem Gestrüpp sprießt plötzlich aus dem Boden. Es kann höchstens 50ft (15m) breit sein.",
  "Diebstahl": "Ein sichtbarer Gegenstand wird in deine Hände teleportiert.",
  "Dingsbums": "Eine primitive Version eines gezeichneten Werkzeugs oder Gegenstands erscheint vor dir. Es verschwindet nach kurzer Zeit wieder.",
  "Drahtseil": "Ein Drahtseil schießt aus deinem Arm und befestigt sich an zwei maximal 50ft (15m) voneinander entfernten Punkten.",
  "Eisige Berührung": "Von einer berührten Oberfläche breitet sich bis zu 10ft (3m) eine dicke Eisschicht aus.",
  "Elastizität": "Dein Körper kann sich bis zu 10ft (3m) dehnen.",
  "Elementarwand": "Eine 50ft (15m) lange und 10ft (3m) hohe Wand aus Eis oder Feuer erhebt sich aus dem Boden.",
  "Erdbeben": "Der Boden beginnt so stark zu beben, dass Bauwerke beschädigt werden oder einstürzten, können.",
  "Evolution": "Eine Kreatur entwickelt sich schlagartig weiter.",
  "Flüssige Luft": "Die Luft um dich herum ermöglicht es, zu schwimmen.",
  "Gedanken erkennen": "Du kannst die oberflächlichen Gedanken von Kreaturen in der Nähe hören.",
  "Gegenstand beleben": "Belebt ein Objekt, welches nach Möglichkeiten deinen Befehlen Folge leistet.",
  "Gegenstand bewegen": "Ein Gegenstand beliebiger Größe wird mit der Kraft einer Person zu dir gezogen oder weggeschoben.",
  "Geister erwecken": "Der Geist einer Leiche in der Nähe erscheint und beantwortet eine Frage.",
  "Geisterhaftes Geräusch": "Du erzeugst die Illusion von Geräuschen aus einer beliebigen Richtung.",
  "Gier": "Eine Kreatur giert danach, einen sichtbaren Gegenstand deiner Wahl zu besitzen.",
  "Glätten": "Jede Oberfläche im Umkreis von 30ft (10m) wird extrem rutschig.",
  "Grube": "Eine Grube von 10ft (3m) Breite und Tiefe öffnet sich im Boden.",
  "Hass": "Eine Kreatur entwickelt einen tiefen Hass gegenüber einer anderen Kreatur oder Gruppe und möchte diese vernichten.",
  "Hast": "Deine Bewegungsgeschwindigkeit wird verdreifacht.",
  "Hypnose": "Eine Kreatur wird in Trance versetzt und muss eine Ja-oderNein Frage wahrheitsgemäß beantworten.",
  "Idol beschwören": "Eine aus Stein gehauene Statue von der Größe eines Maultiers erhebt sich aus dem Boden.",
  "Kleber": "Überzieht ein Objekt mit extrem klebrigem Schleim.",
  "Klopfen": "Ein normales oder magisches Schloss öffnet sich lautstark.",
  "Köderblume": "Eine Blume, die den Geruch von verwesendem Fleische verströmt, sprießt aus dem Boden.",
  "Körpertausch": "Bei Berührung tauschst du den Körper mit einer Kreatur. Stirbt ein Körper, stirbt auch der andere.",
  "Lauschen": "Du kannst schwache Geräusche deutlich hören.",
  "Leuchtsignal": "Ein heller Energieball steigt mit Leuchtspur in den Himmel und verrät Freund und Feind deinen Standort.",
  "Lichtkugel": "Ein schwebendes Licht bewegt sich entsprechend deinen Befehlen.",
  "Magie erkennen": "Du kannst magische Auren in deiner Nähe sehen o. hören.",
  "Magiedämpfer": "Die Effizienz aller magischen Effekte in deiner Nähe wird halbiert.",
  "Magiemagnet": "Ein von dir berührtes Objekt, wird zum Ziel jedes Zaubers in der Nähe.",
  "Magisches Auge": "Du kannst durch einen magischen, fliegenden Augapfel sehen, der deinen Befehlen folgt.",
  "Magisches Zeichen": "Du kannst mit deinem Finger eine Farbe verströmen die nur du sehen kannst, selbst durch Gegenstände und über jede Entfernung hinweg.",
  "Maskerade": "Berührst du jemanden, erhält die Person die Stimme und das Aussehen von jemandem anderen.",
  "Modellieren": "Unbelebte Materialien sind in deinen Händen wie Ton.",
  "Murmelrausch": "Deine Taschen füllen sich alle 30 Sek. mit Murmeln auf.",
  "Nebelschwade": "Dichte Nebelschwaden strömen aus dir.",
  "Netz": "Dein Handgelenk verschießt Netze.",
  "Objektwerdung": "Du verwandelst dich in ein beliebiges unbelebtes Objekt, von der Größe eines großen Tischs bis hin zu einem Apfel.",
  "Optische Illusion": "Eine stille, unbewegliche und raumgroße Illusion deiner Wahl erscheint.",
  "Pflanzen beherrschen": "Pflanzen und Bäume gehorchen deinen Befehlen, und erhalten die Fähigkeit sich langsam fortzubewegen.",
  "Phobie": "Eine Kreatur in der Nähe fürchtet sich vor einem Gegenstand deiner Wahl.",
  "Plappern": "Eine Kreatur muss deine Gedanken laut und deutlich wiederholen. In Pausen bleibt sie stumm.",
  "Quelle": "Eine Meerwasserquelle entspringt vor dir.",
  "Raserei": "Eine Kreatur in deiner Nähe verfällt in Raserei.",
  "Rauchgestalt": "Dein Körper verwandelt sich in eine Rauchwolke.",
  "Röntgenblick": "Du kannst durch Wände, Schmutz, Kleidung, usw. hindurchsehen.",
  "Schaumkanone": "Ein Schaumschwall bricht aus deiner Hand hervor und bedeckt das Ziel.",
  "Schild": "Eine berührte Kreatur ist eine Minute vor nichtmagischen Angriffen geschützt.",
  "Schlaf": "Eine Kreatur in Sichtweite, verfällt in einen leichten Schlaf.",
  "Schleier": "Eine Kreatur, die du berührst, wird unsichtbar. Die Wirkung dieses Zaubers erlischt bei ihrer ersten Bewegung.",
  "Schnüffel": "Selbst die schwächsten Düfte kannst du noch wahrnehmen.",
  "Schutzkreis": "Ein silberner Kreis mit 50ft (15m) Durchmesser erscheint am Boden. Eine Spezies deiner Wahl kann ihn nicht durchschreiten.",
  "Schwarm": "Du kannst dich in einen Schwarm Krähen, Ratten oder Piranhas verwandeln und nur durch Explosionen verletzt werden.",
  "Schweben": "Lasse ein Objekt, mit bis zu einem Humanoiden, 2ft (½m) reibungslos über den Boden schweben.",
  "Schwerkraftverschiebung": "Du kannst für dich die Richtung der Schwerkraft verändern.",
  "Sortieren": "Sortiert leblose Gegenstände nach einer von dir festgelegten Kategorie.",
  "Spektakel": "Eine offensichtliche Illusion deiner Wahl, in der maximalen Größe eines Palastes, erscheint unter deiner Kontrolle. Sie ist voll beweglich und produziert Geräusche.",
  "Sphäre der Nacht": "Vor dir erscheint eine Sphäre mit 50ft (15m) Durchmesser, die den Nachthimmel zeigt.",
  "Spiegelbild": "Eine von dir kontrollierte Doppelgängerillusion deiner selbst erscheint.",
  "Spiegelgang": "Ein Spiegel wird zu einem Durchgang zu einem anderen, in den du heute geblickt hast.",
  "Spinnenklettern": "Du kannst wie eine Spinne auf Oberflächen klettern.",
  "Sprung": "Du springst einmal bis zu 10ft (3m) hoch.",
  "Taubheit": "Alle Kreaturen in der Nähe werden Taub.",
  "Telekinese": "Du kannst einen Gegenstand unter 60lbs (30kg) mental bewegen.",
  "Telepathie": "Zwei Kreaturen können, unabhängig von ihrer Entfernung ihre Gedanken hören.",
  "Teleportieren": "Ein Gegenstand oder eine Person in Sichtweite, teleportiert von einem Ort zu einem anderen in 50ft (15m) Radius.",
  "Tor": "Ein Portal zu einer zufälligen planaren Ebene öffnet sich.",
  "Tote erwecken": "Ein besonders dummes Skelett erhebt sich aus dem Boden und ist dir zu Diensten. Es kann nur einfachsten Befehlen Folge leisten.",
  "Trugbild": "Du hast vollständige Kontrolle über alles, was eine Kreatur sieht.",
  "Unkrautvernichter": "Eine drehende Klinge fliegt aus deiner Brust und zerschneidet Pflanzenmaterial, das deinen Weg blockiert. Ansonsten ist sie harmlos.",
  "Unsichtbare Fessel": "Zwei Objekte können nicht weiter als 10ft (3m) auseinander bewegt werden.",
  "Verkleiden": "Du kannst das Aussehen einer Person nach Belieben verändern, solange die Gestalt humanoid bleibt. Doppelgänger erregen Argwohn.",
  "Verkleinern": "Eine Kreatur wird bei Berührung auf Mäusegröße geschrumpft.",
  "Versatz": "Ein Objekt scheint 15ft (5m) von seiner Position versetzt zu sein.",
  "Verstehen": "Du beherrschst für kurze Zeit alle Sprachen.",
  "Wahrer Blick": "Du durchschaust alle Illusionen in der Nähe.",
  "Wechsel": "Zwei Kreaturen, in Sichtweite tauschen den Platz.",
  "Wetterkontrolle": "Du kannst die Art des Wetters verändern, es aber nicht kontrollieren.",
  "Wunden heilen": "Einmal am Tag kannst du mit einer Berührung 1W4 ST heilen.",
  "Würfel beschwören": "Jede Sekunde kannst du einen 3ft (1m) großen Würfel aus Erde beschwören oder verbannen. Neue Würfel müssen mit dem Boden oder miteinander verbunden sein.",
  "Zeitkontrolle": "Die Zeit in einer 50ft (15m) großen Sphäre verlangsamt oder erhöht sich für 30 Sekunden um 10%.",
  "Zerlegen": "Du kannst alle Körperteile schmerzfrei und ohne Schaden, nach Belieben abtrennen und zusammensetzen.",
  "Zusätzlicher Arm": "Dir wächst vorübergehend ein zusätzlicher Arm."
}

// Verletzungen (S. 20): Ergebnis = erlittener Schaden, wenn die TP genau auf 0 fallen.
// onAdd: Zustände, die sofort gelten. steps: Würfe, die im Bogen als Knöpfe erscheinen.
//   where: Wurf auf eine Liste (Körperstelle, Attribut)
//   max:   Maximum anheben – mode 'higher' (übernehmen, wenn höher als das Maximum), 'current' (wenn höher
//          als der aktuelle Wert), 'add' (addieren), 'set' (ersetzen);
//          target 'hp', 'ST', 'GE', 'WK' oder 'rolled' (= Attribut aus dem where-Schritt)
//   save:  WK-Rettungswurf; Schritte mit needsSave gibt es nur nach Erfolg,
//          needsDoomSurvived erst, wenn Verdammt überlebt ist
const BODY = ['Hals', 'Hände', 'Auge', 'Brustkorb', 'Beine', 'Ohr']
export const scars = [
  {
    title: 'Dauerhafte Narbe',
    text: 'Würfle 1W6: 1 Hals, 2 Hände, 3 Auge, 4 Brustkorb, 5 Beine, 6 Ohr. Würfle 1W6 – ist das Ergebnis höher als deine max. TP, übernimm es.',
    steps: [
      { key: 'where', type: 'where', notation: '1d6', label: 'Wo?', values: BODY },
      { key: 'hp', type: 'max', notation: '1d6', target: 'hp', mode: 'higher', label: 'Max. TP' }
    ]
  },
  {
    title: 'Niederschmetternder Hieb',
    text: 'Du bist desorientiert und durchgeschüttelt. Beschreibe, wie du dich wieder sammelst. Würfle 1W6 – ist das Ergebnis höher als deine max. TP, übernimm es.',
    steps: [{ key: 'hp', type: 'max', notation: '1d6', target: 'hp', mode: 'higher', label: 'Max. TP' }]
  },
  {
    title: 'Überrollt',
    text: 'Du wirst durch die Luft geschleudert. Du bist in Bedrängnis, bis du dich ein paar Stunden ausgeruht hast. Dann würfle 1W6 und addiere es zu deinen max. TP.',
    onAdd: { deprived: true },
    steps: [{ key: 'hp', type: 'max', notation: '1d6', target: 'hp', mode: 'add', label: 'Nach der Rast: max. TP +' }]
  },
  {
    title: 'Gebrochene Gliedmaßen',
    text: 'Würfle 1W6: 1–2 Bein, 3–4 Arm, 5 Rippe, 6 Schädel. Nach der Heilung würfle 2W6 – ist die Summe höher als deine max. TP, übernimm sie.',
    steps: [
      { key: 'where', type: 'where', notation: '1d6', label: 'Was?', values: ['Bein', 'Bein', 'Arm', 'Arm', 'Rippe', 'Schädel'] },
      { key: 'hp', type: 'max', notation: '2d6', target: 'hp', mode: 'higher', label: 'Nach der Heilung: max. TP' }
    ]
  },
  {
    title: 'Erkrankt',
    text: 'Du bist mit einer ekelhaften Krankheit infiziert. Wenn du sie überwunden hast, würfle 2W6 – ist das Ergebnis höher als deine max. TP, übernimm es.',
    steps: [{ key: 'hp', type: 'max', notation: '2d6', target: 'hp', mode: 'higher', label: 'Nach der Genesung: max. TP' }]
  },
  {
    title: 'Wiedererweckung durch Kopfwunde',
    text: 'Würfle 1W6: 1–2 ST, 3–4 GE, 5–6 WK, dann 3W6 – ist die Summe höher als der Attributswert, übernimm sie.',
    steps: [
      { key: 'where', type: 'where', notation: '1d6', label: 'Welches Attribut?', values: ['ST', 'ST', 'GE', 'GE', 'WK', 'WK'] },
      { key: 'attr', type: 'max', notation: '3d6', target: 'rolled', mode: 'current', label: 'Neuer Wert' }
    ]
  },
  {
    title: 'Gelähmt',
    text: 'Du kannst dich kaum bewegen, bis du ernsthafte Hilfe bekommst und dich ausruhst. Nach der Genesung würfle 3W6 – ist die Summe höher als deine max. GE, übernimm sie.',
    steps: [{ key: 'ge', type: 'max', notation: '3d6', target: 'GE', mode: 'higher', label: 'Nach der Genesung: max. GE' }]
  },
  {
    title: 'Taubheit',
    text: 'Du kannst nichts hören, bis du besondere Hilfe findest. WK-Rettungswurf: Bei Erfolg erhöhe deine max. WK um 1W4.',
    steps: [
      { key: 'save', type: 'save', label: 'WK-Rettungswurf' },
      { key: 'wk', type: 'max', notation: '1d4', target: 'WK', mode: 'add', needsSave: true, label: 'Max. WK +' }
    ]
  },
  {
    title: 'Neustart',
    text: 'Ein verborgener Teil deiner Psyche ist freigelegt. Würfle 3W6 – ist die Summe höher als deine max. WK, übernimm sie.',
    steps: [{ key: 'wk', type: 'max', notation: '3d6', target: 'WK', mode: 'higher', label: 'Max. WK' }]
  },
  {
    title: 'Abgetrennt',
    text: 'Eine Gliedmaße ist abgerissen, verkrüppelt oder unbrauchbar (die SL sagt welche). WK-Rettungswurf: Bei Erfolg erhöhe deine max. WK um 1W6.',
    steps: [
      { key: 'save', type: 'save', label: 'WK-Rettungswurf' },
      { key: 'wk', type: 'max', notation: '1d6', target: 'WK', mode: 'add', needsSave: true, label: 'Max. WK +' }
    ]
  },
  {
    title: 'Tödliche Wunde',
    text: 'Du bist in Bedrängnis und außer Gefecht. Du stirbst in einer Stunde, wenn du nicht geheilt wirst. Wenn du wieder gesund bist, würfle 2W6 – das Ergebnis sind deine neuen max. TP.',
    onAdd: { deprived: true, incapacitated: true },
    steps: [{ key: 'hp', type: 'max', notation: '2d6', target: 'hp', mode: 'set', label: 'Wieder gesund: neue max. TP' }]
  },
  {
    title: 'Verdammt',
    text: 'Scheitert dein nächster Rettungswurf gegen kritischen Schaden, stirbst du auf schreckliche Weise. Überlebst du, würfle 3W6 – ist die Summe höher als deine max. TP, übernimm sie.',
    onAdd: { doomed: true },
    steps: [{ key: 'hp', type: 'max', notation: '3d6', target: 'hp', mode: 'higher', needsDoomSurvived: true, label: 'Überlebt: max. TP' }]
  }
]

// Ausrüstungsliste (S. 11) als Vorlagen für "Gegenstand hinzufügen"
export const itemTemplates = [
  { name: 'Dolch', type: 'weapon', damage: 'd6' },
  { name: 'Kurzschwert', type: 'weapon', damage: 'd6' },
  { name: 'Stab', type: 'weapon', damage: 'd6' },
  { name: 'Speer', type: 'weapon', damage: 'd8' },
  { name: 'Bastardschwert', type: 'weapon', damage: 'd8' },
  { name: 'Axt', type: 'weapon', damage: 'd8' },
  { name: 'Streitkolben', type: 'weapon', damage: 'd8' },
  { name: 'Hellebarde', type: 'weapon', damage: 'd10', bulky: true },
  { name: 'Kriegshammer', type: 'weapon', damage: 'd10', bulky: true },
  { name: 'Zweihänder', type: 'weapon', damage: 'd10', bulky: true },
  { name: 'Schleuder', type: 'weapon', damage: 'd4' },
  { name: 'Bogen', type: 'weapon', damage: 'd6', bulky: true },
  { name: 'Armbrust', type: 'weapon', damage: 'd8', bulky: true },
  { name: 'Schild', type: 'armor', armor: 1 },
  { name: 'Helm', type: 'armor', armor: 1 },
  { name: 'Gambeson', type: 'armor', armor: 1 },
  { name: 'Brigantine', type: 'armor', armor: 1, bulky: true },
  { name: 'Kettenhemd', type: 'armor', armor: 2, bulky: true },
  { name: 'Plattenrüstung', type: 'armor', armor: 3, bulky: true },
  { name: 'Rationen (3 Tage)', type: 'gear' },
  { name: 'Fackel', type: 'gear' },
  { name: 'Laterne & Öl', type: 'gear' },
  { name: 'Seil (8 m)', type: 'gear' },
  { name: 'Leiter (3 m)', type: 'gear', bulky: true },
  { name: 'Zelt (2 Personen)', type: 'gear', bulky: true },
  { name: 'Zauberbuch', type: 'spellbook' },
  { name: 'Schriftrolle', type: 'scroll' }
]

export const carrierTemplates = [
  { name: 'Pferd', capacity: 4 },
  { name: 'Maultier', capacity: 6 },
  { name: 'Karren', capacity: 4 },
  { name: 'Wagen', capacity: 8 }
]
