# Inventaire des cours (COURSE_INVENTORY)

Établi le 31 octobre 2026 (mis à jour après la refonte) sur la branche `claude/learning-journal` (point de départ : tag `avant-learning-journal`, commit `ba59873`).
Source : `content/catalogue.json` et les fichiers `content/<matière>/<chapitre>.json`. Les identifiants complets sont figés dans `tests/reference/inventaire-contenu.json`, contrôlé par `tests/unit/integrite.test.ts`.

## Synthèse

| Code | Matière | Statut | Semestre | Enseignant (maquette) | Chapitres | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|---|---|---|---|
| tci | Techniques du commerce international | ORL | S5 + S6 | Isabelle Noël | 9 | 66 | 75 | 18 | 9 |
| ici | Introduction au commerce international | ORL | S5 | Isabelle Noël | 6 | 24 | 29 | 9 | 3 |
| tou | Introduction au tourisme international | ORL? | — | — | 0 | 0 | 0 | 0 | 0 |
| dai | Droit des affaires internationales | ORL | S5 | Isabelle Noël | 6 | 21 | 31 | 8 | 2 |
| dcl | Droit des contrats de la Common law | ORL | S6 | Isabelle Noël | 8 | 23 | 39 | 9 | 3 |
| cpt | Comptabilité générale | ORL | S5 | Isabelle Noël | 9 | 32 | 63 | 15 | 15 |
| gfi | Gestion financière | ORL | S6 | Isabelle Noël | 6 | 18 | 31 | 10 | 9 |
| odg | Outils de gestion | ORL | S6 | Isabelle Noël | 5 | 17 | 27 | 6 | 8 |
| mgi | Management interculturel | ORL | S6 | Isabelle Noël | 4 | 13 | 20 | 5 | 2 |
| gdp | Gestion de projet | ORL | S5 | Sonia Tesson | 4 | 18 | 22 | 7 | 2 |
| red | Rédaction de documents universitaires | ORL | S5 | Sonia Tesson | 3 | 10 | 11 | 4 | 1 |
| aec | Anglais économique et commercial | ORL | S5 + S6 | Alice Michel | 4 | 22 | 25 | 6 | 2 |
| tra | Traduction anglaise : thème et version | ORL | S5 | Alice Michel | 3 | 15 | 18 | 5 | 2 |
| cea | Compréhension et expression anglaises | ORL | S6 | Elodie Gallet | 3 | 8 | 10 | 3 | 0 |
| eec | Espagnol économique et commercial | ORL | S5 + S6 | Claire Decobert | 4 | 15 | 18 | 5 | 1 |
| tve | Thème et version espagnols | ORL | S5 + S6 | Annie Baccon, Sylvie Fournié-Chaboche | 3 | 15 | 17 | 4 | 2 |
| cvb | Civilisation britannique : the UK since 1945 | ORL | S5 | Karine Rivière de Franco | 6 | 19 | 20 | 6 | 1 |
| cve | Civilisation espagnole | ORL | S5 | Claire Decobert | 6 | 14 | 25 | 10 | 2 |
| cva | Civilisation américaine : publicité et marketing | ORL | S6 | Eric Tabuteau | 6 | 10 | 22 | 10 | 1 |
| cvl | Civilisation latino-américaine | ORL? | S6 | Marcos Eymar | 5 | 10 | 20 | 10 | 1 |
| stg | Stage et rapport de stage | ORL | S6 | Aline Henninger, Mayumi Shimosakai | 5 | 10 | 19 | 6 | 3 |
| eco | Économie internationale | COMP | — | — | 4 | 10 | 23 | 9 | 3 |
| mks | Marketing international et supply chain | COMP | — | — | 2 | 4 | 12 | 4 | 2 |
| **Total** | 23 matières | | | | **111** | **394** | **577** | **169** | **74** |

Statuts : **ORL** Maquette d’Orléans ; **ORL?** Présence ou contenu à confirmer ; **COMP** Complément hors maquette.

Toutes les notions du catalogue sont rédigées (394 / 394). La matière « Introduction au tourisme international » figure au catalogue avec le statut **absente** (aucun chapitre, aucune source) : voir COURSE_COMPLETENESS_REPORT.md.

## Détail par matière, chapitre et notion

### tci — Techniques du commerce international

