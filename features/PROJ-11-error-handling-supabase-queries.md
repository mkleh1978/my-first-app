# PROJ-11: Error-Handling für Supabase-Queries

**Status:** Planned
**Created:** 2026-02-13
**Last Updated:** 2026-02-13
**Revision:** v1.0
**Origin:** BUG-1 aus PROJ-1 QA-Report

---

## Abhängigkeiten

- PROJ-1 (Basis-Feature muss implementiert sein)

---

## Hintergrund

Beim QA-Test von PROJ-1 wurde festgestellt, dass `fetchCompanies` in `page.tsx` (Zeile 70–127) den `error`-Wert aus der Supabase-Response nicht prüft. Bei Netzwerkfehler oder Supabase-Ausfall zeigt die App "No companies found" statt einer aussagekräftigen Fehlermeldung. Dies ist ein UX-Problem, kein Datenverlust-Risiko.

---

## User Stories

**US-1:** Als Nutzer möchte ich bei einem Verbindungsfehler eine verständliche Fehlermeldung sehen (statt "No companies found"), damit ich weiß, dass ein technisches Problem vorliegt und ich es erneut versuchen kann.

**US-2:** Als Nutzer möchte ich die Möglichkeit haben, die Daten bei einem Fehler erneut zu laden, ohne die Seite manuell neu laden zu müssen.

---

## Acceptance Criteria

### Error-Handling

- [ ] AC-1: Wenn `fetchCompanies` einen Supabase-Error zurückgibt (`error` !== null), wird eine Fehlermeldung angezeigt statt "No companies found"
- [ ] AC-2: Die Fehlermeldung lautet sinngemäß: "Verbindung fehlgeschlagen. Bitte versuche es erneut." (oder englisch: "Failed to load companies. Please try again.")
- [ ] AC-3: Bei einem Fehler wird ein "Retry"-Button angezeigt, der `fetchCompanies` erneut aufruft
- [ ] AC-4: Der Loading-State wird bei einem Fehler korrekt auf `false` gesetzt (kein ewiger Spinner)
- [ ] AC-5: Wenn nach einem Fehler ein erneuter Versuch erfolgreich ist, wird die Fehlermeldung entfernt und die Daten normal angezeigt

### Visuelles Feedback

- [ ] AC-6: Die Fehlermeldung wird visuell vom "No companies found"-Zustand unterschieden (z.B. durch ein Warn-Icon oder rote Farbe)
- [ ] AC-7: Der "Retry"-Button folgt dem bestehenden Button-Styling der App

### Bestehende Funktionalität

- [ ] AC-8: Bei erfolgreicher Abfrage (kein Error) ändert sich nichts am bisherigen Verhalten
- [ ] AC-9: "No companies found" wird weiterhin korrekt angezeigt, wenn die Abfrage erfolgreich ist, aber 0 Ergebnisse liefert

---

## Edge Cases

1. **Intermittierender Fehler:** Erster Versuch schlägt fehl, Retry ist erfolgreich → Daten werden normal angezeigt
2. **Dauerhafter Ausfall:** Mehrere Retries schlagen fehl → Fehlermeldung bleibt, Retry-Button bleibt verfügbar
3. **Fehler während Pagination:** User ist auf Seite 3, Netzwerk bricht ab → Fehlermeldung auf Seite 3, bestehende Daten werden ersetzt
4. **Fehler bei initialem Laden:** Erste Abfrage beim App-Start schlägt fehl → Fehlermeldung statt Loading-Spinner
5. **Fehler bei Country-/Count-Queries:** `loadCountries` und `loadTotalCount` haben ebenfalls kein Error-Handling

---

## Technische Anforderungen

### Betroffene Dateien

