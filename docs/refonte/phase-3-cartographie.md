# Phase 3 — Cartographie des matières, chapitres et notions

Chaque **notion** deviendra une fiche autonome, avec ses QCM, ses flashcards et ses exercices.

**Identifiants stables** : `matière.chapitre.notion`, en minuscules, avec tirets. Exemple : `tci.incoterms.transfert-risque`. Une fois publiés, ils ne changent plus : la progression enregistrée y est rattachée.

**Statut de chaque matière dans la maquette** :

- **[ORL]** EC confirmé dans la maquette d'Orléans ;
- **[ORL?]** présence ou contenu à confirmer ;
- **[COMP]** complément utile, hors maquette d'Orléans, signalé comme tel dans l'application.

**Niveau de chaque notion** :

- **P** : prérequis (révision de L1-L2) ;
- **F** : fondamental L3 ;
- **A** : avancé L3.

Les prérequis entre notions sont notés `← id`.

**Volume** : 22 matières, environ 330 notions.

---

## 1. Techniques du commerce international — `tci` [ORL] S5 + S6

**`tci.operation`** — L'opération d'import-export

- `tci.operation.acteurs` — Les acteurs : vendeur, acheteur, transporteur, commissionnaire, transitaire, banques, douane, assureur (F)
- `tci.operation.flux` — Flux physique, documentaire et financier (F)
- `tci.operation.offre-export` — L'offre et la facture pro forma (F)
- `tci.operation.facture-commerciale` — La facture commerciale internationale : mentions (F)

**`tci.incoterms`** — Incoterms® 2020

- `tci.incoterms.fonction` — Fonction et nature contractuelle des Incoterms (F) ← `dai.normes.soft-law`
- `tci.incoterms.familles` — Les 4 familles E, F, C, D et les 2 catégories (tous modes / maritime) (F)
- `tci.incoterms.transfert-risque` — Le point de transfert des risques (F)
- `tci.incoterms.repartition-couts` — Le point de transfert des frais (F)
- `tci.incoterms.dissociation-c` — La règle des deux points critiques dans la famille C (A)
- `tci.incoterms.exw` — EXW (F)
- `tci.incoterms.fca` — FCA, y compris le connaissement « à bord » (F)
- `tci.incoterms.fas-fob` — FAS et FOB (F)
- `tci.incoterms.cfr-cif` — CFR et CIF (F)
- `tci.incoterms.cpt-cip` — CPT et CIP (F)
- `tci.incoterms.dap-dpu-ddp` — DAP, DPU et DDP (F)
- `tci.incoterms.assurance` — Obligations d'assurance : CIF en clause C, CIP en clause A (F)
- `tci.incoterms.dedouanement` — Qui dédouane à l'export et à l'import (F)
- `tci.incoterms.chargement-dechargement` — Chargement et déchargement selon la règle (A)
- `tci.incoterms.choix` — Choisir un Incoterm : critères et erreurs (A)
- `tci.incoterms.redaction` — Rédiger la clause : règle, lieu précis, version (F)
- `tci.incoterms.vs-propriete` — Incoterm, transfert de propriété et contrat de vente (A) ← `dai.cvim.champ`
- `tci.incoterms.cas` — Études de cas (A)

**`tci.transport`** — Transport international

- `tci.transport.choix-mode` — Choisir un mode : coût, délai, sécurité, nature de la marchandise (F)
- `tci.transport.maritime` — Transport maritime : lignes régulières, tramping, conteneurs EVP, FCL / LCL (F)
- `tci.transport.fret-maritime` — Calcul du fret maritime : unité payante, BAF, CAF, THC (A)
- `tci.transport.aerien` — Transport aérien : LTA / AWB, poids taxable (rapport 1/6) (F)
- `tci.transport.routier` — Transport routier : lettre de voiture CMR (F)
- `tci.transport.ferroviaire` — Transport ferroviaire : lettre de voiture CIM (F)
- `tci.transport.multimodal` — Transport multimodal et commissionnaire de transport (F)
- `tci.transport.responsabilite` — Responsabilité et limites d'indemnisation du transporteur (A)
- `tci.transport.emballage-marquage` — Emballage, marquage, colisage (F)

**`tci.documents`** — Documents du commerce international

- `tci.documents.connaissement` — Le connaissement : fonctions, titre de propriété (F)
- `tci.documents.connaissement-net-clause` — Connaissement net ou clausé ; connaissement à ordre, nominatif, au porteur (A)
- `tci.documents.autres-transport` — Sea waybill, LTA, CMR, CIM : non négociables (F)
- `tci.documents.liste-colisage` — Liste de colisage et certificats (origine, sanitaire, inspection) (F)
- `tci.documents.coherence` — Cohérence documentaire (A)

**`tci.paiement`** — Paiements internationaux

