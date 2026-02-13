# PROJ-16: Chart Label Readability

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-12 (Reporting) — Reporting-Charts existieren
- Benötigt: PROJ-9 (Company Detail Modal) — FundingChart existiert

## Zusammenfassung
Alle Charts im Projekt werden auf Lesbarkeit geprüft und korrigiert. Das Hauptproblem: Hardcoded dunkelnavy Textfarben (`#170245`) sind auf dunklen Hintergründen nicht lesbar. Die Fix-Strategie: Alle Chart-Textfarben auf CSS-Variablen umstellen, die sich automatisch an den Hintergrund anpassen.

---

## User Stories

- **US-1**: Als User möchte ich, dass Chart-Beschriftungen (Achsen, Tooltips, Legenden) immer gut lesbar sind, egal ob heller oder dunkler Hintergrund.

- **US-2**: Als User möchte ich, dass Tooltips einen klaren Kontrast zum Chart-Hintergrund haben.

- **US-3**: Als User möchte ich, dass alle Charts visuell konsistent sind (gleiche Textfarben, gleiche Tooltip-Styles).

---

## Acceptance Criteria

### Betroffene Charts (alle 8 prüfen)

**Kritisch — hardcoded `#170245` Textfarben:**
- [ ] **AC-1**: `FundingByCategoryChart` — Achsen-Labels verwenden Theme-aware Farbe statt hardcoded `#170245`.
- [ ] **AC-2**: `FundingTimelineChart` — Achsen-Labels und Legenden-Text verwenden Theme-aware Farbe.
- [ ] **AC-3**: `FundingChart` (Steckbrief) — Achsen-Labels und Tooltip-Textfarbe verwenden Theme-aware Farbe.

**Mittel — Tooltip-Styling konsistent machen:**
- [ ] **AC-4**: `StatusDistributionChart` — Tooltip-Hintergrund und Textfarbe verwenden Theme-aware Farben.
- [ ] **AC-5**: `TargetModelChart` — Tooltip-Hintergrund und Textfarbe verwenden Theme-aware Farben.

**OK — Bereits Tailwind-Variablen (nur Verifizierung):**
- [ ] **AC-6**: `TopCountriesList` — Nutzt bereits Tailwind-Variablen, keine Änderung nötig.
- [ ] **AC-7**: `TopKeywordsCloud` — Nutzt bereits Tailwind-Variablen, keine Änderung nötig.
- [ ] **AC-8**: `CategoryKpiCards` — Nutzt bereits Tailwind-Variablen, keine Änderung nötig.

### Tooltip-Konsistenz
- [ ] **AC-9**: Alle Tooltips verwenden die gleiche Hintergrundfarbe (Theme-aware: surface/background).
- [ ] **AC-10**: Alle Tooltips verwenden die gleiche Textfarbe (Theme-aware: foreground).
- [ ] **AC-11**: Alle Tooltips haben die gleiche Border-Farbe (Theme-aware: border).

### Achsen-Konsistenz
- [ ] **AC-12**: Alle Recharts-Achsen-Labels verwenden eine einheitliche Theme-aware Textfarbe.
- [ ] **AC-13**: Achsen-Linien und Grid-Lines verwenden Theme-aware Farben.

---

## Edge Cases

- **EC-1**: CSS-Variablen in Recharts — Recharts akzeptiert keine CSS-Variablen (`var(--color)`) direkt in `fill`/`stroke` Props. Lösung: Die CSS-Variable per JavaScript auslesen oder feste Farben verwenden, die sowohl auf hell als auch dunkel gut lesbar sind.
- **EC-2**: Server-Side Rendering — `getComputedStyle` funktioniert nicht auf dem Server. Charts müssen Client-Side gerendert werden (sind bereits "use client").
- **EC-3**: Transition bei Theme-Wechsel — Falls Dark Mode toggle eingebaut wird, sollten Charts die Farben ohne Page Reload aktualisieren.

---

## Technische Anforderungen
- Identifiziere alle hardcoded Hex-Farben in Recharts-Komponenten
- Ersetze durch Theme-kompatible Lösung (z.B. CSS-Variablen auslesen via Hook oder universelle Farben)
- Tooltip-Styles zentralisieren (evtl. als Shared-Konstante)
- Keine neuen Dependencies nötig

---

## Tech-Design (Solution Architect)

### A) Betroffene Dateien

```
Neu:
└── src/lib/chart-theme.ts  ← Hook + Shared Tooltip/Axis Styles

Geändert (Recharts-Komponenten):
├── src/components/FundingChart.tsx                        ← KRITISCH
├── src/components/reporting/FundingByCategoryChart.tsx     ← KRITISCH
├── src/components/reporting/FundingTimelineChart.tsx       ← KRITISCH
├── src/components/reporting/StatusDistributionChart.tsx    ← MITTEL
└── src/components/reporting/TargetModelChart.tsx           ← MITTEL

Unverändert (bereits Theme-aware):
├── src/components/reporting/TopCountriesList.tsx           ← OK
├── src/components/reporting/TopKeywordsCloud.tsx           ← OK
└── src/components/reporting/CategoryKpiCards.tsx           ← OK
```

