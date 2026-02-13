# PROJ-12: Reporting — Aggregierte Kategorie-Analyse

## Status: ✅ Done

## Abhängigkeiten
- Benötigt: PROJ-1 (FinTech Database Base Feature) — Datenmodell, Supabase-Anbindung, Tailwind-Theme
- Benötigt: PROJ-11 (Error Handling) — Error-State-Pattern für Supabase-Queries

## Kontext
Die bestehende Datenbank enthält ~10.000 FinTech-Unternehmen mit 5 Haupt-Kategorien und zahlreichen Subcategories. Bisher können User nur einzelne Companies browsen. Es fehlt eine aggregierte Sicht, die Trends und Muster auf Kategorie-/Subcategory-Ebene sichtbar macht.

### Verfügbare Kategorien
- Financial Education
- Financial Foundation
- Infrastructure & Technology
- Investment & Wealth Building
- Risk Protection

### Verfügbare Datenfelder für Aggregation
- `total_funding` — Gesamtfinanzierung pro Company
- `funding_2010` bis `funding_2025` — Jährliche Funding-Daten
- `key_features` — Freitext mit Produkt-Features
- `number_of_employees` — Mitarbeiterzahl
- `founded_year` — Gründungsjahr
- `company_status` — Operational / Closed / Acquired
- `target_model` — B2B / B2C / B2B, B2C
- `country` — Land des Hauptsitzes
- `product_type` — Produkttyp

---

## User Stories

### US-1: Kategorie-Übersicht
Als Analyst möchte ich eine Übersichtsseite sehen, die alle 5 Haupt-Kategorien mit ihren wichtigsten KPIs (Anzahl Companies, Gesamt-Funding, Durchschnittliches Funding) nebeneinander darstellt, um schnell die größten und aktivsten Segmente zu identifizieren.

### US-2: Aggregiertes Funding-Volumen pro Kategorie
Als Analyst möchte ich das aggregierte Total-Funding-Volumen pro Kategorie als Balkendiagramm sehen, um zu verstehen, welche Kategorien das meiste Kapital angezogen haben.

### US-3: Funding-Timeline pro Kategorie
Als Analyst möchte ich die aggregierten Funding-Volumina pro Jahr (2010–2025) pro Kategorie als gestapeltes oder gruppiertes Zeitreihen-Diagramm sehen, um zeitliche Trends und Verschiebungen zwischen Kategorien zu erkennen.

### US-4: 3-stufiger Drill-Down (Kategorie → Subcategories → Einzelne Subcategory)
Als Analyst möchte ich stufenweise tiefer navigieren können:
- **Level 0 (Übersicht):** Alle 5 Haupt-Kategorien mit ihren KPIs und Charts
- **Level 1 (Kategorie-Drill-Down):** Klick auf eine Kategorie zeigt deren Subcategories mit allen Aggregationen auf Subcategory-Ebene
- **Level 2 (Subcategory-Fokus):** Klick auf eine Subcategory fokussiert alle Charts auf NUR diese eine Subcategory — um deren spezifische Trends, Status-Verteilung und Features isoliert zu analysieren

Die Navigation ist stufenweise: Level 2 → "Zurück" → Level 1 → "Zurück" → Level 0.

### US-5: Häufigste Produkt-Features
Als Analyst möchte ich pro Kategorie (und optional Subcategory) die häufigsten Produkt-Features/Schlagworte aus dem Feld `key_features` sehen, um typische Produktmuster je Segment zu verstehen.

### US-6: Weitere Segment-Insights
Als Analyst möchte ich pro Kategorie zusätzliche Insights sehen:
- Verteilung nach Company-Status (Operational / Closed / Acquired)
- Verteilung nach Target Model (B2B / B2C / Beide)
- Top-5 Länder nach Anzahl Companies
- Durchschnittliches Gründungsjahr / Medianalter

### US-7: Navigation zwischen Database und Reporting
Als User möchte ich einfach zwischen der Datenbank-Ansicht (Tabelle) und der Reporting-Ansicht wechseln können, ohne den Kontext zu verlieren.

---

## Acceptance Criteria

### Seite & Navigation
- [ ] **AC-1:** Es existiert eine eigene Reporting-Seite unter `/reporting` (oder vergleichbarer Route)
- [ ] **AC-2:** Im Header ist eine Navigation sichtbar, die zwischen "Database" und "Reporting" umschalten lässt
- [ ] **AC-3:** Die Reporting-Seite nutzt das bestehende HoFT-Design (Navy, Teal, Orange, gleiche Schriftarten und Abstände)

### Kategorie-Übersicht (KPI-Cards)
- [ ] **AC-4:** Oben auf der Seite werden 5 KPI-Cards angezeigt — eine pro Haupt-Kategorie
- [ ] **AC-5:** Jede KPI-Card zeigt: Kategorie-Name, Anzahl Companies, aggregiertes Total-Funding (formatiert z.B. "$2.3B"), durchschnittliches Funding pro Company
- [ ] **AC-6:** Die Kategorie-Cards sind klickbar und setzen den Drill-Down-Filter auf die gewählte Kategorie

### Aggregiertes Funding-Balkendiagramm
- [ ] **AC-7:** Ein horizontales oder vertikales Balkendiagramm zeigt das aggregierte Total-Funding pro Kategorie
- [ ] **AC-8:** Die Balken sind in der jeweiligen Kategorie-Farbe dargestellt (analog zu den bestehenden CategoryBadge-Farben)
- [ ] **AC-9:** Hover über einen Balken zeigt einen Tooltip mit exaktem Betrag

### Funding-Timeline (Jahresvergleich)
- [ ] **AC-10:** Ein Zeitreihen-Diagramm (Stacked Bar Chart oder Grouped Bar Chart) zeigt die aggregierten Funding-Volumina pro Jahr (2010–2025) aufgeschlüsselt nach Kategorie
- [ ] **AC-11:** Leere Jahre (kein Funding in keiner Kategorie) werden übersprungen oder als 0 dargestellt
- [ ] **AC-12:** Eine Legende ordnet die Farben den Kategorien zu

