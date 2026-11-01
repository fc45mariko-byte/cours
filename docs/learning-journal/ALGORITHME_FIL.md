# Algorithme du fil

Code : `app/src/recommandation.ts` (moteur), `app/src/pages/Fil.tsx` (affichage), `app/src/classement.ts` (onglets).
Tests : `tests/unit/recommandation.test.ts`, test de bout en bout « fil dynamique » dans `tests/e2e/journal.spec.ts`.

Tout est calculé sur l'appareil, à partir de la progression enregistrée dans le navigateur. Aucun service externe, aucune donnée envoyée.

## 1. Quand le fil change

| Moment | Effet |
|---|---|
| **Nouvelle édition, toutes les 3 heures** | Le fil est recomposé. Si la page est ouverte, un bandeau « Une nouvelle édition du fil est prête » s'affiche : rien ne bouge sous les yeux pendant la lecture. |
| **« Actualiser le fil »** | Nouvelle édition immédiate. |
| **Pendant la lecture** | Les publications déjà affichées restent à leur place ; chaque nouveau lot de 10 est recalculé avec la progression du moment (ce qui vient d'être lu, compris, marqué à revoir, réussi ou raté). |
| **Retour sur le fil** dans la même édition | L'ordre déjà affiché est restitué (mémorisé par onglet et par filtres), avec la reprise de lecture. |

## 2. Le score d'une publication

Pour chaque publication, rattachée à une notion de cours :

1. **Besoin pédagogique** selon le statut de la notion : en apprentissage (1) > découverte et pratiquée (0,85) > non explorée (0,55) > comprise (0,35) > maîtrisée (0,12).
2. **Échéance de révision**, à la manière de la répétition espacée : chaque statut a un intervalle (1 jour en apprentissage, 2 jours pratiquée, 6 jours comprise, 21 jours maîtrisée). Une notion revient quand l'intervalle est écoulé, d'autant plus fortement que le retard grandit ; avant l'échéance, elle est mise au repos.
3. **Prérequis** : une notion dont tous les prérequis sont compris est poussée (« prochaine étape ») ; une notion dont aucun prérequis n'est acquis attend.
4. **Lue mais pas testée** : les formats d'évaluation (quiz, études de cas, exercices, comparaisons) passent devant une nouvelle relecture.
5. **Marques explicites** : « à revoir » fait remonter fortement ; « compris » et « lu » font descendre.
6. **Intérêts appris** :
   - matières suivies (réglages) et matières travaillées récemment (activité des 60 derniers jours, demi-vie de 7 jours) ;
   - formats lus volontiers : taux de lecture, de compréhension et d'enregistrement par format, lissé, qui multiplie le score de 0,75 à 1,3.
7. **Lassitude** : une publication déjà montrée plusieurs fois sans réaction recule, et plus encore si elle a été montrée dans les 12 dernières heures. Une publication n'est comptée « montrée » que si elle est visible à plus de 50 % à l'écran, au plus une fois par heure ; les 800 plus récentes sont conservées.
8. **Moment de la journée** : formats courts aux heures de trajet et de pause (7-9 h, 12-14 h, 17-19 h), formats longs le soir.
9. **Actualité** (Monde et économie) : bonus, d'autant plus fort que l'article est récent.
10. **Part de hasard** propre à chaque édition, pour que deux éditions ne se ressemblent pas, tout en restant reproductible au sein d'une même édition.

## 3. La composition

Les publications sont choisies une par une parmi les mieux notées, avec des pénalités de diversité :

- jamais deux fois de suite le même format **et** la même matière ;
- pas le même format plus d'une fois sur les quatre dernières positions, sans pénalité forte ;
- pas deux fois le même chapitre sur six positions, ni deux fois la même notion ;
- **une place sur six réservée à la découverte** : la matière la moins montrée jusqu'ici.

Le moteur ne trie pas tout le fil d'un coup : il choisit les 10 prochaines publications, ce qui permet de tenir compte de l'activité en cours.

## 4. Transparence

Chaque carte indique **« Pourquoi ici »**, dans cet ordre de priorité : marquée à revoir ; lue, pas encore testée ; bon moment pour la revoir ; prochaine étape ; Monde et économie ; notion en cours d'apprentissage ; dans vos matières ; format apprécié ; adapté au moment de la journée ; pour élargir vos lectures.

## 5. Onglets

| Onglet | Ordre |
|---|---|
| Pour vous | Moteur de recommandation sur tout le fil, avec cartes de progression (quêtes, défi de révision, badge) toutes les 12 publications |
| Mes matières | Moteur, limité aux matières suivies |
| Monde et économie | Articles datés d'abord (du plus récent au plus ancien), puis moteur sur les matières d'économie et de commerce international |
| Enregistrés, Déjà lus | Ordre chronologique |

## 6. Données enregistrées (progression, champ `fil`)

- `actualise` : nombre d'actualisations demandées (fait partie de l'identifiant d'édition) ;
- `ordre` : publications déjà affichées par onglet et filtres, pour l'édition en cours (300 au plus) ;
- `impressions` : nombre d'affichages et date du dernier, par publication (800 au plus).

Ces champs s'ajoutent à la progression existante sans rien modifier ; une ancienne sauvegarde reçoit des valeurs vides.
