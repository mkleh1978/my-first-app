# PROJ-29: Domain-Index und LinkedIn-Import-Performance

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-007 (HIGH)
- Betroffene Dateien: `src/lib/import-contacts.ts`, Tabelle `FinWell_data` (Spalte `domain`)

## Abhängigkeiten
- Benötigt: PROJ-20 (LinkedIn Contact Import) -- existierende Import-Funktionalitaet

## Beschreibung
Der LinkedIn-Import hat zwei Performance-Probleme:
1. Es gibt keinen Index auf der Spalte `FinWell_data.domain`, obwohl diese fuer das Matching bei jedem Import verwendet wird.
2. Der Import verwendet ein N+1 Update Pattern: Bei 500+ Kontakten werden 500+ sequenzielle UPDATE-Queries ausgefuehrt. Jede einzelne Query ist ein eigener HTTP-Request an Supabase mit RLS-Evaluierung.

Zusaetzlich werden alle 10.156 Zeilen (id + domain) in den Browser geladen, um eine Domain-zu-ID-Map im Speicher aufzubauen.

## User Stories
- Als Admin moechte ich, dass der LinkedIn-Import deutlich schneller ablaeuft, damit ich nicht mehrere Minuten auf den Abschluss warten muss.
- Als Admin moechte ich, dass der Import auch bei grossen Kontaktlisten (500+) zuverlaessig und performant funktioniert.
- Als Betreiber moechte ich, dass die Datenbank einen Index auf der `domain`-Spalte hat, um Domain-basierte Abfragen zu beschleunigen.

## Acceptance Criteria
- [ ] Ein Datenbankindex auf `FinWell_data.domain` existiert
- [ ] Der LinkedIn-Import verwendet Batch-Updates statt einzelner sequenzieller Queries
- [ ] Die Gesamtdauer des Imports fuer 500 Kontakte ist um mindestens 50% reduziert im Vergleich zum aktuellen N+1-Pattern
- [ ] Der Import bleibt funktional korrekt -- alle Kontaktdaten werden den richtigen Unternehmen zugeordnet
- [ ] Fehlerbehandlung bleibt erhalten: fehlgeschlagene Batches werden korrekt gemeldet
- [ ] Die Progress-Anzeige im Admin-UI funktioniert weiterhin korrekt

## Edge Cases
- Import mit 0 matchenden Domains -- soll schnell abschliessen, keine unnoetige Datenbank-Last
- Import waehrend gleichzeitiger Nutzung der Hauptseite -- Datenbankperformance fuer andere User soll nicht beeintraechtigt werden
- Doppelte Domains in der Import-Datei -- soll korrekt behandelt werden (letzter Eintrag gewinnt oder Warnung)
- Timeout bei sehr grossen Batches -- Batch-Groesse soll angemessen gewaehlt werden
- Domain-Index bei 10.000+ Eintraegen -- soll spuerbare Verbesserung bei Domain-Lookups bringen

## Testbare Szenarien
1. Import von 100 Kontakten -- schneller als zuvor, alle korrekt zugeordnet
2. Import von 500 Kontakten -- deutlich schneller, alle korrekt zugeordnet
3. Domain-basierte Suche in der Datenbank -- schnellere Antwortzeiten durch Index
4. Progress-Anzeige im Admin-UI -- zeigt korrekten Fortschritt waehrend Batch-Updates
5. Fehlerhafter Import (ungueltige Daten) -- Fehler werden korrekt gemeldet

## Tech Design (Solution Architect)

### Betroffene Dateien
- `src/lib/import-contacts.ts` -- N+1 Update Pattern durch Batch-RPC ersetzen
- Datenbank: Index auf `FinWell_data.domain`

### Konkrete Aenderungen

**1. Datenbank-Index erstellen (SQL Migration)**
- Index auf `FinWell_data.domain` fuer schnelleres Domain-Matching

**2. Import-Logik optimieren (`src/lib/import-contacts.ts`)**

Aktuelles Problem (Zeile 144-155): Innerhalb jedes Batches wird fuer jedes Update ein separater HTTP-Request an Supabase gesendet (N+1 Pattern). Bei 500 Kontakten = 500 sequenzielle Requests.

Loesung: Eine serverseitige RPC-Funktion erstellen, die ein Array von Updates als JSON entgegennimmt und alle auf einmal ausfuehrt. Der Frontend-Code ruft dann pro Batch nur 1x die RPC-Funktion auf statt N Einzel-Updates.

Alternative (einfacher, ohne RPC): Die sequenziellen Updates innerhalb eines Batches parallel mit `Promise.all` ausfuehren statt sequenziell. Das ist einfacher umzusetzen und reduziert die Wartezeit bereits erheblich (von 500 sequenziellen Requests auf 5 parallele Batches a 100).

**3. Domain-Map-Laden optimieren**
- Aktuell werden alle 10.156 Zeilen (id + domain) paginiert geladen
- Nach Erstellung des Domain-Index koennte man alternativ pro Contact-Domain einen gezielten Lookup machen
- Einfachste Loesung: Bestehendes Laden beibehalten (ist einmalig und akzeptabel), nur die Updates parallelisieren

### SQL Migrations
Eine Migration noetig:
- Name: `add_domain_index_finwell_data`
- Inhalt: `CREATE INDEX` auf `FinWell_data(domain)`

### Dependencies
Keine neuen Packages.

### Tech-Entscheidung
`Promise.all` innerhalb von Batches ist die einfachste Loesung mit dem besten Aufwand-Nutzen-Verhaeltnis. Eine RPC-Funktion waere performanter, aber komplexer. Die Batch-Groesse von 100 parallelen Requests ist fuer Supabase akzeptabel.

### Testhinweise
- Import von 100 Kontakten -- messbar schneller als zuvor
- Import von 500 Kontakten -- deutlich schneller
- Progress-Anzeige funktioniert weiterhin (Updates nach jedem Batch)
- Fehlerhafte Eintraege werden weiterhin korrekt gemeldet
- Andere User merken keinen Performance-Einbruch waehrend Import