Maquette d’Orléans · S5 + S6 · Isabelle Noël · catégorie Commerce international

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `tci.operation` | L'opération d'import-export | Les acteurs : vendeur, acheteur, transporteur, commissionnaire, transitaire, banques, douane, assureur · Flux physique, documentaire et financier · L'offre et la facture pro forma · La facture commerciale internationale : mentions | 5 | 2 | 0 |
| `tci.incoterms` | Incoterms® 2020 | Fonction et nature contractuelle des Incoterms · Les 4 familles E, F, C, D et les 2 catégories (tous modes / maritime) · Le point de transfert des risques · Le point de transfert des frais · La règle des deux points critiques dans la famille C · EXW · FCA, y compris le connaissement « à bord » · FAS et FOB · CFR et CIF · CPT et CIP · DAP, DPU et DDP · Obligations d'assurance : CIF en clause C, CIP en clause A · Qui dédouane à l'export et à l'import · Chargement et déchargement selon la règle · Choisir un Incoterm : critères et erreurs · Rédiger la clause : règle, lieu précis, version · Incoterm, transfert de propriété et contrat de vente · Études de cas | 20 | 5 | 3 |
| `tci.transport` | Transport international | Choisir un mode : coût, délai, sécurité, nature de la marchandise · Transport maritime : lignes régulières, tramping, conteneurs EVP, FCL / LCL · Calcul du fret maritime : unité payante, BAF, CAF, THC · Transport aérien : LTA / AWB, poids taxable (rapport 1/6) · Transport routier : lettre de voiture CMR · Transport ferroviaire : lettre de voiture CIM · Transport multimodal et commissionnaire de transport · Responsabilité et limites d'indemnisation du transporteur · Emballage, marquage, colisage | 9 | 2 | 2 |
| `tci.documents` | Documents du commerce international | Le connaissement : fonctions, titre de propriété · Connaissement net ou clausé ; connaissement à ordre, nominatif, au porteur · Sea waybill, LTA, CMR, CIM : non négociables · Liste de colisage et certificats (origine, sanitaire, inspection) · Cohérence documentaire | 6 | 2 | 0 |
| `tci.paiement` | Paiements internationaux | Risque de non-paiement, risque pays, risque de change · Instruments (virement, chèque, effet) et techniques (encaissement simple, remise, crédit) · Virement SWIFT, IBAN / BIC · Lettre de change et billet à ordre · Remise documentaire D/P et D/A (URC 522) · Le crédit documentaire : mécanisme et acteurs · Révocable / irrévocable ; notifié / confirmé · Réalisation : à vue, paiement différé, acceptation, négociation · Examen des documents, réserves, autonomie · Garanties bancaires et lettre de crédit stand-by · Choisir une technique de paiement selon le risque | 13 | 3 | 2 |
| `tci.change` | Risque de change | Cours au comptant et à terme, cotation · Couverture à terme · Options de change · Facturation en devise nationale, termaillage | 5 | 1 | 1 |
| `tci.assurance` | Assurances | Assurance transport : police, clauses ICC A / B / C · Avaries particulières et avarie commune · Réserves à la livraison et recours · Assurance-crédit export | 5 | 1 | 0 |
| `tci.douane` | Douane | Rôle de la douane, union douanière de l'UE · Espèce tarifaire : SH, NC, TARIC · Origine préférentielle et non préférentielle · Valeur en douane (valeur transactionnelle, ajustements) · Calcul des droits et de la TVA à l'importation · Déclaration en douane, EORI, statut OEA · Entrepôt, perfectionnement actif / passif, admission temporaire, transit | 8 | 1 | 1 |
| `tci.intra-ue` | Échanges intracommunautaires | Livraison et acquisition intracommunautaires · Autoliquidation de la TVA · État récapitulatif TVA et enquête EMEBI · Comparaison UE / pays tiers | 4 | 1 | 0 |

### ici — Introduction au commerce international

