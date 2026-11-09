import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const index = JSON.parse(readFileSync(new URL('../../app/src/generated/index.json', import.meta.url), 'utf8'));
const fil = JSON.parse(readFileSync(new URL('../../app/src/generated/fil.json', import.meta.url), 'utf8')) as { id: string; type: string; l: string; edito?: boolean }[];
const chapitres: string[] = index.matieres.flatMap((m: { chapitres: { id: string }[] }) => m.chapitres.map((c) => c.id));

const erreursConsole = (page: Page) => {
  const e: string[] = [];
  page.on('pageerror', (x) => e.push(String(x)));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('fonts.g')) e.push(m.text()); });
  return e;
};
const progression = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('cours-l3-lea:progression') ?? '{}'));

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('navigation : cinq destinations, sur mobile comme sur ordinateur', async ({ page, isMobile }) => {
  const e = erreursConsole(page);
  await page.goto('/');
  const nav = isMobile ? page.locator('nav.nav-mobile') : page.locator('aside.barre nav');
  await expect(nav).toBeVisible();
  for (const [lien, titre] of [['Fil', 'Fil'], ['Bibliothèque', 'Bibliothèque'], ['Étudier', 'Étudier'], ['Progrès', 'Progrès'], ['Accueil', /Qu’apprend-on/]] as const) {
    await nav.getByRole('link', { name: lien }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(titre);
    await expect(nav.getByRole('link', { name: lien })).toHaveAttribute('aria-current', 'page');
  }
  expect(e).toEqual([]);
});

test('anciennes adresses : toujours accessibles', async ({ page }) => {
  for (const [r, h] of [['/#/reviser', 'Réviser'], ['/#/explorer', 'Rechercher'], ['/#/approfondir', 'Approfondir'], ['/#/entrainer', "S'entraîner"], ['/#/flashcards', 'Flashcards'], ['/#/glossaire', 'Glossaire']]) {
    await page.goto(r);
    await expect(page.getByRole('heading', { level: 1 }), r).toContainText(h);
  }
});

test('fil : enregistrer, marquer compris, retrouver après rechargement', async ({ page }) => {
  await page.goto('/#/fil');
  const carte = page.locator('article.pub').first();
  await expect(carte).toBeVisible();
  const id = await carte.getAttribute('data-pub');
  await carte.getByRole('button', { name: /Enregistrer/ }).click();
  await carte.getByRole('button', { name: /Compris/ }).click();
  await expect(carte.getByRole('button', { name: /Enregistré/ })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await page.getByRole('tab', { name: 'Enregistrés' }).click();
  await expect(page.locator(`article[data-pub="${id}"]`)).toBeVisible();
  const p = await progression(page);
  expect(p.enregistres[id!]).toBeDefined();
  expect(p.marques[id!].compris).toBeDefined();
});

test('fil : filtre par langue sans mélange', async ({ page }) => {
  await page.goto('/#/fil?onglet=pour-vous&l=es');
  await expect(page.locator('article.pub').first()).toBeVisible();
  const langues = await page.locator('article.pub').evaluateAll((els) => [...new Set(els.map((x) => x.getAttribute('lang')))]);
  expect(langues).toEqual(['es']);
});

test('monde et économie : articles datés, faits et analyse séparés', async ({ page }) => {
  await page.goto('/#/fil?onglet=monde');
  const premier = page.locator('article.pub.edito').first();
  await expect(premier).toBeVisible();
  await expect(premier.locator('.dateline')).toBeVisible();
  await premier.locator('.pub-titre a').click();
  await expect(page.getByRole('heading', { name: 'Les faits' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
  await expect(page.getByText(/n’en fait pas partie/)).toBeVisible();
});

test('publications : chaque format s’affiche et se marque comme lu', async ({ page }) => {
  const e = erreursConsole(page);
  const types = [...new Set(fil.map((x) => x.type))];
  for (const t of types) {
    const pub = fil.find((x) => x.type === t)!;
    await page.goto(`/#/pub/${encodeURIComponent(pub.id)}`);
    await expect(page.locator('article.pub'), pub.id).toBeVisible();
    await expect(page.locator('.chargement')).toHaveCount(0);
    await expect(page.locator('.erreur-box'), pub.id).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Marquer comme lu' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Lu ✓' })).toBeVisible();
  expect(e).toEqual([]);
});

test('lecteur : tous les chapitres s’affichent dans la langue de leur matière', async ({ page, isMobile }) => {
  test.skip(isMobile, 'parcours exhaustif exécuté une fois, sur ordinateur');
  test.setTimeout(180_000);
  const e = erreursConsole(page);
  for (const c of chapitres) {
    await page.goto(`/#/chapitre/${c}`);
    const article = page.locator('article.lecteur');
    await expect(article, c).toBeVisible();
    const langue = index.matieres.find((m: { id: string }) => m.id === c.split('.')[0]).langue;
    await expect(article, c).toHaveAttribute('lang', langue);
    await expect(page.locator('.section-notion').first(), c).toBeVisible();
  }
  await page.goto('/#/chapitre/cvb.thatcher');
  await expect(page.getByRole('heading', { name: 'Learning objectives' })).toBeVisible();
  await page.goto('/#/chapitre/cve.transicion');
  await expect(page.getByRole('heading', { name: 'Objetivos de aprendizaje' })).toBeVisible();
  expect(e).toEqual([]);
});

test('lecteur : chapitre terminé et position de lecture conservés', async ({ page }) => {
  await page.goto('/#/chapitre/tci.incoterms');
  await page.getByRole('button', { name: 'Marquer comme terminé' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Terminé ✓' })).toBeVisible();
  const p = await progression(page);
  expect(p.chapitres['tci.incoterms'].termine).toBeGreaterThan(0);
  expect(Object.keys(p.xp)).toContain('chap:tci.incoterms');
});

test('matière absente : signalée, sans contenu inventé', async ({ page }) => {
  await page.goto('/#/matiere/tou');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Introduction au tourisme international');
  await expect(page.getByText('Contenu absent.')).toBeVisible();
  await expect(page.locator('ol.sommaire-chap li')).toHaveCount(0);
});

test('progression : XP gagnée une seule fois, conservée après rechargement', async ({ page }) => {
  await page.goto('/#/entrainer/qcm?ids=q.tci.incoterms.001&g=1');
  await page.locator('.qcm-choix input').first().check();
  await page.getByRole('button', { name: 'Valider' }).click();
  await page.waitForTimeout(600);
  await page.goto('/#/progres');
  await expect(page.getByRole('heading', { name: 'Collection' })).toBeVisible();
  const avant = await progression(page);
  await page.reload();
  await page.waitForTimeout(600);
  const apres = await progression(page);
  expect(Object.keys(apres.xp)).toEqual(Object.keys(avant.xp));
  await expect(page.getByRole('heading', { name: 'Quêtes' })).toBeVisible();
});

test('migration : une progression de l’ancienne version est conservée et copiée', async ({ page }) => {
  const v1 = { version: 1, qcm: { 'q.tci.incoterms.004': [{ t: 1700000000000, ok: false }] }, exercices: {}, cartes: {}, erreurs: { 'q.tci.incoterms.004': { type: 'qcm', notion: 'tci.incoterms.transfert-risque', t: 1700000000000, reussitesConsecutives: 0 } }, examen: null, examensPasses: [], vues: {}, activite: {} };
  await page.evaluate((x) => localStorage.setItem('cours-l3-lea:progression', JSON.stringify(x)), v1);
  await page.goto('/#/reviser');
  await page.reload();
  await expect(page.getByRole('link', { name: /Rejouer mes 1 QCM ratés/ })).toBeVisible();
  const copie = await page.evaluate(() => localStorage.getItem('cours-l3-lea:progression:v1'));
  expect(JSON.parse(copie!)).toEqual(v1);
  expect((await progression(page)).version).toBe(2);
});

test('dissertation : sujet généré, plan enregistré automatiquement', async ({ page }) => {
  await page.goto('/#/etudier/dissertation?c=eco.politique');
  await expect(page.getByText('Sujet généré', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Travailler ce sujet' }).click();
  const redaction = page.getByRole('textbox', { name: 'Rédaction', exact: true });
  await expect(redaction).toBeVisible();
  await redaction.fill('Introduction de test');
  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Rédaction', exact: true })).toHaveValue('Introduction de test');
});

test('session de révision : questions, corrections, recommandation', async ({ page }) => {
  await page.goto('/#/etudier/session?p=tci.incoterms&g=3');
  const total = Number((await page.getByRole('heading', { level: 1 }).textContent())?.match(/\/\s*(\d+)/)?.[1] ?? 0);
  expect(total).toBeGreaterThan(0);
  for (let i = 0; i < total; i++) {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`${i + 1}`);
    await page.locator('.qcm-choix input').first().check();
    await page.getByRole('button', { name: 'Valider' }).click();
    await page.getByRole('button', { name: /Suivant|Voir le bilan/ }).click();
  }
  await expect(page.getByRole('heading', { name: /Bilan/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recommandation' })).toBeVisible();
});

test('fil dynamique : ordre conservé dans l’édition, renouvelé à l’actualisation, raisons affichées', async ({ page }) => {
  await page.goto('/#/fil');
  await expect(page.locator('article.pub').first()).toBeVisible();
  const ordre = () => page.locator('article.pub').evaluateAll((els) => els.slice(0, 8).map((x) => x.getAttribute('data-pub')));
  const avant = await ordre();
  await expect(page.locator('.pourquoi').first()).toContainText('Pourquoi ici');
  await page.waitForTimeout(5500); // les impressions sont enregistrées toutes les 5 secondes
  await page.reload();
  await expect(page.locator('article.pub').first()).toBeVisible();
  expect(await ordre()).toEqual(avant);
  const p = await progression(page);
  expect(Object.keys(p.fil.impressions).length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Actualiser le fil' }).click();
  await expect(page.locator('article.pub').first()).toBeVisible();
  const apres = await ordre();
  expect(apres).not.toEqual(avant);
});

test('cahiers d’exercices : liste par emploi du temps, impression avec ou sans corrigés', async ({ page }) => {
  const e = erreursConsole(page);
  await page.goto('/#/cahiers');
  await expect(page.getByRole('heading', { name: 'Au programme ce semestre' })).toBeVisible();
  const premier = index.cahiers[0];
  test.skip(!premier, 'aucun cahier');
  await page.goto(`/#/cahier/${premier.matiere}`);
  await expect(page.locator('.cahier .exo').first()).toBeVisible();
  await expect(page.locator('.corriges')).toBeVisible();
  await page.getByLabel('Inclure les corrigés').uncheck();
  await expect(page.locator('.corriges')).toBeHidden();
  await page.getByLabel('J’ai fait cet exercice').first().check();
  await page.reload();
  await expect(page.getByLabel('J’ai fait cet exercice').first()).toBeChecked();
  expect(e).toEqual([]);
});

test('exercices express : un exercice par partie, version complète disponible', async ({ page }) => {
  const premier = index.cahiers.find((c: { exercices: number; sections: number }) => c.exercices > c.sections);
  test.skip(!premier, 'aucun cahier');
  await page.goto(`/#/cahier/${premier.matiere}`);
  await expect(page.locator('.cahier .exo').first()).toBeVisible();
  expect(await page.locator('.cahier .exo').count()).toBe(premier.sections);
  await page.getByRole('link', { name: 'Complet' }).click();
  await expect(page.locator('.cahier .exo')).toHaveCount(premier.exercices);
});

test('synthèse : lecture, mode récitation et auto-évaluation enregistrée', async ({ page }) => {
  const e = erreursConsole(page);
  await page.goto('/#/syntheses');
  await expect(page.getByRole('heading', { name: 'Au programme ce semestre' })).toBeVisible();
  const s = index.syntheses[0];
  await page.goto(`/#/synthese/${s.matiere}`);
  await expect(page.locator('.synthese-points').first()).toBeVisible();
  await page.getByRole('button', { name: 'Mode récitation' }).click();
  await expect(page.locator('.synthese-points')).toHaveCount(0);
  await expect(page.locator('.synthese-questions details').first()).toBeVisible();
  await page.getByRole('button', { name: 'Je sais' }).first().click();
  const p = await progression(page);
  expect(Object.keys(p.marques).some((k) => k.startsWith('synth:') && p.marques[k].compris)).toBe(true);
  await page.goto('/#/syntheses/parcoeur');
  await expect(page.locator('.par-coeur section').first()).toBeVisible();
  expect(e).toEqual([]);
});

test('plan 14 jours : commencer, cocher une tâche du jour', async ({ page }) => {
  const e = erreursConsole(page);
  await page.goto('/#/plan');
  await page.getByRole('button', { name: 'Commencer aujourd’hui' }).click();
  await expect(page.getByRole('heading', { name: /jour 1/ }).first()).toBeVisible();
  const tache = page.locator('.plan-taches input[type=checkbox]').first();
  await tache.check();
  await page.reload();
  await expect(page.locator('.plan-taches input[type=checkbox]').first()).toBeChecked();
  await page.getByRole('button', { name: 'Voir les 14 jours' }).click();
  await expect(page.locator('.plan-jour')).toHaveCount(14);
  await page.goto('/');
  await expect(page.getByText('Plan 14 jours · jour 1')).toBeVisible();
  expect(e).toEqual([]);
});