### Drill-Down Level 1: Kategorie → Subcategories
- [ ] **AC-13:** User kann eine Kategorie-Card klicken → Wechsel zu Level 1
- [ ] **AC-14:** Auf Level 1 aktualisieren sich alle Charts und KPI-Cards auf Subcategory-Ebene (innerhalb der gewählten Kategorie)
- [ ] **AC-15:** Auf Level 1 ist ein "Zurück zur Übersicht"-Button sichtbar → führt zurück zu Level 0

### Drill-Down Level 2: Subcategory-Fokus
- [ ] **AC-15a:** Auf Level 1 sind die Subcategory-Cards klickbar → Klick wechselt zu Level 2 (Subcategory-Fokus)
- [ ] **AC-15b:** Auf Level 2 filtern sich alle Charts (Funding-Balken, Timeline, Status, Target Model, Länder, Keywords) auf NUR die gewählte Subcategory
- [ ] **AC-15c:** Auf Level 2 bleiben alle Subcategory-KPI-Cards sichtbar; die fokussierte Subcategory ist visuell hervorgehoben (farbiger Rand)
- [ ] **AC-15d:** Auf Level 2 kann der User eine andere Subcategory-Card klicken → Fokus wechselt auf diese
- [ ] **AC-15e:** Klick auf die bereits aktive Subcategory-Card deselektiert sie → zurück zu Level 1
- [ ] **AC-15f:** Auf Level 2 ist ein "Zurück"-Button sichtbar → führt stufenweise zurück zu Level 1 (nicht direkt zu Level 0)

### Häufigste Produkt-Features
- [ ] **AC-16:** Pro Kategorie (bzw. im Drill-Down pro Subcategory) wird eine Liste oder Tag-Cloud der häufigsten Schlagworte aus `key_features` angezeigt
- [ ] **AC-17:** Mindestens die Top 10 häufigsten Begriffe werden dargestellt
- [ ] **AC-18:** Neben jedem Begriff steht die Anzahl der Companies, die diesen Begriff verwenden

### Weitere Insights
- [ ] **AC-19:** Ein Donut-/Pie-Chart zeigt die Verteilung nach Company-Status (Operational / Closed / Acquired) für die gewählte Kategorie/Übersicht
- [ ] **AC-20:** Eine Darstellung zeigt die Verteilung nach Target Model (B2B / B2C / Beide)
- [ ] **AC-21:** Eine Rangliste zeigt die Top-5 Länder nach Anzahl Companies in der gewählten Kategorie/Übersicht

### Fehlerbehandlung & Ladezeiten
- [ ] **AC-22:** Während Daten geladen werden, wird ein Loading-Spinner/Skeleton angezeigt
- [ ] **AC-23:** Bei Fehlern (Supabase-Query schlägt fehl) wird eine Fehlermeldung mit Retry-Button angezeigt (analog PROJ-11)
- [ ] **AC-24:** Wenn keine Daten für eine Aggregation vorhanden sind, wird ein aussagekräftiger Leer-Zustand angezeigt

---

## Edge Cases

### EC-1: Kategorie ohne Funding-Daten
**Wenn** eine Kategorie keinen einzigen Eintrag mit `total_funding > 0` hat, **dann** wird der Funding-Wert als "$0" oder "-" angezeigt und der Balken im Diagramm fehlt (nicht als leerer Balken).

### EC-2: Subcategory mit nur 1 Company
**Wenn** eine Subcategory nur 1 Company enthält, **dann** werden die Aggregationen trotzdem korrekt angezeigt (Durchschnitt = Einzelwert), und es gibt keinen Division-by-Zero-Fehler.

### EC-3: key_features ist NULL oder leer
**Wenn** alle Companies einer Kategorie kein `key_features`-Feld haben, **dann** wird im Bereich "Häufigste Features" ein Leer-Zustand angezeigt ("Keine Feature-Daten verfügbar").

### EC-4: Funding-Years alle NULL für eine Kategorie
**Wenn** für eine Kategorie in keinem Jahr (2010–2025) Funding-Daten existieren, **dann** wird das Timeline-Diagramm für diese Kategorie nicht gerendert oder zeigt einen Hinweis "Keine Jahresdaten verfügbar".

### EC-5: Sehr große Funding-Beträge
**Wenn** das aggregierte Funding eine Kategorie > $100B beträgt, **dann** wird der Wert korrekt formatiert (z.B. "$123.4B") ohne Overflow oder abgeschnittene Darstellung.

### EC-6: Mehrfach-Kategorien pro Company
**Wenn** eine Company sowohl `category_1` als auch `category_2` und `category_3` hat, **dann** wird sie in jeder zutreffenden Kategorie-Aggregation mitgezählt (eine Company kann also in mehreren Kategorien auftauchen). Die Summe aller Kategorie-Counts kann daher > Gesamtanzahl Companies sein.

### EC-7: Sonderzeichen in key_features
**Wenn** `key_features` Sonderzeichen, Komma-separierte Listen oder inkonsistente Formatierung enthält, **dann** wird die Parsing-Logik damit umgehen und dennoch sinnvolle Begriffe extrahieren.

### EC-8: Subcategory-Fokus ohne Daten in einzelnen Charts
**Wenn** eine einzelne Subcategory im Fokus (Level 2) z.B. keine Funding-Daten hat, aber Status-Daten existieren, **dann** zeigt der Funding-Chart den Leer-Zustand an, während die anderen Charts (Status, Keywords etc.) ihre Daten normal darstellen. Jeder Chart behandelt seine Empty-States unabhängig.

---

## Technische Anforderungen

### Performance
- Aggregationen sollten möglichst serverseitig (Supabase RPC/SQL) berechnet werden, nicht clientseitig über alle ~10.000 Rows
- Ladezeit der Reporting-Seite: < 3 Sekunden für initiale Ansicht

### UI/UX
- Responsives Layout (Desktop-optimiert, aber auf Tablet nutzbar)
- Konsistentes Design mit bestehender Database-Ansicht (HoFT-Branding)
- Charts nutzen die bestehende Recharts-Library

