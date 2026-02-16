# PROJ-22: Dripify Watchlist Export (Admin-only)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-19 (Admin-Rolle & LinkedIn-Spalten) - Admin-Rolle und LinkedIn-Daten
- Benötigt: PROJ-18 (Watchlist Favorites) - Bestehende Watchlist-Funktionalität
- Benötigt: PROJ-20 (LinkedIn Contact Import) - LinkedIn URLs müssen vorhanden sein

## Kontext
Admins sollen ihre Watchlist für Dripify (LinkedIn Automation Tool) exportieren können. Dripify benötigt eine Liste von LinkedIn Profile URLs. Der Export zieht die passenden LinkedIn URLs aus der Watchlist.

## User Stories
- Als Admin möchte ich meine Watchlist als Dripify-kompatible Datei exportieren können, um die LinkedIn-Profile automatisiert kontaktieren zu können.
- Als Admin möchte ich vor dem Export sehen, wie viele der Watchlist-Einträge eine LinkedIn URL haben, damit ich weiß, ob der Export sinnvoll ist.
- Als Admin möchte ich nur Einträge MIT LinkedIn URL exportieren (leere überspringen).
- Als normaler User soll der Dripify-Export-Button NICHT sichtbar sein.

## Acceptance Criteria

### Export-Button
- [ ] Separater "Export for Dripify" Button auf der Watchlist-Seite (neben bestehendem Excel-Export)
- [ ] Button ist NUR für Admins sichtbar
- [ ] Button-Design: Sekundärer Button mit Dripify-Bezug (z.B. Icon + "Dripify Export")
- [ ] Button ist disabled wenn keine Watchlist-Einträge LinkedIn URLs haben
- [ ] Tooltip bei disabled: "Keine LinkedIn URLs in der Watchlist vorhanden"

### Export-Format (Dripify)
- [ ] CSV-Datei mit einer Spalte: `profileUrl`
- [ ] Jede Zeile enthält eine LinkedIn Profile URL
- [ ] Nur Einträge mit befüllter `linkedin_profile_url` werden exportiert
- [ ] URL-Format: Vollständige URL (z.B. `https://linkedin.com/in/username`)
- [ ] Falls URL ohne `https://` gespeichert ist → automatisch `https://` voranstellen
- [ ] Dateiname: `HoFT_Dripify_Export_YYYY-MM-DD.csv`

### Zusammenfassung vor Export
- [ ] Kurze Info anzeigen: "X von Y Watchlist-Einträgen haben LinkedIn URLs"
- [ ] Nur Einträge mit LinkedIn URL werden exportiert

### Sicherheit
- [ ] Export-Funktion nur für Admin-Rolle zugänglich
- [ ] Kein Export-Button für User-Rolle sichtbar (kein "Locked"-Hinweis)

## Edge Cases
- Was wenn die Watchlist leer ist? → Kein Dripify-Button anzeigen (oder disabled mit Hinweis)
- Was wenn keine einzige Company eine LinkedIn URL hat? → Button disabled mit Tooltip "Keine LinkedIn URLs vorhanden"
- Was wenn die LinkedIn URL ein ungültiges Format hat? → Trotzdem exportieren (Dripify wird es ggf. ablehnen)
- Was wenn ein User die Export-Funktion über DevTools aufruft? → Kein Backend-Schutz nötig (Daten sind ohnehin im Client geladen), Feature-Gating reicht
- Was wenn die URL `linkedin.com/in/...` statt `https://linkedin.com/in/...` ist? → `https://` automatisch voranstellen

## Technische Anforderungen
- CSV-Generierung client-seitig (kein Server-Endpoint nötig)
- Kein zusätzlicher DB-Call (LinkedIn-Daten sind bereits in Company-Objekten geladen)
- Download via Blob + dynamischem Link (analog zum bestehenden XLSX-Export)

## Tech-Design (Solution Architect)

### Component-Struktur

Watchlist-Seite wird um einen zweiten Export-Button erweitert:

```
Watchlist-Seite (bestehend)
├── Header-Bereich
│   ├── Titel "Watchlist" + Anzahl
│   └── Button-Gruppe (NEU — war vorher einzelner Button)
│       ├── "Export as Excel" Button (bestehend — Teal)
│       └── "Dripify Export" Button (NEU — nur für Admins)
│           └── Info-Text: "X von Y mit LinkedIn URL"
├── Tabelle (bestehend + LinkedIn-Spalten aus PROJ-21)
└── Empty State (bestehend)
```

### Daten-Fluss

```
Schritt 1: Admin klickt "Dripify Export"
→ Watchlist-Companies sind bereits geladen (kein neuer DB-Call)

Schritt 2: LinkedIn URLs filtern
→ Nur Companies mit befüllter linkedin_profile_url nehmen
→ URL normalisieren: "linkedin.com/in/..." → "https://linkedin.com/in/..."

Schritt 3: CSV generieren
→ Header-Zeile: "profileUrl"
→ Je eine Zeile pro LinkedIn URL

Schritt 4: Download auslösen
→ CSV als Blob erstellen
→ Dynamischen Download-Link erzeugen + klicken
→ Dateiname: "HoFT_Dripify_Export_2026-02-16.csv"
```

### Daten-Model

Kein neues Daten-Model. Nutzt bestehende Watchlist-Daten:
```
Aus den geladenen Watchlist-Companies:
→ Filtere nach: linkedin_profile_url ist nicht leer
→ Exportiere nur: profileUrl (eine Spalte)

Beispiel CSV:
profileUrl
https://linkedin.com/in/nstoronsky
https://linkedin.com/in/guillaumepousaz
https://linkedin.com/in/maximilian-tayenthal
```

### Tech-Entscheidungen

**Warum CSV statt XLSX für Dripify?**
→ Dripify erwartet eine einfache Liste von LinkedIn URLs. CSV ist das einfachste Format dafür.

**Warum client-seitige CSV-Generierung statt Server?**
→ Daten sind bereits im Browser geladen. CSV ist trivial zu generieren (keine Library nötig). Gleicher Ansatz wie der bestehende Excel-Export.

**Warum Blob + dynamischer Link statt xlsx-Library?**
→ Für eine simple CSV brauchen wir keine Library. Ein Blob-Download ist 3 Zeilen Code und hat keine Dependencies.

**Warum Info-Text "X von Y" am Button?**
→ Admin sieht sofort, ob sich ein Export lohnt. Verhindert leere Exports.

### Betroffene Dateien

```
Frontend (ANPASSEN):
└── src/app/watchlist/page.tsx   → Dripify-Export-Button + CSV-Export-Logik
```

### Dependencies
Keine neuen Packages — CSV wird nativ generiert (kein Library-Bedarf).
