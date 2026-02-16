# PROJ-20: LinkedIn Contact Import (Admin XLSX Upload)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-19 (Admin-Rolle & LinkedIn-Spalten) - Spalten müssen existieren, Admin-Rolle für Zugriffskontrolle

## Kontext
Admins sollen LinkedIn-Kontaktdaten aus einer XLSX-Datei (z.B. Contacts.xlsx) importieren und automatisch per Domain-Matching den Unternehmen in `FinWell_data` zuordnen können. Der Import soll wiederholt möglich sein (neue Daten mergen).

### Datenquelle: Contacts.xlsx
- **8.406 Einträge**
- **Spalten:** Domain, Company Name, Headquarters, City, Country, Founders/CEOs, Contact Name, Job Title, Linkedin Profile URL
- **Match-Key:** `Domain` ↔ `FinWell_data.domain`

## User Stories
- Als Admin möchte ich eine XLSX-Datei mit LinkedIn-Kontaktdaten hochladen können, um die Datenbank mit Kontaktinformationen anzureichern.
- Als Admin möchte ich nach dem Upload eine Vorschau/Zusammenfassung sehen, wie viele Einträge gematcht wurden und wie viele nicht zugeordnet werden konnten.
- Als Admin möchte ich bestehende Kontaktdaten durch einen neuen Import aktualisieren können (Upsert-Logik).
- Als Admin möchte ich den Import rückgängig machen können (oder zumindest wissen, welche Daten geändert wurden).

## Acceptance Criteria

### Upload-UI (Admin-only)
- [ ] Upload-Button ist nur für Admins sichtbar (z.B. auf einer Admin-Seite oder im Header-Dropdown)
- [ ] Drag & Drop oder File-Picker für .xlsx/.xls Dateien
- [ ] Client-seitiges Parsen der XLSX via bestehender `xlsx`-Library (bereits installiert)
- [ ] Validierung: Datei muss die erwarteten Spalten enthalten (mindestens: Domain, Contact Name, Job Title, Linkedin Profile URL)

### Matching-Logik
- [ ] Match über `domain`-Feld (case-insensitive, ohne http/https/www Prefix)
- [ ] Domain-Normalisierung: `https://www.revolut.com` → `revolut.com`
- [ ] Bei Match: `contact_name`, `job_title`, `linkedin_profile_url` in `FinWell_data` aktualisieren
- [ ] Bei mehreren Kontakten pro Domain: Ersten Eintrag verwenden (CEO/Founder Priorität)

### Import-Ergebnis
- [ ] Zusammenfassung nach Import: X gematcht, Y nicht gefunden, Z aktualisiert
- [ ] Liste der nicht-gematchten Domains anzeigen (zur manuellen Prüfung)
- [ ] Erfolgs-/Fehler-Toast-Notification

### Wiederholter Import
- [ ] Bestehende Daten werden überschrieben (Upsert-Logik)
- [ ] Leere Felder in der XLSX überschreiben NICHT bestehende Werte (nur non-empty Werte updaten)

## Edge Cases
- Was wenn die XLSX keine Domain-Spalte hat? → Fehlermeldung: "Spalte 'Domain' nicht gefunden"
- Was wenn die Domain in FinWell_data anders formatiert ist (mit/ohne www)? → Normalisierung beider Seiten vor Match
- Was wenn eine Company mehrere Kontakte in der XLSX hat? → Erster Eintrag (oder der mit CEO/Founder im Title) gewinnt
- Was wenn die XLSX >10.000 Zeilen hat? → Batch-Processing mit Progress-Indicator
- Was wenn der Import mittendrin fehlschlägt? → Transaktionale Updates (alles oder nichts) ODER Fortschrittsanzeige mit Fehlerlog
- Was wenn ein User (nicht Admin) die Import-Route direkt aufruft? → 403 Forbidden

## Technische Anforderungen
- XLSX wird client-seitig geparst (kein Server-Upload nötig)
- Updates direkt via Supabase Client (Batch-Updates)
- Maximale Dateigröße: 5 MB
- Performance: Import von 8.000 Einträgen < 30 Sekunden