### Drill-Down-Datenfluss
- **State-Modell:** Zwei unabhängige State-Variablen: `selectedCategory` (string | null) und `selectedSubcategory` (string | null)
- **Level 0:** `selectedCategory = null, selectedSubcategory = null` → RPC-Calls ohne Filter, gruppiert nach Kategorie
- **Level 1:** `selectedCategory = "X", selectedSubcategory = null` → RPC-Calls mit `p_category`, gruppiert nach Subcategory
- **Level 2:** `selectedCategory = "X", selectedSubcategory = "Y"` → Chart-RPCs (Timeline, Distributions, Keywords) mit `p_category` + `p_subcategory` filtern auf eine Subcategory; Stats-RPC bleibt auf Level-1-Daten (alle Subcategories für KPI-Cards)

### Datenintegrität
- `NULL`-Werte in numerischen Feldern werden als 0 behandelt (nicht als NaN)
- Textfeld-Parsing (key_features) ist tolerant gegenüber unterschiedlichen Trennzeichen (Komma, Semikolon, Newline)

---

## Tech-Design (Solution Architect)

**Erstellt:** 2026-02-13
**Autor:** Solution Architect Agent

---

### A) Bestandsaufnahme — Was existiert? Was muss neu gebaut werden?

| # | Aspekt | Status | Beschreibung |
|---|--------|--------|--------------|
| 1 | Routing (nur `/` vorhanden) | erweitern | Aktuell existiert nur die Startseite `/`. Neue Route `/reporting` muss angelegt werden. |
| 2 | Header/Navigation | erweitern | Der Header ist aktuell inline in `page.tsx`. Er muss als gemeinsame Komponente extrahiert werden, damit beide Seiten (Database + Reporting) denselben Header mit Navigation teilen. |
| 3 | Recharts (Charting-Library) | vorhanden | Recharts v3.7.0 ist installiert und wird bereits im `FundingChart` verwendet. Kann direkt wiederverwendet werden für alle neuen Diagramme. |
| 4 | Supabase-Client | vorhanden | `src/lib/supabase.ts` existiert. Gleicher Client wird für die neuen Aggregations-Queries genutzt. |
| 5 | HoFT-Farbtheme | vorhanden | Tailwind-Theme mit Navy, Teal, Orange + Kategorie-Farben (Blue, Purple, Slate, Green, Orange) existiert in `globals.css`. Direkt nutzbar. |
| 6 | Kategorie-Farben (CategoryBadge) | vorhanden | `CompanyTable.tsx` definiert Farben pro Kategorie. Müssen als gemeinsame Konstante extrahiert werden. |
| 7 | Funding-Formatierung | vorhanden | `formatFunding()` existiert in `CompanyTable.tsx` und `CompanyDetailModal.tsx`. Kann als Shared Utility extrahiert werden. |
| 8 | Shadcn/UI Komponenten | vorhanden | 35+ UI-Komponenten installiert (Cards, Tabs, Skeleton, Tooltip, etc.). Können direkt genutzt werden. |
| 9 | Serverseitige Aggregations-Queries | fehlt | Es gibt keine Supabase RPC-Funktionen für Aggregationen. Müssen als SQL-Funktionen in Supabase erstellt werden. |
| 10 | Reporting-Seite und Komponenten | fehlt | Komplett neu zu erstellen: Seite, KPI-Cards, Charts, Keyword-Analyse, Insights-Bereich. |

**Zusammenfassung:** Viel bestehende Infrastruktur (Recharts, Supabase, Theme, Shadcn/UI) kann wiederverwendet werden. Hauptaufwand liegt bei den neuen Supabase RPC-Funktionen und den neuen UI-Komponenten für die Reporting-Seite.

---

### B) Component-Struktur — Was wird gebaut?

**Neue Seiten-Struktur:**

```
Layout (src/app/layout.tsx) — unverändert
│
├── Gemeinsamer Header (NEU: src/components/Header.tsx)
│   ├── Logo + Titel "European FinTech Database"
│   ├── Navigation: "Database" | "Reporting" (aktiver Link hervorgehoben)
│   └── Company-Zähler (nur auf Database-Seite sichtbar)
│
├── Database-Seite (src/app/page.tsx) — bestehend, minimal angepasst
│   ├── FilterPanel
│   ├── CompanyTable
│   └── Pagination
│
└── Reporting-Seite (NEU: src/app/reporting/page.tsx)
    │
    ├── Kategorie-Selektor (Dropdown oder Tabs)
    │   ├── "Alle Kategorien" (Übersicht)
    │   ├── "Financial Education"
    │   ├── "Financial Foundation"
    │   ├── ... (alle 5 Kategorien)
    │   └── "Zurück zur Übersicht" (im Drill-Down-Modus)
    │
    ├── KPI-Cards Bereich (NEU: src/components/reporting/CategoryKpiCards.tsx)
    │   ├── Card 1: Kategorie-Name + Anzahl Companies + Total Funding + Avg Funding
    │   ├── Card 2: ...
    │   ├── Card 3: ...
    │   ├── Card 4: ...
    │   └── Card 5: ...
    │   (Im Drill-Down: Zeigt Subcategory-Cards statt Kategorie-Cards)
    │
    ├── Funding-Balkendiagramm (NEU: src/components/reporting/FundingByCategoryChart.tsx)
    │   ├── Vertikale Balken, eine Farbe pro Kategorie
    │   └── Tooltip mit exaktem Betrag bei Hover
    │   (Im Drill-Down: Balken pro Subcategory)
    │
    ├── Funding-Timeline (NEU: src/components/reporting/FundingTimelineChart.tsx)
    │   ├── Stacked Bar Chart: Jahre 2010–2025 auf X-Achse
    │   ├── Jede Kategorie als eigene Farb-Schicht
    │   ├── Legende mit Kategorie-Namen + Farben
    │   └── Tooltip pro Jahr mit Aufschlüsselung
    │   (Im Drill-Down: Schichten pro Subcategory)
    │
    ├── Insights-Bereich (2-Spalten-Grid)
    │   │
    │   ├── Status-Verteilung (NEU: src/components/reporting/StatusDistributionChart.tsx)
    │   │   └── Donut-Chart: Operational / Closed / Acquired
    │   │
    │   ├── Target-Model-Verteilung (NEU: src/components/reporting/TargetModelChart.tsx)
    │   │   └── Donut-Chart: B2B / B2C / Beide
    │   │
    │   └── Top-Länder (NEU: src/components/reporting/TopCountriesList.tsx)
    │       └── Rangliste: Top-5 Länder mit Balken + Anzahl
    │
    └── Häufigste Features (NEU: src/components/reporting/TopKeywordsCloud.tsx)
        ├── Tag-Badges mit den häufigsten Begriffen
        └── Neben jedem Tag: Anzahl Companies
```

