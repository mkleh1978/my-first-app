# PROJ-1: European FinTech Database – Übersicht & Company Cards

**Status:** 🔵 Planned
**Created:** 2026-02-13
**Last Updated:** 2026-02-13
**Revision:** v3.0 – Column Sorting + Subcategory-Spalte hinzugefügt

---

## Abhängigkeiten

- Keine (Basis-Feature)

---

## User Stories

**US-1:** Als Nutzer möchte ich eine Übersicht aller 10.000+ europäischen FinTech-Unternehmen in einer Tabelle sehen, um den Markt strukturiert zu explorieren.

**US-2:** Als Nutzer möchte ich auf den ersten Blick die wichtigsten Informationen eines Unternehmens (Name, Domain, Kategorie, Land, Gründungsjahr, Total Funding, Mitarbeiterzahl, Status) erkennen, um schnell relevante Unternehmen zu identifizieren.

**US-3:** Als Nutzer möchte ich sehen, wie viele Unternehmen die Datenbank insgesamt enthält, um den Umfang einschätzen zu können.

**US-4:** Als Nutzer möchte ich HoFT-Mitglieder visuell hervorgehoben sehen, um Mitglieder schnell zu erkennen.

**US-5:** Als Nutzer möchte ich durch die Unternehmensliste blättern (Pagination), um auch bei 10.000+ Einträgen schnell navigieren zu können.

**US-6:** Als Nutzer möchte ich bei Klick auf ein Unternehmen ein Detail-Modal mit allen verfügbaren Informationen sehen, inklusive eines **Funding-Timeline-Balkendiagramms** (2010–2025).

**US-7:** Als Nutzer möchte ich die Tabelle durch Klick auf eine Spaltenüberschrift sortieren können (aufsteigend / absteigend / zurück zum Default), um die Daten nach meinen Bedürfnissen zu ordnen.

**US-8:** Als Nutzer möchte ich neben der Kategorie auch die **Subcategory** als eigene Spalte in der Tabelle sehen, um Unternehmen feiner einordnen zu können.

---

## Acceptance Criteria

### Tabellen-Übersicht (Hauptansicht)

