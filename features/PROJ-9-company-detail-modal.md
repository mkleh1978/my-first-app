# PROJ-9: Company Detail Modal

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich auf ein Unternehmen klicken können, um alle verfügbaren Details in einem Modal zu sehen.

**US-2:** Als Nutzer möchte ich direkt aus dem Modal die Website des Unternehmens besuchen können.

**US-3:** Als Nutzer möchte ich ein Unternehmen direkt im Modal zu meiner Watchlist hinzufügen können.

---

## Acceptance Criteria

- [x] AC-1: Klick auf eine Unternehmenskarte öffnet ein Detail-Modal
- [x] AC-2: Das Modal zeigt alle verfügbaren Felder: Name, Land mit Flagge, Kategorie, Subcategory, Beschreibung, Hauptsitz, Gründungsjahr, Funding, Target (B2B/B2C)
- [x] AC-3: HoFT-Mitglieder zeigen ein prominentes Member-Badge mit Kategorie
- [x] AC-4: Ein "Visit Website" Button öffnet die Firmenwebsite in einem neuen Tab
- [x] AC-5: Der Website-Link hat `rel="noopener noreferrer"` für Sicherheit
- [x] AC-6: Ein Stern-Button ermöglicht das Favorisieren direkt im Modal
- [x] AC-7: Ein X-Button schließt das Modal
- [x] AC-8: Klick auf den Overlay-Hintergrund schließt das Modal (Desktop)
- [x] AC-9: Klick innerhalb des Modals schließt es nicht (stopPropagation)
- [x] AC-10: Felder die null/leer sind werden ausgeblendet (Headquarters, Founded, Funding)
- [x] AC-11: Auf Desktop: zentriertes Modal mit Overlay (max 500px breit, max 80vh hoch, scrollbar)
- [x] AC-12: Auf Mobile: Fullscreen-Modal (100% Breite und Höhe, kein Overlay)

---

## Edge Cases

- Was passiert wenn ein Unternehmen keine Beschreibung hat? → "No description available" wird angezeigt
- Was passiert wenn kein Headquarter vorhanden ist? → Feld wird komplett ausgeblendet
- Was passiert wenn kein Gründungsjahr vorhanden ist? → Feld wird komplett ausgeblendet
- Was passiert wenn kein Funding vorhanden ist? → Feld wird komplett ausgeblendet
- Was passiert wenn die Website-URL ungültig ist? → Link wird trotzdem gerendert (kein URL-Validation)
- Was passiert bei sehr langer Beschreibung? → Modal ist scrollbar (overflow: auto)
- Was passiert wenn der User auf Mobile das Modal öffnet? → Fullscreen-Darstellung ohne Overlay

---

## Tech Design

### State Management

```javascript
const [selectedFintech, setSelectedFintech] = useState(null);
```

### Modal öffnen/schließen

```javascript
// Öffnen: Klick auf Karte
onClick={() => setSelectedFintech(fintech)

// Schließen: X-Button oder Overlay-Klick
onClick={() => setSelectedFintech(null)

// Klick innerhalb Modal
onClick={(e) => e.stopPropagation()
```

### Modal Layout (App.jsx, Zeile 1325-1518)

```
Detail Modal
├── Overlay (Zeile 1327-1338)
│   ├── Desktop: rgba(0,0,0,0.5) backdrop
│   └── Mobile: white background (fullscreen)
├── Modal Container (Zeile 1340-1351)
│   ├── Desktop: max-width 500px, border-radius 16px, max-height 80vh
│   └── Mobile: 100% width & height, no border-radius
├── Header (Zeile 1353-1430)
│   ├── Member Badge (optional)
│   │   └── Award Icon + "HoFT Member · {category}"
│   ├── Company Name + Country Flag
│   ├── Subcategory (farbcodiert)
│   ├── Favorite Star Button
│   └── Close Button (X)
├── Description (Zeile 1432-1439)
├── Info Grid (Zeile 1441-1483)
│   ├── Headquarters + Country (optional)
│   ├── Founded (optional)
│   ├── Category
│   └── Target
├── Funding (Zeile 1485-1494, optional)
└── Visit Website Button (Zeile 1496-1515)
    └── <a href={website} target="_blank" rel="noopener noreferrer">
```

### Info-Grid Layout

```
Desktop: 2 Spalten (gridTemplateColumns: '1fr 1fr')
Mobile:  1 Spalte  (gridTemplateColumns: '1fr')
```

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Modal öffnet sich bei Klick
- [x] AC-2: Alle Felder werden angezeigt
- [x] AC-3: Member-Badge korrekt
- [x] AC-4: Website-Button funktioniert
- [x] AC-5: `noopener noreferrer` gesetzt
- [x] AC-6: Favorisieren im Modal funktioniert
- [x] AC-7: X-Button schließt Modal
- [x] AC-8: Overlay-Klick schließt Modal (Desktop)
- [x] AC-9: Klick im Modal schließt nicht
- [x] AC-10: Leere Felder werden ausgeblendet
- [x] AC-11: Desktop-Layout korrekt
- [x] AC-12: Mobile Fullscreen korrekt

### Bugs Found
Keine Bugs gefunden.

### Bekannte Limitierungen
- Kein Keyboard-Support: Modal kann nicht mit Escape geschlossen werden
- Kein Focus-Trapping im Modal (Accessibility-Problem)
- Kein ARIA-Attribut (role="dialog", aria-modal="true") gesetzt
- Body-Scroll wird nicht verhindert wenn Modal offen ist

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