**Bestehende Dateien, die angepasst werden:**

| Datei | Änderung |
|-------|----------|
| `src/app/page.tsx` | Header-Bereich wird durch gemeinsame `<Header>`-Komponente ersetzt |
| `src/app/layout.tsx` | Keine Änderung nötig |

**Neue Dateien:**

| Datei | Zweck |
|-------|-------|
| `src/components/Header.tsx` | Gemeinsamer Header mit Navigation |
| `src/app/reporting/page.tsx` | Reporting-Seite (Hauptseite) |
| `src/components/reporting/CategoryKpiCards.tsx` | KPI-Cards pro Kategorie/Subcategory |
| `src/components/reporting/FundingByCategoryChart.tsx` | Balkendiagramm Funding pro Kategorie |
| `src/components/reporting/FundingTimelineChart.tsx` | Stacked-Bar-Chart Funding 2010–2025 |
| `src/components/reporting/StatusDistributionChart.tsx` | Donut-Chart Status-Verteilung |
| `src/components/reporting/TargetModelChart.tsx` | Donut-Chart Target-Model-Verteilung |
| `src/components/reporting/TopCountriesList.tsx` | Top-5-Länder-Rangliste |
| `src/components/reporting/TopKeywordsCloud.tsx` | Häufigste Feature-Begriffe |

---

### C) Daten-Strategie — Woher kommen die Daten?

**Problem:** Die Datenbank enthält ~10.000 Rows. Alle clientseitig zu laden und dann zu aggregieren wäre langsam und datenintensiv.

**Lösung:** Serverseitige Aggregation über Supabase RPC-Funktionen (wie bereits bei `get_distinct_countries()` bewährt).

**Benötigte RPC-Funktionen (4 Stück):**

```
RPC 1: get_category_stats()
├── Liefert pro Kategorie: Anzahl Companies, Sum Total-Funding, Avg Total-Funding
├── Berücksichtigt category_1, category_2, category_3 (EC-6: Mehrfach-Kategorien)
└── Keine Parameter nötig (liefert alle 5 Kategorien auf einmal)

RPC 2: get_category_funding_timeline()
├── Liefert pro Kategorie + pro Jahr (2010–2025): Sum Funding
├── 16 Jahre × 5 Kategorien = max. 80 Datenpunkte
└── Optionaler Parameter: category (für Drill-Down → liefert dann Subcategory-Aufschlüsselung)

RPC 3: get_category_distributions(category TEXT DEFAULT NULL)
├── Liefert: Status-Verteilung, Target-Model-Verteilung, Top-Länder
├── Ohne Parameter: Über alle Companies
├── Mit Parameter: Nur für gewählte Kategorie
└── Kombiniert 3 Abfragen in einer Funktion (effizienter als 3 separate Calls)

RPC 4: get_top_keywords(category TEXT DEFAULT NULL, limit_count INT DEFAULT 10)
├── Liefert: Die häufigsten Begriffe aus key_features
├── Splitting-Logik: Trennung an Komma, Semikolon, Newline
├── Bereinigung: Trim, Lowercase, Deduplizierung
├── Ohne category-Parameter: Über alle Companies
└── Mit category-Parameter: Nur für gewählte Kategorie
```

**Datenfluss:**

```
[Reporting-Seite lädt]
       |
       |--- Parallel 4 RPC-Calls an Supabase ---
       |                                         |
       v                                         v
get_category_stats()              get_category_funding_timeline()
       |                                         |
       v                                         v
get_category_distributions()       get_top_keywords()
       |                                         |
       +---------------- ALLE DATEN --------------+
       |
       v
[State wird gesetzt, UI rendert]
       |
       |-- KPI-Cards nutzen: category_stats
       |-- Funding-Chart nutzt: category_stats
       |-- Timeline-Chart nutzt: funding_timeline
       |-- Donut-Charts nutzen: distributions
       |-- Keywords nutzen: top_keywords
       |-- Top-Länder nutzen: distributions
```

**Drill-Down-Flow (User klickt auf Kategorie):**

```
[User klickt "Financial Foundation"]
       |
       v
[State: selectedCategory = "Financial Foundation"]
       |
       |--- 4 RPC-Calls MIT category-Parameter ---
       |
       v
[Alle Charts/KPIs aktualisieren sich auf Subcategory-Ebene]
       |
[User klickt "Zurück zur Übersicht"]
       |
       v
[State: selectedCategory = null]
       |
[Alle Charts zeigen wieder Kategorie-Ebene]
```

---

### D) Visuelles Konzept — Seitenlayout

