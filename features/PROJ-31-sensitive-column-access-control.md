# PROJ-31: Zugriffskontrolle fuer sensible Kontaktdaten-Spalten

## Status: 🔵 Planned

## Quelle
- QA-Audit: SEC-002 (HIGH/Security)
- Betroffene Spalten: `contact_name`, `job_title`, `linkedin_profile_url` in `FinWell_data`
- Betroffene UI-Komponenten: `CompanyTable.tsx`, `CompanyDetailModal.tsx`, `src/app/watchlist/page.tsx`

## Abhängigkeiten
- Benötigt: PROJ-19 (Admin Role LinkedIn Columns) -- existierende Admin-Spalten-Logik
- Benötigt: PROJ-17 (User Authentication) -- fuer Rollenabfrage

## Beschreibung
Die SELECT-Abfrage auf `FinWell_data` liefert die Spalten `contact_name`, `job_title` und `linkedin_profile_url` an ALLE authentifizierten User. Das UI versteckt diese Spalten zwar fuer Nicht-Admins, aber die Daten sind in den Netzwerk-Responses sichtbar und koennen ueber die Supabase-API direkt abgefragt werden. Das "Verstecken" im UI ist rein kosmetisch und bietet keinen echten Schutz.

LinkedIn-Kontaktdaten sind sensible personenbezogene Informationen, die nur fuer Admins sichtbar sein sollen.

## User Stories
- Als Betreiber moechte ich, dass LinkedIn-Kontaktdaten (Name, Jobtitel, Profil-URL) nur fuer Admin-User zugaenglich sind, um den Schutz personenbezogener Daten sicherzustellen.
- Als normaler User moechte ich weiterhin alle nicht-sensiblen Unternehmensdaten sehen koennen.
- Als Admin moechte ich weiterhin Kontaktdaten in der Tabelle und im Detail-Modal sehen koennen.

## Acceptance Criteria
- [ ] Nicht-Admin-User erhalten bei Abfragen auf `FinWell_data` KEINE Werte fuer `contact_name`, `job_title` und `linkedin_profile_url` (NULL oder nicht im Response enthalten)
- [ ] Admin-User erhalten weiterhin alle Spalten inklusive der Kontaktdaten
- [ ] Ein direkter API-Call als Nicht-Admin auf `FinWell_data` mit `select=contact_name,job_title,linkedin_profile_url` liefert NULL-Werte oder leere Strings
- [ ] Die CompanyTable zeigt Kontaktdaten weiterhin korrekt fuer Admins
- [ ] Das CompanyDetailModal zeigt Kontaktdaten weiterhin korrekt fuer Admins
- [ ] Die Watchlist zeigt Kontaktdaten weiterhin korrekt fuer Admins
- [ ] Der Dripify-Export funktioniert weiterhin korrekt fuer Admins
- [ ] Nicht-Admin-User sehen in den Browser-DevTools (Network-Tab) keine Kontaktdaten in den API-Responses

## Edge Cases
- Admin-Rolle wird einem User entzogen -- beim naechsten Request sieht er keine Kontaktdaten mehr
- Admin-Rolle wird einem User zugewiesen -- beim naechsten Request sieht er Kontaktdaten
- Abfrage mit explizitem `select=*` als Nicht-Admin -- sensible Spalten sind trotzdem NULL/leer
- Reporting-Seite (aggregierte Daten) -- soll nicht von der Aenderung betroffen sein (keine Kontaktdaten in Aggregationen)
- Excel-Export als Nicht-Admin -- darf keine Kontaktdaten enthalten
- Excel-Export als Admin -- soll Kontaktdaten enthalten (siehe auch BUG-018 im QA-Report)

## Testbare Szenarien
1. Nicht-Admin ruft Hauptseite auf -- Network-Response enthaelt keine Kontaktdaten
2. Admin ruft Hauptseite auf -- Kontaktdaten sind in Tabelle und Response sichtbar
3. Nicht-Admin oeffnet Detail-Modal -- kein LinkedIn-Bereich sichtbar, keine Kontaktdaten im Response
4. Admin oeffnet Detail-Modal -- LinkedIn-Bereich mit Kontaktdaten sichtbar
5. Nicht-Admin-API-Call: `select=contact_name` -- gibt NULL zurueck
6. Admin-API-Call: `select=contact_name` -- gibt korrekte Daten zurueck
7. Dripify-Export als Admin -- LinkedIn-URLs sind enthalten

