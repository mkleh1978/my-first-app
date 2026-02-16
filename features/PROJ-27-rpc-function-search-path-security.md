# PROJ-27: RPC-Funktionen search_path absichern

## Status: 🔵 Planned

## Quelle
- QA-Audit: BUG-005 (HIGH)
- Betroffene Funktionen: `get_distinct_countries`, `get_category_distributions`, `get_category_funding_timeline`, `get_category_stats`, `get_top_keywords`, `handle_new_user_role`

## Abhängigkeiten
- Keine

## Beschreibung
Alle 6 oeffentlichen RPC-Funktionen haben einen veraenderbaren `search_path`. Dies ist ein bekanntes Sicherheitsrisiko, bei dem ein Angreifer potenziell ein schadhaftes Schema in den Suchpfad einschleusen koennte, um die Funktionslogik zu manipulieren. Der Supabase Security Advisor meldet dies als Warnung fuer alle 6 Funktionen.

## User Stories
- Als Betreiber moechte ich, dass alle Datenbankfunktionen einen festen `search_path` haben, um Schema-Injection-Angriffe zu verhindern.
- Als User moechte ich, dass die Reporting-Funktionen und Laenderfilter weiterhin korrekt funktionieren, nachdem der search_path fixiert wurde.

## Acceptance Criteria
- [ ] Alle 6 RPC-Funktionen haben `search_path = public` explizit gesetzt
- [ ] `get_distinct_countries` funktioniert weiterhin korrekt (Laenderfilter auf Hauptseite)
- [ ] `get_category_distributions` funktioniert weiterhin korrekt (Reporting)
- [ ] `get_category_funding_timeline` funktioniert weiterhin korrekt (Reporting)
- [ ] `get_category_stats` funktioniert weiterhin korrekt (Reporting)
- [ ] `get_top_keywords` funktioniert weiterhin korrekt (Reporting)
- [ ] `handle_new_user_role` funktioniert weiterhin korrekt (User-Registrierung Trigger)
- [ ] Der Supabase Security Advisor zeigt nach dem Fix keine Warnung mehr zu "mutable search_path"

## Edge Cases
- Funktionen, die auf Tabellen in anderen Schemas zugreifen (z.B. `auth.users` in `handle_new_user_role`) -- muessen mit vollqualifizierten Tabellennamen arbeiten
- Neue RPC-Funktionen, die in Zukunft erstellt werden -- sollen von Anfang an `search_path = public` haben (als Konvention dokumentieren)

## Testbare Szenarien
1. Reporting-Seite laden -- alle Charts und KPIs zeigen korrekte Daten
2. Laenderfilter oeffnen -- zeigt korrekte Liste aller Laender
3. Neuen User registrieren -- Rolle wird korrekt in `user_roles` eingetragen
4. Supabase Security Advisor pruefen -- keine "mutable search_path" Warnungen mehr

## Tech Design (Solution Architect)

### Betroffene Dateien
- Keine Code-Dateien -- reine Datenbank-Migration

### Konkrete Aenderungen

**1. Alle 6 RPC-Funktionen mit festem `search_path` neu erstellen**
- `get_distinct_countries` -- `SET search_path = public`
- `get_category_distributions` -- `SET search_path = public`
- `get_category_funding_timeline` -- `SET search_path = public`
- `get_category_stats` -- `SET search_path = public`
- `get_top_keywords` -- `SET search_path = public`
- `handle_new_user_role` -- `SET search_path = public` (Achtung: Diese Funktion greift auf `auth.users` zu, daher muessen Tabellennamen in dieser Funktion vollqualifiziert bleiben)

Jede Funktion wird per `ALTER FUNCTION ... SET search_path = public` geaendert.

### SQL Migrations
Eine Migration noetig:
- Name: `fix_rpc_search_path_security`
- Inhalt: 6x `ALTER FUNCTION ... SET search_path = public`

### Dependencies
Keine.

### Tech-Entscheidung
`ALTER FUNCTION` statt `CREATE OR REPLACE`, weil wir nur den `search_path` aendern und nicht die Funktionslogik. Das ist sicherer und einfacher.

### Testhinweise
- Reporting-Seite laden -- alle Charts und KPIs muessen korrekte Daten zeigen
- Laenderfilter auf Hauptseite -- korrekte Laenderliste
- Neuen User registrieren -- Rolle wird korrekt in `user_roles` eingetragen
- Supabase Security Advisor pruefen -- keine "mutable search_path" Warnungen mehr