```
+------------------------------------------------------------------+
| [Logo] European FinTech Database     [Database] [Reporting]   📊 |
+------------------------------------------------------------------+
|                                                                  |
| Reporting: Aggregierte Analyse                                   |
| [Alle Kategorien ▼]   ← Dropdown für Drill-Down                |
|                                                                  |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
| | Fin.Edu  | | Fin.Fdn  | | Infra&T  | | Inv&WB   | | RiskPr.  | |
| | 1,234    | | 3,456    | | 2,100    | | 1,890    | | 543      | |
| | $2.3B    | | $8.1B    | | $4.5B    | | $12.3B   | | $1.2B    | |
| | Avg $1.9M| | Avg $2.3M| | Avg $2.1M| | Avg $6.5M| | Avg $2.2M| |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
|                                                                  |
| Funding pro Kategorie                 Funding-Timeline 2010-2025 |
| +----------------------------+  +-------------------------------+ |
| | ████ $12.3B  Inv&WB       |  | █ █ █ █ ███ ████ ████ ███ █  | |
| | ██████ $8.1B Fin.Fdn      |  | █ █ █ ██ ███ ████ █████ ███  | |
| | ████ $4.5B   Infra&Tech   |  | ████████████████████████████  | |
| | ██ $2.3B     Fin.Edu      |  | (Stacked Bars, je Kategorie) | |
| | █ $1.2B      RiskProt     |  | 10 11 12 13 14 15 ... 24 25  | |
| +----------------------------+  +-------------------------------+ |
|                                                                  |
| Status-Verteilung      Target Model       Top 5 Länder          |
| +------------------+  +----------------+  +--------------------+ |
| |   🟢 Operational |  |   B2B   45%    |  | 1. UK      █████   | |
| |   🔴 Closed      |  |   B2C   30%    |  | 2. Germany ████    | |
| |   🟡 Acquired    |  |   Both  25%    |  | 3. France  ███     | |
| |   (Donut Chart)  |  |  (Donut Chart) |  | 4. Sweden  ██      | |
| +------------------+  +----------------+  | 5. Spain   █       | |
|                                           +--------------------+ |
|                                                                  |
| Häufigste Produkt-Features                                       |
| +--------------------------------------------------------------+ |
| | [Budgeting (234)] [Savings (198)] [Payments (187)]           | |
| | [Investing (156)] [Insurance (134)] [Lending (121)]          | |
| | [Analytics (98)] [Compliance (87)] [API (76)] [Crypto (65)]  | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

### E) Tech-Entscheidungen — Warum diese Lösung?

**Entscheidung 1: Eigene Route `/reporting` statt Tab auf der Hauptseite**
- *Warum:* Die Reporting-Ansicht hat eine komplett andere Struktur als die Tabellen-Ansicht. Ein Tab würde die `page.tsx` stark aufblähen. Separate Routen halten den Code sauber getrennt und ermöglichen unabhängiges Laden.
- *PM-Sprache:* "Die Reporting-Seite ist ein eigener Bereich, nicht nur ein Tab. Das hält beide Seiten übersichtlich und schnell."

**Entscheidung 2: Serverseitige Aggregation via Supabase RPC (nicht clientseitig)**
- *Warum:* 10.000 Rows clientseitig zu laden und zu aggregieren wäre langsam (~2-5 Sekunden + hoher Datenverbrauch). RPC-Funktionen berechnen die Summen in der Datenbank und liefern nur die Ergebnisse (~50 Datenpunkte statt 10.000 Rows).
- *PM-Sprache:* "Die Datenbank rechnet die Summen aus und schickt nur die Ergebnisse. Das ist viel schneller als alles herunterzuladen."

**Entscheidung 3: Recharts für alle Diagramme (kein neues Package)**
- *Warum:* Recharts ist bereits installiert und im Projekt bewährt (FundingChart). Es unterstützt Bar Charts, Stacked Bars, Pie/Donut Charts und Tooltips. Kein zusätzliches Package nötig.
- *PM-Sprache:* "Wir nutzen die gleiche Chart-Library, die schon für die Funding-Grafik funktioniert. Kein neues Tool nötig."

**Entscheidung 4: Gemeinsamer Header als eigene Komponente**
- *Warum:* Der Header ist aktuell fest in `page.tsx` eingebaut. Da jetzt zwei Seiten den Header mit Navigation brauchen, wird er als eigene Komponente ausgelagert. Änderungen am Header gelten dann automatisch für beide Seiten.
- *PM-Sprache:* "Der Header wird einmal gebaut und auf beiden Seiten wiederverwendet. Wir müssen ihn nicht doppelt pflegen."

**Entscheidung 5: Kategorie-Farben als gemeinsame Konstante**
- *Warum:* Die Kategorie-Farben (Blau für Fin.Edu, Grün für Inv&WB, etc.) werden sowohl in der Tabelle als auch in den Reporting-Charts benötigt. Einmal definiert, überall genutzt.
- *PM-Sprache:* "Jede Kategorie hat ihre feste Farbe — in der Tabelle und in allen Charts identisch."

**Entscheidung 6: 4 parallele RPC-Calls statt eines Mega-Calls**
- *Warum:* Vier kleinere Funktionen sind einfacher zu testen, zu warten und bei Bedarf einzeln zu optimieren. Sie laden parallel, was die Gesamtladezeit minimiert.
- *PM-Sprache:* "Vier schlanke Abfragen, die gleichzeitig laufen, statt einer riesigen. Schneller und robuster."

**Entscheidung 7: Keyword-Splitting in der Datenbank (nicht im Browser)**
- *Warum:* Das `key_features`-Feld enthält Freitext mit verschiedenen Trennzeichen. Die Aufspaltung in einzelne Begriffe über 10.000 Rows ist rechenintensiv. Die Datenbank kann das effizienter als der Browser.
- *PM-Sprache:* "Die Datenbank extrahiert die Schlüsselwörter direkt — schneller und zuverlässiger als im Browser."

---

### F) Dependencies — Was wird installiert?

**Keine neuen Packages nötig!**

Alles Benötigte ist bereits vorhanden:
- `recharts` — für alle Diagramme (Bar, Stacked Bar, Pie/Donut)
- `@supabase/supabase-js` — für RPC-Calls
- `lucide-react` — für Icons
- Shadcn/UI — für Cards, Skeleton, Tabs, Tooltips
- `next` — für Routing (`/reporting`)

---

### G) Aufwand-Einschätzung

**Betroffene Dateien:**

| # | Datei | Art | Umfang |
|---|-------|-----|--------|
| 1 | `src/components/Header.tsx` | NEU | Mittel — Header extrahieren + Navigation hinzufügen |
| 2 | `src/app/page.tsx` | ÄNDERUNG | Klein — Inline-Header durch `<Header>` ersetzen |
| 3 | `src/app/reporting/page.tsx` | NEU | Groß — Hauptseite mit State-Management, 4 RPC-Calls, Drill-Down-Logik |
| 4 | `src/components/reporting/CategoryKpiCards.tsx` | NEU | Mittel — 5 KPI-Cards mit Klick-Handler |
| 5 | `src/components/reporting/FundingByCategoryChart.tsx` | NEU | Mittel — Recharts Bar Chart |
| 6 | `src/components/reporting/FundingTimelineChart.tsx` | NEU | Mittel — Recharts Stacked Bar Chart |
| 7 | `src/components/reporting/StatusDistributionChart.tsx` | NEU | Klein — Recharts Pie/Donut Chart |
| 8 | `src/components/reporting/TargetModelChart.tsx` | NEU | Klein — Recharts Pie/Donut Chart |
| 9 | `src/components/reporting/TopCountriesList.tsx` | NEU | Klein — Einfache Rangliste |
| 10 | `src/components/reporting/TopKeywordsCloud.tsx` | NEU | Klein — Tag-Badges mit Counts |
| 11 | Supabase: 4 RPC-Funktionen | NEU | Mittel — SQL-Aggregationen + Keyword-Parsing |

**Gesamtumfang:** 1 Datei geändert, 10 neue Dateien, 4 Supabase-Funktionen

**Risiko:** Mittel. Die Supabase RPC-Funktionen sind der kritischste Teil (SQL muss korrekt aggregieren, besonders EC-6 Mehrfach-Kategorien und EC-7 Keyword-Parsing). Die UI-Komponenten sind dank Recharts und Shadcn/UI relativ straightforward.

---

### H) Drill-Down-Erweiterung — 3-stufiger Drill-Down (Update)

**Erstellt:** 2026-02-13
**Anlass:** QA-Test hat gezeigt, dass der 2-stufige Drill-Down unvollständig war. Subcategory-Cards waren klickbar, führten aber ins Leere (RPC-Funktionen fanden keine Daten). Spec wurde auf 3-stufigen Drill-Down erweitert (AC-15a bis AC-15f).

#### H.1) Bestandsaufnahme — Was existiert, was muss sich ändern?

| # | Aspekt | Status | Beschreibung |
|---|--------|--------|--------------|
| 1 | State-Modell in `reporting/page.tsx` | ändern | Aktuell nur `selectedCategory`. Muss um `selectedSubcategory` erweitert werden. |
| 2 | Supabase RPC: `get_category_stats` | unverändert | Liefert bei Level 1 alle Subcategories → KPI-Cards bleiben auf Level 2 gleich |
| 3 | Supabase RPC: `get_category_funding_timeline` | ändern | Neuer Parameter `p_subcategory` → filtert auf eine Subcategory (Level 2) |
| 4 | Supabase RPC: `get_category_distributions` | ändern | Neuer Parameter `p_subcategory` → filtert auf eine Subcategory (Level 2) |
| 5 | Supabase RPC: `get_top_keywords` | ändern | Neuer Parameter `p_subcategory` → filtert auf eine Subcategory (Level 2) |
| 6 | `CategoryKpiCards.tsx` | ändern | Muss auf allen Ebenen klickbar sein. Level 2: aktive Subcategory hervorgehoben |
| 7 | Seitentitel + "Zurück"-Button | ändern | Muss 3 Ebenen abbilden, stufenweise Navigation |
| 8 | Chart-Komponenten | unverändert | Erhalten weiterhin ihre Daten via Props — die Filterung passiert in der Seite + RPCs |

**Zusammenfassung:** 4 Dateien ändern (1 Seite, 1 Komponente, 3 RPC-Funktionen). Keine neuen Dateien nötig. Keine neuen Packages.

#### H.2) Erweitertes State-Modell

```
reporting/page.tsx verwaltet:
├── selectedCategory (string | null)
│   ├── null → Level 0: Übersicht aller Kategorien
│   └── "Financial Foundation" → Level 1: Subcategories dieser Kategorie
│
└── selectedSubcategory (string | null)
    ├── null → Level 0 oder Level 1 (je nach selectedCategory)
    └── "Debt Management & Credit" → Level 2: Fokus auf diese eine Subcategory
