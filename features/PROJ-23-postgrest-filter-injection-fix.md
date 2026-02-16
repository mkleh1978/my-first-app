# PROJ-23: PostgREST Filter Injection Fix

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-001 (CRITICAL)
- Betroffene Dateien: `src/app/page.tsx` (Zeile 121, Zeile 234)

## Abhängigkeiten
- Keine

## Beschreibung
Die Suchfunktion auf der Hauptseite interpoliert User-Input direkt in PostgREST `.or()` Filter-Strings. Sonderzeichen wie `)`, `,`, `.` können genutzt werden, um aus dem beabsichtigten Filter auszubrechen und beliebige Filterbedingungen einzuschleusen. Das Problem existiert an zwei Stellen: in der normalen Suche (Zeile 121) und in der `handleBulkAdd()`-Funktion (Zeile 234).

## User Stories
- Als Betreiber der Plattform moechte ich sicherstellen, dass Sucheingaben keine PostgREST-Filterlogik manipulieren koennen, um die Integritaet der Datenbankabfragen zu schuetzen.
- Als authentifizierter User moechte ich die Suchfunktion normal nutzen koennen, ohne dass Sonderzeichen in meiner Eingabe zu Fehlern oder unerwartetem Verhalten fuehren.
- Als Betreiber moechte ich, dass die Bulk-Add-Funktion dieselbe Eingabesanitisierung nutzt wie die normale Suche, um konsistenten Schutz sicherzustellen.

## Acceptance Criteria
- [ ] Sucheingaben werden vor der Verwendung in PostgREST `.or()` Filtern sanitisiert
- [ ] PostgREST-Sonderzeichen (`,`, `.`, `(`, `)`, `%`, `*`) in Sucheingaben werden korrekt escaped oder entfernt
- [ ] Die Sanitisierung gilt fuer BEIDE Stellen: normale Suche und `handleBulkAdd()`
- [ ] Eine Sucheingabe wie `%,id.neq.` fuehrt NICHT zu einer Manipulation der Filterlogik
- [ ] Eine Sucheingabe wie `test)` fuehrt NICHT zu einem PostgREST-Fehler
- [ ] Normale Suchbegriffe (Buchstaben, Zahlen, Leerzeichen, Bindestriche) funktionieren weiterhin korrekt
- [ ] Umlaute und andere nicht-ASCII-Zeichen in Suchbegriffen funktionieren weiterhin
- [ ] Die Sanitisierung ist in einer wiederverwendbaren Funktion implementiert (nicht dupliziert)

## Edge Cases
- Sucheingabe besteht nur aus Sonderzeichen (z.B. `.,()`) -- soll leeres oder harmloses Ergebnis liefern
- Sucheingabe mit Prozentzeichen (z.B. `100%`) -- soll nicht als Wildcard interpretiert werden
- Sucheingabe mit Backslash (z.B. `test\company`) -- soll korrekt escaped werden
- Leere Sucheingabe nach Sanitisierung -- soll keine Abfrage ausloesen oder alle Ergebnisse zeigen
- Sehr lange Sucheingaben (1000+ Zeichen) -- soll keinen Absturz verursachen

## Testbare Szenarien
1. Eingabe `normal search` -- liefert erwartete Ergebnisse
2. Eingabe `%,id.neq.` -- liefert keine manipulierten Ergebnisse, kein Fehler
3. Eingabe `test),company_name.eq.secret` -- keine Filterinjektion moeglich
4. Eingabe `Fintech & Banking` -- Sonderzeichen werden korrekt behandelt
5. Bulk-Add mit manipuliertem Suchbegriff -- identisches Verhalten wie normale Suche

## Tech Design (Solution Architect)

### Betroffene Dateien
- `src/app/page.tsx` (Zeile 121 und Zeile 234) -- Beide `.or()` Filter-Aufrufe
- `src/lib/sanitize.ts` (NEU) -- Wiederverwendbare Sanitisierungs-Funktion

### Konkrete Aenderungen

**1. Neue Hilfsfunktion `sanitizeSearchInput` erstellen (`src/lib/sanitize.ts`)**
- Entfernt oder escaped PostgREST-Sonderzeichen: `,` `.` `(` `)` `%` `*` `\`
- Erlaubt: Buchstaben, Zahlen, Leerzeichen, Bindestriche, Umlaute
- Begrenzt Eingabelaenge auf max. 200 Zeichen
- Gibt leeren String zurueck, wenn nach Sanitisierung nichts uebrig bleibt

**2. Sanitisierung in `page.tsx` einbauen (2 Stellen)**
- Zeile 121 (normale Suche): `currentFilters.search` durch `sanitizeSearchInput(currentFilters.search)` ersetzen
- Zeile 234 (handleBulkAdd): Identische Sanitisierung einbauen
- Wenn sanitisierter String leer ist: `.or()`-Aufruf ueberspringen

### SQL Migrations
Keine noetig -- reine Frontend-Aenderung.

### Dependencies
Keine neuen Packages noetig.

### Tech-Entscheidung
Eigene Sanitisierungs-Funktion statt einer Library, da die PostgREST-Filter-Syntax sehr spezifisch ist und keine Standard-Library diesen Anwendungsfall abdeckt.

### Testhinweise
- Eingabe `%,id.neq.` in die Suche -- darf keine manipulierten Ergebnisse liefern
- Eingabe `test),company_name.eq.secret` -- kein Fehler, keine Injektion
- Eingabe `Muenchen` oder `Fintech & Banking` -- normale Ergebnisse
- Eingabe nur aus Sonderzeichen `.,()` -- leeres oder volles Ergebnis, kein Crash
- Bulk-Add mit denselben Testfaellen pruefen