## Tech Design (Solution Architect)

### Betroffene Dateien
- Datenbank: Neue RLS Policy oder Security-View fuer spaltenbasierte Zugriffskontrolle
- `src/app/page.tsx` -- SELECT-Query anpassen (optional, je nach Ansatz)
- `src/components/CompanyTable.tsx` -- UI-seitige Admin-Pruefung bleibt bestehen
- `src/components/CompanyDetailModal.tsx` -- UI-seitige Admin-Pruefung bleibt bestehen
- `src/app/watchlist/page.tsx` -- `select("*")` liefert automatisch NULL-Werte fuer Nicht-Admins

### Konkrete Aenderungen

**Ansatz: Datenbank-View mit RLS (empfohlen)**

**1. Security-View erstellen (SQL Migration)**
- Eine Datenbank-View `company_data_view` die fuer Nicht-Admins die Spalten `contact_name`, `job_title`, `linkedin_profile_url` als NULL zurueckgibt
- Die View prueft die Rolle des aktuellen Users via `auth.uid()` gegen die `user_roles`-Tabelle
- Admins sehen alle Spalten, Nicht-Admins sehen NULL fuer sensible Spalten

**2. Frontend-Queries umstellen**
- Alle Supabase-Queries von `FinWell_data` auf `company_data_view` umstellen
- Betrifft: `page.tsx` (Hauptseite), `watchlist/page.tsx`, und ueberall wo `FinWell_data` direkt abgefragt wird
- Die UI-seitigen `isAdmin`-Checks in `CompanyTable.tsx` und `CompanyDetailModal.tsx` bleiben als doppelte Absicherung

**3. Bestehende UI-Logik beibehalten**
- `CompanyTable.tsx` Zeile 212-218: Admin-Spalten weiterhin nur fuer Admins anzeigen
- `CompanyDetailModal.tsx` Zeile 262-312: Key Contact Sektion weiterhin nur fuer Admins
- `watchlist/page.tsx` Zeile 220-226: Admin-Spalten weiterhin nur fuer Admins
- Jetzt kommt aber zusaetzlich NULL aus der Datenbank, falls jemand den Client manipuliert

### Alternativer Ansatz: Column-Level Security via `GRANT/REVOKE`
- PostgreSQL unterstuetzt `REVOKE SELECT (column)` auf Spaltenebene
- Problem: Supabase RLS und Column-Level Security interagieren komplex
- Empfehlung: View-basierter Ansatz ist stabiler und einfacher zu debuggen

### SQL Migrations
Eine Migration noetig:
- Name: `create_secure_company_view`
- Inhalt: View `company_data_view` mit bedingter Spalten-Sichtbarkeit basierend auf User-Rolle

### Dependencies
Keine.

### Tech-Entscheidung
View statt Column-Level Grants, weil:
- Views sind in Supabase gut unterstuetzt und ueber die REST-API erreichbar
- Einfacher zu testen und zu debuggen
- Keine Komplikationen mit RLS-Interaktionen
- Die View kann spaeter einfach erweitert werden, wenn weitere Spalten geschuetzt werden muessen

### Testhinweise
- Nicht-Admin ruft Hauptseite auf -- Network-Tab zeigt NULL fuer contact_name, job_title, linkedin_profile_url
- Admin ruft Hauptseite auf -- alle Kontaktdaten sichtbar
- Nicht-Admin oeffnet Detail-Modal -- kein LinkedIn-Bereich (weil Daten NULL sind)
- Direkter API-Call als Nicht-Admin mit `select=contact_name` -- gibt NULL zurueck
- Excel-Export als Nicht-Admin -- keine Kontaktdaten
- Dripify-Export als Admin -- LinkedIn-URLs enthalten
