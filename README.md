# Cours L3 LEA — Commerce international

Environnement d'apprentissage pour la L3 LEA anglais-espagnol, parcours Commerce international (programme de l'Université d'Orléans). Il propose des fiches par notion, des QCM corrigés, des flashcards ouvertes avec répétition espacée, des exercices corrigés pas à pas, un mode examen et un suivi de la maîtrise.

Site : https://fc45mariko-byte.github.io/cours/ (GitHub Pages, publié depuis la racine de la branche).

## Organisation

| Dossier | Contenu |
|---|---|
| `content/` | **Données pédagogiques** (JSON) : `catalogue.json` (matières, chapitres, notions), `sources.json`, un fichier par chapitre rédigé (`content/<matière>/<chapitre>.json`) |
| `app/src/core/` | Logique testée : correction, maîtrise, répétition espacée, recherche, sauvegarde |
| `app/src/pages`, `app/src/ui` | Interface (Preact) |
| `app/src/styles/tokens.css` | **Système de design** : couleurs, typographie, espacements. Changer le design = modifier ce fichier |
| `scripts/build-index.mjs` | Valide tout le contenu et génère l'index |
| `tests/` | Tests unitaires (Vitest) et de bout en bout (Playwright) |
| `docs/refonte/` | Audit, recherche, cartographie, spécification, bilan |
| `archive/ancien-site/` | Ancien site, conservé tel quel |
| `index.html`, `assets/` | Site construit, publié par GitHub Pages (ne pas modifier à la main) |

## Commandes

```bash
npm install
npm run dev        # serveur de développement
npm run check      # validation du contenu, types, tests unitaires
npm run build      # construit et publie le site à la racine (à committer)
npm run test:e2e   # tests de bout en bout (après npm run build)
```

## Ajouter du contenu

1. Vérifier que la notion figure dans `content/catalogue.json` (identifiant stable `matière.chapitre.notion`).
2. L'écrire dans `content/<matière>/<chapitre>.json` : notions, questions, flashcards, exercices. Les formats sont décrits dans `docs/refonte/phase-4-specification.md` et dans `app/src/types.ts`.
3. Lancer `npm run check`. Le validateur refuse notamment : une question sans bonne réponse ou sans explication par choix, une écriture comptable déséquilibrée, un lien vers une notion inexistante, un exemple réel sans source.