## Tech-Design (Solution Architect)

### Component-Struktur

Neue Admin-Seite für den Import:

```
/admin (Neue Route — nur für Admins erreichbar)
└── Admin-Seite
    ├── Seitentitel "Admin: LinkedIn Import"
    ├── Upload-Bereich
    │   ├── Drag & Drop Zone (oder Datei-Picker)
    │   ├── Datei-Info (Name, Größe, Zeilenanzahl)
    │   └── "Import starten" Button
    ├── Fortschritts-Anzeige (während Import)
    │   ├── Fortschrittsbalken
    │   └── "X von Y verarbeitet..."
    └── Ergebnis-Zusammenfassung (nach Import)
        ├── Erfolgreich gematcht: X
        ├── Nicht gefunden: Y
        ├── Aktualisiert: Z
        └── Aufklappbare Liste: Nicht-gematchte Domains
```

Header (bestehend — wird erweitert):
```
Header
├── Navigation: Database | Reporting | Watchlist | Admin (NEU — nur für Admins)
└── ...
```

### Daten-Fluss

```
Schritt 1: Admin wählt XLSX-Datei
→ Datei wird IM BROWSER gelesen (kein Server-Upload!)
→ xlsx-Library parst die Datei zu einer Liste

Schritt 2: Spalten-Validierung
→ Prüfe ob "Domain", "Contact Name", "Job Title", "Linkedin Profile URL" vorhanden
→ Wenn nicht → Fehlermeldung

Schritt 3: Domain-Normalisierung
→ Alle Domains bereinigen: "https://www.revolut.com" → "revolut.com"
→ Gleiche Normalisierung für Daten aus FinWell_data

Schritt 4: Matching & Update
→ Pro XLSX-Zeile: Suche Company in FinWell_data mit gleicher Domain
→ Wenn gefunden: Aktualisiere contact_name, job_title, linkedin_profile_url
→ Wenn nicht gefunden: Merke Domain für Zusammenfassung
→ Leere Felder in XLSX überschreiben NICHT bestehende Werte

Schritt 5: Ergebnis anzeigen
→ Zusammenfassung: X gematcht, Y nicht gefunden
→ Liste der nicht-gematchten Domains (aufklappbar)
```

### Daten-Model

Kein neues Daten-Model — nutzt die in PROJ-19 erstellten Spalten in `FinWell_data`:
```
Aktualisierte Felder pro Company:
- contact_name     ← aus XLSX "Contact Name"
- job_title        ← aus XLSX "Job Title"
- linkedin_profile_url  ← aus XLSX "Linkedin Profile URL"

Match-Key: domain (normalisiert, case-insensitive)
```

### Tech-Entscheidungen

**Warum client-seitiges Parsen statt Server-Upload?**
→ xlsx-Library ist bereits installiert. Kein neuer API-Endpoint nötig. XLSX bleibt im Browser.

**Warum Batch-Updates statt Einzel-Updates?**
→ 8.000 einzelne Updates wären zu langsam. Updates werden in Batches von ~100 an Supabase gesendet.

**Warum eine eigene /admin Route statt Dialog im Header?**
→ Import braucht Platz für Fortschritt + Ergebnisse. Ein Modal wäre zu klein. Admin-Bereich kann später erweitert werden.

**Warum kein Middleware-Schutz für /admin?**
→ Route wird im Frontend per Role-Check geschützt (Admin-Check im AuthContext). Daten-Zugriff ist ohnehin über Supabase RLS gesichert.

### Betroffene Dateien

```
Frontend (NEU):
├── src/app/admin/page.tsx           → Admin-Seite mit Import-UI
└── src/lib/import-contacts.ts       → Import-Logik (Parsen, Normalisieren, Matchen)

Frontend (ANPASSEN):
├── src/components/Header.tsx        → Admin-Link in Navigation
└── src/middleware.ts                → /admin zu geschützten Routen hinzufügen
```

### Dependencies
Keine neuen Packages — `xlsx` ist bereits installiert.
