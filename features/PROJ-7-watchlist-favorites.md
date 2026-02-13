# PROJ-7: Watchlist & Favorites

**Status:** ✅ Deployed
**Created:** 2026-02-13
**Last Updated:** 2026-02-13

---

## User Stories

**US-1:** Als Nutzer möchte ich interessante Unternehmen als Favoriten markieren können, um sie später wiederzufinden.

**US-2:** Als Nutzer möchte ich eine Übersicht meiner favorisierten Unternehmen (Watchlist) sehen können, um sie zu vergleichen und zu exportieren.

**US-3:** Als Nutzer möchte ich, dass meine Favoriten auch nach dem Schließen des Browsers erhalten bleiben, damit ich meine Arbeit fortsetzen kann.

---

## Acceptance Criteria

- [x] AC-1: Jede Unternehmenskarte hat einen Stern-Button zum Favorisieren
- [x] AC-2: Klick auf den Stern togglet den Favoriten-Status (gefüllt = favorisiert, leer = nicht favorisiert)
- [x] AC-3: Favorisierte Sterne sind orange gefärbt (#EA5A3C)
- [x] AC-4: Der Stern-Button ist auch im Detail-Modal verfügbar
- [x] AC-5: Ein "Watchlist (X)" Button in der Filter-Leiste zeigt die Anzahl der Favoriten
- [x] AC-6: Klick auf Watchlist-Button zeigt nur die favorisierten Unternehmen
- [x] AC-7: Der Watchlist-Button hat einen orangen Rand und wird orange wenn aktiv
- [x] AC-8: Favoriten werden im localStorage persistent gespeichert
- [x] AC-9: Bei leerer Watchlist wird ein Empty State mit Stern-Icon und Hinweis angezeigt
- [x] AC-10: Ein "Browse All Companies" Button im Empty State führt zurück zur Hauptansicht
- [x] AC-11: Der Stern-Button auf Karten hat einen Hover-Effekt (scale 1.2)

---

## Edge Cases

- Was passiert wenn Watchlist und Member-Filter gleichzeitig aktiv sind? → Member-Filter wird deaktiviert, Watchlist wird angezeigt (gegenseitiger Ausschluss)
- Was passiert wenn localStorage voll ist? → Keine Error-Handling implementiert – potentieller Silent Failure
- Was passiert wenn localStorage gelöscht wird? → Favoriten gehen verloren, leeres Array wird initialisiert
- Was passiert wenn ein Stern auf der Karte geklickt wird? → `stopPropagation()` verhindert, dass das Detail-Modal geöffnet wird
- Was passiert wenn die gleiche ID mehrfach favorisiert wird? → `includes()` Check verhindert Duplikate
- Was passiert bei sehr vielen Favoriten (z.B. 1000+)? → Performance von `includes()` auf Array könnte abnehmen (kein Set verwendet)

---

## Tech Design

### State Management (App.jsx, Zeile 167-171)

```javascript
// Initialisierung aus localStorage
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('fintech-favorites');
  return saved ? JSON.parse(saved) : [];
});

const [showWatchlist, setShowWatchlist] = useState(false);
```

### Persistenz (App.jsx, Zeile 179-182)

```javascript
useEffect(() => {
  localStorage.setItem('fintech-favorites', JSON.stringify(favorites));
}, [favorites]);
```

### Toggle-Logik (App.jsx, Zeile 184-193)

```javascript
const toggleFavorite = (id, e) => {
  e?.stopPropagation();
  setFavorites(prev =>
    prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
  );
};

const isFavorite = (id) => favorites.includes(id);
```

### Watchlist-Daten (App.jsx, Zeile 250-252)

```javascript
const watchlistFintechs = useMemo(() => {
  return fintechsData.filter(f => favorites.includes(f.id));
}, [favorites]);
```

### localStorage

- **Key:** `fintech-favorites`
- **Format:** JSON-Array von IDs: `[1, 42, 103, 555]`
- **Sync:** Schreibt bei jeder Änderung des `favorites` State

### Component Architecture

```
App.jsx
├── Card: Star Button (Zeile 1140-1162)
│   ├── Position: absolute, top-right
│   ├── onClick → toggleFavorite(id, e) mit stopPropagation
│   ├── Favorisiert: fill=orange, color=orange
│   └── Nicht favorisiert: fill=none, color=textMuted
├── Modal: Star Button (Zeile 1402-1417)
│   └── Gleiche Toggle-Logik, 24px Icon
├── Desktop: Watchlist Button (Zeile 590-610)
│   ├── Star Icon (gefüllt wenn aktiv)
│   ├── "Watchlist ({favorites.length})"
│   └── Toggle: showWatchlist + memberFilter reset
├── Mobile: Watchlist Button (Zeile 754-772)
│   └── Im "Special Filters" Bereich
├── Results Info: Watchlist Counter (Zeile 1027-1039)
│   └── "{count} Companies in Watchlist" + Export-Limit Hinweis
└── Empty State: Watchlist (Zeile 1272-1297)
    ├── Star Icon (48px, muted)
    ├── "Your watchlist is empty."
    ├── Hinweis zum Favorisieren
    └── "Browse All Companies" Button
```

---

## QA Test Results

**Tested:** 2026-02-13
**App URL:** https://hoft-fintech.netlify.app

### Acceptance Criteria Status
- [x] AC-1: Stern-Button auf jeder Karte
- [x] AC-2: Toggle funktioniert
- [x] AC-3: Orange Färbung bei Favoriten
- [x] AC-4: Stern im Modal vorhanden
- [x] AC-5: Watchlist-Button mit Count
- [x] AC-6: Watchlist-Ansicht zeigt nur Favoriten
- [x] AC-7: Oranger Rand/Hintergrund beim Button
- [x] AC-8: localStorage Persistenz bestätigt
- [x] AC-9: Empty State korrekt
- [x] AC-10: "Browse All Companies" funktioniert
- [x] AC-11: Hover-Effekt bestätigt

### Bugs Found
Keine Bugs gefunden.

### Bekannte Limitierungen
- Kein Error-Handling für localStorage-Fehler (z.B. Private Browsing, Storage-Limit)
- Favoriten sind an den Browser gebunden (kein Cloud-Sync)
- `favorites` ist ein Array statt Set – O(n) für `includes()` Check

---

## Deployment

**Status:** ✅ Deployed
**Deployed:** 2026-02-13
**Production URL:** https://hoft-fintech.netlify.app
**Git Tag:** –
