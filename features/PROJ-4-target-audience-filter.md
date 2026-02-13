# PROJ-4: Target Audience Filter (B2B/B2C)

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich Unternehmen nach Zielgruppe (B2B oder B2C) filtern können, um nur für mich relevante Geschäftsmodelle zu sehen.

---

## Acceptance Criteria

- [x] AC-1: Drei Buttons sind verfügbar: "All", "B2C", "B2B"
- [x] AC-2: "All" ist der Default-Zustand (kein Target-Filter aktiv)
- [x] AC-3: Klick auf B2B/B2C filtert die Ergebnisliste entsprechend
- [x] AC-4: Der aktive Button ist visuell hervorgehoben (Deep Navy Hintergrund, weiße Schrift)
- [x] AC-5: Der Filter kombiniert sich korrekt mit allen anderen aktiven Filtern (AND-Verknüpfung)
- [x] AC-6: Die Ergebnisanzahl aktualisiert sich sofort
- [x] AC-7: Auf Mobile wird der Filter im Filter-Panel unter "Target Audience" angezeigt
- [x] AC-8: Kategorie-Counts aktualisieren sich basierend auf dem Target-Filter

---

## Edge Cases

- Was passiert wenn B2B selektiert und dann B2C geklickt wird? → B2B wird deselektiert, B2C wird selektiert
- Was passiert wenn B2B selektiert und dann "All" geklickt wird? → Filter wird aufgehoben
- Was passiert wenn kein Unternehmen dem kombinierten Filter entspricht? → Empty State wird angezeigt
- Was passiert bei gleichzeitigem Target- und Member-Filter? → Beide werden als AND angewendet

---

## Tech Design

### State Management

```javascript
const [targetFilter, setTargetFilter] = useState('all');
```

### Filterlogik (App.jsx, Zeile 267)

```javascript
if (targetFilter !== 'all' && fintech.target !== targetFilter) return false;
```

### Component Architecture

```
App.jsx
├── Desktop: Target Filter Buttons (Zeile 510-531)
│   └── ButtonGroup: ['all', 'B2C', 'B2B'].map(target => <button>)
│       ├── Active: backgroundColor = deepNavy, color = white
│       └── Inactive: backgroundColor = white, color = deepNavy
└── Mobile: Filter Panel Target Section (Zeile 674-698)
    └── Label "Target Audience" + ButtonGroup (gleiche Logik)
```

### Datenwerte

- `fintech.target` enthält entweder `"B2B"` oder `"B2C"`
- Kein `null` oder leerer Wert möglich – jedes Unternehmen hat einen Target-Wert

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Drei Buttons vorhanden
- [x] AC-2: Default "All" korrekt
- [x] AC-3: Filterung funktioniert
- [x] AC-4: Visuelle Hervorhebung korrekt
- [x] AC-5: Kombination mit anderen Filtern korrekt
- [x] AC-6: Ergebnisanzahl aktualisiert sich
- [x] AC-7: Mobile-Darstellung korrekt
- [x] AC-8: Kategorie-Counts reagieren auf Target-Filter

### Bugs Found
Keine Bugs gefunden.

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