- `tci.paiement.risques` — Risque de non-paiement, risque pays, risque de change (F) ← `ici.risque.risque-pays`
- `tci.paiement.instruments-vs-techniques` — Instruments (virement, chèque, effet) et techniques (encaissement simple, remise, crédit) (F)
- `tci.paiement.virement-swift` — Virement SWIFT, IBAN / BIC (F)
- `tci.paiement.lettre-change` — Lettre de change et billet à ordre (F)
- `tci.paiement.remise-documentaire` — Remise documentaire D/P et D/A (URC 522) (F)
- `tci.paiement.credit-documentaire` — Le crédit documentaire : mécanisme et acteurs (F) ← `tci.documents.connaissement`
- `tci.paiement.credoc-types` — Révocable / irrévocable ; notifié / confirmé (F)
- `tci.paiement.credoc-realisation` — Réalisation : à vue, paiement différé, acceptation, négociation (A)
- `tci.paiement.credoc-conformite` — Examen des documents, réserves, autonomie (A)
- `tci.paiement.garanties` — Garanties bancaires et lettre de crédit stand-by (A)
- `tci.paiement.choix` — Choisir une technique de paiement selon le risque (A)

**`tci.change`** — Risque de change

- `tci.change.notion` — Cours au comptant et à terme, cotation (F)
- `tci.change.couverture-terme` — Couverture à terme (A)
- `tci.change.options` — Options de change (A)
- `tci.change.techniques-internes` — Facturation en devise nationale, termaillage (A)

**`tci.assurance`** — Assurances

- `tci.assurance.transport` — Assurance transport : police, clauses ICC A / B / C (F)
- `tci.assurance.avaries` — Avaries particulières et avarie commune (A)
- `tci.assurance.reserves` — Réserves à la livraison et recours (F)
- `tci.assurance.credit` — Assurance-crédit export (A)

**`tci.douane`** — Douane

- `tci.douane.role` — Rôle de la douane, union douanière de l'UE (F)
- `tci.douane.espece` — Espèce tarifaire : SH, NC, TARIC (F)
- `tci.douane.origine` — Origine préférentielle et non préférentielle (A)
- `tci.douane.valeur` — Valeur en douane (valeur transactionnelle, ajustements) (F) ← `tci.incoterms.repartition-couts`
- `tci.douane.calcul-droits-tva` — Calcul des droits et de la TVA à l'importation (F)
- `tci.douane.declaration` — Déclaration en douane, EORI, statut OEA (F)
- `tci.douane.regimes-particuliers` — Entrepôt, perfectionnement actif / passif, admission temporaire, transit (A)

**`tci.intra-ue`** — Échanges intracommunautaires

- `tci.intra-ue.livraison-acquisition` — Livraison et acquisition intracommunautaires (F) ← `cpt.tva.mecanisme`
- `tci.intra-ue.autoliquidation` — Autoliquidation de la TVA (F)
- `tci.intra-ue.declarations` — État récapitulatif TVA et enquête EMEBI (F)
- `tci.intra-ue.vs-pays-tiers` — Comparaison UE / pays tiers (A)

## 2. Introduction au commerce international — `ici` [ORL] S5

Descriptif officiel non trouvé : le contenu ci-dessous est à confirmer.

**`ici.diagnostic`**

- `ici.diagnostic.interne` — Diagnostic export interne (F)
- `ici.diagnostic.swot` — SWOT et facteurs clés de succès (F)
- `ici.diagnostic.selection-marches` — Sélection des marchés : critères, grille de notation (F)
- `ici.diagnostic.uppsala` — Modèle d'Uppsala et distance psychique (A)
- `ici.diagnostic.born-global` — Les « born global » (A)

**`ici.information`**

- `ici.information.sources` — Sources d'information sur les marchés ; acteurs publics d'appui à l'export (F)
- `ici.information.etude-marche` — Étude de marché documentaire et terrain (F)

**`ici.risque`**

- `ici.risque.risque-pays` — Risque pays : politique, économique, de transfert (F)
- `ici.risque.notation` — Les classements de risque pays (lecture) (F)

**`ici.presence`**

- `ici.presence.export-indirect` — Export indirect (F)
- `ici.presence.export-direct` — Export direct (F)
- `ici.presence.agent-commercial` — Agent commercial (F)
- `ici.presence.distributeur` — Distributeur et concessionnaire (F)
- `ici.presence.licence-franchise` — Licence et franchise (F)
- `ici.presence.joint-venture` — Joint-venture (F)
- `ici.presence.filiale` — Filiale et succursale (F)
- `ici.presence.choix` — Arbitrage contrôle / engagement / risque (A)

**`ici.prospection`**

- `ici.prospection.outils` — Salons, missions, VIE, prospection digitale (F)
- `ici.prospection.plan` — Plan de prospection (A)

**`ici.mix`**

- `ici.mix.standardisation-adaptation` — Standardisation ou adaptation (F)
- `ici.mix.produit` — Produit et normes (F)
- `ici.mix.prix-export` — Prix export : escalade des prix (A) ← `tci.incoterms.repartition-couts`
- `ici.mix.distribution` — Canaux de distribution (F)
- `ici.mix.communication` — Communication internationale (F)

