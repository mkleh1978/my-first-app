# PROJ-30: Server-seitige Email-Domain-Einschraenkung

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-008 (HIGH)
- Betroffene Dateien: `src/app/(auth)/register/page.tsx` (Zeile 19)

## Abhängigkeiten
- Benötigt: PROJ-17 (User Authentication) -- existierende Registrierungslogik

## Beschreibung
Die Einschraenkung der Registrierung auf `@hoft.berlin`-Email-Adressen wird nur im React-Frontend-Component geprueft. Ein Angreifer kann diese Pruefung umgehen, indem er die Supabase Auth API direkt aufruft (mit dem oeffentlich sichtbaren Anon Key):

```
supabase.auth.signUp({ email: "attacker@gmail.com", password: "12345678" })
```

Das ermoeglicht es Personen ausserhalb der Organisation, Accounts zu erstellen und auf die gesamte FinWell-Datenbank zuzugreifen.

## User Stories
- Als Betreiber moechte ich, dass die `@hoft.berlin`-Email-Einschraenkung server-seitig durchgesetzt wird, damit sie nicht umgangen werden kann.
- Als Betreiber moechte ich, dass direkte API-Calls zur Registrierung mit nicht-@hoft.berlin-Adressen abgelehnt werden.
- Als HoFT-Mitarbeiter moechte ich mich weiterhin mit meiner `@hoft.berlin`-Adresse registrieren koennen.

## Acceptance Criteria
- [ ] Die Email-Domain-Pruefung (`@hoft.berlin`) wird server-seitig durchgesetzt (z.B. via Datenbank-Trigger, Auth-Hook oder Edge Function)
- [ ] Ein direkter API-Call `supabase.auth.signUp({ email: "attacker@gmail.com" })` wird mit einem Fehler abgelehnt
- [ ] Die Fehlermeldung bei nicht-@hoft.berlin-Adressen ist verstaendlich (z.B. "Registrierung nur mit @hoft.berlin-Adressen moeglich")
- [ ] Die Client-seitige Pruefung bleibt als zusaetzliche UX-Verbesserung erhalten (fruehes Feedback)
- [ ] Registrierung mit gueltiger `@hoft.berlin`-Adresse funktioniert weiterhin korrekt
- [ ] Die Pruefung greift auch bei Gross-/Kleinschreibung (z.B. `user@HOFT.BERLIN` oder `user@HoFT.Berlin`)
- [ ] Bestehende Accounts (auch solche ohne @hoft.berlin, falls vorhanden) koennen sich weiterhin einloggen

## Edge Cases
- Email mit Subdomain: `user@sub.hoft.berlin` -- soll abgelehnt werden (nur exakt `@hoft.berlin`)
- Email mit Leerzeichen oder Sonderzeichen: `user @hoft.berlin` -- soll abgelehnt werden
- Email in Grossbuchstaben: `USER@HOFT.BERLIN` -- soll akzeptiert werden (case-insensitive)
- Zukuenftige Domain-Aenderung der Organisation -- die erlaubte Domain soll einfach anpassbar sein (nicht hartcodiert an vielen Stellen)
- OAuth-Login (falls spaeter implementiert) -- muss dieselbe Domain-Einschraenkung haben

## Testbare Szenarien
1. Registrierung ueber UI mit `test@hoft.berlin` -- funktioniert
2. Registrierung ueber UI mit `test@gmail.com` -- wird abgelehnt (Client-seitig)
3. Direkter API-Call mit `test@gmail.com` -- wird abgelehnt (Server-seitig)
4. Direkter API-Call mit `test@hoft.berlin` -- funktioniert
5. Direkter API-Call mit `test@HOFT.BERLIN` -- funktioniert (case-insensitive)
6. Direkter API-Call mit `test@sub.hoft.berlin` -- wird abgelehnt

## Tech Design (Solution Architect)

### Betroffene Dateien
- Datenbank: Neuer Trigger auf `auth.users` ODER Supabase Auth Hook (Edge Function)
- `src/app/(auth)/register/page.tsx` -- Client-seitige Pruefung bleibt bestehen (UX)

### Konkrete Aenderungen

**Ansatz: Datenbank-Trigger (empfohlen)**

**1. Datenbank-Funktion + Trigger erstellen (SQL Migration)**
- Funktion `check_email_domain()` die bei INSERT auf `auth.users` prueft, ob die Email-Domain `@hoft.berlin` ist
- Case-insensitive Pruefung (LOWER)
- Bei nicht-@hoft.berlin: Exception werfen mit verstaendlicher Fehlermeldung
- Trigger: BEFORE INSERT ON `auth.users`

**2. Client-seitige Pruefung beibehalten (`register/page.tsx`)**
- Die bestehende Pruefung in Zeile 19 bleibt fuer schnelles User-Feedback
- Keine Aenderungen noetig

### Alternativer Ansatz: Supabase Auth Hook (Edge Function)
- Supabase unterstuetzt Auth Hooks, die bei `signUp` aufgerufen werden
- Vorteil: Sauberer als direkte Trigger auf `auth.users`
- Nachteil: Erfordert Edge Function Deployment und Konfiguration im Dashboard
- Empfehlung: Datenbank-Trigger ist einfacher und zuverlaessiger

### SQL Migrations
Eine Migration noetig:
- Name: `add_email_domain_restriction_trigger`
- Inhalt: Funktion `check_email_domain()` + Trigger BEFORE INSERT auf `auth.users`

### Dependencies
Keine.

### Tech-Entscheidung
Datenbank-Trigger statt Edge Function, weil:
- Einfacher zu implementieren und zu testen
- Kein zusaetzliches Deployment (Edge Function) noetig
- Trigger auf `auth.users` greift garantiert bei jedem signUp, auch bei direkten API-Calls
- Die erlaubte Domain sollte als Variable in der Funktion stehen (einfach aenderbar)

### Testhinweise
- Registrierung ueber UI mit `@hoft.berlin` -- funktioniert
- Direkter API-Call mit `test@gmail.com` via Supabase Client -- wird abgelehnt mit Fehlermeldung
- Direkter API-Call mit `test@HOFT.BERLIN` -- funktioniert (case-insensitive)
- Direkter API-Call mit `test@sub.hoft.berlin` -- wird abgelehnt
- Bestehende User koennen sich weiterhin einloggen