- [ ] AC-1: Alle FinTech-Unternehmen werden in einer Tabelle mit folgenden Spalten angezeigt: **Company** (Name + Domain + HoFT-Badge), **Category** (farbcodiertes Badge), **Subcategory**, **Country**, **Founded**, **Total Funding** (formatiert: $1.2B, $340M etc.), **Employees**, **Status** (farbcodiertes Badge)
- [ ] AC-2: Die Tabelle ist server-seitig paginiert (50 Einträge pro Seite) via Supabase
- [ ] AC-3: Pagination-Controls zeigen „Previous / Page X of Y / Next"
- [ ] AC-4: Die Daten werden standardmäßig nach Total Funding absteigend sortiert (höchstes Funding zuerst)
- [ ] AC-5: HoFT-Mitglieder zeigen ein „HoFT"-Badge neben dem Firmennamen
- [ ] AC-6: Tabellenzeilen haben einen Hover-Effekt und sind klickbar (öffnet Detail-Modal)
- [ ] AC-7: Der Header zeigt die Gesamtanzahl der Unternehmen (z.B. „10,156 Companies")
- [ ] AC-8: Status-Badges sind farbcodiert: Operational (grün), Closed (rot), Acquired (gelb)
- [ ] AC-9: Kategorie-Badges sind farbcodiert pro Kategorie (5 Farben)
- [ ] AC-10: Funding-Werte werden menschenlesbar formatiert ($2.7B, $340M, $12K)

### Company Detail Modal

- [ ] AC-11: Bei Klick auf eine Tabellenzeile öffnet sich ein Modal mit allen Unternehmensdaten
- [ ] AC-12: Das Modal zeigt Quick-Stats: Total Funding, Founded, Employees, Status
- [ ] AC-13: Das Modal zeigt Company Info: Location, Region, Target Model, Product Type, Founders/CEOs
- [ ] AC-14: Das Modal zeigt alle Kategorien + Subkategorien (bis zu 3 Paare)
- [ ] AC-15: Das Modal zeigt Produkt-Details: Value Proposition, Problem Solved, Key Features, USP (wenn vorhanden)
- [ ] AC-16: Das Modal zeigt ein **Funding-Timeline-Balkendiagramm** (Recharts) mit den jährlichen Funding-Beträgen von 2010 bis 2025
- [ ] AC-17: Das Funding-Chart zeigt vertikale Balken pro Jahr, die Y-Achse formatiert Beträge menschenlesbar ($M, $B)
- [ ] AC-18: Wenn ein Unternehmen **keine Funding-Daten** hat (alle Jahre leer/0), wird im Chart-Bereich der Hinweis „Keine Funding-Daten verfügbar" angezeigt
- [ ] AC-19: Das Modal zeigt Investors und Top Competitors (wenn vorhanden)
- [ ] AC-20: Das Modal zeigt einen klickbaren Link zur Unternehmens-Website (domain)
- [ ] AC-21: Das Modal ist mit Escape-Taste oder Klick auf den Overlay schließbar
- [ ] AC-22: Das Modal hat einen Close-Button (X) oben rechts

### Header & Layout

- [ ] AC-23: Der Header zeigt „European FinTech Database" als Titel und „House of Finance & Tech Berlin" als Untertitel
- [ ] AC-24: Das Layout ist auf maximal 1280px Breite (max-w-7xl) zentriert

### Spalten-Sortierung (Column Sorting)

- [ ] AC-25: Folgende 5 Spalten sind per Klick auf die Spaltenüberschrift sortierbar: **Company**, **Country**, **Founded**, **Total Funding**, **Employees**
- [ ] AC-26: Nicht-sortierbare Spalten (Category, Subcategory, Status) zeigen KEINE Sortier-Indikatoren
- [ ] AC-27: Jede sortierbare Spalte zeigt ein Pfeil-Icon in der Spaltenüberschrift als Sortier-Indikator (↑ aufsteigend, ↓ absteigend, ↕ neutral/unsortiert)
- [ ] AC-28: Die Sortierung folgt einem **3-Stufen-Toggle**: 1. Klick → Richtung 1, 2. Klick → Richtung 2, 3. Klick → zurück zum Default (Total Funding absteigend)
- [ ] AC-29: **Text-Spalten** (Company, Country) starten beim 1. Klick mit **aufsteigend** (A→Z), 2. Klick = absteigend (Z→A), 3. Klick = Reset
- [ ] AC-30: **Zahlen-Spalten** (Founded, Total Funding, Employees) starten beim 1. Klick mit **absteigend** (höchster Wert zuerst), 2. Klick = aufsteigend, 3. Klick = Reset
- [ ] AC-31: Die Sortierung wird **server-seitig** via Supabase `.order()` ausgeführt (nicht client-seitig), damit sie über alle paginierten Seiten konsistent ist
- [ ] AC-32: Beim Sortier-Wechsel wird automatisch auf Seite 1 zurückgesprungen
- [ ] AC-33: Die Default-Sortierung ist Total Funding absteigend (wie bisher)
- [ ] AC-34: Es kann immer nur EINE Spalte gleichzeitig sortiert sein (kein Multi-Sort)

### Subcategory-Spalte

- [ ] AC-35: Die Tabelle zeigt eine eigene **Subcategory**-Spalte rechts neben der Category-Spalte
- [ ] AC-36: Die Subcategory wird als einfacher Text angezeigt (kein Badge, im Gegensatz zur Category)
- [ ] AC-37: Wenn subcategory_1 leer/null ist, wird „-" angezeigt

---

## Edge Cases

1. **Unternehmen ohne Beschreibung:** description_en ist null → Feld wird im Modal nicht angezeigt
2. **Unternehmen ohne Standort:** city/country ist null → „-" wird in der Tabelle angezeigt
3. **Unternehmen ohne Funding:** total_funding ist null oder „0" → „-" wird in der Tabelle angezeigt
4. **Unternehmen ohne Mitarbeiterzahl:** number_of_employees ist null → „-" wird angezeigt
5. **Funding-Chart ohne Daten:** Alle funding_20XX Felder sind null/0 → Hinweistext „Keine Funding-Daten verfügbar" statt leerem Chart
6. **Funding-Chart mit nur 1 Jahr Daten:** Nur ein einzelner Balken wird angezeigt, Chart ist dennoch funktional
7. **Sehr hohe Funding-Werte:** z.B. $2.6B → Y-Achse skaliert automatisch (Recharts Auto-Scaling)
8. **Floating-Point Werte:** founded_year = „2013.0" → Wird als „2013" angezeigt (Integer-Formatting)
9. **Sehr lange Firmennamen:** CSS sorgt für Umbruch, kein Overflow
10. **Leere Supabase-Response:** Wenn die Abfrage 0 Ergebnisse liefert → „No companies found" mit Hinweis anzeigen
11. **Supabase Connection Error:** Fehler beim Laden → Loading-Spinner bleibt, keine Crash
12. **Sortierung bei NULL-Werten:** Unternehmen ohne Wert (z.B. NULL in founded_year) werden bei aufsteigender Sortierung ans Ende sortiert (NULLS LAST)
13. **Sortierung + Filter-Kombination:** Wenn Filter aktiv sind und Sortierung geändert wird, bleiben Filter erhalten, nur die Reihenfolge ändert sich
14. **Subcategory ohne Category:** Theoretisch möglich → Subcategory wird trotzdem angezeigt
15. **Sortier-Reset bei Filter-Änderung:** Wenn ein neuer Filter gesetzt wird, bleibt die aktuelle Sortierung erhalten (kein Reset)

---

## Technische Anforderungen

### Datenquelle
- **Supabase-Tabelle:** `FinWell_data` (10.156 Einträge, 49 Spalten)
- **Client:** `@supabase/supabase-js` v2.95.3 via `src/lib/supabase.ts`
- **Pagination:** Server-seitig via `.range()` (50 pro Seite)

### Datenmodell (Supabase Spalten)

```
Basis:          id, company_name, domain, description_en, company_status, member
Klassifikation: category_1/2/3, subcategory_1/2/3, target_model, product_type
Standort:       headquarters, city, country, region
Finanzen:       total_funding, funding_2010–2025, latest_round, latest_round_year, investors
Team:           founders_ceos, number_of_employees, founded_year
Produkt:        core_value_proposition, problem_solved, key_features,
                competitive_advantage_usp, integration_capabilities, top_competitors
Meta:           analysis_status, formation_year_verified
```

### Kategorie-Konfiguration (5 Hauptkategorien)

| Kategorie | Badge-Farbe |
|-----------|-------------|
| Financial Education | Lila (purple) |
| Financial Foundation | Blau (blue) |
| Infrastructure & Technology | Slate (grau) |
| Investment & Wealth Building | Grün (green) |
| Risk Protection | Orange |

### Component Architecture (Next.js 16 App Router)

```
src/app/page.tsx              – Hauptseite (Client Component)
├── Header                    – Titel + Gesamtanzahl
├── FilterPanel               – (→ siehe PROJ-2 bis PROJ-6)
├── CompanyTable              – Tabelle mit Pagination + Column Sorting
│   ├── SortableHeader        – Klickbare Spaltenüberschrift mit Sortier-Pfeil
│   ├── CategoryBadge         – Farbcodiertes Kategorie-Badge
│   ├── Subcategory-Spalte    – Eigene Textspalte (NEU!)
│   └── StatusBadge           – Farbcodiertes Status-Badge
├── Pagination Controls       – Previous / Page X of Y / Next
└── CompanyDetailModal        – Alle Unternehmensdetails
    ├── Quick Stats           – Funding, Founded, Employees, Status
    ├── Company Info           – Location, Target Model, Founders
    ├── Categories             – Bis zu 3 Kategorie/Subkategorie-Paare
    ├── Product Details        – USP, Value Prop, Key Features
    ├── FundingChart           – Recharts Balkendiagramm (2010–2025)
    ├── Investors              – Investoren-Liste
    └── Top Competitors        – Wettbewerber-Liste
```

### Neue Dependency

- **recharts** – React-basierte Chart-Bibliothek für das Funding-Timeline-Balkendiagramm

### Performance

- Server-seitige Pagination: Max 50 Zeilen pro Request
- Debounced Search (300ms)
- Supabase-Abfrage mit `.select()` statt `*` (nur benötigte Spalten)

---

## Tech-Design (Solution Architect)

### Branding-Grundlage (aus Branding Guidelines.pdf)

Das gesamte Design folgt den offiziellen HoFT Branding Guidelines (Januar 2026):

```
Farbpalette:
├── #170245 Deep Navy     → Primärfarbe: Text, Headlines, Buttons
├── #006B6B Teal          → Sekundärfarbe: Links, Akzente, Chart-Balken
├── #FFFFFF Weiß          → Hintergründe, Karten
├── #F2F3F5 Off-White     → Sektion-Hintergründe, alternating areas
└── #EA5A3C Orange        → Highlight, Hover-Effekte, Call-to-Action

Typografie:
├── Geist Bold/Medium     → Headlines (bereits installiert ✅)
├── Geist Regular         → Body Text, Buttons
└── Farbe: Deep Navy (#170245) für alle Texte

Design-Prinzipien:
├── Großzügiger Whitespace (Elemente nicht zusammendrängen)
├── Card-Based Layouts (subtile Schatten oder Borders)
├── Buttons: Abgerundete Ecken (8px), solide Füllung, klare Hover-States
└── Icons: Einfache Linien-Icons, einheitliche Strichstärke
```

### Bestandsaufnahme – Was existiert bereits?

```
Bereits implementiert (v2.0 ✅):
├── Hauptseite (page.tsx)          → Header (Navy), Layout, Pagination ✅
├── CompanyTable                   → Tabelle mit 7 Spalten, Badges, Hover ✅
├── CompanyDetailModal             → Quick Stats, Info, Kategorien, Produkt, Investors ✅
├── FundingChart                   → Recharts Balkendiagramm ✅
├── FilterPanel                    → Suche + Filter ✅
├── globals.css                    → HoFT Branding Farben ✅
└── Supabase-Anbindung             → Pagination, Filtering, Suche ✅

Noch NICHT implementiert (v3.0 – NEU):
├── Column Sorting                 → Spaltenüberschriften sind nicht klickbar
│   ├── Sortierung hardcoded auf total_funding DESC
│   ├── CompanyTable akzeptiert keinen Sort-State als Prop
│   └── Kein SortConfig-Type vorhanden
└── Subcategory-Spalte             → subcategory_1 wird geladen, aber nicht in der Tabelle gezeigt
```

### Was muss geändert werden? (v3.0)

**Zwei neue Aufgaben:** Column Sorting + Subcategory-Spalte

(Aufgaben 1 + 2 — Branding + FundingChart — sind bereits umgesetzt ✅)

#### Aufgabe 1: Branding-Anpassung (gesamte App)

Die Farb-Variablen in globals.css müssen auf die HoFT-Palette umgestellt werden:

```
Farbänderungen (Alt → Neu):
├── Primärfarbe:    #1e40af (Blau)     → #170245 (Deep Navy)
├── Sekundärfarbe:  #3b82f6 (Hellblau) → #006B6B (Teal)
├── Akzentfarbe:    #0ea5e9 (Cyan)     → #EA5A3C (Orange)
├── Hintergrund:    #f8fafc (Slate)    → #F2F3F5 (Off-White)
├── Oberfläche:     #ffffff            → #FFFFFF (bleibt)
├── Border:         #e2e8f0            → passend zu Off-White anpassen
├── Muted Text:     #64748b            → Charcoal / abgeschwächtes Navy
└── Dark Mode:      Anpassung an Navy-Töne statt Slate-Töne
```

Auswirkung auf Komponenten:

```
Betroffene Dateien:
├── globals.css                    → Farb-Variablen umstellen
├── CompanyTable                   → Badge-Farben an Branding anpassen
│   ├── HoFT-Badge: Teal statt Blau
│   └── Hover: dezenter, On-Brand
├── CompanyDetailModal             → Link-Farbe auf Teal, Button auf Deep Navy
├── FilterPanel                    → Input-Focus auf Teal, Buttons auf Navy/Off-White
└── page.tsx (Header)              → Header-Styling an Branding anpassen
```

#### Aufgabe 2: Neues FundingChart (AC-16, AC-17, AC-18)

```
CompanyDetailModal (bestehend)
├── Quick Stats                    → Branding-Farben aktualisieren
├── Company Info                   → Branding-Farben aktualisieren
├── Categories                     → Branding-Farben aktualisieren
├── Product Details                → Branding-Farben aktualisieren
├── ★ FundingChart (NEU!)          → Recharts Balkendiagramm
│   ├── X-Achse: Jahre (2010–2025), Geist Regular, Deep Navy
│   ├── Y-Achse: Funding-Betrag ($M/$B Format), Deep Navy
│   ├── Balken: Teal (#006B6B) als Füllfarbe
│   ├── Balken Hover: Orange (#EA5A3C) beim Überfahren
│   ├── Tooltip: Weißer Hintergrund, Deep Navy Text, exakter Betrag
│   └── Leer-Zustand: "Keine Funding-Daten verfügbar" (Muted Text)
├── Investors                      → Branding-Farben aktualisieren
└── Top Competitors                → Branding-Farben aktualisieren
```

#### Aufgabe 3: Column Sorting (AC-25 bis AC-34)

**Welche Spalten werden sortierbar?**

```
Sortierbare Spalten (5 von 8):
├── Company (company_name)         → Text: 1. Klick A→Z, 2. Klick Z→A, 3. Reset
├── Country (country)              → Text: 1. Klick A→Z, 2. Klick Z→A, 3. Reset
├── Founded (founded_year)         → Zahl: 1. Klick höchste, 2. Klick niedrigste, 3. Reset
├── Total Funding (total_funding)  → Zahl: 1. Klick höchste, 2. Klick niedrigste, 3. Reset
└── Employees (number_of_employees)→ Zahl: 1. Klick höchste, 2. Klick niedrigste, 3. Reset

Nicht sortierbar (kein Pfeil-Icon):
├── Category (category_1)
├── Subcategory (subcategory_1)
└── Status (company_status)
```

**Wie sieht der Sortier-Indikator aus?**

```
Spaltenüberschrift-Layout:
┌──────────────────────────┐
│  Company Name       ↕    │  ← Neutral (unsortiert, dezenter Pfeil)
│  Company Name       ↑    │  ← Aufsteigend (A→Z)
│  Company Name       ↓    │  ← Absteigend (Z→A)
│  Category                │  ← Nicht sortierbar (kein Pfeil)
└──────────────────────────┘

Hover: Spaltenüberschrift bekommt dezenten Hover-Effekt (cursor: pointer)
```

**Wo „lebt" der Sort-State?**

```
Datenfluss für Sortierung:

page.tsx (Hauptseite)
├── Sort-State wird hier verwaltet
│   ├── Welche Spalte? (z.B. "company_name")
│   ├── Welche Richtung? ("asc" / "desc" / null)
│   └── Default: total_funding absteigend
│
├── Sort-State wird an CompanyTable übergeben
│   └── CompanyTable zeigt Pfeil-Icons je nach State
│
├── Sort-Change-Handler wird an CompanyTable übergeben
│   └── CompanyTable ruft Handler auf bei Klick auf Spaltenüberschrift
│
└── Supabase-Query benutzt Sort-State
    ├── .order(aktive_spalte, { ascending: richtung })
    ├── NULLS LAST (Leer-Werte immer ans Ende)
    └── Bei Sort-Wechsel → automatisch zurück auf Seite 1
```

**3-Stufen-Toggle-Logik:**

```
Beispiel: User klickt auf "Company"

Zustand 0: Total Funding ↓ (Default)
    │ Klick auf "Company"
    ▼
Zustand 1: Company ↑ (A→Z)
    │ Klick auf "Company"
    ▼
Zustand 2: Company ↓ (Z→A)
    │ Klick auf "Company"
    ▼
Zustand 0: Total Funding ↓ (zurück zum Default)

Wenn User ANDERE Spalte klickt → sofort in Stufe 1 der neuen Spalte
```

#### Aufgabe 4: Subcategory-Spalte (AC-35 bis AC-37)

```
CompanyTable – Spalten (8 statt bisher 7):
├── Company (Name + Domain + HoFT-Badge)
├── Category (farbcodiertes Badge)
├── Subcategory (NEU! – einfacher Text, „-" bei null)
├── Country
├── Founded
├── Total Funding
├── Employees
└── Status

Daten: subcategory_1 wird bereits aus Supabase geladen → Keine Query-Änderung nötig!
```

### Daten-Fluss für FundingChart

```
Daten sind bereits vorhanden!

Die 16 Funding-Felder (funding_2010 bis funding_2025) werden
schon heute mit jedem Unternehmen aus Supabase geladen.

→ Die bestehende Funding-Tabelle (HTML) im Modal wird ERSETZT
  durch das visuelle Balkendiagramm.

Jeder Balken zeigt:
- Jahr (z.B. 2021)
- Betrag (z.B. $340M)
- Nur Jahre mit Funding > 0 werden als Balken dargestellt
- Balken-Farbe: Teal (#006B6B), Hover: Orange (#EA5A3C)
```

### Tech-Entscheidungen

```
Warum Recharts für das Balkendiagramm? (v2.0, bereits umgesetzt ✅)
→ React-nativ, leichtgewichtig (~40KB gzip), responsive out-of-the-box
→ Perfekt für einfache Bar Charts ohne Overhead
→ Automatische Y-Achsen-Skalierung (von $10K bis $2.6B)
→ Eingebaute Tooltips und Achsen-Formatierung

Warum Server-seitige Sortierung statt Client-seitig? (v3.0)
→ Bei 10.000+ Einträgen mit Pagination MUSS die Datenbank sortieren
→ Client kennt nur die aktuelle Seite (50 Einträge), nicht alle Daten
→ Supabase .order() ist optimiert und nutzt Datenbank-Indizes
→ Garantiert konsistente Ergebnisse über alle Seiten hinweg

Warum 3-Stufen-Toggle statt nur Asc/Desc? (v3.0)
→ User können jederzeit zum Default-Zustand zurück (Total Funding ↓)
→ Intuitiver als einen separaten "Reset"-Button
→ Gängiges UX-Pattern (z.B. MUI DataGrid, AG Grid)

Warum spaltenabhängiger Erst-Klick? (v3.0)
→ Text-Spalten: A→Z ist natürlicher Start (alphabetisch)
→ Zahlen-Spalten: Höchster Wert zuerst ist nützlicher (Top-Funding, meiste Mitarbeiter)
→ Reduziert Klickaufwand zum gewünschten Ergebnis

Warum Subcategory als eigene Spalte statt unter Category? (v3.0)
→ Klarere Trennung der Informationen
→ Einfacher visuell zu scannen in der Tabelle
→ subcategory_1 Daten sind bereits in der Supabase-Query enthalten
```

### Dependencies

```
Bereits installiert (keine neuen Packages nötig für v3.0!):
- recharts ✅
- @supabase/supabase-js ✅
- next, react, tailwindcss ✅
- Geist Font ✅

Column Sorting + Subcategory benötigen KEINE neuen Dependencies.
```

### Aufwand-Einschätzung (v3.0)

```
Neue Dateien:       0 (alles in bestehenden Dateien)
Geänderte Dateien:  3

Betroffene Dateien:
├── CompanyTable.tsx    → Sortierbare Header-Zellen + Subcategory-Spalte
│   ├── Neue Props: sortColumn, sortDirection, onSortChange
│   ├── SortableHeader-Zellen mit Pfeil-Icons
│   ├── Neue <th> + <td> für Subcategory
│   └── Cursor + Hover für klickbare Überschriften
│
├── page.tsx            → Sort-State Management + Supabase .order() Anpassung
│   ├── Neuer State: sortColumn + sortDirection
│   ├── handleSortChange-Funktion (3-Stufen-Toggle)
│   ├── Supabase .order() dynamisch statt hardcoded
│   └── setPage(0) bei Sort-Wechsel
│
└── types/fintech.ts    → SortConfig Type
    └── Sortier-Konfiguration als Type (Spalte + Richtung)

Umfang: Mittel (kein neues Package, kein Backend-Change, nur UI-Logik)
```

---

## Abgrenzung (Out of Scope für PROJ-1)

- Column Picker (wählbare Spalten) → ggf. separates Feature
- Karten-Grid-Ansicht (alternativ zur Tabelle) → ggf. separates Feature
- Virtual Scrolling / Infinite Scroll → nicht nötig bei 50er-Pagination
- Multi-Column-Sort (mehrere Spalten gleichzeitig sortieren) → nicht nötig
- Watchlist/Favorites → siehe PROJ-7
- Excel Export → siehe PROJ-8
- Filter (Search, Category, Country etc.) → siehe PROJ-2 bis PROJ-6
- Responsive/Mobile → siehe PROJ-10

---

## QA Test Results

**Tested:** 2026-02-13
**Method:** Code Review gegen alle Acceptance Criteria + Security Audit
**Build:** `npm run build` ✅ (Turbopack, 11.5s)
**Lint:** Nur pre-existierende shadcn/ui Warnings (nicht unser Code)

### Acceptance Criteria Status

#### Tabellen-Übersicht (AC-1 bis AC-10)

- [x] AC-1: Tabelle zeigt 8 Spalten: Company, Category, Subcategory, Country, Founded, Total Funding, Employees, Status ✅
- [x] AC-2: Server-seitige Pagination (PAGE_SIZE=50, Supabase .range()) ✅
- [x] AC-3: Pagination: "Previous / Page X of Y / Next" ✅
- [x] AC-4: Default-Sort = Total Funding absteigend (DEFAULT_SORT) ✅
- [x] AC-5: HoFT-Badge neben Firmennamen ✅
- [x] AC-6: Hover-Effekt (hover:bg-teal/5) + cursor-pointer ✅
- [x] AC-7: Header zeigt "{totalCount} Companies" ✅
- [x] AC-8: Status-Badges farbcodiert (emerald/red/amber) ✅
- [x] AC-9: Kategorie-Badges farbcodiert (5 Farben) ✅
- [x] AC-10: Funding menschenlesbar ($2.7B, $340M, $12K) ✅

#### Company Detail Modal (AC-11 bis AC-22)

- [x] AC-11: Klick auf Zeile öffnet Modal ✅
- [x] AC-12: Quick Stats (Funding, Founded, Employees, Status) ✅
- [x] AC-13: Company Info (Location, Region, Target Model, Product Type, Founders) ✅
- [x] AC-14: Kategorien + Subkategorien (bis zu 3 Paare) ✅
- [x] AC-15: Product Details (Value Prop, Problem, Features, USP) ✅
- [x] AC-16: Funding-Timeline-Balkendiagramm (Recharts) ✅
- [x] AC-17: Vertikale Balken, Y-Achse formatiert ($M, $B) ✅
- [x] AC-18: "Keine Funding-Daten verfügbar" bei leeren Daten ✅
- [x] AC-19: Investors + Top Competitors (wenn vorhanden) ✅
- [x] AC-20: Klickbarer Domain-Link (target="_blank", rel="noopener noreferrer") ✅
- [x] AC-21: Escape + Overlay-Klick schließt Modal ✅
- [x] AC-22: Close-Button (X) oben rechts ✅

#### Header & Layout (AC-23 bis AC-24)

- [x] AC-23: "European FinTech Database" + "House of Finance & Tech Berlin" ✅
- [x] AC-24: max-w-7xl zentriert ✅

#### Spalten-Sortierung (AC-25 bis AC-34)

- [x] AC-25: 5 Spalten sortierbar (Company, Country, Founded, Total Funding, Employees) ✅
- [x] AC-26: Category, Subcategory, Status ohne Sortier-Indikatoren ✅
- [x] AC-27: Pfeil-Icons (↕ neutral, ↑ asc, ↓ desc) — aktive Pfeile in Teal ✅
- [x] AC-28: 3-Stufen-Toggle implementiert ✅
- [x] AC-29: Text-Spalten starten A→Z (ascending) ✅
- [x] AC-30: Zahlen-Spalten starten höchster Wert zuerst (descending) ✅
- [x] AC-31: Server-seitig via Supabase .order() ✅
- [x] AC-32: Sort-Wechsel → setPage(0) via useEffect ✅
- [x] AC-33: Default = total_funding desc ✅
- [x] AC-34: Single-Sort (SortConfig hat nur eine column) ✅

#### Subcategory-Spalte (AC-35 bis AC-37)

- [x] AC-35: Eigene Spalte rechts neben Category ✅
- [x] AC-36: Einfacher Text (kein Badge) ✅
- [x] AC-37: Null → "-" (via `?? "-"`) ✅

### Edge Cases Status

- [x] EC-1: Keine Beschreibung → nicht im Modal angezeigt ✅
- [x] EC-2: Kein Land → "-" in Tabelle ✅
- [x] EC-3: Kein Funding → "-" in Tabelle ✅
- [x] EC-4: Keine Mitarbeiter → "-" ✅
- [x] EC-5: Keine Funding-Daten → Hinweistext ✅
- [x] EC-6: Nur 1 Jahr Funding → einzelner Balken ✅
- [x] EC-7: Sehr hohe Werte → Recharts Auto-Scaling ✅
- [x] EC-8: Float-Jahre (2013.0) → "2013" (Math.round) ✅
- [x] EC-9: Lange Firmennamen → CSS Wrapping ✅
- [x] EC-10: Leere Response → "No companies found" ✅
- [ ] ⚠️ EC-11: Supabase Connection Error → Kein explizites Error-Handling (siehe BUG-1)
- [x] EC-12: NULL in Sort → NULLS LAST (nullsFirst: false) ✅
- [x] EC-13: Sort + Filter → Filter bleiben erhalten ✅
- [x] EC-14: Subcategory ohne Category → wird trotzdem angezeigt ✅
- [x] EC-15: Sort bleibt bei Filter-Änderung → erhalten ✅

### Security Audit (Red-Team)

#### RLS-Policies
- ✅ `FinWell_data` hat RLS enabled + SELECT-only Policy für anon
- ✅ Keine INSERT/UPDATE/DELETE Policies → Schreibzugriff blockiert
- ✅ Domain-Links mit `rel="noopener noreferrer"` (Tab-Nabbing verhindert)
- ✅ Supabase PostgREST parametrisiert Queries (kein direktes SQL-Injection-Risiko)

#### Gefundene Security-Hinweise
- ⚠️ Supabase Anon Key ist `NEXT_PUBLIC_` (bewusst öffentlich, RLS schützt) — OK für interne App
- ⚠️ Search-Input: LIKE-Wildcards (`%`, `_`) werden nicht escaped — Low Risk, kann breitere Suchergebnisse liefern

### Bugs Found

#### BUG-1: Kein Error-Handling bei fehlgeschlagener Supabase-Query
- **Severity:** Medium
- **Datei:** page.tsx, fetchCompanies (Zeile 70-127)
- **Problem:** `const { data, count } = await query;` prüft nicht auf `error`
- **Auswirkung:** Bei Netzwerkfehler/Supabase-Ausfall zeigt die App "No companies found" statt einer Fehlermeldung
- **Expected:** Fehlermeldung wie "Verbindung fehlgeschlagen. Bitte versuche es erneut."
- **Priority:** Medium (UX-Issue, kein Datenverlust)

### Summary

- ✅ **37 von 37 Acceptance Criteria bestanden**
- ✅ **14 von 15 Edge Cases bestanden**
- ⚠️ **1 Edge Case teilweise** (EC-11: Error-Handling)
- ⚠️ **1 Bug gefunden** (Medium: fehlende Fehlerbehandlung)
- ✅ **Security:** Keine kritischen Sicherheitslücken
- ✅ **Build:** Kompiliert fehlerfrei
- ✅ **TypeScript:** Keine Type-Errors

### Recommendation

✅ **Production-Ready** — Feature ist funktional vollständig und sicher.

BUG-1 (Error-Handling) ist ein Medium-Issue, das in einem Follow-Up behoben werden kann. Es verursacht keinen Datenverlust und die App crasht nicht — sie zeigt lediglich eine irreführende Meldung bei Netzwerkproblemen.