## 3. Droit des affaires internationales — `dai` [ORL] S5

Descriptif officiel non trouvé : le contenu ci-dessous est à confirmer.

**`dai.normes`**

- `dai.normes.sources` — Sources du droit du commerce international (F)
- `dai.normes.hard-law` — Traités, règlements et directives de l'UE (F)
- `dai.normes.soft-law` — Soft law, lex mercatoria, usages, règles de la CCI (F)
- `dai.normes.omc` — OMC : principes (nation la plus favorisée, traitement national), ORD (F)

**`dai.cvim`**

- `dai.cvim.champ` — Champ d'application et exclusion (F)
- `dai.cvim.formation` — Offre et acceptation (A)
- `dai.cvim.obligations` — Obligations du vendeur et de l'acheteur (F)
- `dai.cvim.contravention-essentielle` — Contravention essentielle et résolution (A)
- `dai.cvim.remedes` — Remèdes et dommages-intérêts (A)
- `dai.cvim.exoneration` — Exonération (art. 79) (A)

**`dai.contrat`**

- `dai.contrat.clauses` — Clauses clés : prix, livraison, force majeure, hardship, réserve de propriété (F)
- `dai.contrat.unidroit` — Principes UNIDROIT (A)

**`dai.conflits`**

- `dai.conflits.loi-applicable` — Loi applicable : Rome I (F)
- `dai.conflits.juridiction` — Juridiction compétente : Bruxelles I bis, clause attributive (F)
- `dai.conflits.distinction` — Distinguer loi applicable et juridiction (F)

**`dai.litiges`**

- `dai.litiges.modes-amiables` — Négociation, médiation, conciliation (F)
- `dai.litiges.arbitrage` — Arbitrage : clause compromissoire, institutions (F)
- `dai.litiges.new-york` — Convention de New York et exécution des sentences (A)
- `dai.litiges.exequatur` — Exécution des jugements étrangers (A)

**`dai.distribution`**

- `dai.distribution.agent` — Statut de l'agent commercial (directive 86/653) (A)
- `dai.distribution.concurrence` — Droit de la concurrence de l'UE : ententes et restrictions verticales (A)

## 4. Droit des contrats de la Common law — `dcl` [ORL] S6

Le descriptif officiel est confirmé.

**`dcl.systemes`**

- `dcl.systemes.civil-common` — Civil law et common law (F)
- `dcl.systemes.precedent` — Stare decisis, ratio decidendi, obiter dictum (F)
- `dcl.systemes.equity` — Equity et ses remèdes (F)
- `dcl.systemes.statutes` — Statute law et case law (F)

**`dcl.juridictions`**

- `dcl.juridictions.angleterre` — Organisation judiciaire anglaise et britannique (F)
- `dcl.juridictions.usa` — Organisation judiciaire américaine (fédéral / États) (F)
- `dcl.juridictions.brexit` — Conséquences du Brexit : CJUE, reconnaissance des jugements, Conventions de La Haye 2005 et 2019 (A)

**`dcl.formation`**

- `dcl.formation.offer` — Offer et invitation to treat (F)
- `dcl.formation.acceptance` — Acceptance, mirror image rule, postal rule (F)
- `dcl.formation.consideration` — Consideration et promissory estoppel (F)
- `dcl.formation.intention` — Intention to create legal relations (F)
- `dcl.formation.capacity-formalities` — Capacité, deeds, forme écrite (A)

**`dcl.contenu`**

- `dcl.contenu.terms` — Express et implied terms (F)
- `dcl.contenu.classification` — Conditions, warranties, innominate terms (A)
- `dcl.contenu.exclusion` — Clauses d'exclusion et limites (A)

**`dcl.vices`**

- `dcl.vices.misrepresentation` — Misrepresentation (A)
- `dcl.vices.mistake-duress` — Mistake, duress, undue influence (A)

**`dcl.inexecution`**

- `dcl.inexecution.breach` — Breach et discharge (F)
- `dcl.inexecution.damages` — Damages : expectation, remoteness (Hadley v Baxendale), mitigation (A)
- `dcl.inexecution.equitable` — Specific performance et injunction (A)
- `dcl.inexecution.privity` — Privity of contract (A)

**`dcl.ucc`**

- `dcl.ucc.article2` — UCC article 2 : champ, battle of the forms (A)

**`dcl.lexique`**

- `dcl.lexique.contrat-anglais` — Vocabulaire des contrats anglo-saxons (F)

## 5. Comptabilité générale — `cpt` [ORL] S5

**`cpt.cadre`**

- `cpt.cadre.role` — Rôle et utilisateurs de la comptabilité (P)
- `cpt.cadre.principes` — Principes comptables (prudence, permanence, image fidèle…) (F)
- `cpt.cadre.pcg` — Le PCG et les classes de comptes (F)

**`cpt.mecanisme`**

