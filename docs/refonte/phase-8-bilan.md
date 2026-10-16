# Phase 8 — Bilan de la refonte

État au 16 octobre 2026, branche `claude/commit-ewmdsd`.

## 1. Ce qui est livré

**Application** (Vite, Preact, TypeScript), publiée sur GitHub Pages depuis la racine de la branche :

- tableau de bord inspiré de la maquette (barre latérale d'icônes, puces de filtre, cartes pastel par matière avec badge de maîtrise, panneau « notions fragiles » et « à réviser aujourd'hui ») ; barre d'onglets en bas sur mobile ; thème sombre ;
- fiches-notions (question, définition, explication, fonctionnement, terminologie FR / EN / ES, exemple fictif signalé ou réel sourcé, contre-exemple, confusions, vérification, références datées) ;
- QCM à choix unique, multiple et vrai / faux, sans réponse avant validation, avec une explication par choix ;
- flashcards ouvertes (réponse de référence, éléments indispensables, erreurs, relance) avec répétition espacée ;
- exercices corrigés (nombres saisis à la française, écritures comptables, choix, réponses libres avec critères et corrigé) ;
- mode examen sans correction immédiate, reprise après rechargement, bilan ;
- maîtrise calculée à partir des résultats, historique des erreurs, glossaire, recherche insensible aux accents (termes français, anglais, espagnols) ;
- export et import de la progression (stockage local uniquement ; aucune clé ni aucun secret dans le code client).

**Qualité** :

- validateur de contenu (`scripts/build-index.mjs`) : identifiants, prérequis et connexes existants, niveau conforme au catalogue, une bonne réponse et une explication par choix, écritures équilibrées, exemple réel obligatoirement sourcé ;
- 34 tests unitaires (Vitest) et 20 tests de bout en bout (Playwright, bureau et mobile) : 18 réussis, 2 ignorés (le test « notion non rédigée » n'a plus d'objet : toutes les notions sont rédigées) ;
- intégration continue (`.github/workflows/verifier.yml`) : contenu, types, tests unitaires, construction, cohérence du site publié, tests de bout en bout. Les exécutions de la branche sont vertes.

## 2. Contenu rédigé

**394 / 394 notions** du catalogue, 577 QCM, 169 flashcards, 74 exercices, 1 075 termes trilingues, 104 sources.

| Code | Matière | Statut | Semestre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|---|---|
| tci | Techniques du commerce international | ORL | S5, S6 | 66 | 75 | 18 | 9 |
| ici | Introduction au commerce international | ORL | S5 | 24 | 29 | 9 | 3 |
| dai | Droit des affaires internationales | ORL | S5 | 21 | 31 | 8 | 2 |
| dcl | Droit des contrats de la Common law | ORL | S6 | 23 | 39 | 9 | 3 |
| cpt | Comptabilité générale | ORL | S5 | 32 | 63 | 15 | 15 |
| gfi | Gestion financière | ORL | S6 | 18 | 31 | 10 | 9 |
| odg | Outils de gestion | ORL | S6 | 17 | 27 | 6 | 8 |
| mgi | Management interculturel | ORL | S6 | 13 | 20 | 5 | 2 |
| gdp | Gestion de projet | ORL | S5 | 18 | 22 | 7 | 2 |
| red | Rédaction de documents universitaires | ORL | S5 | 10 | 11 | 4 | 1 |
| aec | Anglais économique et commercial | ORL | S5, S6 | 22 | 25 | 6 | 2 |
| tra | Traduction anglaise : thème et version | ORL | S5 | 15 | 18 | 5 | 2 |
| cea | Compréhension et expression anglaises | ORL | S6 | 8 | 10 | 3 | 0 |
| eec | Espagnol économique et commercial | ORL | S5, S6 | 15 | 18 | 5 | 1 |
| tve | Thème et version espagnols | ORL | S5, S6 | 15 | 17 | 4 | 2 |
| cvb | Civilisation britannique : the UK since 1945 | ORL | S5 | 19 | 20 | 6 | 1 |
| cve | Civilisation espagnole | ORL | S5 | 14 | 25 | 10 | 2 |
| cva | Civilisation américaine : publicité et marketing | ORL | S6 | 10 | 22 | 10 | 1 |
| cvl | Civilisation latino-américaine | ORL? | S6 | 10 | 20 | 10 | 1 |
| stg | Stage et rapport de stage | ORL | S6 | 10 | 19 | 6 | 3 |
| eco | Économie internationale | COMP | — | 10 | 23 | 9 | 3 |
| mks | Marketing international et supply chain | COMP | — | 4 | 12 | 4 | 2 |