Maquette d’Orléans · S5 · Isabelle Noël · catégorie Commerce international

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `ici.diagnostic` | Diagnostic et sélection des marchés | Diagnostic export interne · SWOT et facteurs clés de succès · Sélection des marchés : critères, grille de notation · Modèle d'Uppsala et distance psychique · Les « born global » | 5 | 2 | 1 |
| `ici.information` | Information sur les marchés | Sources d'information sur les marchés ; acteurs publics d'appui à l'export · Étude de marché documentaire et terrain | 4 | 1 | 0 |
| `ici.risque` | Risque pays | Risque pays : politique, économique, de transfert · Les classements de risque pays (lecture) | 3 | 1 | 0 |
| `ici.presence` | Modes de présence à l'international | Export indirect · Export direct · Agent commercial · Distributeur et concessionnaire · Licence et franchise · Joint-venture · Filiale et succursale · Arbitrage contrôle / engagement / risque | 8 | 2 | 1 |
| `ici.prospection` | Prospection | Salons, missions, VIE, prospection digitale · Plan de prospection | 3 | 1 | 0 |
| `ici.mix` | Marketing mix international | Standardisation ou adaptation · Produit et normes · Prix export : escalade des prix · Canaux de distribution · Communication internationale | 6 | 2 | 1 |

### tou — Introduction au tourisme international

Présence ou contenu à confirmer · sans semestre · enseignant non renseigné · catégorie Commerce international

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|

### dai — Droit des affaires internationales

Maquette d’Orléans · S5 · Isabelle Noël · catégorie Droit

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `dai.normes` | Sources et normes du commerce international | Sources du droit du commerce international · Traités, règlements et directives de l'UE · Soft law, lex mercatoria, usages, règles de la CCI · OMC : principes (nation la plus favorisée, traitement national), ORD | 6 | 2 | 0 |
| `dai.cvim` | La vente internationale (CVIM) | Champ d'application et exclusion · Offre et acceptation · Obligations du vendeur et de l'acheteur · Contravention essentielle et résolution · Remèdes et dommages-intérêts · Exonération (art. 79) | 8 | 2 | 1 |
| `dai.contrat` | Le contrat international | Clauses clés : prix, livraison, force majeure, hardship, réserve de propriété · Principes UNIDROIT | 3 | 1 | 0 |
| `dai.conflits` | Loi applicable et juridiction | Loi applicable : Rome I · Juridiction compétente : Bruxelles I bis, clause attributive · Distinguer loi applicable et juridiction | 5 | 1 | 1 |
| `dai.litiges` | Règlement des litiges | Négociation, médiation, conciliation · Arbitrage : clause compromissoire, institutions · Convention de New York et exécution des sentences · Exécution des jugements étrangers | 5 | 1 | 0 |
| `dai.distribution` | Distribution et concurrence | Statut de l'agent commercial (directive 86/653) · Droit de la concurrence de l'UE : ententes et restrictions verticales | 4 | 1 | 0 |

### dcl — Droit des contrats de la Common law

Maquette d’Orléans · S6 · Isabelle Noël · catégorie Droit

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `dcl.systemes` | Les systèmes juridiques | Civil law et common law · Stare decisis, ratio decidendi, obiter dictum · Equity et ses remèdes · Statute law et case law | 5 | 1 | 0 |
| `dcl.juridictions` | Organisation judiciaire | Organisation judiciaire anglaise et britannique · Organisation judiciaire américaine (fédéral / États) · Conséquences du Brexit : CJUE, reconnaissance des jugements, Conventions de La Haye 2005 et 2019 | 4 | 1 | 0 |
| `dcl.formation` | Formation du contrat | Offer et invitation to treat · Acceptance, mirror image rule, postal rule · Consideration et promissory estoppel · Intention to create legal relations · Capacité, deeds, forme écrite | 8 | 2 | 1 |
| `dcl.contenu` | Contenu du contrat | Express et implied terms · Conditions, warranties, innominate terms · Clauses d'exclusion et limites | 6 | 1 | 0 |
| `dcl.vices` | Vices du consentement | Misrepresentation · Mistake, duress, undue influence | 4 | 1 | 0 |
| `dcl.inexecution` | Inexécution et remèdes | Breach et discharge · Damages : expectation, remoteness (Hadley v Baxendale), mitigation · Specific performance et injunction · Privity of contract | 6 | 1 | 1 |
| `dcl.ucc` | Uniform Commercial Code | UCC article 2 : champ, battle of the forms | 3 | 1 | 0 |
| `dcl.lexique` | Vocabulaire juridique | Vocabulaire des contrats anglo-saxons | 3 | 1 | 1 |

### cpt — Comptabilité générale