- `cpt.mecanisme.bilan-resultat` — Bilan et compte de résultat : structure (F)
- `cpt.mecanisme.partie-double` — La partie double (F)
- `cpt.mecanisme.debit-credit` — Le fonctionnement débit / crédit des comptes (F)
- `cpt.mecanisme.journal` — Le journal (F)
- `cpt.mecanisme.grand-livre` — Le grand livre (F)
- `cpt.mecanisme.balance` — La balance (F)

**`cpt.tva`**

- `cpt.tva.mecanisme` — Mécanisme de la TVA, taux (F)
- `cpt.tva.ecritures` — Écritures de TVA collectée et déductible (F)
- `cpt.tva.declaration` — Liquidation de la TVA à décaisser (F)

**`cpt.achats-ventes`**

- `cpt.achats-ventes.factures` — Facture d'achat et de vente (F)
- `cpt.achats-ventes.reductions` — Réductions commerciales (RRR) et financières (escompte) (F)
- `cpt.achats-ventes.frais-accessoires` — Frais accessoires, ports, emballages (A)
- `cpt.achats-ventes.avoirs` — Avoirs (F)
- `cpt.achats-ventes.international` — Achats et ventes à l'international, TVA intracommunautaire (A) ← `tci.intra-ue.livraison-acquisition`
- `cpt.achats-ventes.devises` — Opérations en devises et écarts de change (A)

**`cpt.tresorerie`**

- `cpt.tresorerie.reglements` — Règlements : virement, chèque, espèces (F)
- `cpt.tresorerie.effets` — Effets de commerce (A)
- `cpt.tresorerie.rapprochement` — Rapprochement bancaire (A)

**`cpt.personnel`**

- `cpt.personnel.paie` — Brut, net, cotisations : écritures 421 / 431 / 641 / 645 (F)

**`cpt.investissements`**

- `cpt.investissements.immobilisations` — Acquisition d'immobilisations (F)
- `cpt.investissements.amortissement-lineaire` — Amortissement linéaire, plan d'amortissement (F)
- `cpt.investissements.amortissement-degressif` — Amortissement dégressif (A)
- `cpt.investissements.cessions` — Cession d'immobilisations (A)

**`cpt.inventaire`**

- `cpt.inventaire.stocks` — Variation de stocks (F)
- `cpt.inventaire.depreciations` — Dépréciations (créances, stocks) (F)
- `cpt.inventaire.provisions` — Provisions pour risques et charges (A)
- `cpt.inventaire.regularisations` — Charges et produits constatés d'avance, factures à recevoir ou à établir (A)

**`cpt.synthese`**

- `cpt.synthese.compte-resultat` — Établir le compte de résultat (F)
- `cpt.synthese.bilan` — Établir le bilan (F)

## 6. Gestion financière — `gfi` [ORL] S6

Le descriptif officiel est confirmé.

**`gfi.bilan-fonctionnel`**

- `gfi.bilan-fonctionnel.reclassement` — Du bilan comptable au bilan fonctionnel (F) ← `cpt.synthese.bilan`
- `gfi.bilan-fonctionnel.retraitements` — Retraitements usuels (A)

**`gfi.equilibre`**

- `gfi.equilibre.frng` — Fonds de roulement net global (F)
- `gfi.equilibre.bfr` — Besoin en fonds de roulement : exploitation et hors exploitation (F)
- `gfi.equilibre.tresorerie-nette` — Trésorerie nette (F)
- `gfi.equilibre.situations` — Les six situations d'équilibre et de déséquilibre (A)
- `gfi.equilibre.rentabilite-vs-liquidite` — Rentabilité et liquidité (F)
- `gfi.equilibre.effet-ciseaux` — Croissance et effet de ciseaux (A)

**`gfi.performance`**

- `gfi.performance.sig` — Soldes intermédiaires de gestion (F) ← `cpt.synthese.compte-resultat`
- `gfi.performance.caf` — Capacité d'autofinancement (méthodes additive et soustractive) (F)

**`gfi.ratios`**

- `gfi.ratios.structure` — Ratios de structure et d'endettement (F)
- `gfi.ratios.liquidite` — Ratios de liquidité (F)
- `gfi.ratios.rotation` — Délais clients, fournisseurs, rotation des stocks (F)
- `gfi.ratios.rentabilite` — Rentabilité économique et financière (F)
- `gfi.ratios.levier` — Effet de levier (A)

**`gfi.diagnostic`**

- `gfi.diagnostic.methode` — Méthode du diagnostic financier rédigé (A)

**`gfi.financement`**

- `gfi.financement.court-terme` — Découvert, escompte, affacturage, Dailly (F)
- `gfi.financement.long-terme` — Emprunt, crédit-bail, augmentation de capital (F)

## 7. Outils de gestion — `odg` [ORL] S6

Le descriptif officiel (tableau de bord) est confirmé ; le reste est à confirmer.

**`odg.couts`**

- `odg.couts.fixes-variables` — Charges fixes et variables (F)
- `odg.couts.mcv` — Marge sur coût variable, taux de marge (F)
- `odg.couts.seuil` — Seuil de rentabilité, point mort, marge de sécurité (F)
- `odg.couts.levier-operationnel` — Levier opérationnel (A)
- `odg.couts.couts-complets` — Coûts complets, centres d'analyse (A)
- `odg.couts.abc` — Méthode ABC (Activity-Based Costing) (A)