ORL : matière de la maquette d'Orléans ; ORL? : contenu exact à confirmer auprès de l'enseignant ; COMP : complément hors maquette, signalé dans l'application.

## 3. Statut des sources

Les fiches distinguent trois niveaux d'accès (affichés dans l'application) :

- **lu** (1) : livret de stage L3 LEA 2021-2022, fourni avec la demande de refonte ;
- **consulté par extrait** (2) : pages S5 et S6 de la licence sur univ-orleans.fr ;
- **texte de référence** (101) : ouvrages, textes juridiques et rapports cités comme références bibliographiques vérifiables. Ils n'ont **pas** été consultés pendant la rédaction ; les références sont données pour que l'étudiant puisse les vérifier.

Aucun syllabus détaillé ni support d'enseignant n'a été consulté : le contenu suit les intitulés et descriptifs officiels des EC, complétés par les connaissances standard de chaque discipline.

## 4. Points à vérifier (`aVerifier`)

57 notions portent une mention « à vérifier » : données susceptibles d'évoluer (taux, seuils, ratifications, actualité politique) ou conventions propres aux enseignants. Elles s'affichent sur la fiche.

| Notion | Point à vérifier |
|---|---|
| `tci.incoterms.cpt-cip` | La justification officielle de l'ICC (marchandises manufacturées en CIP, matières premières en CIF) est à confirmer dans l'introduction des Incoterms® 2020. |
| `tci.transport.aerien` | Le ratio 1/6 000 est la règle IATA usuelle ; certains transporteurs express appliquent 1/5 000. Vérifier le tarif du transporteur. |
| `tci.transport.ferroviaire` | Délais et disponibilité des liaisons Chine–Europe variables selon le contexte géopolitique : à vérifier au moment de l'étude. |
| `tci.transport.responsabilite` | Montants des plafonds aérien (révision OACI périodique) et ferroviaire à confirmer dans les textes en vigueur. |
| `tci.assurance.credit` | Organismes et modalités des garanties publiques à l'export à vérifier sur le site de Bpifrance. |
| `tci.intra-ue.declarations` | Seuils et modalités de dépôt de l'EMEBI à vérifier sur douane.gouv.fr pour l'année en cours. |
| `ici.diagnostic.born-global` | Le seuil chiffré (part du CA à l'étranger, délai) varie selon les auteurs : utiliser la définition donnée en cours. |
| `ici.information.sources` | Organisation du dispositif public d'appui à l'export et noms des outils (évolutions fréquentes) : vérifier sur teamfrance-export.fr. |
| `ici.risque.notation` | Échelles exactes des assureurs-crédit (elles diffèrent selon l'assureur) : consulter la méthodologie publiée par chacun. |
| `ici.prospection.outils` | Conditions du VIE (âge, durée, indemnités) à vérifier sur le site de Business France / Civiweb. |
| `ici.mix.produit` | Exigences d'étiquetage propres à chaque pays (exemple mexicain) : vérifier la réglementation en vigueur avant usage. |
| `dai.normes.omc` | État de l'Organe d'appel et de l'arrangement provisoire (MPIA) : vérifier la situation actuelle sur wto.org. |
| `dai.cvim.champ` | Liste des États contractants : vérifier sur le site de la CNUDCI (uncitral.un.org) au moment de l'usage. |
| `dai.litiges.new-york` | Nombre exact d'États parties : vérifier sur uncitral.un.org. |
| `dai.distribution.agent` | Évaluation usuelle « deux années de commissions » : usage jurisprudentiel français, non fixé par la loi ; vérifier l'état de la jurisprudence. |
| `dcl.juridictions.usa` | Seuil de montant de la diversity jurisdiction (75 000 $ selon 28 U.S.C. § 1332) : vérifier la valeur en vigueur. |
| `dcl.juridictions.brexit` | Dates d'entrée en vigueur de la Convention de La Haye de 2019 pour le Royaume-Uni et règles transitoires : vérifier sur hcch.net. |
| `dcl.ucc.article2` | Le § 2-207 est appliqué diversement selon les États (knock-out rule majoritaire) : vérifier la jurisprudence de l'État concerné. |
| `cpt.cadre.pcg` | Le règlement ANC n° 2022-06, applicable aux exercices ouverts à compter du 1er janvier 2025, modifie certains comptes et la présentation du compte de résultat : vérifier les numéros utilisés en cours. |
| `cpt.tva.mecanisme` | Les champs d'application des taux réduits évoluent régulièrement (lois de finances) : vérifier la liste à jour sur impots.gouv.fr. |
| `cpt.tva.declaration` | Seuils et calendrier des acomptes du régime simplifié : vérifier les règles en vigueur (impots.gouv.fr). |
| `cpt.achats-ventes.frais-accessoires` | Comptes de sous-classes (6241, 6242, 7085, 4096, 4196) : vérifier la nomenclature du PCG applicable depuis 2025 (règlement ANC 2022-06) et les conventions de l'enseignant. |
| `cpt.achats-ventes.international` | Sous-comptes exacts de TVA intracommunautaire et d'importation (445662, 4452, sous-comptes d'importation) : varient selon les manuels et le plan de comptes de l'enseignant. |
| `cpt.achats-ventes.devises` | Beaucoup de manuels utilisent encore 666/766 pour toutes les différences de change ; le règlement ANC 2015-05 a réservé 656/756 aux opérations commerciales. Vérifier la convention de l'enseignant et la nomenclature du PCG 2025. |
| `cpt.personnel.paie` | Les taux de cotisations utilisés dans les exemples sont fictifs et arrondis ; le compte 4421 du prélèvement à la source est à confirmer avec la nomenclature utilisée en cours. |
| `cpt.investissements.cessions` | Le règlement ANC 2022-06 (exercices ouverts depuis le 1er janvier 2025) redéfinit le résultat exceptionnel et modifie la nomenclature : vérifier si les comptes 675 / 775 restent ceux enseignés et le classement du résultat de cession. |
| `cpt.synthese.compte-resultat` | Le règlement ANC 2022-06 (exercices ouverts depuis le 1er janvier 2025) restreint le résultat exceptionnel et modifie la présentation : vérifier le modèle de compte de résultat utilisé en cours. |
| `gfi.bilan-fonctionnel.retraitements` | Les retraitements exigés varient selon les enseignants (notamment le crédit-bail et les VMP) : suivre la convention du cours. |
| `gfi.performance.sig` | Le nouveau modèle de compte de résultat (ANC 2022-06) peut modifier certains regroupements : vérifier le tableau des SIG du cours. |
| `gfi.ratios.structure` | Les seuils et le périmètre des dettes financières (avec ou sans concours bancaires, nettes ou non de la trésorerie) diffèrent selon les manuels : appliquer la convention du cours. |
| `odg.prevision.saisonnalite` | Méthode de calcul des coefficients attendue en cours (rapport à la moyenne ou à la tendance) à confirmer. |
| `mgi.grilles.hofstede` | Les scores par pays ne sont pas reproduits ici : les consulter sur le site officiel de Hofstede Insights ou dans l'ouvrage de 2010, en citant l'édition. |
| `gdp.cadrage.smart` | Les déclinaisons des lettres A et R varient selon les auteurs (atteignable, ambitieux, acceptable ; réaliste, pertinent) : retenir celle du cours. |
| `red.attribution.plagiat` | Règles précises de l'université d'Orléans sur la fraude et l'usage de l'IA : consulter le règlement des études de l'année. |
| `red.attribution.normes` | Norme exigée par les enseignants du parcours (ISO 690, APA ou consignes propres) : à confirmer, comme indiqué dans la cartographie. |
| `eec.lexico.finanzas` | Taux d'IVA espagnols (21 / 10 / 4 %) : vérifier les taux en vigueur et les éventuelles mesures temporaires sur agenciatributaria.gob.es. |
| `eec.economia.espana-sectores` | Chiffres actuels (part du tourisme dans le PIB, rang automobile, taux de chômage) : consulter l'INE (ine.es) et Eurostat avant de les citer. |
| `eec.economia.latam` | Classement des économies et indicateurs récents (PIB, inflation) : vérifier auprès de la CEPAL, du FMI ou de la Banque mondiale. |
| `eec.economia.bloques` | État d'avancement des accords UE-Mercosur, UE-Mexique et UE-Chili (signature, ratification, entrée en vigueur) : vérifier sur le site de la Commission européenne (DG Commerce). |
| `cvb.institutions.parlement` | Composition de la Chambre des lords (réforme des pairs héréditaires engagée en 2024-2025) : vérifier sur parliament.uk. |
| `cvb.institutions.partis` | Rapports de force partisans récents (sondages, élections partielles) : vérifier l'actualité. |
| `cve.autonomias.cataluna` | Application de la loi d'amnistie et situation judiciaire des dirigeants indépendantistes : évolution en cours, à vérifier à la date d'étude. |
| `cve.actualidad.crisis-2008` | Composition actuelle du gouvernement et du Congrès (après les élections du 23 juillet 2023) et derniers chiffres du chômage (INE, EPA) à vérifier à la date d'étude. |
| `cva.contemporain.numerique` | Législation américaine sur les données personnelles en évolution (lois d'États, projets fédéraux) : vérifier l'état du droit à la date d'étude. |
| `cvl.urbanizacion.exodo` | Taux d'urbanisation actuel : vérifier la dernière estimation des Nations unies (World Urbanization Prospects) ou de la CEPAL. |
| `cvl.urbanizacion.metropolis` | Populations des aires métropolitaines : chiffres variables selon les définitions et les recensements, à vérifier à la date d'étude. |
| `cvl.informalidad.economia` | Taux d'emploi informel par pays : se reporter aux dernières données de l'OIT (ILOSTAT). |
| `cvl.fracturas.violencia` | Taux d'homicide par pays et par ville : chiffres très variables d'une année à l'autre, vérifier les dernières données (UNODC, instituts nationaux). |
| `stg.cadre.objectifs` | Règles issues du livret 2021-2022 (lu). Un livret 2024-2025 existe (non consulté) : vérifier durée, dates limites et ECTS de l'année en cours. |
| `stg.cadre.convention` | Montant horaire minimal de la gratification : il dépend du plafond horaire de la sécurité sociale de l'année (le livret 2021-2022 indiquait 600 € par mois) ; vérifier sur service-public.fr. Circuit de signature : vérifier la procédure actuelle (plateforme en ligne possible). |
| `stg.rapport.structure` | Exigences issues du livret 2021-2022 : vérifier le nombre de pages et l'ordre des éléments dans le livret de l'année en cours. |
| `stg.soutenance.preparation` | Date limite de soutenance (2 juillet en 2021-2022, dérogation jusqu'au 2 septembre) : à vérifier pour l'année en cours. |
| `stg.evaluation.bareme` | Barème et règle de non-compensation issus du livret 2021-2022 : vérifier les modalités de contrôle des connaissances de l'année en cours. |
| `eco.change.taux-change` | Les cours de change cités sont illustratifs : consulter le cours de référence de la BCE à la date d'étude. |
| `eco.politique.protectionnisme` | Droits de douane américains et mesures de rétorsion : situation très évolutive depuis 2025, à vérifier à la date d'étude. |
| `eco.politique.integration-regionale` | État de ratification de l'accord UE-Mercosur et adhésions récentes aux blocs régionaux : à vérifier à la date d'étude. |
| `mks.marketing.digital` | Accessibilité des plateformes selon les pays et règles applicables aux transferts de données hors UE : à vérifier à la date d'étude. |

## 5. Limites connues

- Exercices encore peu nombreux dans les matières de langue et de civilisation (cea : aucun ; red, eec, cvb, cva, cvl : un seul). Les réponses libres y sont corrigées par critères, sans notation automatique.
- Le livret de stage utilisé date de 2021-2022 ; le livret 2024-2025 n'a pas été consulté.
- Les comptes et regroupements comptables suivent le PCG tel que modifié par le règlement ANC 2022-06 lorsque cela est précisé ; certains manuels et enseignants utilisent encore l'ancienne présentation (signalé sur les fiches concernées).
- La progression reste dans le navigateur : changer d'appareil suppose l'export / import manuel.

## 6. Prochaines étapes proposées

1. Confronter chaque matière au syllabus ou aux supports de l'enseignant, en priorité cvl (ORL?) et les conventions signalées (retraitements en gestion financière, norme bibliographique, méthode des coefficients saisonniers).
2. Remplacer les règles de stage par celles du livret de l'année en cours.
3. Ajouter des exercices dans les matières de langue et de civilisation (commentaires guidés, traductions corrigées).
4. Revoir les points « à vérifier » à chaque rentrée (taux, seuils, actualité).
5. Retirer ou réécrire le test de bout en bout « notion non rédigée », devenu sans objet.
