# PROJ-48: Reporting Chart Presentation Improvements

## Status: ✅ Done

**Implementation Date:** 2026-02-17
**Commits:** d394fc6, 8752935
**Build Status:** ✅ PASS

## Abhängigkeiten
- Benötigt: PROJ-12 (Reporting Module) - Charts existieren
- Benötigt: PROJ-16 (Chart Label Readability) - chart-theme.ts existiert

## Kontext
Die Reporting-Charts haben aktuell Probleme mit überlappenden Labels, insbesondere im "TOTAL FUNDING BY SEGMENT" Chart. Die Kategorie-Namen (z.B. "Financial Foundation", "Infrastructure & Technology", "Investment & Wealth Building") sind zu lang für vertikale Balkendiagramme mit rotierten X-Achsen-Labels. Trotz erhöhter Rotation (-45°) und vergrößerten Margins überlappen die Labels weiterhin mit den Balken.

**User Feedback:** "Das passt immer noch nicht, ist eher schlechter geworden"

### Kern-Problem
Vertikale Balkendiagramme mit langen Kategorie-Namen führen zu:
- Labels überlappen mit Balken-Elementen
- Unlesbarer Text durch starke Rotation
- Verschwendeter vertikaler Platz durch lange rotierte Labels
- Inkonsistente Chart-Präsentation zwischen verschiedenen Report-Komponenten

---

## User Stories

### US-1: Lesbare Kategorie-Labels
Als Analyst möchte ich, dass alle Kategorie- und Subcategory-Namen in Charts vollständig und ohne Überlappung lesbar sind, damit ich die Daten schnell erfassen kann.

### US-2: Konsistente Chart-Präsentation
Als User möchte ich, dass alle Reporting-Charts (Funding by Segment, Timeline, Distributions) ein konsistentes visuelles Layout mit einheitlichen Abständen, Schriftgrößen und Label-Positionen haben.

### US-3: Optimale Nutzung des verfügbaren Platzes
Als User möchte ich, dass Charts den verfügbaren Platz optimal nutzen - lange Labels sollen horizontal dargestellt werden wo sie unbegrenzten Raum haben.

### US-4: Schnelle Datenerfassung
Als Analyst möchte ich Kategorie-Namen und Werte in einem Blick erfassen können ohne Charts drehen oder rotierte Labels entziffern zu müssen.

---

## Acceptance Criteria

### Funding by Segment Chart

- [ ] **AC-1:** Das "TOTAL FUNDING BY SEGMENT" Chart wird als **horizontales Balkendiagramm** dargestellt:
  - Kategorie-/Subcategory-Namen auf der **Y-Achse** (vertikal linksbündig)
  - Balken wachsen **horizontal** von links nach rechts
  - Funding-Beträge auf der **X-Achse** (unten)

- [ ] **AC-2:** Y-Achsen-Labels (Kategorie-Namen) sind:
  - **Nicht rotiert** (0°, horizontal lesbar)
  - **Nicht abgeschnitten** - volle Namen sichtbar (bis 40 Zeichen)
  - **Nicht überlappend** mit Balken oder anderen Labels
  - Font-Size: 11-12px
  - Farbe: `colors.foreground` (Theme-aware)

- [ ] **AC-3:** X-Achsen-Labels (Funding-Beträge) sind:
  - Formatiert via `formatFundingValue()` (z.B. "$12.3B")
  - Font-Size: 11px
  - Farbe: `colors.muted` (Theme-aware)

- [ ] **AC-4:** Chart-Container:
  - Height: 300-350px (abhängig von Anzahl Kategorien: 5 Kategorien = 300px, >8 Subcategories = 350px)
  - Width: 100% (responsive)
  - Margins: `{ top: 10, right: 20, bottom: 30, left: 150 }` (großer linker Margin für lange Labels)

- [ ] **AC-5:** Tooltip bei Hover:
  - Zeigt vollständigen Kategorie-/Subcategory-Namen (falls Y-Label gekürzt)
  - Zeigt exakten Funding-Betrag
  - Verwendet `tooltipStyle(colors)` für konsistentes Theme-aware Styling

- [ ] **AC-6:** Balken-Farben bleiben erhalten:
  - Nutzen `getSegmentColor(segment, index)` wie bisher
  - Farben sind identisch zu KPI-Cards und CategoryBadges

### Timeline Chart (Optional - für Konsistenz)

- [ ] **AC-7:** "FUNDING TIMELINE" Chart (Stacked Bar) behält vertikales Layout (Jahre auf X-Achse sind kurz und lesbar)