Maquette d’Orléans · S5 · Isabelle Noël · catégorie Gestion

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `cpt.cadre` | Cadre comptable | Rôle et utilisateurs de la comptabilité · Principes comptables (prudence, permanence, image fidèle…) · Le PCG et les classes de comptes | 5 | 1 | 0 |
| `cpt.mecanisme` | Mécanismes comptables | Bilan et compte de résultat : structure · La partie double · Le fonctionnement débit / crédit des comptes · Le journal · Le grand livre · La balance | 6 | 1 | 0 |
| `cpt.tva` | La TVA | Mécanisme de la TVA, taux · Écritures de TVA collectée et déductible · Liquidation de la TVA à décaisser | 9 | 2 | 2 |
| `cpt.achats-ventes` | Achats et ventes | Facture d'achat et de vente · Réductions commerciales (RRR) et financières (escompte) · Frais accessoires, ports, emballages · Avoirs · Achats et ventes à l'international, TVA intracommunautaire · Opérations en devises et écarts de change | 12 | 3 | 3 |
| `cpt.tresorerie` | Trésorerie | Règlements : virement, chèque, espèces · Effets de commerce · Rapprochement bancaire | 7 | 2 | 2 |
| `cpt.personnel` | Charges de personnel | Brut, net, cotisations : écritures 421 / 431 / 641 / 645 | 4 | 1 | 1 |
| `cpt.investissements` | Investissements et amortissements | Acquisition d'immobilisations · Amortissement linéaire, plan d'amortissement · Amortissement dégressif · Cession d'immobilisations | 8 | 2 | 3 |
| `cpt.inventaire` | Travaux d'inventaire | Variation de stocks · Dépréciations (créances, stocks) · Provisions pour risques et charges · Charges et produits constatés d'avance, factures à recevoir ou à établir | 8 | 2 | 2 |
| `cpt.synthese` | Documents de synthèse | Établir le compte de résultat · Établir le bilan | 4 | 1 | 2 |

### gfi — Gestion financière

Maquette d’Orléans · S6 · Isabelle Noël · catégorie Gestion

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `gfi.bilan-fonctionnel` | Le bilan fonctionnel | Du bilan comptable au bilan fonctionnel · Retraitements usuels | 5 | 1 | 1 |
| `gfi.equilibre` | Équilibre financier | Fonds de roulement net global · Besoin en fonds de roulement : exploitation et hors exploitation · Trésorerie nette · Les six situations d'équilibre et de déséquilibre · Rentabilité et liquidité · Croissance et effet de ciseaux | 6 | 2 | 2 |
| `gfi.performance` | Analyse de l'activité | Soldes intermédiaires de gestion · Capacité d'autofinancement (méthodes additive et soustractive) | 6 | 2 | 1 |
| `gfi.ratios` | Les ratios | Ratios de structure et d'endettement · Ratios de liquidité · Délais clients, fournisseurs, rotation des stocks · Rentabilité économique et financière · Effet de levier | 7 | 2 | 2 |
| `gfi.diagnostic` | Diagnostic financier | Méthode du diagnostic financier rédigé | 2 | 1 | 1 |
| `gfi.financement` | Financement | Découvert, escompte, affacturage, Dailly · Emprunt, crédit-bail, augmentation de capital | 5 | 2 | 2 |

### odg — Outils de gestion

Maquette d’Orléans · S6 · Isabelle Noël · catégorie Gestion

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `odg.couts` | Coûts et rentabilité | Charges fixes et variables · Marge sur coût variable, taux de marge · Seuil de rentabilité, point mort, marge de sécurité · Levier opérationnel · Coûts complets, centres d'analyse · Méthode ABC (Activity-Based Costing) | 8 | 2 | 2 |
| `odg.stocks` | Gestion des stocks | Valorisation des stocks : CMUP, FIFO · Quantité économique de commande (Wilson / Harris) · Stock d'alerte, stock de sécurité · Méthode ABC / Pareto (20 / 80) | 6 | 1 | 2 |
| `odg.prevision` | Prévision | Ajustement linéaire (moindres carrés) · Coefficients saisonniers | 4 | 1 | 1 |
| `odg.budget` | Budgets et écarts | Budgets et prévisions · Analyse des écarts | 5 | 1 | 2 |
| `odg.pilotage` | Pilotage et tableau de bord | Choisir des indicateurs (KPI) · Construire un tableau de bord · Balanced scorecard | 4 | 1 | 1 |

### mgi — Management interculturel

