# PROJ-17: User Authentication (Supabase Auth)

## Status: 🔵 Planned

## Abhängigkeiten
- Keine (Basis-Feature)
- Wird benötigt von: PROJ-18 (Watchlist & Favorites)

---

## User Stories

**US-1:** Als Nutzer möchte ich mich mit Email und Passwort registrieren können, um einen persönlichen Account zu erhalten.

**US-2:** Als Nutzer möchte ich mich mit meinem Account einloggen können, um auf die FinTech-Datenbank zuzugreifen.

**US-3:** Als Nutzer möchte ich eingeloggt bleiben, bis ich mich explizit auslogge, damit ich nicht bei jedem Besuch neu einloggen muss.

**US-4:** Als Nutzer möchte ich mich ausloggen können, um meinen Account auf einem geteilten Gerät zu schützen.

**US-5:** Als Nutzer möchte ich mein Passwort zurücksetzen können, falls ich es vergessen habe.

---

## Acceptance Criteria

- [ ] AC-1: Es gibt eine `/login`-Seite mit Email- und Passwort-Feldern
- [ ] AC-2: Es gibt eine `/register`-Seite mit Email, Passwort und Passwort-Bestätigung
- [ ] AC-3: Nach erfolgreicher Registrierung wird eine Bestätigungs-Email gesendet
- [ ] AC-4: Erst nach Email-Bestätigung ist der Login möglich
- [ ] AC-5: Alle anderen Routen (`/`, `/reporting`, `/watchlist`) sind nur für eingeloggte User zugänglich
- [ ] AC-6: Nicht-eingeloggte User werden automatisch auf `/login` weitergeleitet
- [ ] AC-7: Der Header zeigt die User-Email und einen Logout-Button
- [ ] AC-8: Logout löscht die Session und leitet auf `/login` weiter
- [ ] AC-9: Es gibt einen "Passwort vergessen"-Link auf der Login-Seite
- [ ] AC-10: Password-Reset sendet eine Email mit Reset-Link
- [ ] AC-11: Session bleibt nach Browser-Reload erhalten (Supabase Session Management)
- [ ] AC-12: Passwort-Validierung: Mindestens 8 Zeichen
- [ ] AC-13: Login/Register-Formulare zeigen aussagekräftige Fehlermeldungen (falsche Credentials, Email bereits vergeben, etc.)
- [ ] AC-14: Login/Register-Seiten folgen dem HoFT-Branding (Navy/Teal/Orange)

---

## Edge Cases

- **Doppelte Email-Registrierung:** Fehlermeldung "Diese Email-Adresse ist bereits registriert" + Link zu Login
- **Falsches Passwort:** Fehlermeldung "Email oder Passwort falsch" (keine Info welches falsch ist — Security)
- **Abgelaufene Session:** Automatischer Redirect auf `/login` mit Hinweis "Session abgelaufen, bitte erneut einloggen"
- **Email-Bestätigung nicht abgeschlossen:** Hinweis "Bitte bestätige deine Email-Adresse" mit Resend-Button
- **Password-Reset für unbekannte Email:** Keine Fehlermeldung aus Security-Gründen ("Falls ein Account existiert, wurde eine Email gesendet")
- **Gleichzeitige Sessions:** Supabase erlaubt mehrere aktive Sessions — kein Conflict

---

## Technische Anforderungen

- **Auth Provider:** Supabase Auth (Email + Password)
- **Session:** Supabase Client-Side Session (automatische Token-Refresh)
- **Protected Routes:** Middleware oder Client-Side Auth-Guard
- **Email-Templates:** Supabase Standard-Templates (Confirmation, Password Reset)
- **RLS (Row Level Security):** Wird für PROJ-18 (Watchlist-Tabelle) benötigt