```
src/app/page.tsx
├── fetchCompanies: error-Check nach Supabase-Query
├── Neuer State: error (string | null)
├── loadCountries: optionaler error-Check
└── loadTotalCount: optionaler error-Check

src/components/CompanyTable.tsx
├── Neue Prop: error (string | null)
├── Neuer Prop: onRetry (() => void)
└── Error-State-Rendering (Warn-Icon + Fehlermeldung + Retry-Button)
```

### Datenquelle
- Gleiche Supabase-Tabelle wie PROJ-1: `FinWell_data`
- Kein neues Backend/API nötig

---

## Tech-Design (Solution Architect)

**Erstellt:** 2026-02-13
**Autor:** Solution Architect Agent

---

### A) Bestandsaufnahme -- Was existiert? Was fehlt?

| # | Aspekt                              | Status | Beschreibung                                                                                         |
|---|-------------------------------------|--------|------------------------------------------------------------------------------------------------------|
| 1 | Supabase-Query in `fetchCompanies`  | vorhanden  | Query wird gebaut, Daten werden geladen -- funktioniert im Normalfall einwandfrei.                   |
| 2 | Error-Auswertung in `fetchCompanies`| fehlt  | Die Supabase-Response liefert ein `error`-Feld. Dieses wird aktuell **komplett ignoriert**.          |
| 3 | Error-Auswertung in `loadCountries` | fehlt  | Gleiche Situation: `error` wird nicht geprüft.                                                       |
| 4 | Error-Auswertung in `loadTotalCount`| fehlt  | Gleiche Situation: `error` wird nicht geprüft.                                                       |
| 5 | Error-State in `page.tsx`           | fehlt  | Es gibt keinen `error`-State. Wenn ein Fehler auftritt, zeigt die App "No companies found".         |
| 6 | Error-Darstellung in CompanyTable   | fehlt  | Die Komponente kennt nur 3 Zustände: Loading, Leere Liste, Daten. Ein Error-Zustand fehlt komplett. |
| 7 | Retry-Mechanismus                   | fehlt  | Es gibt keinen Button oder Funktion, um bei Fehler die Daten erneut zu laden.                       |
| 8 | Loading-State (`setLoading`)        | vorhanden  | Wird korrekt auf `true`/`false` gesetzt -- muss nur um den Error-Fall erweitert werden.             |
| 9 | "No companies found"-Anzeige        | vorhanden  | Funktioniert korrekt, muss aber vom neuen Error-Zustand abgegrenzt werden.                          |

**Zusammenfassung:** Die Datenabfrage funktioniert, aber es gibt keinerlei Fehlerbehandlung. Bei Netzwerkausfall oder Supabase-Problemen sieht der Nutzer eine irreführende "Keine Ergebnisse"-Meldung statt eines hilfreichen Fehlerhinweises.

---

### B) Component-Struktur -- Was ändert sich?

Aktueller Zustand (vereinfacht):

```
page.tsx (Home)
|
|-- State: companies, loading, countries, totalCount, ...
|
|-- fetchCompanies()  -->  Supabase Query  -->  setzt companies + loading
|
+-- <CompanyTable>
     |-- Props: companies, loading, sort, ...
     |-- Anzeige: Loading-Spinner ODER "No companies" ODER Tabelle
```

Neuer Zustand nach PROJ-11:

```
page.tsx (Home)
|
|-- State: companies, loading, countries, totalCount, ...
|-- State: error  (NEU -- string oder null)
|
|-- fetchCompanies()  -->  Supabase Query
|   |-- Erfolg?  -->  setzt companies + loading + error=null
|   +-- Fehler?  -->  setzt error="Fehlermeldung" + loading=false  (NEU)
|
|-- handleRetry()  (NEU -- ruft fetchCompanies erneut auf)
|
+-- <CompanyTable>
     |-- Props: companies, loading, sort, ...
     |-- Props: error, onRetry  (NEU)
     |
     |-- Anzeige-Logik (4 Zustände statt 3):
     |   1. loading=true           -->  Loading-Spinner (wie bisher)
     |   2. error vorhanden        -->  Error-Anzeige + Retry-Button  (NEU)
     |   3. companies leer         -->  "No companies found" (wie bisher)
     |   4. companies vorhanden    -->  Tabelle (wie bisher)
```

