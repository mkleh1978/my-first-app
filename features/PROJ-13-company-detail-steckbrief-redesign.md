# PROJ-13: Company Detail Steckbrief — Redesign

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-9 (Company Detail Modal) — bestehende Modal-Infrastruktur
- Benötigt: PROJ-1 (FinTech Database) — Datenmodell

## Zusammenfassung
Der Company-Steckbrief (Detail Modal) wird komplett überarbeitet: klarere Struktur, Bullet Points für lange Texte, optimierte Reihenfolge, 2-Spalten Grid mit Icons für Company Info, und leere Felder werden ausgeblendet.

---

## User Stories

- **US-1**: Als User möchte ich auf einen Blick die wichtigsten KPIs eines Unternehmens sehen (Funding, Founded, Employees, Status), um schnell einschätzen zu können, ob das Unternehmen relevant ist.

- **US-2**: Als User möchte ich die Kategorien und Subcategories direkt unter den KPIs sehen, um sofort zu verstehen, in welchem Bereich das Unternehmen aktiv ist.

- **US-3**: Als User möchte ich lange Textfelder (Key Features, Investors, Competitors etc.) als übersichtliche Bullet-Listen sehen, statt als Fließtext-Blöcke.

- **US-4**: Als User möchte ich Company-Infos (Location, Target Model, Product Type, Founders) in einem übersichtlichen 2-Spalten Grid mit Icons sehen, um Informationen schnell scannen zu können.

- **US-5**: Als User möchte ich, dass leere Felder komplett ausgeblendet werden, damit der Steckbrief sauber und nicht mit Platzhaltern aufgebläht wirkt.

- **US-6**: Als User möchte ich die Funding-Historie weiterhin als Balkendiagramm sehen, um Funding-Trends visuell erfassen zu können.

---

## Acceptance Criteria

### Section-Reihenfolge (optimiert)
- [ ] **AC-1**: Die Sections erscheinen in folgender Reihenfolge:
  1. Header (Name, Domain, HoFT-Badge, Beschreibung)
  2. Quick Stats (4er-Grid: Total Funding, Founded, Employees, Status)
  3. Categories (Kategorie/Subcategory Badges)
  4. Company Info (2-Spalten Grid mit Icons)
  5. Product Details (Bullet-Listen)
  6. Funding History (Chart + Latest Round)
  7. Investors (Bullet-Liste)
  8. Competitors (Bullet-Liste)
  9. Integration Capabilities (Bullet-Liste)

### Header
- [ ] **AC-2**: Company Name, Domain-Link, HoFT-Badge und Beschreibung bleiben wie bisher im Header.

### Quick Stats
- [ ] **AC-3**: Die 4 KPI-Karten (Total Funding, Founded, Employees, Status) bleiben als kompaktes 4er-Grid erhalten.

### Categories
- [ ] **AC-4**: Categories werden direkt nach den Quick Stats angezeigt (statt weiter unten).
- [ ] **AC-5**: Jede Kategorie/Subcategory-Kombination wird als Badge dargestellt (wie bisher).

### Company Info — 2-Spalten Grid mit Icons
- [ ] **AC-6**: Company Info wird als 2-Spalten Grid dargestellt (responsive: 1 Spalte auf Mobile).
- [ ] **AC-7**: Jedes Info-Feld hat ein passendes Icon links neben dem Label:
  - Location → Map-Pin Icon
  - Region → Globe Icon
  - Target Model → Users/Target Icon
  - Product Type → Package/Box Icon
  - Founders/CEOs → Person Icon
- [ ] **AC-8**: Felder ohne Daten (null/leer) werden komplett ausgeblendet — kein "-" oder "N/A".

### Product Details — Bullet Points
- [ ] **AC-9**: Folgende Felder werden als separate Sections mit Bullet-Listen dargestellt:
  - Core Value Proposition
  - Problem Solved
  - Key Features
  - Competitive Advantage / USP
- [ ] **AC-10**: Lange Textfelder werden automatisch an Kommas, Semikolons oder Zeilenumbrüchen gesplittet und als `<ul>/<li>` Bullet-Liste gerendert.
- [ ] **AC-11**: Falls der Text keine trennbaren Teile enthält (einzelner Satz), wird er als normaler Absatz dargestellt (kein einzelner Bullet).

### Funding History
- [ ] **AC-12**: Das Funding-Balkendiagramm (FundingChart) bleibt erhalten.
- [ ] **AC-13**: Latest Round wird darunter angezeigt.

### Investors, Competitors, Integration
- [ ] **AC-14**: Investors werden als Bullet-Liste dargestellt (automatisch an Kommas gesplittet).
- [ ] **AC-15**: Top Competitors werden als Bullet-Liste dargestellt (automatisch an Kommas gesplittet).
- [ ] **AC-16**: Integration Capabilities werden als Bullet-Liste dargestellt.

### Leere Felder
- [ ] **AC-17**: Jede Section, die keine Daten enthält, wird komplett ausgeblendet (inkl. Section-Header).
- [ ] **AC-18**: Innerhalb einer Section werden einzelne leere Felder ausgeblendet.

---

## Edge Cases