Maquette d’Orléans · S6 · Isabelle Noël · catégorie Management

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `mgi.fondements` | Fondements | Définir la culture : niveaux, stéréotype, préjugé · Ce qu'une grille peut et ne peut pas dire | 3 | 1 | 0 |
| `mgi.grilles` | Les grilles d'analyse | Les 6 dimensions de Hofstede · Critiques de Hofstede · Hall : contexte, temps, espace · Trompenaars et Hampden-Turner : 7 dilemmes · Choisir la grille adaptée à un cas | 7 | 2 | 1 |
| `mgi.management` | Management | Culture et pratiques managériales · Équipes multiculturelles et à distance · Expatriation, choc culturel | 4 | 1 | 0 |
| `mgi.negociation` | Négociation internationale | Phases de la négociation · Styles de négociation et culture · BATNA, ZOPA, concessions | 6 | 1 | 1 |

### gdp — Gestion de projet

Maquette d’Orléans · S5 · Sonia Tesson · catégorie Management

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `gdp.cadrage` | Cadrage | Projet et triangle QCD · Charte, cahier des charges · Objectifs SMART · Parties prenantes, matrice pouvoir / intérêt | 5 | 2 | 0 |
| `gdp.organisation` | Organisation | WBS · Matrice RACI | 4 | 1 | 0 |
| `gdp.planification` | Planification | Tableau des antériorités · Réseau PERT · Méthode MPM · Dates au plus tôt / au plus tard, marges totale et libre · Chemin critique · Diagramme de Gantt · Durées PERT à trois estimations | 7 | 2 | 1 |
| `gdp.pilotage` | Pilotage et clôture | Gestion des risques : éviter, réduire, transférer, accepter · Budget de projet · Valeur acquise · Méthodes agiles · Clôture, retour d'expérience | 6 | 2 | 1 |

### red — Rédaction de documents universitaires

Maquette d’Orléans · S5 · Sonia Tesson · catégorie Méthodologie

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `red.sources` | Sources | Types et fiabilité des sources · Recherche documentaire | 3 | 1 | 0 |
| `red.argumentation` | Argumentation | Problématique · Plan · Paragraphe argumentatif · Introduction et conclusion · Note de synthèse | 5 | 2 | 1 |
| `red.attribution` | Citer et référencer | Citation, paraphrase · Plagiat · Normes bibliographiques (norme à confirmer) | 3 | 1 | 0 |

### aec — Anglais économique et commercial

Maquette d’Orléans · S5 + S6 · Alice Michel · catégorie Anglais

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `aec.correspondance` | Business correspondence | Business letter layout · Salutations and complimentary closes · Register and softening · Enquiry (request for information) · Offer and quotation · Order and acknowledgement · Complaint and reply · Payment reminders · Professional e-mail | 9 | 2 | 1 |
| `aec.lexique` | Vocabulary | Company vocabulary · Finance and accounting in English · International trade vocabulary · Marketing vocabulary · Economics vocabulary · False friends in business English · Numbers and trends | 8 | 2 | 1 |
| `aec.presse` | The business press | Reading a business article in English · Writing a synthesis in English | 3 | 1 | 0 |
| `aec.grammaire` | Useful grammar | Modal verbs · The passive voice · Conditionals · Present perfect and simple past | 5 | 1 | 0 |

### tra — Traduction anglaise : thème et version

Maquette d’Orléans · S5 · Alice Michel · catégorie Anglais

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `tra.procedes` | Procédés de traduction | Procédés directs : emprunt, calque, traduction littérale · Procédés obliques : transposition, modulation, équivalence, adaptation | 5 | 1 | 0 |
| `tra.contrastes` | Contrastes français / anglais | Nominalisation et verbalisation · Temps et aspects · Articles et déterminants · Les formes en -ing · Le passif · Prépositions et particules · Ordre des mots, chassé-croisé | 7 | 2 | 0 |
| `tra.pratique` | Pratique et méthode | La version · Le thème · Titres de presse · Faux amis · Nombres · Méthode d'épreuve | 6 | 2 | 2 |

### cea — Compréhension et expression anglaises

Maquette d’Orléans · S6 · Elodie Gallet · catégorie Anglais

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `cea.oral` | Spoken English | Weak forms · Linking and assimilation · Accents of English | 4 | 1 | 0 |
| `cea.methode` | Listening method | Global then focused listening · Note-taking · Restitution: the report | 3 | 1 | 0 |
| `cea.expression` | Speaking | Giving an oral presentation in English · Spoken interaction in English | 3 | 1 | 0 |