**`odg.stocks`**

- `odg.stocks.valorisation` — Valorisation des stocks : CMUP, FIFO (F)
- `odg.stocks.wilson` — Quantité économique de commande (Wilson / Harris) (F)
- `odg.stocks.point-commande` — Stock d'alerte, stock de sécurité (F)
- `odg.stocks.pareto` — Méthode ABC / Pareto (20 / 80) (F)

**`odg.prevision`**

- `odg.prevision.moindres-carres` — Ajustement linéaire (moindres carrés) (A)
- `odg.prevision.saisonnalite` — Coefficients saisonniers (A)

**`odg.budget`**

- `odg.budget.budgets` — Budgets et prévisions (F)
- `odg.budget.ecarts` — Analyse des écarts (A)

**`odg.pilotage`**

- `odg.pilotage.indicateurs` — Choisir des indicateurs (KPI) (F)
- `odg.pilotage.tableau-de-bord` — Construire un tableau de bord (F)
- `odg.pilotage.balanced-scorecard` — Balanced scorecard (A)

## 8. Management interculturel — `mgi` [ORL] S6

Le descriptif officiel est confirmé.

**`mgi.fondements`**

- `mgi.fondements.culture` — Définir la culture : niveaux, stéréotype, préjugé (F)
- `mgi.fondements.limites` — Ce qu'une grille peut et ne peut pas dire (F)

**`mgi.grilles`**

- `mgi.grilles.hofstede` — Les 6 dimensions de Hofstede (F)
- `mgi.grilles.hofstede-critiques` — Critiques de Hofstede (A)
- `mgi.grilles.hall` — Hall : contexte, temps, espace (F)
- `mgi.grilles.trompenaars` — Trompenaars et Hampden-Turner : 7 dilemmes (F)
- `mgi.grilles.comparer` — Choisir la grille adaptée à un cas (A)

**`mgi.management`**

- `mgi.management.pratiques` — Culture et pratiques managériales (F)
- `mgi.management.equipes` — Équipes multiculturelles et à distance (F)
- `mgi.management.expatriation` — Expatriation, choc culturel (A)

**`mgi.negociation`**

- `mgi.negociation.phases` — Phases de la négociation (F)
- `mgi.negociation.styles` — Styles de négociation et culture (F)
- `mgi.negociation.batna` — BATNA, ZOPA, concessions (A)

## 9. Gestion de projet — `gdp` [ORL] S5

**`gdp.cadrage`**

- `gdp.cadrage.projet` — Projet et triangle QCD (F)
- `gdp.cadrage.charte` — Charte, cahier des charges (F)
- `gdp.cadrage.smart` — Objectifs SMART (F)
- `gdp.cadrage.parties-prenantes` — Parties prenantes, matrice pouvoir / intérêt (F)

**`gdp.organisation`**

- `gdp.organisation.wbs` — WBS (F)
- `gdp.organisation.raci` — Matrice RACI (F)

**`gdp.planification`**

- `gdp.planification.anteriorites` — Tableau des antériorités (F)
- `gdp.planification.pert` — Réseau PERT (F)
- `gdp.planification.mpm` — Méthode MPM (A)
- `gdp.planification.dates-marges` — Dates au plus tôt / au plus tard, marges totale et libre (A)
- `gdp.planification.chemin-critique` — Chemin critique (F)
- `gdp.planification.gantt` — Diagramme de Gantt (F)
- `gdp.planification.pert-probabiliste` — Durées PERT à trois estimations (A)

**`gdp.pilotage`**

- `gdp.pilotage.risques` — Gestion des risques : éviter, réduire, transférer, accepter (F)
- `gdp.pilotage.budget` — Budget de projet (F)
- `gdp.pilotage.valeur-acquise` — Valeur acquise (A)
- `gdp.pilotage.agile` — Méthodes agiles (A)
- `gdp.pilotage.cloture` — Clôture, retour d'expérience (F)

## 10. Rédaction de documents universitaires — `red` [ORL] S5

**`red.sources`**

- `red.sources.typologie` — Types et fiabilité des sources (F)
- `red.sources.recherche` — Recherche documentaire (F)

**`red.argumentation`**

- `red.argumentation.problematique` — Problématique (F)
- `red.argumentation.plan` — Plan (F)
- `red.argumentation.paragraphe` — Paragraphe argumentatif (F)
- `red.argumentation.intro-conclusion` — Introduction et conclusion (F)
- `red.argumentation.note-synthese` — Note de synthèse (A)

**`red.attribution`**

- `red.attribution.citation-paraphrase` — Citation, paraphrase (F)
- `red.attribution.plagiat` — Plagiat (F)
- `red.attribution.normes` — Normes bibliographiques (norme à confirmer) (F)

## 11. Anglais économique et commercial — `aec` [ORL] S5 + S6

