# PROJ-14: Subcategory Filter

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-1 (FinTech Database) — Basis-Datenmodell und FilterPanel
- Benötigt: PROJ-3 (Category Filter) — Category-Dropdown muss existieren

## Zusammenfassung
Ein Subcategory-Dropdown wird zum FilterPanel hinzugefügt. Er erscheint nur, wenn eine Category gewählt ist, und zeigt dann nur die Subcategories dieser Category. Filter bezieht sich auf `category_1`/`subcategory_1`.

---

## User Stories

- **US-1**: Als User möchte ich nach einer bestimmten Subcategory filtern können, um innerhalb einer Category gezielter zu suchen (z.B. nur "Debt Management & Credit" innerhalb "Financial Foundation").

- **US-2**: Als User möchte ich, dass der Subcategory-Filter erst erscheint wenn ich eine Category gewählt habe, damit das FilterPanel nicht unnötig überladen wirkt.

- **US-3**: Als User möchte ich, dass der Subcategory-Filter automatisch zurückgesetzt wird, wenn ich die Category ändere, damit ich keine ungültigen Filter-Kombinationen habe.

- **US-4**: Als User möchte ich die Anzahl der Treffer im Subcategory-Dropdown sehen, um einschätzen zu können wie viele Companies in jeder Subcategory sind.

---

## Acceptance Criteria

### Filter-Verhalten
- [ ] **AC-1**: Wenn keine Category ausgewählt ist, wird kein Subcategory-Dropdown angezeigt.
- [ ] **AC-2**: Wenn eine Category ausgewählt wird, erscheint ein Subcategory-Dropdown rechts daneben (oder darunter auf Mobile).
- [ ] **AC-3**: Das Subcategory-Dropdown zeigt nur Subcategories, die zur gewählten Category gehören (basierend auf `category_1`/`subcategory_1`).
- [ ] **AC-4**: Bei Auswahl einer Subcategory werden die Companies in der Tabelle zusätzlich nach `subcategory_1` gefiltert.
- [ ] **AC-5**: Das Subcategory-Dropdown hat eine "All Subcategories" Option (Default), die keine zusätzliche Filterung anwendet.

### Reset-Verhalten
- [ ] **AC-6**: Wenn die Category geändert wird, wird der Subcategory-Filter automatisch auf "All Subcategories" zurückgesetzt.
- [ ] **AC-7**: Wenn die Category auf "All Categories" zurückgesetzt wird, verschwindet das Subcategory-Dropdown.
- [ ] **AC-8**: Der "Clear all filters" Button setzt auch die Subcategory zurück.

### Datenquelle
- [ ] **AC-9**: Subcategory-Liste wird dynamisch aus der Datenbank geladen (nicht hardcoded).
- [ ] **AC-10**: Der Filter bezieht sich nur auf `category_1`/`subcategory_1` (nicht auf Slot 2 und 3).

---

## Edge Cases

- **EC-1**: Category ohne Subcategories — Sollte nicht vorkommen (jede Company mit category_1 hat auch subcategory_1), aber falls doch: Dropdown zeigt "No subcategories available" und ist disabled.
- **EC-2**: Subcategory mit 0 Treffern nach Kombination mit anderen Filtern — Die Subcategory erscheint trotzdem im Dropdown (Datenquelle basiert auf allen Companies der Category, nicht auf der aktuellen Filterung).
- **EC-3**: Sehr lange Subcategory-Namen — Dropdown muss breit genug sein oder Text abkürzen (z.B. "Budget Optimization & Expense Planning").
- **EC-4**: URL/State Sharing — Wenn in Zukunft Filter in der URL gespeichert werden, muss die Subcategory dort enthalten sein.

---

## Technische Anforderungen
- Subcategory-Liste per Supabase-Query laden (DISTINCT subcategory_1 WHERE category_1 = X)
- FilterPanel.tsx erweitern (neues Dropdown)
- Filters-Interface in fintech.ts erweitern (neues Feld `subcategory`)
- page.tsx: Query um `.eq("subcategory_1", ...)` erweitern

---

## Tech-Design (Solution Architect)

### A) Betroffene Dateien

```
Geändert:
├── src/types/fintech.ts          ← Filters-Interface erweitern
├── src/components/FilterPanel.tsx ← Neues Subcategory-Dropdown
└── src/app/page.tsx              ← Subcategory-Query + State + Laden der Subcategories

Neu:
└── (keine neuen Dateien)

Unverändert:
├── src/components/CompanyTable.tsx
└── src/components/CompanyDetailModal.tsx
```

### B) Daten-Model Erweiterung

```
Filters-Interface (fintech.ts) bekommt ein neues Feld:
- subcategory: string  (leer = "All Subcategories")

DEFAULT_FILTERS bekommt:
- subcategory: ""

Subcategory-Daten pro Category:
- Financial Education:            4 Subcategories
- Financial Foundation:           5 Subcategories
- Infrastructure & Technology:    6 Subcategories
- Investment & Wealth Building:   6 Subcategories
- Risk Protection:                9 Subcategories
```

### C) Datenfluss

```
1. User wählt Category
   → page.tsx lädt Subcategory-Liste per Supabase-Query:
     SELECT DISTINCT subcategory_1
     FROM FinWell_data
     WHERE category_1 = '<gewählte Category>'
     ORDER BY subcategory_1

2. Subcategory-Dropdown erscheint im FilterPanel
   → Zeigt die geladenen Subcategories

3. User wählt Subcategory
   → page.tsx fügt .eq("subcategory_1", value) zur Query hinzu

4. User ändert Category
   → Subcategory wird auf "" zurückgesetzt
   → Neue Subcategory-Liste wird geladen
```

### D) Component-Änderungen

```
FilterPanel (erweitert):
├── Search
├── Category-Dropdown (bestehend)
├── Subcategory-Dropdown (NEU — nur sichtbar wenn Category gewählt)
│   ├── "All Subcategories" (Default)
│   └── Dynamische Liste aus Props
├── Country
├── Status
├── Target Model
├── HoFT Members Toggle
└── Clear Filters (setzt auch Subcategory zurück)

FilterPanel Props erweitert um:
- subcategories: string[]  (Liste der Subcategories für die gewählte Category)
```

### E) Reset-Logik in page.tsx

```
Wenn Category sich ändert:
→ setFilters({ ...filters, category: newCategory, subcategory: "" })
→ Lade neue Subcategories für newCategory
→ Alte Subcategory wird automatisch zurückgesetzt

Wenn "Clear filters" geklickt:
→ subcategory wird mit allen Filtern zurückgesetzt (bereits im onChange Handler)
```

### F) Tech-Entscheidungen

```
Warum Supabase-Query statt RPC für Subcategories?
→ Einfache DISTINCT-Abfrage, kein komplexes Aggregat.
  Supabase JS Client kann das direkt ohne RPC.

Warum Subcategory-Liste als Prop statt im FilterPanel laden?
→ Der State für die gewählte Category lebt in page.tsx.
  page.tsx lädt die Liste und gibt sie als Prop weiter.
  Konsistent mit dem bestehenden Pattern (countries werden genauso geladen).

Warum kein Backend-Change für die Hauptquery?
→ Supabase .eq("subcategory_1", value) reicht aus.
  Keine RPC-Änderung nötig.
```

### G) Dependencies

```
Keine neuen Packages nötig!
```