### eec — Espagnol économique et commercial

Maquette d’Orléans · S5 + S6 · Claire Decobert · catégorie Espagnol

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `eec.correspondencia` | Correspondencia comercial | La estructura de la carta comercial · Usted, subjuntivo y condicional de cortesía · El ciclo comercial: consulta, presupuesto, pedido, albarán, factura · La reclamación · El correo electrónico profesional en español | 6 | 1 | 1 |
| `eec.lexico` | Léxico | El vocabulario de la empresa en español · Finanzas y contabilidad en español · El vocabulario del comercio exterior en español · Los falsos amigos francés-español en el ámbito profesional | 4 | 1 | 0 |
| `eec.economia` | Economía | Los sectores de la economía española · Hitos: Plan de Estabilización de 1959, ingreso en la CEE en 1986, euro · Las economías latinoamericanas · Mercosur, Alianza del Pacífico y acuerdos con la UE | 6 | 2 | 0 |
| `eec.escritos` | Escritos profesionales | El informe en español · El CV en español | 2 | 1 | 0 |

### tve — Thème et version espagnols

Maquette d’Orléans · S5 + S6 · Annie Baccon, Sylvie Fournié-Chaboche · catégorie Espagnol

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `tve.contrastes` | Contrastes français / espagnol | Le calque · Ser et estar · Por et para · Le subjonctif · Concordance des temps · La a personal · Verbes du type gustar · Traduire « on » · Périphrases verbales · Pronoms et enclise | 11 | 2 | 0 |
| `tve.lexico` | Lexique et registre | Faux amis · Registre | 3 | 1 | 0 |
| `tve.metodo` | Méthode | Le thème · La version · Le journal d'erreurs | 3 | 1 | 2 |

### cvb — Civilisation britannique : the UK since 1945

Maquette d’Orléans · S5 · Karine Rivière de Franco · catégorie Civilisations

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `cvb.institutions` | Institutions | Parliament and government · Parties and the electoral system | 2 | 1 | 0 |
| `cvb.welfare` | The Welfare State | The Beveridge Report (1942) · Attlee and the Welfare State: the NHS · Nationalisation | 3 | 1 | 0 |
| `cvb.consensus` | Consensus and crisis | The post-war consensus ("Butskellism") · Relative decline and "stop-go" · The United Kingdom and Europe (1973, 1975) · The crisis of the 1970s and the Winter of Discontent | 4 | 1 | 0 |
| `cvb.thatcher` | Thatcherism | Monetarism · Privatisation · The trade unions and the miners' strike · The Big Bang in the City (1986) · The poll tax and Thatcher's downfall | 5 | 1 | 0 |
| `cvb.new-labour` | From Major to New Labour | The Major government (1990-1997) · New Labour and the Third Way · Devolution · The Good Friday Agreement (1998) | 4 | 1 | 0 |
| `cvb.methode` | Method | The British civilisation document commentary | 2 | 1 | 1 |

### cve — Civilisation espagnole

Maquette d’Orléans · S5 · Claire Decobert · catégorie Civilisations

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `cve.franquismo` | El franquismo | La herencia franquista | 2 | 1 | 0 |
| `cve.transicion` | La Transición | La Ley para la Reforma Política (1976) · Las elecciones de 1977 y la legalización del PCE · Los Pactos de la Moncloa (1977) · La Constitución de 1978 | 4 | 1 | 0 |
| `cve.consolidacion` | La consolidación democrática | El 23-F (1981) · Los gobiernos de González, la entrada en la CEE y 1992 · Los gobiernos de Aznar y el euro · El 11-M (2004) | 8 | 3 | 1 |
| `cve.autonomias` | El Estado de las autonomías | El Estado de las autonomías · La cuestión catalana (2006-2017) · El País Vasco y ETA | 6 | 3 | 0 |
| `cve.actualidad` | España desde 2008 | La crisis de 2008 y el fin del bipartidismo | 3 | 1 | 0 |
| `cve.metodo` | Método | El comentario de texto histórico | 2 | 1 | 1 |

### cva — Civilisation américaine : publicité et marketing