- [ ] **AC-8:** Timeline Chart verwendet einheitliche Margins und Font-Sizes wie Funding-Chart:
  - Font-Size für Achsen: 11px
  - Margins: `{ top: 10, right: 20, bottom: 40, left: 50 }`
  - Legende: Font-Size 11px, Position: `bottom` oder `right`

### Status & Target Model Charts (Pie/Donut)

- [ ] **AC-9:** Pie/Donut-Charts verwenden konsistente Font-Sizes:
  - Labels: 11-12px
  - Tooltip: 13px (via `tooltipStyle`)

- [ ] **AC-10:** Pie/Donut-Charts haben einheitliche Größe:
  - Height: 250px (konsistent in beiden Charts)
  - InnerRadius: 35% (Donut-Dicke konsistent)

### Top Countries List

- [ ] **AC-11:** TopCountriesList verwendet gleiche Font-Sizes wie Charts:
  - Länder-Namen: 12px
  - Counts: 11px

---

## Edge Cases

### EC-1: Sehr lange Subcategory-Namen
**Wenn** eine Subcategory einen Namen > 40 Zeichen hat (z.B. "Alternative Lending & Credit Solutions for SMEs"),
**dann** wird der Y-Achsen-Label gekürzt auf 38 Zeichen + "..." (z.B. "Alternative Lending & Credit Solu..."), aber der volle Name erscheint im Tooltip.

### EC-2: Nur 2-3 Kategorien/Subcategories im Drill-Down
**Wenn** eine Kategorie nur 2-3 Subcategories hat,
**dann** wird die Chart-Height reduziert auf `200px` (weniger leerer Raum), aber die Balken-Höhe erhöht auf mindestens 30px (gut klickbar).

### EC-3: Mehr als 10 Subcategories im Drill-Down
**Wenn** eine Kategorie > 10 Subcategories hat,
**dann** wird die Chart-Height auf `400px` erhöht und Balken-Höhe auf `20px` reduziert (scrolling optional, aber alle sichtbar).

### EC-4: Funding-Wert = 0 oder NULL
**Wenn** eine Kategorie `total_funding_sum = 0` hat,
**dann** wird sie bereits in `FundingByCategoryChart.tsx:31` herausgefiltert (`.filter((s) => s.total_funding_sum > 0)`), erscheint also nicht im Chart (bestehende Logik bleibt).

### EC-5: Mobile/Tablet Ansicht (schmale Bildschirme)
**Wenn** der Viewport < 768px breit ist,
**dann** bleibt das horizontale Layout (Y-Achsen-Labels sind platzsparender als rotierte X-Achsen-Labels), aber:
- Left Margin reduziert auf 120px
- Font-Size für Labels reduziert auf 10px
- Kürzung der Labels auf 30 Zeichen + "..."

### EC-6: Theme-Wechsel (Dark Mode)
**Wenn** der User zwischen Light/Dark Mode wechselt,
**dann** passen sich alle Chart-Textfarben automatisch an via `useChartColors()` Hook ohne Page Reload.

### EC-7: Sehr kleine Funding-Beträge (<$100K)
**Wenn** ein Balken einen sehr kleinen Wert hat (Balken-Breite <5% der X-Achse),
**dann** bleibt der Balken trotzdem sichtbar (mindestens 2px breit) und der Tooltip zeigt den exakten Betrag.

---

## Technische Anforderungen

### Performance
- Chart-Rendering < 300ms (keine Verzögerung beim Drill-Down-Wechsel)
- Recharts `ResponsiveContainer` nutzt `debounce` für Resize-Events (bereits eingebaut)

### Accessibility
- Alle Chart-Balken sind keyboard-navigierbar (Recharts default)
- Tooltips erscheinen bei Keyboard-Focus (nicht nur bei Hover)
- Labels haben ausreichenden Kontrast (WCAG AA: mindestens 4.5:1)

### Responsiveness
- Charts passen sich an Container-Breite an (100% width)
- Charts behalten Aspect Ratio auf Tablet (768px - 1024px)
- Mobile-Ansicht (<768px) zeigt reduzierte Font-Sizes, bleibt aber horizontal

### Browser-Kompatibilität
- Chrome/Edge (aktuell)
- Firefox (aktuell)
- Safari (aktuell)
- Keine IE11-Unterstützung nötig

---

## Tech-Design (Solution Architect)

### A) Betroffene Dateien

