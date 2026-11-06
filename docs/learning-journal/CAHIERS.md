# Cahiers d'exercices imprimables

Un cahier par matière (22), dans `content/cahiers/<matière>.json` ; format et règles dans `scripts/cahiers.mjs`.

- **Pédagogie** : une partie par chapitre du cours ; chaque partie commence par « À retenir » (rappel des bases), puis 2 ou 3 exercices progressifs : *bases* (comprendre la notion), *application* (cas concret, calcul, document, rédaction), parfois *pour aller plus loin*. Chaque exercice donne son objectif, une méthode guidée pas à pas, les questions et des lignes pour répondre sur papier. Les corrigés, en fin de cahier, expliquent chaque étape et signalent les pièges.
- **Langue** : celle de la matière (anglais pour aec, cea, cvb, cva ; espagnol pour eec, cve, cvl ; français ailleurs ; consignes en français pour les matières de traduction).
- **Fidélité** : les exercices s'appuient sur les fiches du cours ; les situations inventées sont signalées « fictives ». Tous les calculs ont été refaits et contrôlés.
- **Impression** : page `#/cahier/<matière>` (bouton Imprimer, avec ou sans corrigés) ; PDF A4 prêts à imprimer dans `imprimables/<matière>.pdf`, régénérés par `npm run build && npm run imprimables`.
- **Ordre** : la liste `#/cahiers` place d'abord les matières de l'emploi du temps du S5.
- **Contrôles** : `node scripts/build-index.mjs` (structure, chapitres et notions existants, au moins 3 exercices « bases » et 3 « application ») et `tests/unit/cahiers.test.ts` (chaque matière a son cahier, qui couvre tous ses chapitres, et son PDF).

La matière « Introduction au tourisme international » (à l'emploi du temps) n'a pas encore de cahier : son cours n'est pas disponible.
