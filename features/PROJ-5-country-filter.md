# PROJ-5: Country Filter

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich Unternehmen nach Land filtern können, um FinTechs in einem bestimmten europäischen Markt zu finden.

**US-2:** Als Nutzer möchte ich sehen, wie viele Unternehmen pro Land in der Datenbank sind, um die Marktverteilung zu verstehen.

---

## Acceptance Criteria

- [x] AC-1: Ein Dropdown-Menü zeigt alle verfügbaren Länder
- [x] AC-2: Jeder Ländereintrag zeigt die Anzahl der Unternehmen in Klammern: "Germany (450)"
- [x] AC-3: Die Länder sind nach Anzahl der Unternehmen absteigend sortiert
- [x] AC-4: "All Countries" ist der Default-Wert
- [x] AC-5: Ein Globe-Icon ist als visueller Hinweis im Dropdown positioniert
- [x] AC-6: Das aktive Dropdown hat Dark-Styling (Deep Navy) wenn ein Land ausgewählt ist
- [x] AC-7: Der Filter kombiniert sich korrekt mit allen anderen aktiven Filtern
- [x] AC-8: Auf Mobile wird der Filter im Filter-Panel unter "Country" angezeigt (full-width)
- [x] AC-9: Mindestens 20 europäische Länder sind verfügbar

---

## Edge Cases

- Was passiert wenn ein Land nur wenige Unternehmen hat? → Wird trotzdem im Dropdown angezeigt (sortiert nach Count)
- Was passiert wenn Land-Filter + Kategorie-Filter keine Ergebnisse ergibt? → Empty State wird angezeigt
- Was passiert wenn das Dropdown auf Mobile geöffnet wird? → Native OS-Dropdown wird verwendet
- Was passiert bei Ländern mit Sonderzeichen im Namen? → Kein Problem, da nur englische Ländernamen verwendet werden

---

## Tech Design

### Länderliste (App.jsx, Zeile 78-89)

```javascript
const getCountries = () => {
  const counts = {};
  fintechsData.forEach(f => {
    counts[f.country] = (counts[f.country] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));
};
const countries = getCountries(); // Einmalig bei App-Load berechnet
```

### State Management

```javascript
const [countryFilter, setCountryFilter] = useState('all');
```

### Filterlogik (App.jsx, Zeile 268)

```javascript
if (countryFilter !== 'all' && fintech.country !== countryFilter) return false;
```

### Verfügbare Länder (20 Stück mit Flaggen-Mapping)

```
Germany, Switzerland, Estonia, United Kingdom, Sweden,
Netherlands, Finland, Spain, Norway, Austria, Ireland,
Lithuania, Denmark, France, Belgium, Italy, Portugal,
Poland, Luxembourg, Czech Republic
```

### Component Architecture

```
App.jsx
├── Desktop: Country Dropdown (Zeile 533-566)
│   ├── Globe Icon (absolute positioned)
│   ├── <select> mit custom appearance
│   │   ├── <option value="all">All Countries</option>
│   │   └── countries.map(({ country, count }) => <option>)
│   └── Styling: aktiv = deepNavy, inaktiv = white
└── Mobile: Filter Panel Country Section (Zeile 701-727)
    └── Label "Country" + <select> (full-width, native)
```

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Dropdown funktioniert
- [x] AC-2: Counts werden angezeigt
- [x] AC-3: Sortierung nach Count korrekt
- [x] AC-4: Default "All Countries" korrekt
- [x] AC-5: Globe-Icon vorhanden
- [x] AC-6: Dark-Styling bei Selektion
- [x] AC-7: Kombination mit anderen Filtern korrekt
- [x] AC-8: Mobile-Darstellung korrekt
- [x] AC-9: 20 Länder verfügbar

### Bugs Found
Keine Bugs gefunden.

### Bekannte Limitierungen
- Ländercounts im Dropdown sind statisch (basierend auf Gesamtdaten, nicht auf aktiven Filtern)
- Custom Dropdown-Styling auf Mobile eingeschränkt (OS-native Darstellung)

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
