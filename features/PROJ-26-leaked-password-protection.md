# PROJ-26: Leaked Password Protection aktivieren

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-004 (HIGH)
- Betroffene Komponente: Supabase Auth-Konfiguration

## Abhängigkeiten
- Keine

## Beschreibung
Die Supabase-Instanz hat die "Leaked Password Protection" deaktiviert. Dieses Feature prueft Passwoerter gegen die HaveIBeenPwned-Datenbank, um zu verhindern, dass User kompromittierte Passwoerter waehlen. Der Supabase Security Advisor meldet dies als Warnung.

## User Stories
- Als Betreiber moechte ich, dass User keine Passwoerter verwenden koennen, die in bekannten Datenlecks aufgetaucht sind, um Account-Uebernahmen zu erschweren.
- Als User moechte ich bei der Registrierung oder Passwortaenderung gewarnt werden, wenn mein gewaehltes Passwort kompromittiert ist, um ein sicheres Passwort waehlen zu koennen.

## Acceptance Criteria
- [ ] "Leaked Password Protection" ist in der Supabase-Instanz aktiviert
- [ ] Bei der Registrierung wird ein kompromittiertes Passwort (z.B. `password123`) abgelehnt
- [ ] Die Fehlermeldung ist verstaendlich und fordert den User auf, ein anderes Passwort zu waehlen
- [ ] Bei der Passwortaenderung (Reset) gelten dieselben Pruefungen
- [ ] Nicht-kompromittierte Passwoerter werden weiterhin akzeptiert
- [ ] Der Supabase Security Advisor zeigt nach Aktivierung keine Warnung mehr zu diesem Thema

## Edge Cases
- User waehlt ein Passwort, das erst kuerzlich in einem Datenleck aufgetaucht ist -- soll abgelehnt werden (abhaengig von HaveIBeenPwned-Aktualitaet)
- HaveIBeenPwned-Service ist voruebergehend nicht erreichbar -- Supabase-Standardverhalten pruefen (Fail-open oder Fail-closed)
- Bestehende User mit kompromittierten Passwoertern -- koennen sich weiterhin einloggen, werden aber bei Passwortaenderung zum Wechsel gezwungen

## Testbare Szenarien
1. Registrierung mit `password123` -- wird abgelehnt mit verstaendlicher Fehlermeldung
2. Registrierung mit einem starken, einzigartigen Passwort -- wird akzeptiert
3. Passwort-Reset mit kompromittiertem Passwort -- wird abgelehnt
4. Bestehender User loggt sich mit altem (moeglicherweise kompromittiertem) Passwort ein -- funktioniert weiterhin

## Tech Design (Solution Architect)

### Betroffene Dateien
- Keine Code-Dateien -- reine Supabase Dashboard-Einstellung

### Konkrete Aenderungen

**1. Supabase Dashboard-Einstellung aktivieren**
- Dashboard aufrufen: Authentication > Settings > Security
- "Leaked Password Protection" aktivieren (HaveIBeenPwned-Check)
- Das ist ein Toggle im Supabase Dashboard, KEIN Code noetig

### SQL Migrations
Keine.

### Dependencies
Keine.

### Tech-Entscheidung
Supabase bietet diese Funktion nativ an. Kein Custom-Code noetig. Die Pruefung erfolgt server-seitig bei `signUp` und Passwort-Reset. Bestehende User sind nicht betroffen (koennen sich weiterhin einloggen).

### Testhinweise
- Registrierung mit `password123` -- muss mit Fehlermeldung abgelehnt werden
- Registrierung mit starkem, einzigartigem Passwort -- muss funktionieren
- Passwort-Reset mit kompromittiertem Passwort -- muss abgelehnt werden
- Bestehende Logins funktionieren weiterhin
- Supabase Security Advisor pruefen -- Warnung muss verschwunden sein
