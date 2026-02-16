# PROJ-19: Admin-Rolle & LinkedIn-Spalten (DB-Infrastruktur)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-17 (User Authentication) - Bestehendes Auth-System

## Kontext
Die FinWell_data-Tabelle soll um LinkedIn-Kontaktdaten erweitert werden. Außerdem wird ein einfaches Rollen-System benötigt, um Admin-Funktionen (LinkedIn-Daten sehen, Dripify-Export) von normalen Usern abzugrenzen.

## User Stories

### Admin-Rolle
- Als System-Betreiber möchte ich, dass `markus.lehleiter@hoft.berlin` automatisch Admin-Rechte hat, um LinkedIn-Daten und Admin-Funktionen nutzen zu können.
- Als normaler User (@hoft.berlin) möchte ich die App wie gewohnt nutzen können, ohne LinkedIn-Daten oder Admin-Exports zu sehen.
- Als Admin möchte ich klar erkennen können, dass ich erweiterte Rechte habe (z.B. visueller Indikator im Header).

### LinkedIn-Spalten
- Als Admin möchte ich, dass die Tabelle `FinWell_data` die Spalten `contact_name`, `job_title` und `linkedin_profile_url` enthält, um Kontaktdaten zu LinkedIn-Profilen speichern zu können.

## Acceptance Criteria

### Admin-Rolle
- [ ] Supabase-Tabelle `user_roles` existiert mit Spalten: `id`, `user_id` (FK → auth.users), `role` (text, default 'user'), `created_at`
- [ ] `markus.lehleiter@hoft.berlin` hat role = 'admin'
- [ ] Alle anderen @hoft.berlin User haben role = 'user' (Default)
- [ ] RLS-Policy: User können nur ihre eigene Rolle lesen
- [ ] React Context `useAuth` wird um `role` erweitert (Wert: 'admin' | 'user')
- [ ] Role wird beim Login/Session-Restore aus `user_roles` geladen
- [ ] Neuer User bekommt automatisch role = 'user' (DB-Trigger oder Default)

### LinkedIn-Spalten
- [ ] Spalte `contact_name` (text, nullable) existiert in `FinWell_data`
- [ ] Spalte `job_title` (text, nullable) existiert in `FinWell_data`
- [ ] Spalte `linkedin_profile_url` (text, nullable) existiert in `FinWell_data`
- [ ] Bestehende RLS-Policies bleiben intakt
- [ ] TypeScript-Type `FinTechCompany` enthält die 3 neuen Felder

## Edge Cases
- Was passiert, wenn `markus.lehleiter@hoft.berlin` sich neu registriert? → Admin-Rolle wird automatisch zugewiesen (DB-Trigger prüft Email)
- Was wenn ein User direkt die `user_roles`-Tabelle per API abfragt? → RLS: Nur eigene Rolle lesbar, keine Schreibrechte
- Was wenn später weitere Admins hinzukommen? → Admin kann per Supabase Dashboard weitere Admins eintragen (kein UI nötig für MVP)
- Was wenn die LinkedIn-Spalten bei bestehenden Companies leer sind? → Null-Werte sind OK, Anzeige wird übersprungen (PROJ-21)

## Technische Anforderungen
- Migration via Supabase MCP (apply_migration)
- Kein Breaking Change für bestehende Queries
- Role-Check muss performant sein (kein zusätzlicher DB-Call pro Page Load → einmalig bei Session-Start laden)

## Tech-Design (Solution Architect)

### Component-Struktur

Bestehende Architektur wird erweitert (kein neuer Screen):

```
AuthProvider (bestehend — wird erweitert)
├── user          (bestehend — Supabase User-Objekt)
├── role          (NEU — 'admin' | 'user')
├── isAdmin       (NEU — Hilfsfunktion: role === 'admin')
├── loading       (bestehend)
└── signOut       (bestehend)
```

Header (bestehend — kleines Admin-Badge ergänzen)
```
Header
├── Navigation (Database | Reporting | Watchlist)
├── Company Count
└── User-Bereich
    ├── Email
    ├── Admin-Badge (NEU — nur wenn Admin, z.B. kleines "Admin" Label)
    └── Logout-Button
```

### Daten-Model

**Neue Tabelle: `user_roles`**
```
Jede Rolle hat:
- Eindeutige ID
- Verknüpfung zum User (auth.users)
- Rolle: "admin" oder "user" (Standard: "user")
- Erstellungszeitpunkt

Gespeichert in: Supabase (user_roles Tabelle)
Sicherheit: User können nur ihre eigene Rolle lesen (RLS)
```

**Neue Spalten in `FinWell_data`:**
```
Jedes Unternehmen bekommt zusätzlich:
- Kontaktperson (Name des CEO/Founders)
- Job-Titel (z.B. "CEO", "Co-Founder")
- LinkedIn Profil URL

Alle drei Felder sind optional (können leer sein).
```

**Automatische Admin-Zuweisung:**
```
Wenn ein neuer User sich registriert:
→ Automatisch Rolle "user" zuweisen
→ AUSNAHME: markus.lehleiter@hoft.berlin bekommt "admin"
(Wird über einen Datenbank-Trigger gesteuert)
```

### Tech-Entscheidungen

**Warum eine separate `user_roles`-Tabelle statt Supabase Custom Claims?**
→ Einfacher zu verwalten, kein JWT-Refresh nötig, per Dashboard editierbar

**Warum Role im AuthContext statt separatem Context?**
→ Role gehört zur User-Session, ein zusätzlicher Context wäre Overhead. Wird einmalig beim Login geladen (1 DB-Call).

**Warum kein Admin-UI zum Rollen-Verwalten?**
→ Für MVP reicht das Supabase Dashboard. Nur 1 Admin aktuell.

### Betroffene Dateien

```
Datenbank (Supabase Migrationen):
├── Migration 1: user_roles Tabelle + RLS + Trigger
└── Migration 2: 3 neue Spalten in FinWell_data

Frontend:
├── src/lib/auth-context.tsx     → Role-Feld + isAdmin ergänzen
├── src/types/fintech.ts         → 3 neue Felder im FinTechCompany Type
└── src/components/Header.tsx    → Admin-Badge anzeigen
```

### Dependencies
Keine neuen Packages nötig — nutzt bestehende Supabase-Infrastruktur.