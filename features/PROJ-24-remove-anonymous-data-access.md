# PROJ-24: Anonymen Datenzugriff auf FinWell_data entfernen

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-002 (CRITICAL)
- Betroffene Komponente: Supabase RLS Policy "Allow anon read access" auf `FinWell_data`

## Abhängigkeiten
- Keine

## Beschreibung
Die RLS Policy "Allow anon read access" auf der Tabelle `FinWell_data` erlaubt der `anon`-Rolle uneingeschraenkten SELECT-Zugriff (`qual = true`). Da die Supabase-URL und der Anon-Key im Frontend-Bundle oeffentlich sichtbar sind, kann jeder ohne Authentifizierung alle 10.156 Datensaetze auslesen -- einschliesslich Kontaktnamen, Jobtitel und LinkedIn-URLs. Die bestehende Policy "Allow authenticated read access" deckt bereits den Zugriff fuer eingeloggte User ab.

## User Stories
- Als Betreiber moechte ich, dass die Unternehmensdatenbank NUR fuer authentifizierte User zugaenglich ist, um unbefugten Datenzugriff zu verhindern.
- Als Betreiber moechte ich sicherstellen, dass die oeffentlich sichtbaren Supabase-Credentials (URL + Anon Key) NICHT ausreichen, um Daten auszulesen.
- Als authentifizierter User moechte ich weiterhin uneingeschraenkt auf die Datenbank zugreifen koennen.

## Acceptance Criteria
- [ ] Die RLS Policy "Allow anon read access" auf `FinWell_data` ist entfernt
- [ ] Ein unauthentifizierter API-Call mit dem Anon Key auf `FinWell_data` gibt 0 Zeilen zurueck (kein Fehler, aber keine Daten)
- [ ] Authentifizierte User koennen weiterhin alle Daten in `FinWell_data` lesen
- [ ] Die Anwendung funktioniert nach dem Entfernen der Policy korrekt (keine Regressionen)
- [ ] Die Login-Seite und Registrierungsseite funktionieren weiterhin (benoetigen keinen FinWell_data-Zugriff)
- [ ] Server-seitige Datenabfragen (falls vorhanden, z.B. in Middleware oder SSR) verwenden den Service-Role-Key statt den Anon-Key

## Edge Cases
- Nicht-eingeloggter User ruft die Hauptseite auf -- wird zum Login weitergeleitet, sieht keine Daten
- Session laeuft waehrend der Nutzung ab -- User erhaelt keinen Datenzugriff mehr, wird zum Login weitergeleitet
- Direkter API-Call mit Anon Key via cURL/Postman -- gibt leeres Array zurueck, kein Fehler
- Supabase Realtime-Subscriptions (falls verwendet) -- funktionieren nur fuer authentifizierte User

## Testbare Szenarien
1. cURL-Request mit Anon Key: `curl -H "apikey: ANON_KEY" https://PROJECT.supabase.co/rest/v1/FinWell_data` -- leeres Ergebnis
2. Eingeloggter User oeffnet Hauptseite -- Daten werden normal geladen
3. User meldet sich ab und versucht erneut Daten zu laden -- kein Zugriff
4. Alle bestehenden Features (Suche, Filter, Watchlist, Reporting) funktionieren fuer eingeloggte User

## Tech Design (Solution Architect)

### Betroffene Dateien
- Keine Code-Dateien -- reine Supabase-Datenbank-Aenderung

### Konkrete Aenderungen

**1. RLS Policy entfernen via SQL Migration**
- Die Policy "Allow anon read access" auf `FinWell_data` entfernen (Migration: `DROP POLICY`)
- Die bestehende Policy "Allow authenticated read access" bleibt bestehen und deckt alle eingeloggten User ab

### SQL Migrations
Eine Migration noetig:
- Name: `remove_anon_read_policy_finwell_data`
- Inhalt: `DROP POLICY` fuer "Allow anon read access" auf `FinWell_data`

### Dependencies
Keine.

### Tech-Entscheidung
Einfaches Entfernen der Policy reicht aus, da bereits eine authentifizierte Policy existiert. Kein Code-Umbau noetig, weil die App bereits Login erzwingt (Middleware leitet nicht-eingeloggte User zu `/login` weiter).

### Testhinweise
- cURL mit Anon Key auf `FinWell_data` REST-Endpoint -- muss leeres Array zurueckgeben
- Eingeloggter User: Hauptseite, Suche, Filter, Watchlist, Reporting -- alles muss funktionieren
- Login/Register-Seiten muessen weiterhin erreichbar sein
