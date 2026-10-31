# Audit linguistique des cours (COURSE_LANGUAGE_AUDIT)

Établi le 31 octobre 2026.

## Règle retenue

Consigne : « français sauf quand il faut que ce soit une autre langue ».

- **Interface** (navigation, boutons, messages) : français.
- **Contenu pédagogique** (fiches, explications, QCM, corrections, flashcards, exercices, sujets) : langue d'enseignement de la matière.
  - Matières enseignées en anglais : tout en anglais.
  - Matières enseignées en espagnol : tout en espagnol.
  - Matières de traduction (thème / version) : consignes et corrections en français ; textes sources et cibles dans les deux langues, par nature.
  - Toutes les autres matières : français (les termes techniques anglais ou espagnols restent cités dans la terminologie trilingue).

## Méthode de mesure

Pour chaque matière, comptage des mots-outils propres à chaque langue (articles, prépositions, pronoms) dans les titres, questions, définitions et explications des fiches, puis dans les énoncés, choix et explications des QCM. Les pourcentages indiquent la part de chaque langue parmi ces mots-outils. Une part d'environ 5 à 10 % d'« espagnol » dans un texte français est un bruit de mesure (mots communs comme « en », « que », « se »).

## Résultat par matière

| Code | Matière | Langue cible | Fiches FR / EN / ES | QCM FR / EN / ES | Conforme |
|---|---|---|---|---|---|
| tci | Techniques du commerce international | français | 91 / 1 / 8 | 91 / 0 / 8 | Oui |
| ici | Introduction au commerce international | français | 92 / 1 / 7 | 93 / 1 / 6 | Oui |
| dai | Droit des affaires internationales | français | 92 / 1 / 8 | 95 / 0 / 5 | Oui |
| dcl | Droit des contrats de la Common law | français | 84 / 6 / 9 | 89 / 3 / 8 | Oui |
| cpt | Comptabilité générale | français | 91 / 2 / 7 | 91 / 3 / 6 | Oui |
| gfi | Gestion financière | français | 90 / 2 / 8 | 93 / 1 / 6 | Oui |
| odg | Outils de gestion | français | 92 / 1 / 7 | 91 / 4 / 5 | Oui |
| mgi | Management interculturel | français | 90 / 5 / 5 | 94 / 2 / 4 | Oui |
| gdp | Gestion de projet | français | 89 / 3 / 8 | 93 / 1 / 6 | Oui |
| red | Rédaction de documents universitaires | français | 89 / 0 / 11 | 93 / 0 / 7 | Oui |
| aec | Anglais économique et commercial | anglais | 69 / 20 / 11 | 58 / 34 / 8 | **Non** |
| tra | Traduction anglaise : thème et version | français + anglais (traduction) | 71 / 18 / 11 | 70 / 26 / 4 | Oui (consignes en français ; à relire) |
| cea | Compréhension et expression anglaises | anglais | 68 / 17 / 15 | 84 / 12 / 4 | **Non** |
| eec | Espagnol économique et commercial | espagnol | 75 / 1 / 24 | 76 / 2 / 23 | **Non** |
| tve | Thème et version espagnols | français + espagnol (traduction) | 65 / 3 / 31 | 49 / 4 / 47 | Oui (consignes en français ; à relire) |
| cvb | Civilisation britannique : the UK since 1945 | anglais | 89 / 2 / 9 | 92 / 1 / 7 | **Non** |
| cve | Civilisation espagnole | espagnol | 88 / 0 / 11 | 84 / 0 / 16 | **Non** |
| cva | Civilisation américaine : publicité et marketing | anglais | 84 / 6 / 10 | 91 / 4 / 6 | **Non** |
| cvl | Civilisation latino-américaine | espagnol | 89 / 1 / 10 | 87 / 3 / 10 | **Non** |
| stg | Stage et rapport de stage | français | 88 / 1 / 11 | 93 / 0 / 7 | Oui |
| eco | Économie internationale | français | 89 / 2 / 9 | 89 / 0 / 11 | Oui |
| mks | Marketing international et supply chain | français | 87 / 2 / 12 | 92 / 3 / 5 | Oui |

## Écarts

**7 matières ne respectent pas la règle** : leur contenu est rédigé en français alors qu'il doit l'être en anglais (aec, cea, cvb, cva) ou en espagnol (eec, cve, cvl). Ce contenu n'est pas un support original de l'université : il a été rédigé pour cette application à partir des descriptifs officiels. Sa réécriture dans la langue cible n'est donc pas la traduction d'un cours original ; elle fait l'objet d'une phase de contenu dédiée (voir REFACTOR_PLAN.md), menée en conservant tous les identifiants.

Points à confirmer :

- **dcl** (Droit des contrats de la Common law) : classé en français (EC rattachée au bloc gestion, enseignante Isabelle Noël, bibliographie en partie française). À confirmer si le cours est donné en anglais.
- **cvb** et **cva** : classées en anglais, **cve** et **cvl** en espagnol, selon l'usage des civilisations en LEA. À confirmer par les supports de cours si disponibles.
- **tra** et **tve** : les fiches de méthode restent en français ; les exemples sont bilingues.

## Correspondance avec les intitulés du cahier des charges

| Intitulé du cahier des charges | Élément existant |
|---|---|
| English Economic and Commercial Studies | matière aec |
| English Translation | matière tra |
| English Grammar | chapitre aec.grammaire |
| English Business Communication | chapitre aec.correspondance |
| English Vocabulary | chapitre aec.lexique |
| Traducción espagnole / Thème espagnol | matière tve |
| Grammaire espagnole | chapitre tve.contrastes |
| Civilisation espagnole | matière cve |
| Vocabulario comercial | chapitre eec.lexico |

## Contrôle prévu

Un champ `langue` sera ajouté à chaque matière (héritage par les chapitres et les contenus). Un test de construction mesurera la langue dominante de chaque fichier de chapitre et échouera si elle ne correspond pas à la langue déclarée (hors matières de traduction).
