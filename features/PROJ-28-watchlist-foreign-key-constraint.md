# PROJ-28: Foreign Key fuer watchlist.company_id hinzufuegen

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-006 (HIGH)
- Betroffene Tabelle: `watchlist` (Spalte `company_id`)

## Abhängigkeiten
- Keine

## Beschreibung
Die `watchlist`-Tabelle hat zwar einen Foreign Key von `user_id` zu `auth.users(id)` mit `ON DELETE CASCADE`, aber `company_id` hat keine Fremdschluesselbeziehung zu `FinWell_data.id`. Das bedeutet:
1. User koennen beliebige `company_id`-Werte in die Watchlist einfuegen (Orphan-Referenzen)
2. Wenn ein Unternehmen aus `FinWell_data` geloescht wird, bleiben verwaiste Watchlist-Eintraege zurueck
3. Die Watchlist-Seite wuerde bei verwaisten Eintraegen stillschweigend weniger Ergebnisse anzeigen

## User Stories
- Als Betreiber moechte ich die Datenkonsistenz zwischen Watchlist und Unternehmensdaten sicherstellen, um verwaiste Referenzen zu verhindern.
- Als User moechte ich, dass meine Watchlist-Eintraege automatisch entfernt werden, wenn ein Unternehmen aus der Datenbank geloescht wird, damit ich keine fehlerhaften Eintraege sehe.
- Als User moechte ich, dass nur gueltige Unternehmens-IDs in meine Watchlist aufgenommen werden koennen.

## Acceptance Criteria
- [ ] Ein Foreign Key Constraint von `watchlist.company_id` zu `FinWell_data.id` existiert
- [ ] Der FK hat `ON DELETE CASCADE` -- beim Loeschen eines Unternehmens werden zugehoerige Watchlist-Eintraege automatisch entfernt
- [ ] Das Einfuegen einer nicht-existierenden `company_id` in die Watchlist wird mit einem Fehler abgelehnt
- [ ] Bestehende Watchlist-Eintraege mit gueltigen `company_id`-Werten bleiben erhalten
- [ ] Bestehende verwaiste Watchlist-Eintraege (falls vorhanden) werden vor der FK-Erstellung bereinigt
- [ ] Das Hinzufuegen und Entfernen von Unternehmen zur/von der Watchlist funktioniert weiterhin korrekt

## Edge Cases
- Bestehende Watchlist-Eintraege mit ungueltigem `company_id` -- muessen vor FK-Erstellung identifiziert und entfernt werden, sonst schlaegt die Migration fehl
- Gleichzeitiges Loeschen eines Unternehmens waehrend ein User es zur Watchlist hinzufuegt -- CASCADE soll korrekt greifen
- Bulk-Add zur Watchlist -- alle `company_id`-Werte muessen gueltig sein

## Testbare Szenarien
1. User fuegt ein existierendes Unternehmen zur Watchlist hinzu -- funktioniert
2. Direkter API-Call mit nicht-existierender `company_id` -- wird abgelehnt (FK Violation)
3. Admin loescht ein Unternehmen aus `FinWell_data` -- zugehoerige Watchlist-Eintraege werden automatisch entfernt
4. Watchlist-Seite zeigt nach Unternehmensloeschung keinen fehlerhaften Eintrag

## Tech Design (Solution Architect)

### Betroffene Dateien
- Keine Code-Dateien -- reine Datenbank-Migration

### Konkrete Aenderungen

**1. Verwaiste Eintraege bereinigen (vor FK-Erstellung)**
- Alle `watchlist`-Eintraege loeschen, deren `company_id` nicht in `FinWell_data.id` existiert
- Dies ist noetig, weil der FK-Constraint sonst fehlschlaegt

**2. Foreign Key Constraint hinzufuegen**
- `watchlist.company_id` bekommt einen Foreign Key auf `FinWell_data.id`
- Mit `ON DELETE CASCADE` -- wenn ein Unternehmen geloescht wird, werden zugehoerige Watchlist-Eintraege automatisch entfernt

### SQL Migrations
Eine Migration noetig:
- Name: `add_watchlist_company_foreign_key`
- Schritt 1: Verwaiste Eintraege bereinigen (DELETE WHERE NOT EXISTS)
- Schritt 2: `ALTER TABLE watchlist ADD CONSTRAINT watchlist_company_id_fkey FOREIGN KEY (company_id) REFERENCES "FinWell_data"(id) ON DELETE CASCADE`

### Dependencies
Keine.

### Tech-Entscheidung
`ON DELETE CASCADE` statt `ON DELETE SET NULL`, weil ein Watchlist-Eintrag ohne Unternehmensbezug keinen Sinn hat. Der User wuerde sonst "Geister-Eintraege" in der Watchlist sehen.

### Testhinweise
- Unternehmen zur Watchlist hinzufuegen -- funktioniert weiterhin
- Watchlist-Seite laden -- alle Eintraege korrekt
- Verwaiste Eintraege in `watchlist` pruefen (sollte nach Migration 0 sein)
- Direkter API-Call mit nicht-existierender `company_id` -- FK Violation Error
