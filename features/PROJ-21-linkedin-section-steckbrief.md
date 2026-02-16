# PROJ-21: LinkedIn Section im Steckbrief (rollenbasierte Sichtbarkeit)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-19 (Admin-Rolle & LinkedIn-Spalten) - Rollen-System und Spalten
- Benötigt: PROJ-20 (LinkedIn Contact Import) - Daten müssen vorhanden sein
- Benötigt: PROJ-13 (Company Detail Steckbrief Redesign) - Bestehende Steckbrief-Struktur

## Kontext
Der Company-Steckbrief (CompanyDetailModal) soll um eine LinkedIn-Kontakt-Section erweitert werden. Diese Section ist NUR für Admins sichtbar. Wenn keine LinkedIn-Daten vorhanden sind, wird die Section ausgeblendet.

## User Stories
- Als Admin möchte ich im Steckbrief einer Company die LinkedIn-Kontaktdaten des CEO/Founders sehen, um direkt deren Profil besuchen zu können.
- Als Admin möchte ich den LinkedIn-Link direkt anklicken können, um zum Profil weitergeleitet zu werden.
- Als normaler User möchte ich den Steckbrief wie gewohnt sehen, ohne LinkedIn-Daten (kein Hinweis, dass etwas verborgen ist).
- Als Admin möchte ich bei Companies ohne LinkedIn-Daten keinen leeren Bereich sehen.

## Acceptance Criteria

### LinkedIn Section im Steckbrief
- [ ] Neue Section "Key Contact" im CompanyDetailModal (nach "Company Info", vor "Product Details")
- [ ] Section zeigt: Contact Name, Job Title, LinkedIn Profile URL (als klickbarer Link)
- [ ] LinkedIn-Link öffnet in neuem Tab (`target="_blank"`, `rel="noopener noreferrer"`)
- [ ] Icon: LinkedIn-Icon oder User-Icon (lucide-react `Linkedin` oder `UserCircle`)
- [ ] Styling konsistent mit bestehendem Steckbrief-Design (Icons, Farben, Abstände)

### Rollenbasierte Sichtbarkeit
- [ ] Section ist NUR sichtbar wenn: User = Admin UND mindestens ein LinkedIn-Feld befüllt ist
- [ ] Für User-Rolle: Section ist komplett unsichtbar (kein Platzhalter, kein Hinweis)
- [ ] Kein "Locked"- oder "Upgrade"-Hinweis für normale User

### Conditional Rendering
- [ ] Wenn `contact_name` leer → Zeile nicht anzeigen
- [ ] Wenn `job_title` leer → Zeile nicht anzeigen
- [ ] Wenn `linkedin_profile_url` leer → Zeile nicht anzeigen
- [ ] Wenn ALLE drei Felder leer → Gesamte Section nicht anzeigen (auch für Admins)

### Company Table (Haupttabelle)
- [ ] Spalte "Contact" in der Tabelle (nur für Admins sichtbar)
- [ ] Spalte "Title" in der Tabelle (nur für Admins sichtbar)
- [ ] Spalte "LinkedIn" in der Tabelle (nur für Admins sichtbar, als klickbarer Link/Icon)

## Edge Cases
- Was wenn nur die LinkedIn URL vorhanden ist, aber kein Name? → Nur URL-Link anzeigen mit Generic-Label "LinkedIn Profile"
- Was wenn die LinkedIn URL kein gültiges Format hat? → Trotzdem anzeigen, kein Client-seitiges URL-Validieren
- Was wenn ein Admin den Steckbrief teilt (Screenshot)? → Bewusstes Risiko, kein technisches Enforcement
- Was wenn sich die Rolle während der Session ändert? → Role wird bei Session-Start geladen; Änderung wirkt erst nach Re-Login

## Technische Anforderungen
- Kein zusätzlicher DB-Call für LinkedIn-Daten (werden mit Company-Query mitgeladen)
- Role-Check via `useAuth()` Context (performant, kein API-Call)
- LinkedIn-Daten NICHT in Client-Bundle für User-Rolle filtern → Filterung im Frontend reicht (Daten sind nicht hochsensibel, nur Feature-Gating)

## Tech-Design (Solution Architect)

### Component-Struktur

**A) Steckbrief (CompanyDetailModal) — neue Section einfügen:**

```
CompanyDetailModal (bestehend)
├── Header (Name, Domain, Badge)
├── Quick Stats (Funding, Founded, Employees, Status)
├── Categories
├── Company Info (Location, Region, Target Model, etc.)
├── ★ Key Contact (NEU — nur für Admins, nur wenn Daten vorhanden)
│   ├── Kontaktperson (Name + Job Title)
│   └── LinkedIn Profil (klickbarer Link, öffnet in neuem Tab)
├── Product Details
├── Funding History
├── Investors
├── Competitors
└── Integration Capabilities
```

Die neue Section fügt sich zwischen "Company Info" und "Product Details" ein — nutzt das bestehende `Section`- und `InfoItem`-Pattern des Modals.

**B) Haupttabelle (CompanyTable) — 3 neue Spalten:**

```
CompanyTable (bestehend)
Spalten: ★ | Company | Category | Country | Founded | Funding | Employees | Status
                                    ↓ NEU (nur für Admins sichtbar) ↓
         ★ | Company | Category | Country | Contact | Title | LinkedIn | Founded | Funding | Employees | Status
```

**C) Watchlist-Tabelle — gleiche 3 Spalten ergänzen:**

```
Watchlist-Tabelle (bestehend)
Gleiche Logik: Contact, Title, LinkedIn nur für Admins sichtbar
```

### Daten-Model

Kein neues Daten-Model — nutzt die bestehenden Felder aus PROJ-19:
```
Aus FinTechCompany-Objekt (bereits geladen):
- contact_name          → Anzeige: "Nikolay Storonsky"
- job_title             → Anzeige: "CEO"
- linkedin_profile_url  → Anzeige: Klickbarer Link mit LinkedIn-Icon
```

### Sichtbarkeits-Logik

```
Zeige LinkedIn-Daten wenn:
  1. User hat Rolle "admin" (aus useAuth().isAdmin)
  UND
  2. Mindestens ein Feld ist befüllt (contact_name ODER job_title ODER linkedin_profile_url)

Wenn NICHT Admin:
  → Keine Section im Steckbrief
  → Keine Spalten in der Tabelle
  → Kein Hinweis, dass etwas fehlt
```

### Tech-Entscheidungen

**Warum Section zwischen "Company Info" und "Product Details"?**
→ Kontaktdaten gehören zum Unternehmensprofil, nicht zu Produktdetails. Logische Einordnung.

**Warum bestehende InfoItem-Komponente wiederverwenden?**
→ Konsistentes Design. Section und InfoItem sind bereits im Modal definiert — gleiches Muster für LinkedIn.

**Warum Frontend-Filterung statt Backend-Filterung (RLS)?**
→ LinkedIn-Daten sind nicht hochsensibel (Names + öffentliche Profile). Frontend-Gating reicht, spart komplexe RLS-Regeln pro Rolle.

### Betroffene Dateien

```
Frontend (ANPASSEN):
├── src/components/CompanyDetailModal.tsx  → Neue "Key Contact" Section einfügen
├── src/components/CompanyTable.tsx        → 3 Admin-only Spalten ergänzen
└── src/app/watchlist/page.tsx             → 3 Admin-only Spalten in Watchlist-Tabelle
```

### Dependencies
Keine neuen Packages — `lucide-react` hat bereits ein `Linkedin`-Icon.