**`aec.correspondance`**

- `aec.correspondance.layout` — Business letter layout (F)
- `aec.correspondance.salutations` — Salutations et formules de clôture (F)
- `aec.correspondance.registre` — Registre et atténuation (F)
- `aec.correspondance.enquiry` — Enquiry (F)
- `aec.correspondance.offer` — Offer et quotation (F)
- `aec.correspondance.order` — Order et acknowledgement (F)
- `aec.correspondance.complaint` — Complaint et reply (F)
- `aec.correspondance.reminder` — Payment reminders (F)
- `aec.correspondance.email` — Courriel professionnel (F)

**`aec.lexique`**

- `aec.lexique.entreprise` — L'entreprise (F)
- `aec.lexique.finance` — Finance et comptabilité (F)
- `aec.lexique.commerce-international` — Commerce international (F)
- `aec.lexique.marketing` — Marketing (F)
- `aec.lexique.economie` — Économie (F)
- `aec.lexique.faux-amis` — Faux amis (F)
- `aec.lexique.chiffres` — Nombres et tendances (A)

**`aec.presse`**

- `aec.presse.lecture` — Lire un article économique (F)
- `aec.presse.synthese` — Synthèse écrite (A)

**`aec.grammaire`**

- `aec.grammaire.modaux` — Modaux (P)
- `aec.grammaire.passif` — Passif (P)
- `aec.grammaire.conditionnels` — Conditionnels (P)
- `aec.grammaire.temps` — Present perfect et prétérit (P)

## 12. Traduction anglaise (thème et version) — `tra` [ORL] S5

**`tra.procedes`**

- `tra.procedes.directs` — Procédés directs : emprunt, calque, traduction littérale (F)
- `tra.procedes.obliques` — Procédés obliques : transposition, modulation, équivalence, adaptation (F)

**`tra.contrastes`**

- `tra.contrastes.nominalisation` — Nominalisation et verbalisation (F)
- `tra.contrastes.temps-aspect` — Temps et aspects (F)
- `tra.contrastes.articles` — Articles et déterminants (F)
- `tra.contrastes.ing` — Les formes en -ing (F)
- `tra.contrastes.passif` — Le passif (F)
- `tra.contrastes.prepositions` — Prépositions et particules (A)
- `tra.contrastes.ordre` — Ordre des mots, chassé-croisé (A)

**`tra.pratique`**

- `tra.pratique.version` — La version (F)
- `tra.pratique.theme` — Le thème (F)
- `tra.pratique.titres-presse` — Titres de presse (F)
- `tra.pratique.faux-amis` — Faux amis (F)
- `tra.pratique.nombres` — Nombres (F)
- `tra.pratique.methode` — Méthode d'épreuve (F)

## 13. Compréhension et expression anglaises — `cea` [ORL] S6

**`cea.oral`**

- `cea.oral.formes-faibles` — Formes faibles (F)
- `cea.oral.liaisons` — Liaisons et assimilations (F)
- `cea.oral.accents` — Les accents (F)

**`cea.methode`**

- `cea.methode.ecoute` — Écoute globale puis ciblée (F)
- `cea.methode.prise-notes` — Prise de notes (F)
- `cea.methode.restitution` — Restitution : compte rendu (F)

**`cea.expression`**

- `cea.expression.presentation` — Présentation orale (A)
- `cea.expression.interaction` — Interaction orale (A)

## 14. Espagnol économique et commercial — `eec` [ORL] S5 + S6

**`eec.correspondencia`**

- `eec.correspondencia.estructura` — Structure de la carta comercial (F)
- `eec.correspondencia.cortesia` — Usted, subjonctif, conditionnel de courtoisie (F)
- `eec.correspondencia.ciclo` — Le cycle : consulta, presupuesto, pedido, albarán, factura (F)
- `eec.correspondencia.reclamacion` — La reclamación (F)
- `eec.correspondencia.email` — Courriel (F)

**`eec.lexico`**

- `eec.lexico.empresa` — L'entreprise (F)
- `eec.lexico.finanzas` — Finances (F)
- `eec.lexico.comercio-exterior` — Commerce extérieur (F)
- `eec.lexico.falsos-amigos` — Faux amis (F)

**`eec.economia`**

- `eec.economia.espana-sectores` — Les secteurs de l'économie espagnole (F)
- `eec.economia.espana-historia` — Repères : plan de stabilisation de 1959, entrée dans la CEE en 1986, euro (F)
- `eec.economia.latam` — Économies latino-américaines (F)
- `eec.economia.bloques` — Mercosur, Alliance du Pacifique, accords avec l'UE (F)

**`eec.escritos`**

- `eec.escritos.informe` — L'informe (A)
- `eec.escritos.cv` — CV en espagnol (F)

## 15. Thème et version espagnols — `tve` [ORL] S5 + S6

**`tve.contrastes`**

