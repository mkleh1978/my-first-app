# PROJ-8: Excel Export

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich meine Watchlist als Excel-Datei exportieren können, um die Daten offline zu bearbeiten oder mit Kollegen zu teilen.

---

## Acceptance Criteria

- [x] AC-1: Ein "Export Excel" Button erscheint wenn die Watchlist-Ansicht aktiv ist und mindestens 1 Favorit vorhanden
- [x] AC-2: Klick auf den Button startet den Download einer XLSX-Datei
- [x] AC-3: Der Dateiname enthält das aktuelle Datum: `FinTech_Watchlist_YYYY-MM-DD.xlsx`
- [x] AC-4: Die Excel-Datei enthält folgende Spalten: Name, Website, Category, Subcategory, Country, Headquarters, Founded, Target, HoFT Member, Member Category, Description
- [x] AC-5: Die Header-Zeile ist fett formatiert
- [x] AC-6: Der Export ist auf maximal 30 Unternehmen begrenzt
- [x] AC-7: Bei mehr als 30 Favoriten wird ein Hinweis angezeigt: "(Export limited to 30)"
- [x] AC-8: Der Button hat HoFT-Teal-Farbe (#006B6B) und ein Download-Icon
- [x] AC-9: Der Button hat einen Hover-Effekt (dunkleres Teal)

---

## Edge Cases

- Was passiert bei leerer Watchlist? → Export-Button wird nicht angezeigt (nur sichtbar wenn `watchlistFintechs.length > 0`)
- Was passiert bei genau 30 Favoriten? → Alle 30 werden exportiert, kein Limit-Hinweis
- Was passiert bei 31+ Favoriten? → Nur die ersten 30 werden exportiert, Limit-Hinweis wird angezeigt
- Was passiert wenn ein Unternehmen leere Felder hat? → Leerer String wird in die Zelle geschrieben
- Was passiert bei Browser-Inkompatibilität? → FileSaver.js handled die meisten Browser (IE10+, Chrome, Firefox, Safari)
- Was passiert wenn der Download fehlschlägt? → Kein Error-Handling implementiert (async ohne try/catch)

---

## Tech Design

### Export-Limit (App.jsx, Zeile 12)

```javascript
const EXPORT_LIMIT = 30;
```

### Export-Funktion (App.jsx, Zeile 196-239)

```javascript
const exportWatchlist = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Watchlist');

  // Spalten definieren
  worksheet.columns = [
    { header: 'Name',            key: 'name',           width: 25 },
    { header: 'Website',         key: 'website',        width: 30 },
    { header: 'Category',        key: 'category',       width: 25 },
    { header: 'Subcategory',     key: 'subcategory',    width: 30 },
    { header: 'Country',         key: 'country',        width: 15 },
    { header: 'Headquarters',    key: 'headquarters',   width: 20 },
    { header: 'Founded',         key: 'founded',        width: 10 },
    { header: 'Target',          key: 'target',         width: 8  },
    { header: 'HoFT Member',     key: 'isMember',       width: 12 },
    { header: 'Member Category', key: 'memberCategory', width: 15 },
    { header: 'Description',     key: 'description',    width: 50 }
  ];

  // Daten hinzufügen (max. EXPORT_LIMIT)
  watchlistFintechs.slice(0, EXPORT_LIMIT).forEach(f => {
    worksheet.addRow({ ... });
  });

  // Header fett
  worksheet.getRow(1).font = { bold: true };

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `FinTech_Watchlist_${date}.xlsx`);
};
```

### Abhängigkeiten

- **ExcelJS** (`^4.4.0`) – Excel-Datei-Generierung im Browser
- **file-saver** (`^2.0.5`) – Browser-Download API

### Datentransformation

| JSON-Feld | Excel-Spalte | Transformation |
|-----------|-------------|----------------|
| `name` | Name | Direkt |
| `website` | Website | Direkt |
| `category` | Category | Direkt |
| `subcategory` | Subcategory | Direkt |
| `country` | Country | Direkt |
| `headquarters` | Headquarters | `\|\| ''` (Fallback) |
| `founded` | Founded | `\|\| ''` (Fallback) |
| `target` | Target | Direkt |
| `isMember` | HoFT Member | `true → 'Yes', false → 'No'` |
| `memberCategory` | Member Category | `\|\| ''` (Fallback) |
| `description` | Description | `\|\| ''` (Fallback) |

### Component Architecture

```
App.jsx
├── Export Button (Zeile 1075-1098)
│   ├── Sichtbar nur wenn: showWatchlist && watchlistFintechs.length > 0
│   ├── Download Icon + "Export Excel"
│   ├── onClick → exportWatchlist()
│   └── Hover: backgroundColor #005858
└── Export-Limit Hinweis (Zeile 1034-1038)
    └── Sichtbar wenn: watchlistFintechs.length > EXPORT_LIMIT
```

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Button erscheint korrekt
- [x] AC-2: XLSX-Download funktioniert
- [x] AC-3: Dateiname mit Datum korrekt
- [x] AC-4: Alle 11 Spalten vorhanden
- [x] AC-5: Header-Zeile fett
- [x] AC-6: Limit auf 30 bestätigt
- [x] AC-7: Limit-Hinweis wird angezeigt
- [x] AC-8: Teal-Farbe und Download-Icon korrekt
- [x] AC-9: Hover-Effekt vorhanden

### Bugs Found
Keine Bugs gefunden.

### Bekannte Limitierungen
- Kein Error-Handling bei fehlgeschlagenem Export
- Export-Limit von 30 ist hardcoded (nicht konfigurierbar durch User)
- Keine Fortschrittsanzeige während der Export-Generierung
- Website-Spalte enthält nur den Text-Link, keinen klickbaren Hyperlink

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