### B) Kern-Problem und Lösung

```
Problem:
  Recharts akzeptiert keine CSS-Variablen (var(--foreground)) in fill/stroke.
  Aktuell: fill="#170245" (hardcoded Navy) → unsichtbar auf dunklem Hintergrund.

Lösung: useChartColors() Hook
  → Liest CSS-Variablen aus dem DOM via getComputedStyle
  → Gibt Hex-Farben zurück, die Recharts direkt nutzen kann
  → Reagiert auf Theme-Änderungen (falls Dark Mode Toggle kommt)

Farben die gelesen werden:
  --foreground → für Achsen-Text und Tooltip-Text
  --muted      → für dezente Achsen-Text (Alternative)
  --surface    → für Tooltip-Hintergrund
  --border     → für Tooltip-Border und Achsen-Linien
```

### C) Neue Utility: chart-theme.ts

```
Datei: src/lib/chart-theme.ts

1. Hook: useChartColors()
   → Liest CSS-Variablen beim Mount
   → Returned: { foreground, muted, surface, border }
   → Alle als Hex-Strings (z.B. "#170245" oder "#E8E6EF")

2. Shared Styles: getTooltipStyle(colors)
   → Gibt einheitliches Tooltip contentStyle-Objekt zurück:
     backgroundColor: colors.surface
     color: colors.foreground
     border: "1px solid " + colors.border
     borderRadius: "8px"
     fontSize: "13px"

3. Shared Styles: getAxisTickStyle(colors)
   → Gibt einheitliches Achsen-Tick-Objekt zurück:
     fontSize: 11
     fill: colors.muted
```

### D) Bestandsaufnahme — Was wird geändert

```
FundingByCategoryChart.tsx:
  VORHER: tick={{ fill: "#170245" }}
  NACHHER: tick={{ fill: colors.muted }}
  VORHER: contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E0E1E5" }}
  NACHHER: contentStyle={tooltipStyle}

FundingTimelineChart.tsx:
  VORHER: tick={{ fill: "#170245" }}
  NACHHER: tick={{ fill: colors.muted }}
  VORHER: contentStyle={{ backgroundColor: "#FFFFFF", ... }}
  NACHHER: contentStyle={tooltipStyle}

FundingChart.tsx (Steckbrief):
  VORHER: const NAVY = "#170245"; tick={{ fill: NAVY }}
  NACHHER: tick={{ fill: colors.muted }}
  VORHER: contentStyle={{ backgroundColor: "#FFFFFF", color: NAVY, ... }}
  NACHHER: contentStyle={tooltipStyle}
  (TEAL und ORANGE Konstanten bleiben — die sind Branding-Farben, nicht Theme-Farben)

StatusDistributionChart.tsx:
  VORHER: contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E0E1E5" }}
  NACHHER: contentStyle={tooltipStyle}

TargetModelChart.tsx:
  VORHER: contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E0E1E5" }}
  NACHHER: contentStyle={tooltipStyle}
```

### E) Theme-Farben Mapping

```
Light Mode:
  --foreground: #170245 (Navy)      → gut auf weißem Hintergrund
  --muted:      #5A5670 (Grau-Lila) → dezent auf weißem Hintergrund
  --surface:    #FFFFFF (Weiß)       → Tooltip-Hintergrund
  --border:     #E0E1E5 (Hellgrau)   → Tooltip-Border

Dark Mode:
  --foreground: #E8E6EF (Hell-Lila)  → gut auf dunklem Hintergrund
  --muted:      #9B94B3 (Mittel-Lila)→ dezent auf dunklem Hintergrund
  --surface:    #1A1040 (Dunkel-Lila) → Tooltip-Hintergrund
  --border:     #2D1B69 (Dunkel-Lila) → Tooltip-Border
```

### F) Tech-Entscheidungen

```
Warum Custom Hook statt feste Farben?
→ Feste Farben müssten in beiden Themes gut lesbar sein.
  Ein mittleres Grau (#888) wäre auf beiden Hintergründen mäßig.
  Der Hook liest die echten Theme-Farben → optimaler Kontrast.

Warum getComputedStyle statt Theme-Context?
→ Das Projekt hat keinen React Theme-Provider.
  Die Farben kommen direkt aus CSS via @media (prefers-color-scheme).
  getComputedStyle ist die einfachste Brücke zu React.

Warum TEAL/ORANGE Konstanten beibehalten?
→ Diese sind Branding-Farben, keine Theme-Farben.
  Teal #006B6B und Orange #EA5A3C haben genug Kontrast
  auf sowohl hellen als auch dunklen Hintergründen.
```

### G) Dependencies

```
Keine neuen Packages nötig!
Nur getComputedStyle() vom Browser DOM.
```