**Wichtig:** Es wird KEINE neue Komponente erstellt. Die bestehenden zwei Dateien (`page.tsx` und `CompanyTable.tsx`) werden erweitert.

---

### C) Daten-Fluss -- Wie fließt der Error-State?

```
[Supabase-Datenbank]
       |
       | (Netzwerk-Anfrage)
       v
[fetchCompanies() in page.tsx]
       |
       |-- Prüfung: Hat die Response ein "error"-Feld?
       |
       |-- JA (Fehler):
       |   |-- error-State = "Failed to load companies. Please try again."
       |   |-- loading-State = false
       |   +-- companies-State = [] (leere Liste)
       |
       |-- NEIN (Erfolg):
       |   |-- error-State = null (kein Fehler)
       |   |-- loading-State = false
       |   +-- companies-State = [Daten aus Supabase]
       |
       v
[page.tsx übergibt Props an CompanyTable]
       |
       |-- error="Failed to load..."  +  onRetry=handleRetry
       |           ODER
       |-- error=null                  +  onRetry=handleRetry
       |
       v
[CompanyTable entscheidet, was angezeigt wird]
       |
       |-- error vorhanden?  -->  Zeige Warn-Icon + Fehlermeldung + Retry-Button
       |-- error=null?        -->  Zeige Tabelle oder "No companies" (wie bisher)
```

**Retry-Ablauf (wenn Nutzer "Retry" klickt):**

```
[Nutzer klickt "Retry"-Button]
       |
       v
[onRetry() in CompanyTable]  -->  ruft handleRetry() in page.tsx auf
       |
       v
[handleRetry() ruft fetchCompanies() erneut auf]
       |
       |-- loading = true  (Spinner wird kurz angezeigt)
       |
       v
[Supabase antwortet]
       |
       |-- Erfolg?  -->  error = null, Daten werden angezeigt
       +-- Fehler?  -->  error bleibt, Retry-Button bleibt verfügbar
```

---

### D) Error-State Darstellung -- Visuelles Konzept

Die Fehlermeldung ersetzt den Tabellenbereich (gleiche Position wie "No companies found") und sieht so aus:

```
+------------------------------------------------------------------+
|                                                                  |
|                    /!\  (Warn-Dreieck-Icon)                      |
|                                                                  |
|           Failed to load companies.                              |
|           Please try again.                                      |
|                                                                  |
|                  [ Retry ]  (Button)                              |
|                                                                  |
+------------------------------------------------------------------+
```

**Visuelle Details:**
- **Warn-Icon:** Dreieck mit Ausrufezeichen, in Orange/Amber-Ton (hebt sich klar von "No companies found" ab -- AC-6)
- **Fehlermeldung:** Zweizeilig, Haupttext fett, Untertext normal -- klar und verständlich (AC-2)
- **Retry-Button:** Folgt dem bestehenden Button-Styling der App (abgerundete Ecken, Border, Hover-Effekt -- AC-7)
- **Positionierung:** Zentriert im Tabellenbereich, gleicher vertikaler Abstand wie der Loading-Spinner

**Abgrenzung zum "No companies found"-Zustand:**

| Aspekt       | "No companies found"          | Error-Zustand                   |
|------------- |-------------------------------|----------------------------------|
| Icon         | Trauriges Gesicht (grau)      | Warn-Dreieck (amber/orange)      |
| Haupttext    | "No companies found"          | "Failed to load companies."      |
| Untertext    | "Try adjusting your filters"  | "Please try again."              |
| Aktion       | Kein Button                   | "Retry"-Button                   |
| Farbgebung   | Gedämpft, grau                | Warm-warnend, amber/orange       |