Maquette d’Orléans · S6 · Eric Tabuteau · catégorie Civilisations

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `cva.naissance` | The birth of advertising | Mass production and the birth of modern advertising · The agencies: Ayer, Lasker, Hopkins and reason-why · Bernays and public relations | 6 | 3 | 0 |
| `cva.mesure` | Measurement | Gallup, Nielsen and market research | 2 | 1 | 0 |
| `cva.age-or` | The golden age | Television and the Unique Selling Proposition · The creative revolution of the 1960s | 4 | 2 | 0 |
| `cva.regulation` | Regulation | Regulating advertising: the FTC and tobacco | 3 | 1 | 0 |
| `cva.contemporain` | The contemporary era | Audience segmentation · Digital advertising and personal data | 4 | 2 | 0 |
| `cva.methode` | Method | Analyzing an advertisement | 3 | 1 | 1 |

### cvl — Civilisation latino-américaine

Présence ou contenu à confirmer · S6 · Marcos Eymar · catégorie Civilisations

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `cvl.urbanizacion` | Urbanización | El éxodo rural · Las metrópolis latinoamericanas | 4 | 2 | 0 |
| `cvl.informalidad` | Informalidad | Favelas, villas, barriadas: los barrios informales · La economía informal | 4 | 2 | 0 |
| `cvl.fracturas` | Fracturas urbanas | Segregación y barrios cerrados · La violencia urbana | 4 | 2 | 0 |
| `cvl.politicas` | Políticas urbanas | Medellín y el urbanismo social · Otros casos: Bogotá y Curitiba | 4 | 2 | 0 |
| `cvl.representaciones` | Representaciones | El cine de la ciudad latinoamericana · Analizar una imagen o una secuencia de película | 4 | 2 | 1 |

### stg — Stage et rapport de stage

Maquette d’Orléans · S6 · Aline Henninger, Mayumi Shimosakai · catégorie Méthodologie

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `stg.cadre` | Cadre du stage | Objectifs et types de stage · Convention, gratification, assurance | 5 | 1 | 1 |
| `stg.recherche` | Recherche de stage | CV et lettre de motivation | 2 | 1 | 0 |
| `stg.rapport` | Le rapport | Problématique de gestion ou de langues · Structure du rapport · Note de synthèse · Forme du rapport · Erreurs courantes | 7 | 2 | 1 |
| `stg.soutenance` | La soutenance | Préparer la soutenance | 2 | 1 | 0 |
| `stg.evaluation` | Évaluation | Barème | 3 | 1 | 1 |

### eco — Économie internationale

Complément hors maquette · sans semestre · enseignant non renseigné · catégorie Compléments

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `eco.theories` | Théories du commerce international | Avantage absolu (Smith) · Avantage comparatif (Ricardo) · Le modèle HOS · Nouvelles théories du commerce international | 7 | 3 | 1 |
| `eco.mesure` | Mesurer les échanges | Balance des paiements · Termes de l'échange, taux de couverture | 5 | 2 | 1 |
| `eco.change` | Le change | Taux de change, régimes | 4 | 1 | 1 |
| `eco.politique` | Politiques commerciales | Libre-échange et protectionnisme · Intégration régionale · Chaînes de valeur mondiales | 7 | 3 | 0 |

### mks — Marketing international et supply chain

Complément hors maquette · sans semestre · enseignant non renseigné · catégorie Compléments

| Chapitre | Titre | Notions | QCM | Flashcards | Exercices |
|---|---|---|---|---|---|
| `mks.marketing` | Marketing international | Segmentation, ciblage, positionnement · Marketing digital à l'international | 6 | 2 | 1 |
| `mks.supply` | Supply chain | La chaîne logistique · Entreposage, stocks, plateformes | 6 | 2 | 1 |

## Autres sources présentes dans le dépôt

| Emplacement | Contenu | Relié à l'application |
|---|---|---|
| `archive/ancien-site/` | 19 fiches HTML (une par discipline, numérotées 01 à 19) et `00-master-plan.html` | Non. Publié en l'état sur GitHub Pages sous `/archive/ancien-site/` |
| Branche locale `archive/master-plans` | Historique de l'ancien site (15 commits) | Non |
| `content/sources.json` | 104 références (1 lue, 2 consultées par extrait, 101 références non consultées) | Oui (fiches) |

L'ancien site ne couvre pas : stage (stg), économie internationale (eco), marketing et supply chain (mks).
