# Phase 1 — Audit du site et du dépôt `cours`

Date de l'audit : 15 octobre 2026
Périmètre : dépôt `fc45mariko-byte/cours`, branche `claude/commit-ewmdsd` (commit `c0e30be`), seule branche du dépôt.
Méthode : lecture intégrale des 21 fichiers HTML (texte extrait, environ 90 000 mots), inspection du CSS et du JS, comptage des composants, vérification ponctuelle des faits que je pouvais contrôler sans recherche documentaire.

> **Limite de cet audit.** La phase 1 ne contient pas encore la recherche académique (phase 2). Les lacunes listées en section 6 sont donc **provisoires** : elles comparent le site à ce qu'on attend en général d'une L3 LEA Commerce international. Elles ne le comparent pas encore à la maquette d'Orléans, que je n'ai pas consultée. Les erreurs de la section 5 viennent de mes connaissances. Celles marquées « à vérifier » seront confirmées sur source en phase 2.

---

## 1. Synthèse

| Constat | Détail |
|---|---|
| Nature du site | 21 pages HTML statiques, sans build ni données structurées : 1 index, 1 « Master Plan », 19 fiches de matière |
| Volume | Environ 4 000 à 5 500 mots par fiche, 90 000 mots au total |
| Granularité | **Une fiche par matière** (19). Chaque fiche regroupe 5 à 8 chapitres en 3 ou 4 blocs « 篇 ». Aucune notion n'a sa propre unité d'apprentissage |
| Format pédagogique | Récit argumenté : problème, « origine de la règle », mécanisme, exemple, erreurs classiques, dilemme, encadré « CEO », encadré « HelixOps » |
| Activités | **Aucun QCM, aucun exercice corrigé, aucune flashcard, aucun calcul guidé.** Les 59 « dilemmes » sont des questions ouvertes de jugement sans correction notée |
| Suivi | Aucune progression, aucune sauvegarde, aucune recherche, aucun filtre, aucun glossaire |
| Hélix Ops | 60 encadrés « HelixOps » (3 ou 4 par fiche) et une mention dans `index.html`. Ils n'ont pas de logique applicative : c'est du contenu spéculatif sur l'IA, à supprimer |
| Qualité factuelle | Globalement soignée et prudente (beaucoup de « points d'exactitude »). J'ai relevé **24 erreurs ou imprécisions**, dont 10 certaines (section 5) |
| Couverture | Le récit couvre bien l'architecture des matières. Les savoir-faire évalués en L3 n'y sont pas : écritures comptables, calculs financiers, Incoterms règle par règle, documents de transport, exercices de langue |
| Architecture technique | Contenu, style et logique mélangés dans chaque fichier. Environ 13 à 14 Ko de CSS dupliqué par fiche. Couleurs codées en dur. Pas de jetons de design |
| Déploiement | **Non vérifié** : `fc45mariko-byte.github.io` n'est pas résolu depuis l'environnement d'exécution (politique réseau). À confirmer de votre côté |

**Conclusion.** Le contenu actuel est une **base de connaissances narrative réutilisable en partie**. Il ne constitue pas un environnement d'apprentissage. L'architecture technique ne convient pas au cahier des charges : identifiants stables, QCM, répétition espacée, progression, design interchangeable. Je recommande une **reconstruction de l'application**, avec **récupération sélective du contenu** dans un format structuré.

---

## 2. Inventaire technique

### 2.1 Fichiers

| Fichier | Rôle | Taille |
|---|---|---|
| `index.html` | Grille des 19 matières (cartes colorées) | 11 Ko |
| `style.css` | Feuille de style, **utilisée uniquement par `index.html`** | 12 Ko |
| `00-master-plan.html` | Cartographie : chapitres, dépendances, « concepts-colonnes », classification Système/Automatisme | 100 Ko |
| `01` à `19-*.html` | Une fiche par matière, CSS et JS embarqués | 60 à 75 Ko chacun |
| `README.md` | 4 lignes, décrit l'ancien système | — |

Historique : 15 commits, tous datés du 9 août 2026 au plus tôt, tous générés. Le dépôt ne contient ni `package.json`, ni tests, ni CI, ni workflow GitHub Pages.

### 2.2 Technologies et dépendances

- HTML et CSS écrits à la main, sans framework.
- **anime.js 3.2.1** (CDN jsdelivr), uniquement pour une animation d'entrée en fondu. Le contenu reste visible sans JS. **Pas de gestion de `prefers-reduced-motion`.**
- **Google Fonts** : Cormorant Garamond, Josefin Sans, Spectral.
- 256 SVG en ligne (schémas, chronologies, Gantt, pendule, cascades).
- 49 tableaux HTML, dont certains dans des conteneurs à défilement horizontal pour le mobile.
- Interaction : `<details>/<summary>` pour révéler l'analyse des dilemmes. C'est la seule interaction du site.

### 2.3 Architecture

- **Couplage total** entre contenu, présentation et palette. Chaque fiche redéfinit ses propres variables (`--p1`, `--p3-dk`…) et ses classes (`.helix`, `.ceo`, `.disc`, `.dilemma`…).
- **Aucune séparation des données** : on ne peut réutiliser une définition ou un exemple qu'en analysant le HTML.
- **Aucun identifiant stable** pour les notions. Les ancres internes sont rares.
- Liens entre fiches : chips « liens transversaux » en texte libre, pas de vrais liens profonds.
- Navigation : précédent / index / suivant uniquement.

### 2.4 Accessibilité

| Point | État |
|---|---|
| Langue du document | `lang="fr"`, correct |
| Schémas SVG porteurs d'information | 1 à 3 `aria-label` par page sur environ 12 SVG : **la plupart des schémas n'ont pas de nom accessible** |
| Mouvement | Animation sans `prefers-reduced-motion` |
| Thème sombre | Absent |
| Contraste | Non mesuré. Les palettes pastel des fiches seront à contrôler si une partie est conservée |
| Clavier | `<details>` est accessible au clavier. Aucun autre composant interactif |

### 2.5 Déploiement

- Une seule branche (`claude/commit-ewmdsd`). Aucun fichier de configuration Pages dans le dépôt : Pages est donc configuré dans les réglages GitHub (« Deploy from a branch »).
- **Je n'ai pas pu interroger l'URL publique** : le DNS de `github.io` est bloqué par la politique réseau de l'environnement. **À vérifier de votre côté** : quelle branche est publiée, et si la version en ligne correspond au commit `c0e30be`.

---

## 3. Inventaire pédagogique

### 3.1 Les 19 matières et leurs métadonnées

Ces métadonnées (enseignants, volumes horaires, ECTS, semestres) figurent dans le site **sans source**. Je ne les ai pas vérifiées. Elles seront confrontées à la maquette d'Orléans en phase 2.

| # | Matière | Semestre indiqué | Chapitres annoncés |
|---|---|---|---|
| 01 | Techniques du commerce international (TCI 1 et 2) | S5 + S6 | 8 |
| 02 | Introduction au commerce international | S5 | 6 |
| 03 | Droit des affaires internationales | S5 | 6 |
| 04 | Droit des contrats et Common Law | S6 | 6 |
| 05 | Comptabilité générale | S5 | 6 |
| 06 | Gestion financière | S6 | 6 |
| 07 | Outils de gestion | S6 | 7 |
| 08 | Management interculturel | S6 | 6 |
| 09 | Gestion de projet | S5 | 6 |
| 10 | Rédaction universitaire et initiation à la recherche | S5 | 5 |
| 11 | Anglais économique et commercial | S5 + S6 | 5 |
| 12 | Traduction anglaise, thème et version | S5 | 6 |
| 13 | Compréhension et expression anglaises | S6 | 5 |
| 14 | Espagnol économique et commercial | S5 + S6 | 7 |
| 15 | Thème et version espagnols | S5 + S6 | 5 |
| 16 | Civilisation britannique, The UK since 1945 | S5 | 7 |
| 17 | Civilisation espagnole, de la Transición à nos jours | S5 | 6 |
| 18 | Civilisation américaine, publicité et marketing | S6 | 6 |
| 19 | Civilisation latino-américaine, la ville contemporaine | S6 | 6 |

Total : **115 chapitres annoncés** dans le Master Plan, traités dans environ 62 blocs narratifs.

Incohérences internes déjà visibles : ECTS absents pour 08 et 15, « 1 ECTS » pour 17. Les intitulés de cours précis (publicité et marketing en civilisation américaine, ville contemporaine en civilisation latino-américaine) laissent penser qu'ils viennent d'un syllabus réel. **À confirmer.**

### 3.2 Composants de contenu présents

| Composant | Nombre | Correspond au cahier des charges ? |
|---|---|---|
| « Le problème réel » | environ 62 | Oui : c'est la **question centrale** |
| « Origine de la règle » (dates, auteurs, textes) | environ 70 | En partie : utile comme contexte, souvent trop long, sans lien vers la source |
| « Le mécanisme » (chaînes causales) | environ 70 | Oui : c'est le **fonctionnement détaillé** |
| Exemples concrets | 77 | Oui, mais tous inventés (PME fictives) et **jamais signalés comme fictifs** |
| Tableaux comparatifs | 49 | Oui, souvent bien faits et réutilisables |
| « Erreurs classiques » (étudiants / entreprises) | environ 62 | Oui : ce sont les **confusions fréquentes** |
| « À comprendre / À automatiser » | environ 35 | Utile comme matière première de flashcards |
| Dilemmes A/B/C avec analyse | 59 | Non : pas de correction notée, toutes les réponses sont « défendables ». À transformer en mini-cas |
| « Comment un CEO voit ce chapitre » | 60 | Hors cahier des charges. Mélange d'enjeux professionnels et de maximes. **À décider** |
| « HelixOps — où l'IA frappe ici » | 60 | **À supprimer** (Hélix Ops) |
| Définition précise isolée | rare | Absente comme rubrique : les définitions sont noyées dans le récit |
| Contre-exemple | rare | Quasi absent |
| Exercice corrigé, calcul pas à pas | 0 | Absent |
| Vérification de compréhension | 0 | Absente |
| Références avec liens et date de consultation | 0 | Absentes. Seules des dates et des titres sont cités dans le texte |
| Glossaire et traductions EN/ES | 0 | Absents. Quelques tableaux de faux amis seulement |

### 3.3 Cadre conceptuel de l'ancien système (Master Plan)

Le Master Plan impose plusieurs couches artificielles :

- classification **« Système x % / Automatisme y % »** par matière, avec des pourcentages non fondés ;
- « Chapitre-fondation », « Concept-colonne », « Problème générateur », « Étape 1 / Étape 2 » ;
- marqueurs « 篇 I–IV » (caractère chinois) comme numérotation ;
- « Ordre de traitement recommandé » en blocs.

Recommandation : **ne pas reconduire** ce cadre. Les **dépendances entre chapitres** et les **concepts transversaux** du Master Plan restent utiles comme point de départ pour les relations de prérequis de la phase 3. Ils devront être revérifiés.

---

## 4. Hélix Ops : éléments identifiés pour suppression

| Élément | Où | Action proposée |
|---|---|---|
| 60 encadrés `.helix` « HelixOps — où l'IA … frappe ici » | Fiches 01 à 19, 3 ou 4 par fiche | Suppression totale |
| Règles CSS `.helix`, `.helix h5`, `.helix ul`, `.helix li` | CSS embarqué de chaque fiche | Supprimées avec l'ancienne présentation |
| Mention « des lectures CEO et HelixOps en fin de partie » | `index.html`, introduction | Suppression |
| Cadre « Master Plans / L'Architecture des Disciplines » (section 3.3) | `00-master-plan.html`, en-têtes et pieds de page de toutes les fiches, `README.md` | Remplacement par la nouvelle architecture |
| Encadrés « CEO » | 60 | À décider. Proposition : supprimer, et récupérer au cas par cas les rares points factuels utiles dans une rubrique « Enjeux professionnels » |

**Sauvegarde avant suppression.** Rien n'a été supprimé à ce stade. Avant toute suppression (début de la phase 6), je propose :

1. un **tag Git** `archive/avant-refonte` sur `c0e30be` ;
2. une **branche** `archive/master-plans` poussée sur GitHub.

L'ancien site restera ainsi consultable et restaurable à l'identique.

---

## 5. Erreurs et imprécisions relevées

Statuts : **Erreur** (certaine), **À actualiser** (vrai à une date, dépassé aujourd'hui), **À vérifier** (douteux, à confirmer sur source), **Incohérence** (contradiction interne).

| # | Fiche | Passage | Problème | Statut |
|---|---|---|---|---|
| 1 | 01 TCI | « déclaration d'échange de biens » pour les échanges intra-UE | La DEB a été remplacée au 1er janvier 2022 par l'état récapitulatif TVA et l'enquête statistique EMEBI | À actualiser |
| 2 | 01 TCI | La conteneurisation « divise le coût de chargement par environ vingt » | Chiffre non sourcé. Les estimations courantes varient fortement | À vérifier |
| 3 | 03 Droit aff. | « Rome I et Bruxelles I bis ne s'appliquent qu'aux litiges intra-européens » | Faux pour Rome I, d'application universelle (art. 2). Imprécis pour Bruxelles I bis, dont l'application dépend surtout du domicile du défendeur dans l'UE | Erreur |
| 4 | 03 Droit aff. | Convention de La Haye 2019 sur les jugements, présentée comme « progresse » | L'UE y est partie depuis 2023 et le Royaume-Uni depuis 2025 | À actualiser / à vérifier |
| 5 | 04 Common law | Section post-Brexit (« non vérifié dans le cadre de cette fiche ») | Ne mentionne ni La Haye 2005 ni La Haye 2019, pourtant au cœur du sujet | À compléter |
| 6 | 05 Compta | Panneaux de bois achetés par une menuiserie, enregistrés au compte 606 | Matière première stockée : compte 601. L'écriture omet aussi la TVA déductible (44566) | Erreur |
| 7 | 05 Compta | Principe de prudence « codifié à l'article L123-21 » | La prudence est énoncée à L123-20. L123-21 porte sur les bénéfices réalisés | À vérifier |
| 8 | 06 Gestion fin. | L'affacturage « transfère le risque d'impayé » | Seulement en affacturage sans recours / avec garantie | Imprécision |
| 9 | 06 Gestion fin. | La CAF « alimente le FRNG comme ressource stable » | Raccourci : le lien passe par le tableau de financement | Imprécision |
| 10 | 07 Outils | Dilemme : machine à 180 000 €, seuil de 600 k€ à 780 k€, taux de MCV de 40 % à 58 % « au-delà du seuil » | Chiffres incohérents : ils impliqueraient environ 452 k€ de charges fixes. Le taux de MCV s'applique à tout le CA, pas seulement « au-delà du seuil » | Erreur |
| 11 | 07, 04, 17, 18 | « le brief transmis pour cette fiche », « repères fournis pour cette fiche », « repères vérifiés de ce cours », « sources mobilisées ici » | Traces de la génération automatique, sans valeur pour l'étudiante | À supprimer |
| 12 | 09 Gestion projet | Registre des risques : « Transférer » par une pénalité de retard contre un dépassement de budget ; « Éviter » par un dépôt précoce du permis | Exemples mal appariés : la pénalité ne transfère pas un surcoût, le dépôt précoce *réduit* le risque | Erreur conceptuelle |
| 13 | 11 Anglais com. | Offre « subject to confirmation » et « valid for thirty days » dans la même clause | Formules contradictoires. Sous CVIM (art. 16-2-a), un délai fixe peut rendre l'offre irrévocable | À nuancer |
| 14 | 12 Trad. EN | Vinay et Darbelnet « linguistes canadiens-français » | Linguistes français ayant travaillé au Canada | Erreur |
| 15 | 13 Comp. EN | La RP « nommée pour la première fois par Daniel Jones, EPD 1917 » | En 1917, Jones parle de *Public School Pronunciation*. « Received Pronunciation » apparaît dans l'édition de 1926, et l'expression est antérieure (A. J. Ellis, 1869) | Erreur |
| 16 | 14 Espagnol com. | « Actualmente ne signifie pas "actuellement" » | Faux : *actualmente* = actuellement. Le piège concerne l'anglais *actually* | Erreur |
| 17 | 14 Espagnol com. | Bolivie « signe son protocole d'adhésion en 2015 » | Membre de plein droit du Mercosur depuis 2024 | À actualiser |
| 18 | 14 / 15 | 14 : *usted* « sans exception commerciale ». 15 : « l'usted reste plus rare dans une bonne partie du monde hispanophone commercial » | Contradiction entre fiches | Incohérence |
| 19 | 14 Espagnol com. | Dilemme tuteo : l'analyse recommande « l'option C » mais décrit l'option B | Correction incohérente avec les choix proposés | Erreur |
| 20 | 17 Civ. esp. | « Une jeune démocratie de deux mois se demande encore, en 1981 » | La Constitution date de décembre 1978 | Erreur |
| 21 | 17 Civ. esp. | Attentats du 11-M « quatre jours avant les élections » | 11 mars, élections le 14 mars : trois jours | Erreur |
| 22 | 17 Civ. esp. | Pactos de la Moncloa : « la paix sociale est activement négociée avec les syndicats » | Pactes signés par le gouvernement et les partis parlementaires. Les syndicats n'en sont pas signataires | Erreur |
| 23 | 18 Civ. am. | « Fabrication du consentement » attribuée à Bernays (1928) | *Manufacture of consent* : Lippmann (1922). Bernays : *The Engineering of Consent* (1947) | À corriger |
| 24 | 19 Civ. lat.-am. | Metrocable attribué au mandat Fajardo (2004-2007) | Ligne K conçue sous Luis Pérez (2001-2003), inaugurée en 2004 | À nuancer |

Interprétations discutables, à revoir plutôt qu'erronées : rapprochements avec Hofstede dans la fiche 16 (dévolution présentée comme baisse de la distance hiérarchique, thatchérisme comme individualisme) ; liens transversaux artificiels dans la fiche 19 (le point de vue caméra comme « analogue du point de vue managérial »).

---

## 6. Lacunes : premier relevé par matière (provisoire, avant la phase 2)

Échelle demandée : **absente**, **mentionnée mais insuffisamment expliquée**, **expliquée sans exemple**, **expliquée mais sans exercice**, **correcte et suffisamment approfondie**, **à actualiser ou à vérifier**.

Aucune fiche ne contient d'exercice. Le meilleur statut atteignable aujourd'hui est donc **« expliquée mais sans exercice »**. Aucune notion n'atteint « correcte et suffisamment approfondie ».

Le relevé détaillé notion par notion sera produit après la cartographie (phase 3), qui fixera la liste de référence.

### 01 Techniques du commerce international

| Notion | Statut |
|---|---|
| Fonction des Incoterms, 4 familles, transfert risque / coûts | Expliquée mais sans exercice |
| **Les 11 règles une par une** (obligations A1–A10 / B1–B10, lieu de livraison, chargement, dédouanement) | Mentionnée mais insuffisamment expliquée : seules EXW, FCA, CIF, CIP, DDP, DPU sont évoquées |
| Incoterms et assurance (CIF clause C, CIP clause A) | Expliquée mais sans exercice |
| Transport maritime : connaissement, net / clausé, Hague-Visby | Expliquée mais sans exercice |
| Transport maritime : conteneurs EVP/FCL/LCL, calcul du fret (unité payante, BAF/CAF/THC) | Absente |
| Transport aérien (LTA/AWB, Montréal 1999), routier (CMR), ferroviaire (CIM), multimodal | Absente |
| Commissionnaire de transport / transitaire / transporteur | Mentionnée mais insuffisamment expliquée |
| Virement SWIFT, chèque, encaissement simple | Absente |
| Remise documentaire (D/P, D/A), lettre de change | Absente |
| Crédit documentaire (révocable/irrévocable, notifié/confirmé, UCP 600) | Expliquée mais sans exercice |
| Formes de réalisation du crédit, examen des documents, réserves | Mentionnée mais insuffisamment expliquée |
| Garanties bancaires, lettre de crédit stand-by | Absente |
| Risque de change (couverture à terme, options, devise de facturation) | Absente |
| Assurance-crédit export, risque de non-paiement | Absente |
| Douane : espèce tarifaire (SH / NC / TARIC) | Absente |
| Douane : origine préférentielle / non préférentielle | Mentionnée (dans le titre du chapitre) mais non expliquée |
| Valeur en douane et calcul droits + TVA à l'import | Expliquée sans exercice, sans calcul |
| Régimes particuliers (entrepôt, perfectionnement actif/passif, admission temporaire) | Mentionnée mais insuffisamment expliquée |
| Statut OEA, EORI, dédouanement centralisé | Absente |
| Échanges intra-UE (TVA intracom, autoliquidation, ETS, EMEBI) | Mentionnée, et à actualiser |
| Assurance transport (ICC A/B/C, police, avarie commune, réserves à la livraison) | Mentionnée mais insuffisamment expliquée |

### 02 Introduction au commerce international

| Notion | Statut |
|---|---|
| Diagnostic export, sélection des marchés, Uppsala | Expliquée mais sans exercice |
| Risque pays (composantes) | Expliquée mais sans exercice |
| Modes de présence (tableau à 5 modes) | Expliquée mais sans exercice |
| Agent commercial vs distributeur / concessionnaire (statuts) | Mentionnée mais insuffisamment expliquée |
| Prospection (salons, VIE, missions) | Expliquée mais sans exercice |
| Marketing mix international (4P détaillés, prix export, canaux) | Mentionnée mais insuffisamment expliquée |
| Calcul d'un prix export (escalade des prix) | Absente |
| Théories du commerce international (Smith, Ricardo, HOS, nouvelles théories) | Absente. **À vérifier** : rattachement à cette matière ou à une matière d'économie |
| Balance des paiements, taux de change, OMC et politique commerciale (aspect économique) | Absente |
| Acteurs publics de l'appui à l'export (Team France Export, Bpifrance, CCI) | Mentionnée |

### 03 Droit des affaires internationales

| Notion | Statut |
|---|---|
| Hard law / soft law, lex mercatoria | Expliquée mais sans exercice |
| OMC (principes NPF, traitement national, ORD) | Mentionnée mais insuffisamment expliquée |
| Règlement vs directive | Mentionnée |
| CVIM : champ d'application | Expliquée mais sans exercice |
| CVIM : formation, conformité, contravention essentielle, remèdes, exonération (art. 79) | Absente |
| Principes UNIDROIT | Mentionnée |
| Rome I / Bruxelles I bis | Expliquée, contient une erreur (section 5, n° 3) |
| Arbitrage, Convention de New York | Expliquée mais sans exercice |
| Clauses du contrat international (force majeure, hardship, langue, réserve de propriété) | Absente |
| Contrats de distribution internationale | Absente |
| Propriété intellectuelle (marque, brevet), droit de la concurrence UE | Absente |

### 04 Droit des contrats et Common Law

| Notion | Statut |
|---|---|
| Civil law vs common law, précédent, ratio / obiter | Expliquée mais sans exercice |
| Equity et ses remèdes | Expliquée mais sans exercice |
| Offer / acceptance / consideration / intention | Expliquée mais sans exercice. **Aucun arrêt de référence cité** (Carlill, Hyde v Wrench…) |
| Invitation to treat, postal rule, promissory estoppel | Absente |
| Terms (conditions / warranties / innominate), exclusion clauses | Absente |
| Misrepresentation, mistake, duress | Absente |
| Breach et damages (expectation, Hadley v Baxendale, mitigation) | Absente |
| Privity of contract | Absente |
| UCC article 2 | Mentionnée mais insuffisamment expliquée |
| Organisation judiciaire britannique | Mentionnée (hiérarchie sommaire) |
| Effets du Brexit | Mentionnée, à compléter (section 5, n° 5) |
| Vocabulaire juridique anglais | Mentionnée (liste courte) |

### 05 Comptabilité générale

| Notion | Statut |
|---|---|
| Principes comptables, PCG, partie double | Expliquée mais sans exercice |
| Classes de comptes | Expliquée mais sans exercice |
| Journal, grand livre, balance | Absente |
| Achats, ventes, TVA (écritures complètes) | Mentionnée mais insuffisamment expliquée ; une erreur (n° 6) |
| Réductions commerciales et financières (RRR, escompte), frais accessoires, emballages | Absente |
| Déclaration et liquidation de la TVA | Mentionnée |
| Opérations en devises (écarts de change, 476/477, 666/766) | Absente. Notion centrale en LEA CI |
| TVA intracommunautaire, autoliquidation, importations | Absente |
| Charges de personnel (écritures 421/431/641/645) | Mentionnée, sans écriture |
| Effets de commerce, rapprochement bancaire | Absente |
| Amortissements linéaire / dégressif | Expliquée sans calcul ni plan d'amortissement |
| Cessions d'immobilisations | Absente |
| Dépréciations (créances, stocks) et provisions : écritures | Mentionnée mais insuffisamment expliquée |
| Régularisations (CCA, PCA, FNP, FAE) | Absente |
| Variation de stocks | Absente |
| Bilan et compte de résultat (structure, construction) | Mentionnée mais insuffisamment expliquée |

### 06 Gestion financière

| Notion | Statut |
|---|---|
| Bilan fonctionnel, FRNG, BFR, trésorerie nette | Expliquée mais sans exercice |
| Retraitements du bilan fonctionnel (EENE, crédit-bail…) | Absente |
| BFR normatif, rotations (stocks, clients, fournisseurs) | Absente |
| SIG | Expliquée (tableau) mais sans exercice |
| CAF (méthodes additive / soustractive) | Expliquée sans calcul |
| Ratios (structure, liquidité, rentabilité, activité) avec formules | Mentionnée mais insuffisamment expliquée |
| Effet de levier | Expliquée avec un exemple chiffré |
| Tableau de financement / tableau des flux de trésorerie | Absente |
| Financement court terme (escompte, affacturage, Dailly, découvert) | Mentionnée |
| Choix d'investissement (VAN, TRI, délai de récupération) | Absente. **À vérifier** : est-ce au programme ? |
| Plan de financement, budget de trésorerie | Absente |

### 07 Outils de gestion

| Notion | Statut |
|---|---|
| Charges fixes / variables, MCV, seuil, point mort, marge de sécurité | Expliquée avec un exemple chiffré, sans exercice |
| Levier d'exploitation | Expliquée ; dilemme chiffré incohérent (n° 10) |
| Wilson / Harris, point de commande, stock de sécurité | Expliquée avec un exemple chiffré |
| Méthodes de valorisation des stocks (CMUP, FIFO) | Absente |
| ABC (Activity-Based Costing) | Expliquée sans calcul |
| Méthode ABC / Pareto en gestion des stocks | Absente. **Ambiguïté** : le Master Plan place la « méthode ABC » sous « stocks », la fiche traite l'Activity-Based Costing |
| Coûts complets, centres d'analyse | Absente |
| Prévision (moindres carrés, coefficients saisonniers) | Expliquée sans calcul |
| Budgets et analyse des écarts | Absente |
| Tableau de bord, Balanced Scorecard | Expliquée mais sans exercice |

### 08 Management interculturel

| Notion | Statut |
|---|---|
| Limites des grilles, stéréotype | Expliquée mais sans exercice |
| Hofstede (6 dimensions) | Expliquée sans scores et sans critiques académiques (McSweeney…) |
| Hall, Trompenaars | Expliquée mais sans exercice |
| Autres modèles (GLOBE, Lewis, Meyer) | Absente. **À vérifier** selon le syllabus |
| Négociation internationale (styles, BATNA, phases) | Mentionnée mais insuffisamment expliquée |
| Équipes multiculturelles, management à distance | Expliquée mais sans exercice |
| Choc culturel, expatriation, courbe en U | Absente |

### 09 Gestion de projet

| Notion | Statut |
|---|---|
| Triangle QCD, charte, SMART, parties prenantes | Expliquée mais sans exercice |
| Matrice pouvoir / intérêt, RACI | Absente |
| WBS | Expliquée mais sans exercice |
| Gantt, PERT, chemin critique | Expliquée sans calcul de réseau |
| **Méthode MPM**, dates au plus tôt / au plus tard, marges totale et libre | Absente. Classique de l'enseignement français |
| Budget de projet, valeur acquise (EVM : CPI, SPI) | Mentionnée mais insuffisamment expliquée |
| Gestion des risques | Expliquée, exemples mal appariés (n° 12) |
| Méthodes agiles (Scrum, Kanban) | Absente |
| Clôture, retour d'expérience | Expliquée mais sans exercice |

### 10 Rédaction universitaire et initiation à la recherche

| Notion | Statut |
|---|---|
| Hiérarchie des sources | Expliquée mais sans exercice |
| Problématique, plan, paragraphe | Expliquée mais sans exercice |
| Citation, paraphrase, plagiat | Expliquée mais sans exercice |
| Normes bibliographiques (APA, MLA) | Mentionnée. La norme française ISO 690 est absente ; **la norme exigée à Orléans est à vérifier** |
| Recherche documentaire (catalogues, bases, opérateurs) | Absente |
| Note de synthèse, rapport de stage, mémoire (structure) | Absente |
| Introduction, conclusion (méthode) | Absente |

### 11 Anglais économique et commercial

| Notion | Statut |
|---|---|
| Structure de la lettre, salutation / clôture, registre | Expliquée avec exemples, sans exercice |
| 7 types de lettres | Expliquée (formules), sans exercice |
| Courriel professionnel, réunions, présentations, téléphone | Absente |
| CV et lettre de motivation en anglais | Absente |
| Lexique socio-économique thématique (finance, marketing, logistique, RH) | Absente, sauf un tableau de faux amis |
| Faux amis, échelle des grands nombres | Expliquée mais sans exercice |
| Synthèse de presse (méthode) | Mentionnée |
| Grammaire utile (modaux, passif, conditionnels) | Mentionnée |

### 12 Traduction anglaise, thème et version

| Notion | Statut |
|---|---|
| 7 procédés de Vinay et Darbelnet | Expliquée avec exemples ; une erreur biographique (n° 14) |
| Contrastes FR/EN (nominalisation, temps, articles, -ing, passif, prépositions) | Mentionnée mais insuffisamment expliquée : seule la nominalisation est développée |
| Version et thème (textes entiers corrigés) | Absente : aucun texte d'entraînement |
| Faux amis, nombres | Expliquée mais sans exercice |
| Méthode d'épreuve | Expliquée mais sans exercice |

### 13 Compréhension et expression anglaises

| Notion | Statut |
|---|---|
| Phénomènes de l'oral (formes faibles, élisions) | Expliquée ; une erreur sur la RP (n° 15) |
| Méthode d'écoute, prise de notes | Expliquée mais sans exercice |
| Accents | Expliquée (tableau) |
| Documents audio d'entraînement | Absente. L'intégration d'audio réel suppose des droits ou des liens externes : **à décider** |
| Expression orale (présentation, débat, interaction) | Absente |

### 14 Espagnol économique et commercial

| Notion | Statut |
|---|---|
| Carta comercial, usted, subjonctif de politesse | Expliquée avec exemples, sans exercice |
| Cycle documentaire (consulta → reclamación) | Expliquée avec exemples |
| Courriel, téléphone, réunion en espagnol | Absente |
| Lexique de l'entreprise (listes thématiques) | Absente, sauf quelques faux amis (dont une erreur, n° 16) |
| Économie espagnole par secteurs | Mentionnée mais insuffisamment expliquée (sans données) |
| Mercosur / Alliance du Pacifique | Expliquée ; à actualiser (n° 17) |
| Accord UE–Mercosur et autres accords | Absente. À vérifier et à actualiser |
| CV, informe, resumen | Mentionnée |

### 15 Thème et version espagnols

| Notion | Statut |
|---|---|
| Calque, ser / estar, por / para, subjonctif, a personal, gustar | Expliquée avec exemples, sans exercice |
| Concordance des temps, traduction de « on », gérondif, *soler*, *llevar* + durée, périphrases verbales | Absente |
| Textes de thème et de version corrigés | Absente |
| Faux amis, registre, journal d'erreurs | Expliquée mais sans exercice ; une incohérence (n° 18) |

### 16 Civilisation britannique

| Notion | Statut |
|---|---|
| Beveridge, Welfare State, nationalisations | Expliquée mais sans exercice |
| Consensus, Butskellism, crise des années 1970 | Expliquée mais sans exercice |
| Thatchérisme (monétarisme, privatisations, mineurs, Big Bang, poll tax) | Expliquée mais sans exercice |
| Major, New Labour, dévolution, Good Friday | Expliquée mais sans exercice |
| Décolonisation, place du Royaume-Uni dans l'Europe (1973, 1975) | Absente |
| Institutions britanniques (Parliament, partis, système électoral) | Absente |
| Période 2007 à aujourd'hui (crise de 2008, austérité, Brexit) | Absente. **À vérifier** : hors programme ? |
| Analyse de documents (méthode du commentaire) | Absente |

### 17 Civilisation espagnole

| Notion | Statut |
|---|---|
| Héritage franquiste, Transición, Constitution de 1978 | Expliquée ; erreurs (n° 20, 22) |
| 23-F, González, CEE, 1992, Aznar, 11-M | Expliquée ; erreur (n° 21) |
| État des autonomies, Catalogne 2006 → 2017 | Expliquée mais sans exercice |
| Zapatero, crise de 2008, 15-M, fin du bipartisme, Memoria Histórica | Absente. À vérifier selon le syllabus |
| Pays basque, ETA (jusqu'en 2018) | Mentionnée |
| Institutions (Cortes, partis, monarchie parlementaire) | Mentionnée |

### 18 Civilisation américaine

| Notion | Statut |
|---|---|
| Naissance de la publicité, Lasker, Hopkins, Bernays | Expliquée ; une attribution à corriger (n° 23) |
| Mesure (Gallup, Nielsen) | Expliquée mais sans exercice |
| USP, creative revolution | Expliquée avec exemples |
| Données et ciblage | Expliquée de manière générale, sans date |
| Contexte : société de consommation, Années folles, New Deal, consumérisme d'après-guerre | Mentionnée |
| Régulation (FTC, publicité mensongère, tabac) | Absente |
| Analyse d'affiches et de spots (méthode) | Absente |

### 19 Civilisation latino-américaine

| Notion | Statut |
|---|---|
| Urbanisation, informalité, vocabulaire (favela, villa miseria…) | Expliquée mais sans exercice |
| Ségrégation, barrios cerrados, gentrification | Expliquée mais sans exercice |
| Violence urbaine | Expliquée mais sans exercice |
| Medellín | Expliquée ; à nuancer (n° 24) |
| Corpus filmique (4 films) | Mentionnée (fiche signalétique), sans analyse de séquence |
| Autres cas (Bogotá TransMilenio, Curitiba, Mexico) | Absente |
| Méthode d'analyse de photographie et de film | Mentionnée |

### Matières potentiellement absentes du site

À confirmer en phase 2 : le site ne prouve pas que les 19 matières ci-dessus couvrent toute la maquette.

- **Économie internationale / macroéconomie** : vous la citez dans le cahier des charges (graphiques, indicateurs, scénarios), elle est absente du site.
- **Logistique / supply chain** comme matière distincte, en dehors du transport traité en TCI.
- **Marketing international** comme matière distincte.
- **Stage, projet professionnel, préprofessionnalisation.**
- **LV3** éventuelle, **numérique / PIX**, options.

---

## 7. Ce qui est réutilisable

| Élément | Réutilisation proposée |
|---|---|
| Questions centrales (« Le problème réel ») | Rubrique « Question centrale » des fiches-notions, après réécriture courte |
| Chaînes de mécanisme | Rubrique « Fonctionnement » |
| 49 tableaux comparatifs | Conservés en données après vérification (CVIM / UNIDROIT, hard / soft law, SIG, bilan comptable / fonctionnel, ser / estar, por / para, faux amis, USP / creative revolution…) |
| « Erreurs classiques » | Rubrique « Confusions fréquentes » et distracteurs de QCM |
| « À comprendre / À automatiser » | Graines de flashcards ouvertes |
| Exemples chiffrés (seuil de rentabilité Aubry, Wilson, effet de levier) | Exemples conservés, **signalés comme fictifs**, transformés en exercices corrigés pas à pas |
| Dilemmes | Matière première de mini-cas. Il faudra définir des critères d'évaluation explicites |
| Dépendances entre chapitres (Master Plan) | Point de départ des relations de prérequis |
| Schémas SVG | Réutilisables au cas par cas, après ajout de descriptions accessibles et retrait des couleurs codées en dur |
| Encadrés « Origine de la règle » | À réduire à une ou deux phrases de contexte, avec une référence vérifiable |

À ne pas reprendre : encadrés HelixOps et CEO, classifications Système/Automatisme, « 篇 », palettes par matière, animations, CSS embarqué.

---

## 8. Recommandation d'architecture (pour discussion en phase 5)

Un **site statique piloté par des données**. Il reste compatible avec GitHub Pages, sans serveur ni clé API :

- **Données pédagogiques** dans des fichiers structurés (JSON ou YAML) : `matieres`, `chapitres`, `notions`, `qcm`, `flashcards`, `exercices`, `glossaire`, `sources`. Chaque élément a un **identifiant stable** (ex. `tci.incoterms.transfert-risque`) et des relations explicites (`prerequis`, `connexes`).
- **Logique applicative** séparée : moteur QCM et examen, répétition espacée (de type SM-2), calcul de la maîtrise à partir des résultats, recherche plein texte côté client, filtres.
- **Présentation** isolée dans un **système de jetons de design** (couleurs, typographie, espacements, rayons, ombres) sous forme de variables CSS. Le futur choix de design se fera sans toucher au contenu ni à la logique.
- **Persistance** de la progression en `localStorage`, avec gestion d'erreur, export / import JSON pour la sauvegarde et reprise de session.
- **Tests automatisés** : validation du schéma des données (identifiants uniques, liens non cassés, bonnes réponses existantes), tests de la logique (score, répétition espacée, calculs des exercices), test de bout en bout dans Chromium.

Le choix précis de la pile sera proposé en phase 5. Deux options : générateur statique (Astro, Eleventy), ou application Vite avec un petit framework. Dans les deux cas, ni serveur ni secret.

---

## 9. Points à vérifier ou à décider

1. **Déploiement** : quelle branche GitHub Pages publie-t-elle ? Le site en ligne correspond-il au commit `c0e30be` ?
2. **Provenance des métadonnées** (enseignants, horaires, ECTS, ouvrages cités comme Segura, Gleason, Langlois et Friédérich) : viennent-elles d'un document que vous possédez (maquette, syllabus, ENT/CELENE) ? Si oui, me le transmettre ferait gagner en fiabilité dans la phase 2.
3. **Encadrés « CEO »** : suppression complète ou récupération partielle ?
4. **Audio** pour la compréhension orale : liens vers des ressources externes (BBC, RTVE) ou pas d'audio ?
5. **Sauvegarde** : accord pour pousser le tag et la branche d'archive avant la phase 6 ?

---

## 10. Suite proposée

**Phase 2, recherche.**

1. Maquette et fiches de cours de la L3 LEA de l'Université d'Orléans.
2. Référentiel national de compétences de la licence LEA.
3. Maquettes de L3 LEA Commerce international dans d'autres universités, en distinguant ce qui est enseigné à Orléans, ce qui est attendu en L3 et ce qui est complémentaire.
4. Sources institutionnelles pour les contenus techniques : ICC, douane, Légifrance, ANC, CNUDCI, EUR-Lex.

Livrable : bibliographie avec liens, organisme et date de consultation.