- `tve.contrastes.calque` — Le calque (F)
- `tve.contrastes.ser-estar` — Ser et estar (F)
- `tve.contrastes.por-para` — Por et para (F)
- `tve.contrastes.subjuntivo` — Le subjonctif (F)
- `tve.contrastes.concordancia` — Concordance des temps (F)
- `tve.contrastes.a-personal` — La a personal (F)
- `tve.contrastes.gustar` — Verbes du type gustar (F)
- `tve.contrastes.on` — Traduire « on » (F)
- `tve.contrastes.perifrasis` — Périphrases verbales (A)
- `tve.contrastes.pronombres` — Pronoms et enclise (F)

**`tve.lexico`**

- `tve.lexico.falsos-amigos` — Faux amis (F)
- `tve.lexico.registro` — Registre (F)

**`tve.metodo`**

- `tve.metodo.tema` — Le thème (F)
- `tve.metodo.version` — La version (F)
- `tve.metodo.diario-errores` — Le journal d'erreurs (F)

## 16. Civilisation britannique — `cvb` [ORL?] S5

Contenu de l'ancien site, à confirmer.

**`cvb.institutions`**

- `cvb.institutions.parlement` — Parlement et gouvernement (P)
- `cvb.institutions.partis` — Partis et système électoral (P)

**`cvb.welfare`**

- `cvb.welfare.beveridge` — Le rapport Beveridge (F)
- `cvb.welfare.attlee` — Attlee et le Welfare State, NHS (F)
- `cvb.welfare.nationalisations` — Les nationalisations (F)

**`cvb.consensus`**

- `cvb.consensus.butskellism` — Le consensus (F)
- `cvb.consensus.declin` — Déclin et « stop-go » (A)
- `cvb.consensus.europe` — Le Royaume-Uni et l'Europe (1973, 1975) (F)
- `cvb.consensus.crise-1970` — Crise des années 1970, Winter of Discontent (F)

**`cvb.thatcher`**

- `cvb.thatcher.monetarisme` — Le monétarisme (F)
- `cvb.thatcher.privatisations` — Les privatisations (F)
- `cvb.thatcher.syndicats` — Les syndicats et la grève des mineurs (F)
- `cvb.thatcher.big-bang` — Le Big Bang (F)
- `cvb.thatcher.poll-tax` — La poll tax et la chute de Thatcher (F)

**`cvb.new-labour`**

- `cvb.new-labour.major` — Le gouvernement Major (F)
- `cvb.new-labour.third-way` — La Third Way (F)
- `cvb.new-labour.devolution` — La dévolution (F)
- `cvb.new-labour.good-friday` — L'accord du Vendredi saint (F)

**`cvb.methode`**

- `cvb.methode.commentaire` — Commentaire de document de civilisation (F)

## 17. Civilisation espagnole — `cve` [ORL] S5

**`cve.franquismo`**

- `cve.franquismo.herencia` — L'héritage franquiste (F)

**`cve.transicion`**

- `cve.transicion.reforma` — La Ley para la Reforma Política (F)
- `cve.transicion.elecciones-1977` — Les élections de 1977 et la légalisation du PCE (F)
- `cve.transicion.moncloa` — Les Pactes de la Moncloa (F)
- `cve.transicion.constitucion` — La Constitution de 1978 (F)

**`cve.consolidacion`**

- `cve.consolidacion.23f` — Le 23-F (F)
- `cve.consolidacion.gonzalez` — Les gouvernements González, l'entrée dans la CEE, 1992 (F)
- `cve.consolidacion.aznar` — Aznar et l'euro (F)
- `cve.consolidacion.11m` — Le 11-M (F)

**`cve.autonomias`**

- `cve.autonomias.estado` — L'État des autonomies (F)
- `cve.autonomias.cataluna` — La question catalane (2006-2017) (A)
- `cve.autonomias.pais-vasco` — Le Pays basque et ETA (A)

**`cve.actualidad`**

- `cve.actualidad.crisis-2008` — Crise de 2008, 15-M, fin du bipartisme (A) [à confirmer]

**`cve.metodo`**

- `cve.metodo.comentario` — Commentaire de document (F)

## 18. Civilisation américaine — `cva` [ORL] S6

**`cva.naissance`**

- `cva.naissance.surproduction` — Production de masse et naissance de la publicité (F)
- `cva.naissance.agences` — Les agences : Lasker, Hopkins, reason-why (F)
- `cva.naissance.relations-publiques` — Bernays et les relations publiques (F)

**`cva.mesure`**

- `cva.mesure.etudes` — Gallup, Nielsen, études de marché (F)

**`cva.age-or`**

- `cva.age-or.television` — Télévision et USP (F)
- `cva.age-or.creative-revolution` — La creative revolution (F)

**`cva.regulation`**

- `cva.regulation.ftc` — Régulation : FTC, tabac (A)

**`cva.contemporain`**

- `cva.contemporain.segmentation` — Segmentation (F)
- `cva.contemporain.numerique` — Publicité numérique et données (F)

**`cva.methode`**

- `cva.methode.analyse-publicite` — Analyser une publicité (F)