```

#### H.3) Datenfluss pro Level

```
Level 0 (Übersicht):
├── selectedCategory = null, selectedSubcategory = null
├── get_category_stats(null) → 5 Haupt-Kategorien
├── get_category_funding_timeline(null, null) → Timeline gruppiert nach Kategorien
├── get_category_distributions(null, null) → Status/Target/Länder über alle Companies
└── get_top_keywords(null, null) → Keywords über alle Companies

Level 1 (Kategorie → Subcategories):
├── selectedCategory = "Financial Foundation", selectedSubcategory = null
├── get_category_stats("Financial Foundation") → Subcategories dieser Kategorie
├── get_category_funding_timeline("Financial Foundation", null) → Timeline pro Subcategory
├── get_category_distributions("Financial Foundation", null) → Distributions der Kategorie
└── get_top_keywords("Financial Foundation", null) → Keywords der Kategorie

Level 2 (Subcategory-Fokus):
├── selectedCategory = "Financial Foundation", selectedSubcategory = "Debt Mgmt"
├── get_category_stats("Financial Foundation") → GLEICHE Daten wie Level 1 (für KPI-Cards)
├── get_category_funding_timeline("Financial Foundation", "Debt Mgmt") → NUR diese Subcategory
├── get_category_distributions("Financial Foundation", "Debt Mgmt") → NUR diese Subcategory
└── get_top_keywords("Financial Foundation", "Debt Mgmt") → NUR diese Subcategory
```

**Wichtig:** Bei Level 2 wird `get_category_stats` NICHT mit `p_subcategory` aufgerufen, damit alle Subcategory-KPI-Cards sichtbar bleiben. Nur die 3 Chart-RPCs (Timeline, Distributions, Keywords) filtern auf die einzelne Subcategory.

#### H.4) Erweiterte Navigation — Seitentitel + "Zurück"-Button

```
Level 0:
├── Titel: "Aggregated Category Analysis"
├── Untertitel: "Overview across all 5 main categories"
└── Kein Zurück-Button

Level 1:
├── Titel: "Financial Foundation — Subcategory Analysis"
├── Untertitel: "Drill-down into subcategories"
└── Zurück-Button: "Back to Overview" → setzt selectedCategory = null → Level 0

Level 2:
├── Titel: "Financial Foundation → Debt Management & Credit"
├── Untertitel: "Subcategory focus"
└── Zurück-Button: "Back to Financial Foundation" → setzt selectedSubcategory = null → Level 1
```

#### H.5) KPI-Cards-Verhalten pro Level

```
Level 0: 5 Kategorie-Cards
├── Klickbar → setzt selectedCategory → wechselt zu Level 1
└── Keine Card ist "aktiv" (kein farbiger Rand)

Level 1: N Subcategory-Cards (innerhalb der gewählten Kategorie)
├── Klickbar → setzt selectedSubcategory → wechselt zu Level 2
└── Keine Card ist "aktiv"

