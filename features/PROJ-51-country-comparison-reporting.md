# PROJ-51: Country Comparison in Reporting

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-12 (Reporting) — bestehende Reporting-Infrastruktur und Supabase RPCs

## User Stories
- Als User möchte ich eine Übersichtstabelle aller Länder mit ihren KPIs sehen, um schnell Trends zu erkennen
- Als User möchte ich die Ländertabelle nach jeder Metrik sortieren können, um Rankings zu sehen
- Als User möchte ich bis zu 3 Länder für einen Detail-Vergleich auswählen können, um sie nebeneinander zu analysieren
- Als User möchte ich pro Land folgende Metriken sehen: Anzahl Companies, Gesamt-Funding, Durchschnitts-Funding, Kategorien-Verteilung, Status-Verteilung, Gründungsjahre-Verteilung
- Als User möchte ich den Country Comparison als Tab innerhalb der Reporting-Seite erreichen

## Acceptance Criteria

### Tab-Navigation
- [ ] Reporting-Seite hat Tab-Navigation: "Overview" (bestehend) | "Country Comparison" (neu)
- [ ] Tab-Wechsel ohne Seitenreload (Client-Side State)
- [ ] URL reflektiert aktiven Tab (z.B. /reporting?tab=countries)

### Übersichtstabelle
- [ ] Tabelle zeigt alle Länder mit: Flagge, Name, Anzahl Companies, Gesamt-Funding, Durchschnitts-Funding, Top-Kategorie, Durchschnittliches Gründungsjahr
- [ ] Jede Spalte ist sortierbar (auf-/absteigend)
- [ ] Default-Sortierung: Anzahl Companies absteigend
- [ ] Länderflaggen werden via flag-icons CSS angezeigt

### Detail-Vergleich (Side-by-Side)
- [ ] User kann bis zu 3 Länder aus der Tabelle auswählen (Checkbox oder Klick)
- [ ] Ausgewählte Länder erscheinen in Side-by-Side Karten unterhalb der Tabelle
- [ ] Jede Länderkarte zeigt:
  - KPI-Header: Companies-Anzahl, Gesamt-Funding, Durchschnitts-Funding
  - Kategorien-Verteilung als Donut/Bar Chart
  - Status-Verteilung (Active, Closed, etc.) als Chart
  - Gründungsjahre als Timeline/Bar Chart
- [ ] Charts nutzen einheitliche Skalen für Vergleichbarkeit
- [ ] "Remove" Button pro Länderkarte zum Abwählen
- [ ] Hinweis "Select up to 3 countries to compare" wenn noch keine ausgewählt

### Daten
- [ ] Daten werden via Supabase RPC oder optimierte Query geladen
- [ ] Loading State während Daten geladen werden
- [ ] Funding-Werte korrekt formatiert (€, Millionen/Milliarden)

## Edge Cases
- Land hat keine Funding-Daten — "N/A" anzeigen statt €0
- Land hat nur 1 Company — Charts zeigen trotzdem korrekt an
- User wählt 4. Land — Hinweis "Maximum 3 Länder" oder älteste Selektion wird ersetzt
- Sehr viele Länder (>50) — Tabelle bleibt performant, ggf. Suchfeld
- Kleine Screens — Side-by-Side wird zu vertikal gestapelten Karten
- Tab-Wechsel behält Selektion bei (kein Reset beim Zurückwechseln)
