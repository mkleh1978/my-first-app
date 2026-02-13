# PROJ-15: Country Flag Emojis

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-1 (FinTech Database) — CompanyTable mit Country-Spalte
- Benötigt: PROJ-13 (Steckbrief Redesign) — CompanyDetailModal mit InfoItem-Grid

## Zusammenfassung
Neben jedem Ländernamen wird die passende Emoji-Flagge angezeigt — sowohl in der Company-Tabelle als auch im Detail-Steckbrief. Keine externe Library nötig, da Emoji-Flaggen über Unicode-Konvertierung aus ISO-Ländercodes erzeugt werden.

---

## User Stories

- **US-1**: Als User möchte ich neben dem Ländernamen eine Flagge sehen, um Länder visuell schneller identifizieren zu können.

- **US-2**: Als User möchte ich die Flagge sowohl in der Übersichtstabelle als auch im Company-Steckbrief sehen, damit die Darstellung konsistent ist.

- **US-3**: Als User möchte ich, dass bei unbekannten oder fehlenden Ländern kein fehlerhaftes Zeichen erscheint, sondern die Flagge einfach weggelassen wird.

---

## Acceptance Criteria

### Tabelle (CompanyTable)
- [ ] **AC-1**: In der Country-Spalte wird links neben dem Ländernamen die Emoji-Flagge angezeigt.
- [ ] **AC-2**: Format: `🇩🇪 Germany` — Flagge + Leerzeichen + Ländername.

### Steckbrief (CompanyDetailModal)
- [ ] **AC-3**: Im Company Info Grid (Location-Feld) wird die Flagge neben City/Country angezeigt.
- [ ] **AC-4**: Format: `🇩🇪 Berlin, Germany` — Flagge vor dem Location-String.

### Flaggen-Mapping
- [ ] **AC-5**: Ländernamen werden korrekt auf ISO 3166-1 Alpha-2 Codes gemappt (z.B. "Germany" → "DE", "United Kingdom" → "GB").
- [ ] **AC-6**: Die Mapping-Funktion ist als wiederverwendbare Utility implementiert.
- [ ] **AC-7**: Bei unbekannten Ländernamen wird keine Flagge angezeigt (nur der Ländername).

### Visuelle Qualität
- [ ] **AC-8**: Flaggen-Emojis haben eine konsistente Größe relativ zum Text.
- [ ] **AC-9**: Kein Layout-Shift — Flaggen haben eine fixe Breite damit die Textausrichtung stabil bleibt.

---

## Edge Cases

- **EC-1**: Unbekannter Ländername — z.B. Tippfehler in der Datenbank ("Germeny") → Keine Flagge, nur Text.
- **EC-2**: Country ist null — Keine Flagge, zeigt "-" (wie bisher).
- **EC-3**: Sonderfall "United Kingdom" vs "UK" vs "Great Britain" — Mapping muss Varianten abdecken.
- **EC-4**: Emoji-Rendering auf Windows — Windows zeigt Flaggen-Emojis als 2-Letter-Codes (z.B. "DE" statt 🇩🇪). Das ist akzeptabel.
- **EC-5**: Sehr viele verschiedene Länder — Das Mapping muss alle in der Datenbank vorkommenden Länder abdecken.

---

## Technische Anforderungen
- Mapping-Utility: `countryToFlag(countryName: string): string` in `src/lib/country-flags.ts`
- Unicode Regional Indicator Conversion: Country Code → Emoji Flag (kein Package nötig)
- Dictionary: Ländername → ISO 3166-1 Alpha-2 Code
- Keine externe Library nötig (reine Unicode-Konvertierung)

---

## Tech-Design (Solution Architect)

### A) Betroffene Dateien

```
Neu:
└── src/lib/country-flags.ts  ← Mapping-Utility (wiederverwendbar)

Geändert:
├── src/components/CompanyTable.tsx     ← Flagge in Country-Spalte
└── src/components/CompanyDetailModal.tsx ← Flagge im Location-InfoItem
```

### B) Utility: country-flags.ts

```
Datei: src/lib/country-flags.ts

1. COUNTRY_TO_ISO Dictionary:
   - 47 europäische Länder (alle in der Datenbank vorhandenen)
   - Inkl. Varianten: "United Kingdom" / "UK" / "Great Britain" → "GB"
   - Case-insensitive Lookup

2. Funktion: countryToFlag(countryName)
   → "Germany" → "DE" → 🇩🇪
   → "Unknown" → "" (leerer String)

3. Technik: Unicode Regional Indicator Symbols
   → "D" = U+1F1E9, "E" = U+1F1EA
   → Formel: codePoint = 0x1F1E5 + charCode
   → Kein Package nötig, reine String-Konvertierung
```

### C) Länder-Mapping (47 Einträge)

```
In der Datenbank vorhandene Länder:
Albania, Andorra, Armenia, Austria, Azerbaijan, Belarus,
Belgium, Bosnia and Herzegovina, Bulgaria, Croatia, Cyprus,
Czechia, Denmark, Estonia, Finland, France, Germany, Greece,
Hungary, Iceland, Ireland, Italy, Kosovo, Latvia, Liechtenstein,
Lithuania, Luxembourg, Malta, Moldova, Monaco, Montenegro,
Netherlands, North Macedonia, Norway, Poland, Portugal,
Romania, Russia, Serbia, Slovakia, Slovenia, Spain, Sweden,
Switzerland, Turkey, Ukraine, United Kingdom

Sonderfälle:
- "Czechia" → "CZ" (nicht "Czech Republic")
- "North Macedonia" → "MK"
- "Kosovo" → "XK" (inoffizieller Code)
- "United Kingdom" → "GB"
```

### D) Component-Änderungen

```
CompanyTable.tsx — Country-Spalte:
Vorher:  {company.country ?? "-"}
Nachher: {company.country ? `${countryToFlag(company.country)} ${company.country}` : "-"}

CompanyDetailModal.tsx — Location InfoItem:
Vorher:  value: [company.city, company.country].filter(Boolean).join(", ")
Nachher: value: countryToFlag(company.country) + " " + [company.city, company.country].filter(Boolean).join(", ")
         (Flagge als Prefix, Leerzeichen danach)
```

### E) Tech-Entscheidungen

```
Warum Emoji-Flaggen statt SVG-Library?
→ Null Dependencies, ~2KB Code, kein Bundle-Impact.
  SVG-Libraries wie flag-icons sind 50-100KB.

Warum fixe Breite für Flaggen?
→ Emoji-Breite variiert je nach OS/Browser.
  Ein <span> mit fixer Breite (w-6) verhindert Layout-Shifts.

Warum Windows-Fallback akzeptabel?
→ Windows zeigt Flaggen-Emojis als 2-Letter Codes (DE, GB, FR).
  Das ist lesbar und informativer als nichts.
```

### F) Dependencies

```
Keine neuen Packages nötig!
Reine Unicode-Konvertierung ohne externe Libraries.
```