---

### E) Tech-Entscheidungen -- Warum diese Lösung?

**Entscheidung 1: Error-State in page.tsx statt in CompanyTable**
- *Warum:* page.tsx ist die "Zentrale", die die Daten lädt. Fehler entstehen dort. Die CompanyTable zeigt nur an, was sie gesagt bekommt. Das hält die Verantwortlichkeiten sauber getrennt.
- *PM-Sprache:* "Die Daten-Logik bleibt an einem Ort. Die Anzeige-Komponente bekommt nur gesagt: 'Zeig einen Fehler' oder 'Zeig die Daten'."

**Entscheidung 2: Manueller Retry statt automatischem Retry**
- *Warum:* Automatisches Retry (z.B. 3x versuchen mit Wartezeit) wäre technisch möglich, aber: (a) es verzögert die Fehlermeldung, (b) es erhöht die Komplexität, (c) die Feature Spec grenzt es explizit als Out-of-Scope ab.
- *PM-Sprache:* "Der Nutzer entscheidet selbst, wann er es erneut versucht. Kein stilles Warten im Hintergrund."

**Entscheidung 3: Ein einziger error-State für alle drei Queries**
- *Warum:* `fetchCompanies` ist die Haupt-Query und der kritischste Fehlerpunkt. `loadCountries` und `loadTotalCount` sind weniger kritisch (die App funktioniert auch ohne korrekte Länderliste oder Gesamtzahl). Ein einziger Error-State hält die Lösung einfach. Bei den Neben-Queries wird der Fehler geloggt, aber nicht dem Nutzer angezeigt (optional, aber empfohlen).
- *PM-Sprache:* "Wir fokussieren das Fehler-Feedback auf den wichtigsten Datenladevorgang. Nebeninfos (Länderliste, Gesamtzahl) scheitern leise, ohne den Nutzer zu stören."

**Entscheidung 4: Keine neue Komponente, nur Erweiterung bestehender Dateien**
- *Warum:* Der Error-Zustand ist ein zusätzlicher Anzeigefall innerhalb der CompanyTable (wie Loading und "No companies"). Eine eigene Error-Komponente wäre Over-Engineering für diesen Umfang.
- *PM-Sprache:* "Wir bauen kein neues Bauteil, sondern erweitern das bestehende um einen weiteren Zustand."

---

### F) Aufwand-Einschätzung

**Betroffene Dateien:**

| # | Datei                               | Art der Änderung                                           | Umfang  |
|---|-------------------------------------|------------------------------------------------------------|---------|
| 1 | `src/app/page.tsx`                  | Neuer State `error`, Error-Check in `fetchCompanies`, `handleRetry`-Funktion, Props-Übergabe an CompanyTable | Mittel  |
| 2 | `src/components/CompanyTable.tsx`    | Neue Props (`error`, `onRetry`), neuer Error-Anzeigeblock zwischen Loading und "No companies" | Mittel  |

**Gesamtumfang:** 2 Dateien werden geändert, 0 neue Dateien werden erstellt.

**Aufwand-Schätzung:**
- Implementierung: ca. 1-2 Stunden (klein)
- Testing: ca. 30 Minuten (manuell -- Supabase-Fehler simulieren, Retry testen)
- Gesamtaufwand: **unter einem halben Tag**

**Risiko:** Gering. Keine Datenbankänderungen, kein neues Backend, keine neuen Abhängigkeiten. Bestehende Funktionalität wird nicht verändert, nur erweitert.

---

## Abgrenzung (Out of Scope)

- Offline-Modus / Service Worker Caching
- Automatisches Retry (z.B. exponential backoff) — nur manueller Retry-Button
- Toast-Notifications bei Fehlern
- Logging/Monitoring von Fehlern an einen externen Service

---

## QA Test Results

