# PROJ-3: Category & Subcategory Filtering

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich Unternehmen nach Hauptkategorien filtern können, um gezielt einen FinTech-Bereich zu explorieren.

**US-2:** Als Nutzer möchte ich innerhalb einer Kategorie nach Unterkategorien filtern können, um noch spezifischere Ergebnisse zu erhalten.

**US-3:** Als Nutzer möchte ich auf einen Blick sehen, wie viele Unternehmen es pro Kategorie gibt, um die Größe der einzelnen Bereiche einzuschätzen.

---

## Acceptance Criteria

- [x] AC-1: 5 Kategorie-Karten werden in einem Grid auf Desktop angezeigt
- [x] AC-2: Jede Karte zeigt: Kategorie-Icon (farbcodiert), Kategoriename, dynamische Anzahl
- [x] AC-3: Klick auf Kategorie filtert die Unternehmensliste; erneuter Klick hebt den Filter auf (Toggle)
- [x] AC-4: Selektierte Kategorie wird visuell hervorgehoben (Hintergrundfarbe = Kategoriefarbe)
- [x] AC-5: Jede Kategorie ist per Chevron-Icon auf-/zuklappbar für Subcategories
- [x] AC-6: Subcategories zeigen jeweils die dynamische Anzahl an
- [x] AC-7: Klick auf Subcategory filtert zusätzlich; erneuter Klick hebt den Subcategory-Filter auf
- [x] AC-8: Selektierte Subcategory wird visuell hervorgehoben (Hintergrundfarbe = Kategoriefarbe)
- [x] AC-9: Kategorie-Counts aktualisieren sich dynamisch basierend auf anderen aktiven Filtern (Suche, Land, B2B/B2C, Member)
- [x] AC-10: Auf Mobile werden Kategorien im Filter-Panel angezeigt (nicht als Karten)
- [x] AC-11: Kategoriekarten haben eine fixe Höhe (110px) für einheitliche Darstellung

---

## Edge Cases

- Was passiert wenn Kategorie selektiert und dann Subcategory gewählt wird? → Beide Filter aktiv, Subcategory grenzt Kategorie weiter ein
- Was passiert wenn Subcategory selektiert und andere Kategorie geklickt wird? → Subcategory wird zurückgesetzt, neue Kategorie wird selektiert
- Was passiert wenn aktive Filter die Kategorie-Counts auf 0 reduzieren? → Karte zeigt "0", ist aber weiterhin klickbar
- Was passiert wenn Kategorie selektiert und dann per Reset-Button zurückgesetzt wird? → Beide Filter (Kategorie + Subcategory) werden zurückgesetzt
- Was passiert wenn mehrere Chevrons gleichzeitig geöffnet sind? → Mehrere Kategorien können gleichzeitig expandiert sein

---

## Tech Design

### Kategoriekonfiguration (App.jsx, Zeile 92-146)

```javascript
const categoryConfig = {
  'Financial Education': {
    icon: GraduationCap,
    color: '#9333EA',
    subcategories: ['Adult Education & Coaching', 'Digital Learning Formats',
                    'Media-Based Financial Education', 'School-Based Financial Education']
  },
  'Financial Foundation': {
    icon: Wallet,
    color: '#006B6B',
    subcategories: ['Budget Optimization & Expense Planning', 'Debt Management & Credit',
                    'Emergency Fund & Savings', 'Liquidity Management']
  },
  'Infrastructure & Technology': {
    icon: Cpu,
    color: '#3B82F6',
    subcategories: ['Data Integration & APIs', 'Data Processing & Analytics',
                    'Digital Identity & Authentication', 'Orchestration & Platform Technology',
                    'Scoring & Risk Analytics']
  },
  'Investment & Wealth Building': {
    icon: TrendingUp,
    color: '#059669',
    subcategories: ['Capital Investment & Trading', 'Real Estate as Investment/Provision',
                    'Retirement & Pension Planning', 'Savings Plans & Automation',
                    'Wealth Management & Advisory']
  },
  'Risk Protection': {
    icon: Shield,
    color: '#DC2626',
    subcategories: ['Care & Health Protection', 'Income Protection', 'Legal Protection',
                    'Life Risk Protection', 'Property Insurance']
  }
};
```

### State Management

```javascript
const [selectedCategory, setSelectedCategory] = useState(null);
const [selectedSubcategory, setSelectedSubcategory] = useState(null);
const [expandedCategories, setExpandedCategories] = useState({});
```

### Dynamische Counts (App.jsx, Zeile 274-295)

```javascript
// Kategorie-Counts: basieren auf baseFilteredData (ohne Kategorie-Filter)
const categoryCounts = useMemo(() => {
  const counts = {};
  baseFilteredData.forEach(f => { counts[f.category] = (counts[f.category] || 0) + 1; });
  return counts;
}, [baseFilteredData]);

// Subcategory-Counts: basieren auf baseFilteredData + selektierter Kategorie
const subcategoryCounts = useMemo(() => {
  const counts = {};
  const dataToCount = selectedCategory
    ? baseFilteredData.filter(f => f.category === selectedCategory)
    : baseFilteredData;
  dataToCount.forEach(f => {
    const key = `${f.category}|${f.subcategory}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}, [baseFilteredData, selectedCategory]);
```

### Event Handler (App.jsx, Zeile 338-372)

```
handleCategoryClick(category)
├── Gleiche Kategorie → Deselect (null)
└── Andere Kategorie → Select + Subcategory reset + Auto-Expand

handleSubcategoryClick(category, subcategory, e)
├── Gleiche Subcategory → Deselect (null)
└── Andere Subcategory → Select Category + Subcategory

toggleExpand(category, e)
└── Toggle expandedCategories[category]
```

### Component Architecture

```
App.jsx
├── Desktop: Category Cards Grid (Zeile 883-1013)
│   └── Category Card (je 5)
│       ├── Icon + Count + Chevron
│       ├── Category Name (zentriert)
│       └── Subcategory List (expandable)
│           └── Subcategory Item (Name + Count)
└── Mobile: Filter Panel Category Section (Zeile 776-830)
    └── Category Buttons (vertikal, full-width)
```

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: 5 Karten werden korrekt angezeigt
- [x] AC-2: Icons, Namen, Counts korrekt
- [x] AC-3: Toggle-Verhalten funktioniert
- [x] AC-4: Visuelle Hervorhebung korrekt
- [x] AC-5: Chevron expand/collapse funktioniert
- [x] AC-6: Subcategory-Counts korrekt
- [x] AC-7: Subcategory Toggle funktioniert
- [x] AC-8: Subcategory-Hervorhebung korrekt
- [x] AC-9: Dynamische Counts aktualisieren sich korrekt
- [x] AC-10: Mobile-Darstellung im Filter-Panel
- [x] AC-11: Fixe Kartenhöhe 110px bestätigt

### Bugs Found
Keine Bugs gefunden.

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