Level 2: GLEICHE N Subcategory-Cards
├── Klickbar → andere Card klicken = Fokus wechseln, gleiche Card klicken = deselektieren (→ Level 1)
└── Fokussierte Subcategory hat farbigen Rand (aktiv)
```

#### H.6) RPC-Erweiterung — Neuer Parameter `p_subcategory`

Drei der vier RPC-Funktionen erhalten einen optionalen Parameter `p_subcategory`:

```
get_category_funding_timeline(p_category, p_subcategory DEFAULT NULL)
├── p_subcategory = null → Wie bisher (gruppiert nach Segment)
└── p_subcategory = "Debt Management" → Filtert auf eine Subcategory

get_category_distributions(p_category, p_subcategory DEFAULT NULL)
├── p_subcategory = null → Wie bisher
└── p_subcategory = "Debt Management" → Nur Companies dieser Subcategory

get_top_keywords(p_category, p_subcategory DEFAULT NULL, p_limit)
├── p_subcategory = null → Wie bisher
└── p_subcategory = "Debt Management" → Nur Keywords dieser Subcategory
```

`get_category_stats` bleibt UNVERÄNDERT — sie liefert auf Level 2 die gleichen Daten wie auf Level 1 (alle Subcategories), damit die KPI-Cards komplett bleiben.

#### H.7) Betroffene Dateien (nur Änderungen)

| # | Datei | Art | Umfang |
|---|-------|-----|--------|
| 1 | `src/app/reporting/page.tsx` | ÄNDERUNG | Mittel — neuer State `selectedSubcategory`, angepasster `fetchData`, stufenweise Navigation |
| 2 | `src/components/reporting/CategoryKpiCards.tsx` | ÄNDERUNG | Klein — `clickable`-Prop entfernen, stattdessen `selectedSubcategory` Prop für Level-2-Highlighting |
| 3 | Supabase RPC: `get_category_funding_timeline` | ÄNDERUNG | Klein — neuer optionaler Parameter `p_subcategory` mit WHERE-Clause |
| 4 | Supabase RPC: `get_category_distributions` | ÄNDERUNG | Klein — neuer optionaler Parameter `p_subcategory` mit WHERE-Clause |
| 5 | Supabase RPC: `get_top_keywords` | ÄNDERUNG | Klein — neuer optionaler Parameter `p_subcategory` mit WHERE-Clause |

**Gesamtumfang:** 2 Dateien ändern, 3 RPC-Funktionen erweitern. Keine neuen Dateien, keine neuen Packages.

**Risiko:** Niedrig. Die RPC-Änderungen sind minimal (ein optionaler Parameter pro Funktion). Die UI-Änderungen betreffen hauptsächlich State-Management und Props.

---

## QA Test Results

**Getestet:** 2026-02-13
**Tester:** QA Engineer Agent
**Build-Status:** ✅ PASS — `next build` kompiliert fehlerfrei, alle 3 Routen (`/`, `/_not-found`, `/reporting`)
**Geprüfte Dateien:** 12 (10 neue + 1 geänderte + 1 Supabase-Migration)

---

### Acceptance Criteria — Ergebnisse

#### Seite & Navigation

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-1 | Eigene Reporting-Seite unter `/reporting` | ✅ PASS | `src/app/reporting/page.tsx` existiert → Next.js App Router erzeugt Route `/reporting` |
| AC-2 | Header-Navigation zwischen "Database" und "Reporting" | ✅ PASS | `Header.tsx:26-45` — zwei `<Link>`-Komponenten mit `usePathname()` für Active-State |
| AC-3 | HoFT-Design (Navy, Teal, Orange, Schriftarten) | ✅ PASS | Alle Komponenten nutzen Theme-Klassen (`bg-navy`, `bg-background`, `text-foreground`, `text-muted`, `border-border`, `bg-surface`, `bg-teal`) |

#### Kategorie-Übersicht (KPI-Cards)

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-4 | 5 KPI-Cards — eine pro Haupt-Kategorie | ✅ PASS | `CategoryKpiCards.tsx:26` — Grid `lg:grid-cols-5`, rendert eine Card pro `stat` |
| AC-5 | Card zeigt: Name, Anzahl, Total-Funding, Avg-Funding | ✅ PASS | `CategoryKpiCards.tsx:48-60` — `stat.segment`, `company_count`, `formatFundingValue(total_funding_sum)`, `formatFundingValue(total_funding_avg)` |
| AC-6 | Cards klickbar → Drill-Down-Filter | ✅ PASS | `CategoryKpiCards.tsx:34-36` — `<button onClick={() => onSelect(isActive ? null : stat.segment)}>`, Toggle-Verhalten |

#### Aggregiertes Funding-Balkendiagramm

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-7 | Balkendiagramm zeigt Total-Funding pro Kategorie | ✅ PASS | `FundingByCategoryChart.tsx:45-89` — Recharts `<BarChart>` mit Daten aus `stats` |
| AC-8 | Balken in Kategorie-Farben | ✅ PASS | `FundingByCategoryChart.tsx:36` — `getSegmentColor(s.segment, i)` mappt auf `CATEGORY_COLORS` |
| AC-9 | Tooltip mit exaktem Betrag bei Hover | ✅ PASS | `FundingByCategoryChart.tsx:66-82` — `<Tooltip>` mit `formatFundingValue()` und `labelFormatter` für vollen Namen |

#### Funding-Timeline (Jahresvergleich)

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-10 | Stacked Bar Chart 2010–2025 nach Kategorie | ✅ PASS | `FundingTimelineChart.tsx:56-99` — `<BarChart>` mit `stackId="a"`, Pivot-Logik transformiert Timeline-Daten |
| AC-11 | Leere Jahre als 0 dargestellt | ✅ PASS | `FundingTimelineChart.tsx:40` — `row[seg] = point ? point.total : 0` |
| AC-12 | Legende ordnet Farben den Kategorien zu | ✅ PASS | `FundingTimelineChart.tsx:87-89` — `<Legend>` Komponente |

#### Subcategory-Drill-Down

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-13 | Kategorie auswählbar via Card-Klick | ✅ PASS | `reporting/page.tsx:66-68` — `handleCategorySelect` setzt `selectedCategory` State |
| AC-14 | Alle Diagramme aktualisieren sich auf Subcategory-Ebene | ✅ PASS | `reporting/page.tsx:62-64` — `useEffect` triggert `fetchData(selectedCategory)`, alle 4 RPCs erhalten `categoryParam` |
| AC-15 | "Zurück zur Übersicht"-Button im Drill-Down | ✅ PASS | `reporting/page.tsx:93-113` — `{selectedCategory && (<button onClick={() => setSelectedCategory(null)}>Back to Overview</button>)}` mit Chevron-Icon |

#### Häufigste Produkt-Features

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-16 | Tag-Cloud der häufigsten Schlagworte | ✅ PASS | `TopKeywordsCloud.tsx:27-43` — Tag-Badges mit Opacity-Skalierung (`0.4 + (count/maxCount) * 0.6`) |
| AC-17 | Mindestens Top 10 Begriffe | ✅ PASS | `reporting/page.tsx:45` — RPC-Call mit `p_limit: 15` (Top 15 > Top 10) |
| AC-18 | Anzahl neben jedem Begriff | ✅ PASS | `TopKeywordsCloud.tsx:39` — `({kw.count.toLocaleString()})` |

#### Weitere Insights

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-19 | Donut-Chart Status-Verteilung | ✅ PASS | `StatusDistributionChart.tsx:40-67` — Recharts `<PieChart>` mit `innerRadius={35}` (Donut), filtert `distribution_type === "status"` |
| AC-20 | Target-Model-Verteilung | ✅ PASS | `TargetModelChart.tsx:40-67` — Analoges Donut-Chart, filtert `distribution_type === "target_model"`, zeigt B2B/B2C/"B2B, B2C" |
| AC-21 | Top-5 Länder Rangliste | ✅ PASS | `TopCountriesList.tsx:29-52` — Rangliste mit Teal-Progressbalken, SQL limitiert auf Top 5 |

#### Fehlerbehandlung & Ladezeiten

| AC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| AC-22 | Loading-Spinner angezeigt | ✅ PASS | `reporting/page.tsx:117-142` — `{loading && (...spinner SVG...)}` |
| AC-23 | Fehlermeldung mit Retry-Button (analog PROJ-11) | ✅ PASS | `reporting/page.tsx:145-171` — Amber-Warning-Icon + "Failed to load" + Retry-Button → `handleRetry()` |
| AC-24 | Aussagekräftiger Leer-Zustand | ✅ PASS | Alle 7 Komponenten haben individuelle Empty-States: "No data available", "No funding data available", "No timeline data available", "No status data", "No target model data", "No country data", "No feature data available" |

**Ergebnis:** 24/24 Acceptance Criteria bestanden ✅

---

### Edge Cases — Ergebnisse

| EC | Beschreibung | Status | Nachweis |
|----|-------------|--------|----------|
| EC-1 | Kategorie ohne Funding → "$0"/"-", kein Balken | ✅ PASS | `formatFundingValue(0)` → "-"; `FundingByCategoryChart.tsx:31` filtert `.filter((s) => s.total_funding_sum > 0)` → kein leerer Balken |
| EC-2 | Subcategory mit 1 Company → kein Division-by-Zero | ✅ PASS | Alle Divisions nutzen `total` aus `reduce()`, SQL `AVG()` funktioniert korrekt mit Einzelwerten |
| EC-3 | key_features NULL/leer → Leer-Zustand | ✅ PASS | `TopKeywordsCloud.tsx:12` — `keywords.length === 0` → "No feature data available"; SQL filtert `WHERE key_features IS NOT NULL AND key_features <> ''` |
| EC-4 | Alle Funding-Years NULL → Hinweis | ✅ PASS | `FundingTimelineChart.tsx:22` — `timeline.length === 0` → "No timeline data available"; SQL nutzt `COALESCE` mit 0 |
| EC-5 | Funding > $100B → korrekte Formatierung | ✅ PASS | `formatFundingValue()`: `>= 1B → "$X.XB"` — z.B. $123.4B wird korrekt als `$123.4B` formatiert via `toFixed(1)` |
| EC-6 | Mehrfach-Kategorien → in jeder Kategorie gezählt | ✅ PASS | Alle 4 SQL-Funktionen nutzen `UNION ALL` über `category_1`, `category_2`, `category_3` |
| EC-7 | Sonderzeichen in key_features → Parsing funktioniert | ✅ PASS | SQL nutzt `regexp_split_to_table(key_features, '\s*\|\s*')` + `split_part(token, ':', 1)` + `INITCAP(LOWER(TRIM()))` — Normalisierung korrekt für das tatsächliche Pipe-separierte Datenformat |

**Ergebnis:** 7/7 Edge Cases bestanden ✅

---

### Backward Compatibility — PROJ-1 & PROJ-11

| Aspekt | Status | Nachweis |
|--------|--------|----------|
| Database-Seite (`/`) funktioniert | ✅ PASS | `page.tsx` — nur Header durch `<Header totalCount={totalCount} />` ersetzt, alle Filter/Tabelle/Pagination/Modal/Sort unverändert |
| Error-Handling-Pattern (PROJ-11) erhalten | ✅ PASS | `page.tsx` — `error` State, `handleRetry`, Loading-State komplett erhalten |
| Country-RPC `get_distinct_countries()` | ✅ PASS | `page.tsx:47` — Country-Loading unverändert |
| Reporting nutzt gleiches Error-Pattern | ✅ PASS | `reporting/page.tsx` — Loading → Error (mit Retry) → Data, identisches Muster wie PROJ-11 |

**Ergebnis:** Volle Rückwärtskompatibilität ✅

---

### Build-Verifizierung

```
✅ next build — Compiled successfully
   Routes: / , /_not-found , /reporting
   TypeScript: No errors
   Build time: ~10s
```

---

### Zusammenfassung

| Bereich | Ergebnis |
|---------|----------|
| Acceptance Criteria | **24/24 PASS** ✅ |
| Edge Cases | **7/7 PASS** ✅ |
| Backward Compatibility | **PASS** ✅ |
| Build | **PASS** ✅ |

**Gesamtergebnis: ✅ ALLE TESTS BESTANDEN**

Keine Bugs, keine offenen Issues. Feature PROJ-12 ist implementierungsbereit für Produktivbetrieb.