**Tested by:** QA Engineer Agent
**Date:** 2026-02-13
**Method:** Code Review + Build Verification
**Files reviewed:** `src/app/page.tsx`, `src/components/CompanyTable.tsx`, `src/types/fintech.ts`

---

### Acceptance Criteria Status

#### Error-Handling

- [x] **AC-1: PASS** — `fetchCompanies` in `page.tsx` (Zeile 121–128) destrukturiert `error: queryError` aus der Supabase-Response und prüft `if (queryError)`. Bei Error wird `setError(...)` gesetzt und `setCompanies([])` geleert. In `CompanyTable.tsx` (Zeile 151–177) wird der Error-Zustand vor dem "No companies found"-Check gerendert, sodass die Fehlermeldung korrekt anstelle von "No companies found" erscheint.
- [x] **AC-2: PASS** — Die Fehlermeldung wird in `page.tsx` Zeile 124 gesetzt: `"Failed to load companies. Please try again."`. In `CompanyTable.tsx` wird dies zweizeilig dargestellt: `"Failed to load companies."` (Zeile 167, fett) + `"Please try again."` (Zeile 168, dezent).
- [x] **AC-3: PASS** — Ein "Retry"-Button wird im Error-Block angezeigt (`CompanyTable.tsx` Zeile 169–174) mit `onClick={onRetry}`. Die `onRetry`-Prop wird in `page.tsx` (Zeile 253) als `handleRetry` übergeben, welches `fetchCompanies(filters, page, sort)` aufruft (Zeile 138–140).
- [x] **AC-4: PASS** — Im Error-Branch von `fetchCompanies` (Zeile 126) wird `setLoading(false)` explizit aufgerufen. Kein ewiger Spinner möglich.
- [x] **AC-5: PASS** — Im Success-Branch von `fetchCompanies` (Zeile 130) wird `setError(null)` gesetzt. Nach einem erfolgreichen Retry verschwindet die Fehlermeldung und die Daten werden normal angezeigt.

#### Visuelles Feedback

- [x] **AC-6: PASS** — Error-Zustand und "No companies found" sind visuell klar unterschieden:
  - **Error:** Amber-farbiges Warn-Dreieck-Icon (`text-amber-500`), Text `"Failed to load companies."`, Retry-Button vorhanden.
  - **No companies:** Graues trauriges-Gesicht-Icon (`opacity-50`, `text-muted`), Text `"No companies found"`, kein Button.
  - Unterschiedliche Icons, Farben, Texte und Aktionen.
- [x] **AC-7: PASS** — Der Retry-Button (`CompanyTable.tsx` Zeile 170–173) verwendet `className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"` — identisches Basis-Styling wie die Pagination-Buttons in `page.tsx` (Zeile 260–263).

#### Bestehende Funktionalität

- [x] **AC-8: PASS** — Bei erfolgreicher Abfrage wird `setError(null)` gesetzt (Zeile 130), wodurch der Error-Block in CompanyTable übersprungen wird. Die bestehende Logik (Loading → "No companies" → Tabelle) bleibt unverändert.
- [x] **AC-9: PASS** — Die Render-Reihenfolge in CompanyTable ist: `loading` (Zeile 122) → `error` (Zeile 151) → `companies.length === 0` (Zeile 179) → Tabelle (Zeile 201). Bei erfolgreicher Abfrage mit 0 Ergebnissen ist `error=null` und `companies=[]`, wodurch korrekt "No companies found" angezeigt wird.

**AC Ergebnis: 9/9 PASS**

---

### Edge Cases Status

