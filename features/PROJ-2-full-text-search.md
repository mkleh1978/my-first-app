# PROJ-2: Full-Text Search

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich nach Unternehmen suchen können, um gezielt bestimmte Firmen oder Themen zu finden.

**US-2:** Als Nutzer möchte ich, dass die Suchergebnisse sofort beim Tippen aktualisiert werden, damit ich schnell die richtigen Unternehmen finde.

---

## Acceptance Criteria

- [x] AC-1: Ein Suchfeld ist prominent in der Filter-Leiste positioniert
- [x] AC-2: Die Suche durchsucht: Firmenname, Domain, Beschreibung, Hauptsitz
- [x] AC-3: Die Filterung erfolgt in Echtzeit beim Tippen (kein Submit-Button nötig)
- [x] AC-4: Die Suche ist case-insensitive
- [x] AC-5: Das Suchfeld hat ein Such-Icon (Lupe) als visuellen Hinweis
- [x] AC-6: Der Placeholder-Text lautet "Search companies..."
- [x] AC-7: Die Suche kombiniert sich korrekt mit allen anderen aktiven Filtern
- [x] AC-8: Die Ergebnisanzeige aktualisiert die Anzahl der gefundenen Unternehmen

---

## Edge Cases

- Was passiert bei leerer Suche? → Alle Unternehmen werden angezeigt (kein Filter aktiv)
- Was passiert bei Sonderzeichen in der Suche? → Wird als normaler String behandelt (kein Regex)
- Was passiert wenn keine Ergebnisse gefunden werden? → Empty State: "No companies found matching your filters" + Reset-Button
- Was passiert bei sehr langen Suchbegriffen? → Eingabe wird nicht begrenzt, CSS verhindert Überlauf
- Was passiert bei kombinierter Suche + Kategorie-Filter? → Beide Filter werden gleichzeitig angewendet (AND-Verknüpfung)
- Was passiert bei Suche nach Teilen eines Worts? → Substring-Matching funktioniert (z.B. "bank" findet "Banking")

---

## Tech Design

### State Management

```javascript
const [searchTerm, setSearchTerm] = useState('');
```

### Suchlogik (App.jsx, Zeile 260-266)

```javascript
const baseFilteredData = useMemo(() => {
  return fintechsData.filter(fintech => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const searchableText = `${fintech.name} ${fintech.domain} ${fintech.description} ${fintech.headquarters}`.toLowerCase();
      if (!searchableText.includes(term)) return false;
    }
    // ... weitere Filter
  });
}, [searchTerm, targetFilter, countryFilter, memberFilter]);
```

### Durchsuchte Felder

| Feld | Beispiel |
|------|----------|
| `name` | "N26", "Trade Republic" |
| `domain` | "n26.com" |
| `description` | "Provider of digital banking services..." |
| `headquarters` | "Berlin", "Vienna" |

### Component Architecture

```
App.jsx
└── Search Input (Zeile 444-467)
    ├── Search Icon (lucide-react)
    ├── <input type="text">
    │   ├── value={searchTerm}
    │   ├── onChange → setSearchTerm
    │   └── placeholder="Search companies..."
    └── Styling: Inline Styles, 14px, 8px border-radius
```

### Performance

- **Kein Debounce:** Jeder Tastendruck triggert Re-Render + useMemo-Neuberechnung
- **useMemo:** Filterergebnis wird gecached, Neuberechnung nur bei Dependency-Änderung
- **Komplexität:** O(n) über 5.733 Einträge bei jedem Tastendruck

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Suchfeld ist sichtbar und korrekt positioniert
- [x] AC-2: Suche durchsucht alle 4 Felder korrekt
- [x] AC-3: Echtzeit-Filterung funktioniert
- [x] AC-4: Case-insensitive Suche bestätigt
- [x] AC-5: Such-Icon vorhanden
- [x] AC-6: Placeholder korrekt
- [x] AC-7: Kombination mit anderen Filtern funktioniert
- [x] AC-8: Ergebniszähler aktualisiert sich

### Bugs Found
Keine Bugs gefunden.

### Bekannte Limitierungen
- Kein Debounce implementiert – bei sehr schnellem Tippen könnten Performance-Einbußen auftreten
- Keine Suchhistorie oder Suchvorschläge (Autocomplete)
- Keine Fuzzy-Suche oder Volltextindizierung

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