```
Geändert:
├── src/components/reporting/FundingByCategoryChart.tsx  ← KRITISCH: Vertical → Horizontal
├── src/components/reporting/FundingTimelineChart.tsx    ← KLEIN: Margin-Anpassungen
├── src/components/reporting/StatusDistributionChart.tsx ← KLEIN: Height-Konsistenz
├── src/components/reporting/TargetModelChart.tsx        ← KLEIN: Height-Konsistenz

Unverändert:
├── src/components/reporting/TopCountriesList.tsx
├── src/components/reporting/TopKeywordsCloud.tsx
├── src/components/reporting/CategoryKpiCards.tsx
└── src/lib/chart-theme.ts (bereits korrekt implementiert)
```

### B) Kern-Änderung: Vertical → Horizontal Bar Chart

**Aktuell (FundingByCategoryChart.tsx):**
```tsx
<BarChart
  data={data}
  layout="horizontal"  // ← irreführend! "horizontal" bedeutet bei Recharts vertikale Balken
  margin={{ top: 8, right: 8, left: 8, bottom: 65 }}
>
  <XAxis
    dataKey="name"
    angle={-45}  // ← rotierte Labels
    textAnchor="end"
    height={80}
  />
  <YAxis tickFormatter={(v) => formatFundingValue(v)} />
</BarChart>
```

**Neu (Horizontal Bars):**
```tsx
<BarChart
  data={data}
  layout="vertical"  // ← horizontale Balken!
  margin={{ top: 10, right: 20, bottom: 30, left: 150 }}  // ← großer linker Margin
>
  <XAxis
    type="number"
    tickFormatter={(v) => formatFundingValue(v)}
    tick={{ fontSize: 11, fill: colors.muted }}
    axisLine={{ stroke: colors.border }}
  />
  <YAxis
    dataKey="name"
    type="category"
    tick={{ fontSize: 12, fill: colors.foreground }}
    width={140}  // ← Platz für lange Labels
  />
</BarChart>
```

**Recharts-Quirk erklärt:**
- `layout="horizontal"` → Balken wachsen **vertikal** (Y-Werte), Kategorien auf X-Achse
- `layout="vertical"` → Balken wachsen **horizontal** (X-Werte), Kategorien auf Y-Achse
- Naming ist verwirrend, aber so ist Recharts API designed!

### C) Standardisierte Chart-Dimensionen

```
Funding by Segment (Horizontal Bars):
├── Height: 300px (5 Categories) | 350px (6-10 Subcategories) | 400px (>10 Subcategories)
├── Width: 100%
└── Margins: { top: 10, right: 20, bottom: 30, left: 150 }

Funding Timeline (Stacked Bars):
├── Height: 320px (konsistent)
├── Width: 100%
└── Margins: { top: 10, right: 20, bottom: 40, left: 50 }

Status Distribution (Donut):
├── Height: 250px
├── Width: 100%
└── Inner Radius: 35%

Target Model (Donut):
├── Height: 250px
├── Width: 100%
└── Inner Radius: 35%
```

### D) Standardisierte Font-Sizes

```
Chart-Titel:
└── 13px, font-semibold, uppercase, tracking-wider, text-muted

Achsen-Labels:
├── Kategorie-Namen (Y-Achse horizontal): 12px, text-foreground
├── Zahlen (X/Y-Achse): 11px, text-muted
└── Timeline-Legende: 11px, text-foreground

Tooltips:
├── 13px, font-weight: 500
└── Via tooltipStyle(colors) (bereits in chart-theme.ts)

KPI-Cards & Listen (Referenz, nicht geändert):
├── Titel: 12px
└── Werte: 14px (bold)
```

### E) Y-Achsen-Label-Kürzung Logik

```tsx
const data = stats
  .filter((s) => s.total_funding_sum > 0)
  .map((s, i) => ({
    // Original-Name für Tooltip
    fullName: s.segment,

    // Gekürzter Name für Y-Achse
    name: s.segment.length > 40
      ? s.segment.slice(0, 38) + "..."
      : s.segment,

    value: s.total_funding_sum,
    color: getSegmentColor(s.segment, i),
  }));

// Tooltip zeigt fullName
<Tooltip
  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
  formatter={(value) => [formatFundingValue(value as number), "Total Funding"]}
  contentStyle={tooltipStyle(colors)}
/>
```

### F) Responsive Anpassungen (Optional - Phase 2)

```tsx
// Hook für Breakpoint-Detection
const isMobile = useMediaQuery("(max-width: 768px)");

// Responsive Margins
const margins = isMobile
  ? { top: 10, right: 10, bottom: 30, left: 120 }
  : { top: 10, right: 20, bottom: 30, left: 150 };

// Responsive Label-Kürzung
const maxLabelLength = isMobile ? 30 : 40;

// Responsive Font-Size
const labelFontSize = isMobile ? 10 : 12;
```