- **EC-1**: Text ohne Trennzeichen — Wenn ein Textfeld wie "Key Features" nur einen einzigen Satz ohne Kommas/Semikolons enthält, wird er als normaler Paragraph angezeigt (nicht als einzelner Bullet Point).
- **EC-2**: Sehr viele Bullets — Wenn ein Feld wie "Investors" 20+ Einträge hat, werden alle angezeigt (kein Abschneiden). Die Liste scrollt innerhalb des Modals.
- **EC-3**: Company ohne Kategorien — Wenn keine category_1/2/3 gesetzt ist, wird die gesamte Categories-Section ausgeblendet.
- **EC-4**: Komplett leerer Steckbrief — Wenn ein Unternehmen nur Name und Domain hat, werden nur Header und Quick Stats angezeigt (alle anderen Sections ausgeblendet).
- **EC-5**: Gemischte Trennzeichen — Ein Text wie "Feature A, Feature B; Feature C" wird korrekt in 3 Bullets gesplittet (Komma UND Semikolon als Trenner).

---

## Technische Anforderungen
- Nur Frontend-Änderungen in `CompanyDetailModal.tsx` — kein Backend/API-Change nötig
- Bullet-Splitting als Utility-Funktion (wiederverwendbar)
- Icons: Inline SVG oder Lucide-Icons (falls bereits im Projekt)
- Responsive: 2-Spalten Grid → 1 Spalte auf Mobile (sm: Breakpoint)

---

## Tech-Design (Solution Architect)

### A) Betroffene Dateien

```
Geändert:
└── src/components/CompanyDetailModal.tsx  ← Hauptarbeit (komplettes Redesign)

Neu:
└── src/lib/text-utils.ts  ← Utility für Bullet-Splitting (wiederverwendbar)

Unverändert:
├── src/components/FundingChart.tsx  ← Bleibt wie ist
├── src/types/fintech.ts            ← Kein Datenmodell-Change
└── src/app/page.tsx                ← Kein Backend-Change
```

### B) Component-Struktur (neu)

```
CompanyDetailModal
├── Modal-Overlay (Backdrop + Click-to-close)
├── Header
│   ├── Company Name + HoFT-Badge
│   ├── Domain-Link (externer Link)
│   └── Beschreibung (Fließtext)
├── Quick Stats (4er-Grid)
│   ├── Total Funding
│   ├── Founded
│   ├── Employees
│   └── Status
├── Categories (Badge-Leiste)                    ← HOCHGEZOGEN von Position 4→3
│   └── Category/Subcategory Badges (max 3)
├── Company Info (2-Spalten Grid mit Icons)      ← NEU: Icons + Grid-Layout
│   ├── 📍 Location (City, Country)
│   ├── 🌐 Region
│   ├── 🎯 Target Model
│   ├── 📦 Product Type
│   └── 👤 Founders/CEOs
├── Product Details (Bullet-Listen)              ← NEU: Auto-Split in Bullets
│   ├── Core Value Proposition
│   ├── Problem Solved
│   ├── Key Features
│   └── Competitive Advantage / USP
├── Funding History
│   ├── FundingChart (Balkendiagramm — unverändert)
│   └── Latest Round Info
├── Investors (Bullet-Liste)                     ← NEU: War vorher Fließtext
├── Competitors (Bullet-Liste)                   ← NEU: War vorher Fließtext
└── Integration Capabilities (Bullet-Liste)      ← NEU: War vorher Fließtext
```

**Wichtig:** Jede Section wird nur angezeigt, wenn Daten vorhanden sind.

### C) Neue Utility: Text-zu-Bullets Splitting

```
Datei: src/lib/text-utils.ts

Funktion: splitTextToBullets(text)
→ Eingabe: "Feature A, Feature B; Feature C"
→ Ausgabe: ["Feature A", "Feature B", "Feature C"]

Logik:
1. Splittet an: Komma (,) ODER Semikolon (;) ODER Zeilenumbruch (\n)
2. Trimmt Whitespace von jedem Eintrag
3. Entfernt leere Einträge
4. Wenn nur 1 Eintrag übrig → Kein Bullet, normaler Paragraph
5. Wenn 2+ Einträge → Bullet-Liste
```

### D) Icon-Zuordnung (Company Info Section)

```
lucide-react ist bereits installiert (v0.564.0) aber noch unbenutzt.
→ Erste Nutzung von Lucide Icons im Projekt!

Zuordnung:
- Location     → MapPin Icon
- Region       → Globe Icon
- Target Model → Target Icon
- Product Type → Package Icon
- Founders     → User Icon
```

### E) Tech-Entscheidungen

```
Warum lucide-react statt weiterhin Inline-SVGs?
→ Ist bereits installiert, Tree-Shakeable (nur genutzte Icons im Bundle),
  konsistente Größen/Styles, besser wartbar als handgeschriebene SVG-Pfade.

Warum separate text-utils.ts statt Inline-Logik?
→ Bullet-Splitting wird in 6+ Feldern genutzt (Key Features, Investors,
  Competitors, etc.) — eine Utility vermeidet Duplikation und ist für
  zukünftige Features wiederverwendbar.

Warum kein Backend-Change nötig?
→ Alle Daten sind bereits vorhanden. Es ändert sich nur die Darstellung,
  nicht die Datenquelle.
```

### F) Responsive Verhalten

```
Company Info Grid:
- Desktop (≥640px): 2 Spalten
- Mobile (<640px):  1 Spalte

Quick Stats Grid:
- Desktop (≥640px): 4 Spalten (bleibt wie bisher)
- Mobile (<640px):  2 Spalten (bleibt wie bisher)
```

### G) Dependencies

```
Keine neuen Packages nötig!
- lucide-react ist bereits installiert (nur noch nicht importiert)
```
