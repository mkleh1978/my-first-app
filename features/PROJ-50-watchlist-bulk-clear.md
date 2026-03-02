# PROJ-50: Watchlist Bulk Clear & Selective Remove

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: PROJ-18 (Watchlist & Favorites) — bestehende Watchlist-Infrastruktur

## User Stories
- Als User möchte ich alle Favoriten auf einmal entfernen können, um meine Watchlist schnell zurückzusetzen
- Als User möchte ich einzelne Einträge per Checkbox auswählen und selektiv entfernen können, um gezielt aufzuräumen
- Als User möchte ich alle Einträge auf einmal auswählen können ("Select All"), um die Bulk-Auswahl zu beschleunigen
- Als User möchte ich vor dem endgültigen Löschen eine Bestätigung sehen, um versehentliches Entfernen zu verhindern

## Acceptance Criteria
- [ ] "Clear All" Button ist sichtbar auf der Watchlist-Seite (nur wenn Einträge vorhanden)
- [ ] "Clear All" öffnet einen Bestätigungsdialog ("Alle X Favoriten entfernen?")
- [ ] Nach Bestätigung werden alle Watchlist-Einträge des Users aus Supabase gelöscht
- [ ] Jede Tabellenzeile hat eine Checkbox zur Selektion
- [ ] "Select All" Checkbox im Tabellen-Header selektiert/deselektiert alle Einträge
- [ ] "Remove Selected (X)" Button erscheint wenn mindestens 1 Eintrag selektiert ist
- [ ] "Remove Selected" öffnet Bestätigungsdialog ("X Favoriten entfernen?")
- [ ] Nach Bulk-Remove wird der FavoritesContext (favoriteIds Set) korrekt aktualisiert
- [ ] UI-Feedback: Tabelle aktualisiert sich sofort nach Entfernen (optimistic update)
- [ ] Leerer Zustand wird korrekt angezeigt, wenn alle Einträge entfernt wurden

## Edge Cases
- User klickt "Clear All" bei nur 1 Eintrag — funktioniert trotzdem
- Netzwerkfehler beim Löschen — Fehlermeldung anzeigen, Einträge bleiben erhalten
- User selektiert Einträge, dann navigiert weg — Selektion wird zurückgesetzt
- Gleichzeitiges Entfernen über StarButton und Bulk-Remove — kein Duplikat-Fehler
- Leere Watchlist — "Clear All" und Checkboxen sind nicht sichtbar