**Anmerkung:** Responsive Anpassungen sind optional für MVP. Desktop-First ist ausreichend, da Reporting primär auf Desktop genutzt wird.

### G) Tech-Entscheidungen — Warum diese Lösung?

**Warum horizontale Balken statt aggressiverer Kürzung?**
→ Kategorie-Namen sind inhaltlich wichtig ("Investment & Wealth Building" vs "Inv&WB" verliert Bedeutung).
→ Horizontale Balken sind der Standard für Charts mit langen Kategorie-Namen (siehe Google Analytics, Tableau, Power BI).
→ Keine Rotation = bessere Lesbarkeit, keine Platzverschwendung.

**Warum `layout="vertical"` (trotz verwirrender Naming)?**
→ Recharts API-Design: `layout` bezieht sich auf die Daten-Richtung, nicht auf die Balken-Richtung.
→ `layout="vertical"` ist der korrekte Wert für horizontal wachsende Balken mit Kategorien auf Y-Achse.

**Warum Left Margin 150px?**
→ Längster Kategorie-Name: "Investment & Wealth Building" = ~34 Zeichen @ 12px Font ≈ 140px.
→ 150px gibt 10px Buffer für Padding.
→ Subcategory-Namen können länger sein, werden dann gekürzt (40 Zeichen @ 12px ≈ 145px).

**Warum nicht alle Charts horizontal?**
→ Timeline-Chart (Jahre 2010-2025) hat kurze X-Labels (4 Zeichen) → vertikales Layout optimal.
→ Pie/Donut-Charts haben keine Achsen → keine Änderung nötig.
→ Nur Charts mit langen Kategorie-Labels profitieren von Rotation.

**Warum keine Chart-Library wechseln?**
→ Recharts ist bewährt (PROJ-12 bereits komplett implementiert), unterstützt horizontale Bars nativ.
→ Kein neues Package nötig, keine Breaking Changes.

### H) Dependencies

**Keine neuen Packages nötig!**
- Recharts v3.7.0 (bereits installiert) — unterstützt `layout="vertical"` nativ
- chart-theme.ts (bereits implementiert) — `useChartColors()` und `tooltipStyle()` direkt nutzbar

### I) Aufwand-Einschätzung

| # | Datei | Änderung | Umfang |
|---|-------|----------|--------|
| 1 | `FundingByCategoryChart.tsx` | Vertical → Horizontal Layout, Margin-Anpassungen, Label-Kürzung-Logik | **Mittel** — ~30 Zeilen geändert |
| 2 | `FundingTimelineChart.tsx` | Margin-Konsistenz, Font-Size-Anpassungen | **Klein** — ~5 Zeilen |
| 3 | `StatusDistributionChart.tsx` | Height-Konsistenz (250px) | **Klein** — 1 Zeile |
| 4 | `TargetModelChart.tsx` | Height-Konsistenz (250px) | **Klein** — 1 Zeile |

**Gesamtumfang:** 4 Dateien geändert, keine neuen Dateien, keine neuen Dependencies

**Risiko:** **Niedrig**
- Recharts horizontal bars sind Standard-Feature (gut dokumentiert, stabil)
- Keine komplexe Logik-Änderung, nur Layout-Anpassungen
- chart-theme.ts bleibt unverändert
- Keine Supabase/Backend-Änderungen nötig

---

## Checkliste vor Abschluss

- [ ] User hat bestätigt: Horizontal Bars sind die gewünschte Lösung
- [ ] User hat bestätigt: Konsistenz über alle Charts ist gewünscht
- [ ] Feature-ID PROJ-48 vergeben
- [ ] File gespeichert: `/features/PROJ-48-reporting-chart-presentation-improvements.md`
- [ ] Status gesetzt: 🔵 Planned
- [ ] Abhängigkeiten zu PROJ-12 und PROJ-16 dokumentiert
- [ ] Alle Edge Cases identifiziert und dokumentiert
- [ ] Acceptance Criteria sind testbar (nicht vage)
- [ ] Tech-Design gibt klaren Implementierungs-Plan vor

---

## User Review

**Status:** ⏳ Wartet auf User-Approval

**Fragen an User:**
1. Sind die AC-Kriterien vollständig? Fehlt etwas?
2. Ist die Horizontal-Bar-Lösung für alle Reporting-Charts akzeptabel?
3. Soll Mobile-Responsiveness (AC-5 Edge Case) im MVP enthalten sein oder Phase 2?

