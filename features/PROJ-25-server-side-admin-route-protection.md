# PROJ-25: Server-seitige Admin-Route-Absicherung

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-003 (CRITICAL)
- Betroffene Dateien: `src/middleware.ts`, `src/app/admin/page.tsx`

## Abhängigkeiten
- Benötigt: PROJ-17 (User Authentication) -- fuer Auth-Middleware-Grundlage

## Beschreibung
Die `/admin`-Route ist nur Client-seitig geschuetzt. Die Middleware prueft lediglich, ob ein User authentifiziert ist, nicht ob er die Admin-Rolle besitzt. Jeder authentifizierte User kann die Admin-Seite aufrufen, den Code der Admin-UI sehen, Upload-Versuche starten und den Import-Mechanismus entdecken. Die einzige tatsaechliche Schutzschicht ist die RLS-UPDATE-Policy auf `FinWell_data`, die Nicht-Admins am Schreiben hindert -- aber der Zugriff auf die Admin-Seite selbst ist nicht eingeschraenkt.

## User Stories
- Als Betreiber moechte ich, dass nur User mit der Admin-Rolle die `/admin`-Route aufrufen koennen, um unbefugten Zugriff auf Admin-Funktionen zu verhindern.
- Als normaler authentifizierter User moechte ich beim Versuch, `/admin` aufzurufen, sofort zur Hauptseite weitergeleitet werden, ohne die Admin-UI zu sehen.
- Als Admin moechte ich weiterhin uneingeschraenkt auf die Admin-Seite zugreifen koennen.

## Acceptance Criteria
- [ ] Die Middleware prueft fuer alle Routen unter `/admin` die Admin-Rolle des Users server-seitig
- [ ] Die Rollenabfrage erfolgt gegen die `user_roles`-Tabelle in der Datenbank (nicht Client-seitig)
- [ ] Nicht-Admin-User werden bei Zugriff auf `/admin` zur Hauptseite (`/`) weitergeleitet
- [ ] Die Weiterleitung erfolgt server-seitig (HTTP 302/307), BEVOR die Admin-Seite gerendert wird
- [ ] Admin-User koennen `/admin` weiterhin normal aufrufen und alle Funktionen nutzen
- [ ] Die bestehende Client-seitige Pruefung (`useAuth().isAdmin`) bleibt als zusaetzliche Absicherung erhalten
- [ ] Nicht-authentifizierte User werden weiterhin zum Login weitergeleitet (bestehende Funktionalitaet)

## Edge Cases
- User wird waehrend einer Admin-Session die Admin-Rolle entzogen -- beim naechsten Request wird er weitergeleitet
- User manipuliert Client-seitigen Code, um `isAdmin = true` zu setzen -- Server-Middleware blockiert trotzdem
- Direkter API-Call auf `/admin` ohne Browser (z.B. cURL mit Auth-Cookie) -- Server-Weiterleitung greift
- Admin-Rolle wird einem neuen User zugewiesen -- sofortiger Zugriff auf `/admin` ohne Neustart
- Middleware-Performance: Rollenabfrage soll kein spuerbares Delay verursachen

## Testbare Szenarien
1. Normaler User ruft `/admin` auf -- wird zu `/` weitergeleitet, sieht keine Admin-UI
2. Admin-User ruft `/admin` auf -- sieht Admin-Seite normal
3. Nicht-eingeloggter User ruft `/admin` auf -- wird zu `/login` weitergeleitet
4. Admin-User fuehrt LinkedIn-Import durch -- funktioniert wie bisher
5. Browser-DevTools: Normaler User sieht KEINEN Admin-Seiten-Code in den Network-Responses

## Tech Design (Solution Architect)

### Betroffene Dateien
- `src/middleware.ts` -- Admin-Rollen-Pruefung hinzufuegen

### Konkrete Aenderungen

**1. Middleware erweitern (`src/middleware.ts`)**
- Fuer Routen unter `/admin`: Nach erfolgreicher Authentifizierung zusaetzlich die `user_roles`-Tabelle abfragen
- Wenn die Rolle nicht `admin` ist: HTTP-Redirect (302) auf `/`
- Die Abfrage nutzt den bestehenden Supabase-Server-Client (bereits im Middleware vorhanden)
- Nur fuer `/admin`-Routen pruefen, nicht fuer alle Routen (Performance)

**2. Bestehende Client-seitige Pruefung beibehalten**
- `useAuth().isAdmin` in Admin-Komponenten bleibt als doppelte Absicherung

### SQL Migrations
Keine noetig -- die `user_roles`-Tabelle existiert bereits mit RLS.

### Dependencies
Keine neuen Packages noetig.

### Tech-Entscheidung
Rollenabfrage direkt in der Middleware statt in einer separaten API-Route, weil die Middleware bereits den Supabase-Server-Client initialisiert und User-Daten laedt. Eine zusaetzliche Datenbank-Abfrage auf `user_roles` ist fuer `/admin`-Routen akzeptabel (nur Admins greifen darauf zu, max. 2-3 User).

### Testhinweise
- Normaler User navigiert zu `/admin` -- wird sofort zu `/` weitergeleitet (kein Admin-HTML sichtbar)
- Admin-User navigiert zu `/admin` -- sieht Admin-Seite normal
- Nicht eingeloggter User navigiert zu `/admin` -- wird zu `/login` weitergeleitet
- Performance: Redirect muss ohne merkliches Delay erfolgen