## 19. Civilisation latino-américaine — `cvl` [ORL?] S6

Présence en S6 à confirmer.

**`cvl.urbanizacion`**

- `cvl.urbanizacion.exodo` — L'exode rural (F)
- `cvl.urbanizacion.metropolis` — Les métropoles (F)

**`cvl.informalidad`**

- `cvl.informalidad.asentamientos` — Favelas, villas, barriadas (F)
- `cvl.informalidad.economia` — L'économie informelle (F)

**`cvl.fracturas`**

- `cvl.fracturas.segregacion` — Ségrégation, barrios cerrados (F)
- `cvl.fracturas.violencia` — La violence urbaine (F)

**`cvl.politicas`**

- `cvl.politicas.medellin` — Medellín et l'urbanisme social (F)
- `cvl.politicas.otros` — Autres cas : Bogotá, Curitiba (A)

**`cvl.representaciones`**

- `cvl.representaciones.cine` — Le cinéma de la ville (F)
- `cvl.representaciones.metodo-imagen` — Analyser une image ou un film (F)

## 20. Stage et rapport — `stg` [ORL] S6

Source : livret de stage, lu.

- `stg.cadre.objectifs` — Objectifs et types de stage (F)
- `stg.cadre.convention` — Convention, gratification, assurance (F)
- `stg.recherche.candidature` — CV et lettre de motivation (F)
- `stg.rapport.problematique` — Problématique de gestion ou de langues (F) ← `red.argumentation.problematique`
- `stg.rapport.structure` — Structure du rapport (F)
- `stg.rapport.note-synthese` — Note de synthèse (F) ← `red.argumentation.note-synthese`
- `stg.rapport.forme` — Forme du rapport (F)
- `stg.rapport.erreurs` — Erreurs courantes (F)
- `stg.soutenance.preparation` — Préparer la soutenance (F)
- `stg.evaluation.bareme` — Barème (F)

## 21. Économie internationale — `eco` [COMP]

Complément recommandé : absente de la maquette d'Orléans trouvée, mais fréquente en L3 LEA ailleurs.

- `eco.theories.avantage-absolu` — Avantage absolu (Smith) (F)
- `eco.theories.avantage-comparatif` — Avantage comparatif (Ricardo) (F)
- `eco.theories.hos` — Le modèle HOS (A)
- `eco.theories.nouvelles` — Nouvelles théories du commerce international (A)
- `eco.mesure.balance-paiements` — Balance des paiements (F)
- `eco.mesure.termes-echange` — Termes de l'échange, taux de couverture (F)
- `eco.change.taux-change` — Taux de change, régimes (F)
- `eco.politique.protectionnisme` — Libre-échange et protectionnisme (F)
- `eco.politique.integration-regionale` — Intégration régionale (F)
- `eco.politique.chaines-valeur` — Chaînes de valeur mondiales (A)

## 22. Marketing international et supply chain — `mks` [COMP]

- `mks.marketing.segmentation` — Segmentation, ciblage, positionnement (F)
- `mks.marketing.digital` — Marketing digital à l'international (A)
- `mks.supply.chaine-logistique` — La chaîne logistique (F)
- `mks.supply.entreposage` — Entreposage, stocks, plateformes (F)

---

## Concepts transversaux (relations « connexes »)

- **Transfert du risque** : `tci.incoterms.transfert-risque` ↔ `tci.assurance.transport` ↔ `dai.cvim.obligations`
- **Valeur et douane** : `tci.incoterms.repartition-couts` ↔ `tci.douane.valeur` ↔ `ici.mix.prix-export`
- **Document comme preuve** : `tci.documents.connaissement` ↔ `tci.paiement.credoc-conformite` ↔ `cpt.mecanisme.partie-double`
- **Temps et trésorerie** : `gfi.equilibre.bfr` ↔ `odg.stocks.point-commande` ↔ `tci.paiement.choix`
- **Fixe / variable** : `odg.couts.fixes-variables` ↔ `gfi.ratios.levier`
- **Soft law** : `dai.normes.soft-law` ↔ `tci.incoterms.fonction` ↔ `tci.paiement.credit-documentaire`
- **Registre** : `aec.correspondance.registre` ↔ `eec.correspondencia.cortesia` ↔ `mgi.grilles.hall`
- **Faux amis** : `aec.lexique.faux-amis` ↔ `tra.pratique.faux-amis` ↔ `tve.lexico.falsos-amigos` ↔ `eec.lexico.falsos-amigos`

## Priorités de rédaction proposées (phase 6)

1. **Vague 1** — matières techniques à forts savoir-faire évalués : `tci`, `cpt`, `gfi`, `odg`.
2. **Vague 2** — `dai`, `dcl`, `ici`, `gdp`, `mgi`, `stg`.
3. **Vague 3** — langues (`aec`, `tra`, `eec`, `tve`, `cea`) et méthodologie (`red`).
4. **Vague 4** — civilisations (`cvb`, `cve`, `cva`, `cvl`) et compléments (`eco`, `mks`).