| # | Edge Case | Status | Analyse |
|---|-----------|--------|---------|
| 1 | Intermittierender Fehler (Retry erfolgreich) | PASS | `handleRetry` ruft `fetchCompanies` erneut auf. Bei Erfolg: `setError(null)` entfernt Fehlermeldung, `setCompanies(data)` zeigt Daten. |
| 2 | Dauerhafter Ausfall (mehrere Retries) | PASS | Jeder Retry-Klick durchläuft den vollständigen Loading→Error-Zyklus. Fehlermeldung + Retry-Button bleiben nach jedem fehlgeschlagenen Versuch verfügbar. |
| 3 | Fehler während Pagination | PASS | Bei Fehler auf Seite N: `setCompanies([])` ersetzt bestehende Daten, `setError(...)` zeigt Fehlermeldung. Retry lädt dieselbe Seite erneut (page-State bleibt erhalten). |
| 4 | Fehler bei initialem Laden | PASS | `loading` startet als `true` (Zeile 32). Bei Fehler: `setLoading(false)`, `setError(...)`. CompanyTable zeigt Error-Block statt Spinner. |
| 5 | Fehler bei Country-/Count-Queries | PASS (Minor Finding) | `loadCountries` (Zeile 45–56) ignoriert `error`, aber `if (data)` verhindert Crash bei null. `loadTotalCount` (Zeile 58–63) nutzt `count ?? 0`. App crasht nicht. **Minor Finding:** Fehler werden nicht geloggt (kein `console.error`). Die Spec empfiehlt Logging als optional. |

**Edge Cases Ergebnis: 5/5 PASS**

---

### PROJ-1 Backward Compatibility

| Aspekt | Status | Details |
|--------|--------|---------|
| CompanyTable Props | PASS | Alle bisherigen Props (`companies`, `onSelect`, `loading`, `sort`, `onSortChange`) bleiben unverändert im Interface. `error` und `onRetry` sind additive Erweiterungen. |
| Sorting | PASS | `handleSortChange` (page.tsx Zeile 170–190) ist unverändert. 3-Stufen-Toggle, Text/Zahlen-Unterscheidung, Server-Side-Sorting intakt. |
| Filtering | PASS | `FilterPanel` (Zeile 237–243) wird mit identischen Props aufgerufen. Debounce-Mechanismus (Zeile 143–157) unverändert. |
| Pagination | PASS | Pagination-Controls (Zeile 257–279) und Page-Change-Effect (Zeile 160–165) unverändert. |
| Detail Modal | PASS | `CompanyDetailModal` (Zeile 284–289) und Escape-Handler (Zeile 193–199) unverändert. |
| Build | PASS | `npm run build` (Next.js 16.1.6 Turbopack) kompiliert erfolgreich ohne Fehler oder Warnungen. |

---

### Bugs Found

**Keine Bugs gefunden.**

### Minor Findings (nicht blockierend)

1. **Fehlendes Console-Logging bei Neben-Queries:** `loadCountries` und `loadTotalCount` loggen Fehler nicht mit `console.error`. Die Feature Spec empfiehlt dies als optional ("optional, aber empfohlen"). Empfehlung: In einem zukünftigen Ticket `console.error(error)` ergänzen für bessere Debugging-Möglichkeiten.

---

### Summary

PROJ-11 ist **vollständig und korrekt implementiert**. Alle 9 Acceptance Criteria sind erfüllt. Alle 5 Edge Cases werden korrekt behandelt. Die bestehende PROJ-1 Funktionalität (Sorting, Filtering, Pagination, Modal) ist nicht beeinträchtigt. Der Build läuft fehlerfrei durch.

Die Implementierung folgt exakt dem Tech-Design: Error-State in `page.tsx`, Error-Darstellung in `CompanyTable.tsx`, manueller Retry via `handleRetry`, visuelle Abgrenzung durch Amber-Warn-Icon vs. Grau-Trauriges-Gesicht-Icon. Die Render-Reihenfolge (Loading → Error → Empty → Table) ist logisch korrekt.

### Recommendation

**APPROVE** — Feature ist bereit für Merge/Deployment. Keine Blocker, keine Bugs. Der einzige Minor Finding (fehlendes Console-Logging in Neben-Queries) ist nicht blockierend und kann in einem separaten Ticket adressiert werden.

---
