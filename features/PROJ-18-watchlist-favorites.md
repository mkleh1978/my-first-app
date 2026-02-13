# PROJ-18: Watchlist & Favorites

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-17 (User Authentication) — für user_id und geschützte Routes

---

## User Stories

**US-1:** Als eingeloggter Nutzer möchte ich Unternehmen als Favoriten markieren können (Stern-Icon), um sie meiner Watchlist hinzuzufügen.

**US-2:** Als eingeloggter Nutzer möchte ich eine eigene `/watchlist`-Seite haben, auf der ich alle meine favorisierten Unternehmen sehe.

**US-3:** Als eingeloggter Nutzer möchte ich meine Watchlist als Excel exportieren können, um sie offline weiterzuverarbeiten.

**US-4:** Als eingeloggter Nutzer möchte ich einen Favoriten entfernen können, wenn ein Unternehmen nicht mehr relevant ist.

**US-5:** Als eingeloggter Nutzer möchte ich direkt in der Tabelle und im Detail-Modal sehen, welche Unternehmen ich favorisiert habe.

---

## Acceptance Criteria

### Stern-Toggle (Tabelle + Modal)
- [ ] AC-1: Jede Zeile in der CompanyTable hat einen Stern-Button (links vom Company-Namen oder rechts)
- [ ] AC-2: Klick auf den Stern togglet den Favoriten-Status
- [ ] AC-3: Favorisierte Sterne sind orange gefärbt (#EA5A3C), nicht-favorisierte sind grau/muted
- [ ] AC-4: Der Stern-Button ist auch im CompanyDetailModal verfügbar (Header-Bereich)
- [ ] AC-5: Klick auf den Stern in der Tabelle öffnet NICHT das Detail-Modal (stopPropagation)

### Supabase Storage
- [ ] AC-6: Favoriten werden in einer Supabase-Tabelle `watchlist` gespeichert (user_id + company_id)
- [ ] AC-7: RLS-Policy: User kann nur eigene Favoriten lesen/schreiben/löschen
- [ ] AC-8: Toggle ist optimistisch (UI reagiert sofort, DB-Write im Hintergrund)
- [ ] AC-9: Bei DB-Fehler wird der Toggle revertiert mit einer Fehlermeldung

### Watchlist-Seite (`/watchlist`)
- [ ] AC-10: Eigene Route `/watchlist` im Navigations-Header erreichbar
- [ ] AC-11: Zeigt alle favorisierten Unternehmen in einer Tabelle (gleiches Format wie Haupttabelle)
- [ ] AC-12: Zeigt die Gesamtzahl der Favoriten an
- [ ] AC-13: Bei leerer Watchlist wird ein Empty State angezeigt ("Noch keine Favoriten — durchsuche die Datenbank")
- [ ] AC-14: Link/Button zurück zur Hauptdatenbank

### Export
- [ ] AC-15: Ein "Export"-Button auf der Watchlist-Seite exportiert die Favoriten als Excel/CSV
- [ ] AC-16: Export enthält die wichtigsten Spalten (Company Name, Category, Country, Funding, Status, etc.)

### Navigation
- [ ] AC-17: Header zeigt "Database" und "Watchlist (X)" als Navigation (X = Anzahl Favoriten)
- [ ] AC-18: Aktiver Tab ist visuell hervorgehoben

---

## Edge Cases

- **Unternehmen wird gelöscht:** Wenn ein favorisiertes Unternehmen aus der DB entfernt wird → Watchlist-Eintrag existiert weiter, aber JOIN liefert kein Ergebnis → Eintrag wird nicht angezeigt
- **Viele Favoriten (100+):** Pagination auf der Watchlist-Seite oder Scroll-basiert
- **Offline-Klick auf Stern:** Optimistic Update fehlschlägt → Revert + Hinweis "Keine Verbindung"
- **Gleichzeitige Sessions:** User favorisiert auf Laptop und Handy gleichzeitig → Supabase ist Source of Truth, kein Conflict durch upsert
- **Export mit 0 Favoriten:** Export-Button ist disabled wenn Watchlist leer
- **Stern in Tabelle vs. Modal synchron:** Wenn User Stern im Modal togglet und Modal schließt → Tabelle muss aktualisierten Status anzeigen

---

## Technische Anforderungen

- **DB-Tabelle:** `watchlist` mit Columns: `id (uuid, PK)`, `user_id (uuid, FK → auth.users)`, `company_id (uuid, FK → FinWell_data)`, `created_at (timestamptz)`
- **Unique Constraint:** `(user_id, company_id)` — verhindert Duplikate
- **RLS:** `SELECT/INSERT/DELETE WHERE auth.uid() = user_id`
- **API-Pattern:** Supabase Client direkt (kein API-Route nötig)
- **State:** React Context oder Zustand für Favorites-IDs (Set für O(1) Lookup)
- **Export:** xlsx oder csv Bibliothek (z.B. `xlsx` npm-Paket)
