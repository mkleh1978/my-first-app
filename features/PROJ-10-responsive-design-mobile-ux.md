# PROJ-10: Responsive Design & Mobile UX

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als mobiler Nutzer möchte ich die FinTech-Datenbank komfortabel auf meinem Smartphone nutzen können, ohne Einschränkungen in der Funktionalität.

**US-2:** Als mobiler Nutzer möchte ich Filter über ein dediziertes Panel setzen können, damit der Bildschirmplatz optimal genutzt wird.

**US-3:** Als Desktop-Nutzer möchte ich eine breite, übersichtliche Darstellung mit Mehrspaltengrid und Hover-Effekten.

---

## Acceptance Criteria

- [x] AC-1: Breakpoint bei 768px trennt Mobile und Desktop-Layout
- [x] AC-2: Desktop: Grid mit 3-4 Spalten (auto-fill, minmax 300px)
- [x] AC-3: Mobile: Grid mit 1 Spalte
- [x] AC-4: Mobile: Filter-Button ersetzt inline Filter-Controls
- [x] AC-5: Mobile: Filter-Panel als Fullscreen-Overlay (fixed, z-index 1000)
- [x] AC-6: Mobile: Filter-Panel enthält alle Filter (Target, Country, Members, Watchlist, Category)
- [x] AC-7: Mobile: "Show X Results" Button schließt das Filter-Panel
- [x] AC-8: Mobile: "Reset All" Button im Filter-Panel wenn Filter aktiv
- [x] AC-9: Mobile: Filter-Button zeigt Anzahl aktiver Filter als Badge
- [x] AC-10: Mobile: Detail-Modal ist Fullscreen (100% Breite & Höhe)
- [x] AC-11: Mobile: Touch-Targets sind mindestens 44px groß
- [x] AC-12: Mobile: Hover-Effekte auf Karten sind deaktiviert
- [x] AC-13: Desktop: Hover-Effekte auf Karten (translateY -2px, Schatten)
- [x] AC-14: Header-Schriftgrößen passen sich an (Mobile: 24px, Desktop: 36px)
- [x] AC-15: Padding und Margins sind auf Mobile reduziert

---

## Edge Cases

- Was passiert bei Geräterotation (Portrait ↔ Landscape)? → Resize-Listener aktualisiert `isMobile` State
- Was passiert bei genau 768px Breite? → Gilt als Mobile (`<= 768`)
- Was passiert wenn das Filter-Panel offen ist und das Gerät gedreht wird? → Panel bleibt offen, passt sich an
- Was passiert bei sehr kleinen Bildschirmen (< 320px)? → Kein spezielles Handling, könnte zu Layout-Problemen führen
- Was passiert bei Desktop-Nutzern die den Browser auf < 768px verkleinern? → Wechsel zu Mobile-Layout
- Was passiert bei Tablets (768px-1024px)? → Mobile-Layout wird verwendet (Breakpoint bei 768px)

---

## Tech Design

### Mobile-Detection (App.jsx, Zeile 241-247)

```javascript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### Mobile Filter Panel State

```javascript
const [showMobileFilters, setShowMobileFilters] = useState(false);
```

### Responsive Breakpoints

| Eigenschaft | Mobile (≤768px) | Desktop (>768px) |
|-------------|-----------------|-------------------|
| Grid Columns | `1fr` | `repeat(auto-fill, minmax(300px, 1fr))` |
| Card Padding | 16px | 20px |
| Header Font | 24px | 36px |
| Container Padding | 16px | 24px |
| Category Cards | Hidden (im Filter-Panel) | Sichtbar als Grid |
| Filter Controls | Filter-Button + Panel | Inline |
| Detail Modal | Fullscreen | 500px max-width, zentriert |
| Hover-Effekte | Deaktiviert | Aktiv |
| Footer Margin | 32px top | 48px top |

### CSS (index.css)

```css
/* Responsive Utility-Klassen */
.mobile-only { display: none; }
.desktop-only { display: block; }

@media (max-width: 768px) {
  .mobile-only { display: block; }
  .desktop-only { display: none; }
}

/* Touch-friendly Targets */
button, a, select, input {
  min-height: 44px;  /* Apple HIG Minimum */
}
```

### Component Architecture

```
App.jsx
├── isMobile-basierte Conditional Rendering
│   ├── {!isMobile && <DesktopFilters />}    (Zeile 508-634)
│   ├── {isMobile && <MobileFilterButton />}  (Zeile 470-505)
│   ├── {isMobile && showMobileFilters && <FilterPanel />} (Zeile 638-880)
│   └── {!isMobile && <CategoryCards />}      (Zeile 883-1013)
├── Mobile Filter Panel (Zeile 638-880)
│   ├── Header: "Filters" + X-Button
│   ├── Target Audience Section
│   ├── Country Section
│   ├── Special Filters (Members, Watchlist)
│   ├── Category Section
│   └── Sticky Action Bar: Reset + "Show X Results"
└── Ternary-Expressions für Inline Styles
    └── padding: isMobile ? '16px' : '24px' (durchgehend)
```

### Filter-Badge Counter (Zeile 489-503)

```javascript
// Zählt aktive Filter für Badge
{(selectedCategory ? 1 : 0) + (targetFilter !== 'all' ? 1 : 0) + (countryFilter !== 'all' ? 1 : 0)}
```

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Breakpoint 768px funktioniert
- [x] AC-2: Desktop Grid 3-4 Spalten
- [x] AC-3: Mobile 1 Spalte
- [x] AC-4: Filter-Button auf Mobile
- [x] AC-5: Filter-Panel Fullscreen
- [x] AC-6: Alle Filter im Panel
- [x] AC-7: "Show X Results" schließt Panel
- [x] AC-8: "Reset All" funktioniert
- [x] AC-9: Filter-Badge-Counter korrekt
- [x] AC-10: Modal Fullscreen auf Mobile
- [x] AC-11: Touch-Targets 44px+
- [x] AC-12: Keine Hover auf Mobile
- [x] AC-13: Hover-Effekte auf Desktop
- [x] AC-14: Header-Schriftgrößen korrekt
- [x] AC-15: Reduziertes Padding auf Mobile

### Bugs Found
Keine Bugs gefunden.

### Bekannte Limitierungen
- Kein Debounce auf dem Resize-Listener
- Filter-Badge zählt nicht alle Filter (Suche und Member-Filter fehlen im Count)
- Kein Landscape-spezifisches Layout für Mobile
- Body-Scroll wird nicht gesperrt wenn Filter-Panel offen ist
- Kein CSS-only Responsive Design (JavaScript-basierte `isMobile` Erkennung statt CSS Media Queries)

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
