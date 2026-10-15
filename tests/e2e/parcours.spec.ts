import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

// Une notion encore non rédigée, quel que soit l'avancement du contenu.
const index = JSON.parse(readFileSync(new URL('../../app/src/generated/index.json', import.meta.url), 'utf8'));
const nonRedigee = Object.keys(index.notions).find((id) => !index.notions[id].redigee);

const erreursConsole = (page: Page) => {
  const e: string[] = [];
  page.on('pageerror', (x) => e.push(String(x)));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('fonts.g')) e.push(m.text()); });
  return e;
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('accueil : matières et filtres', async ({ page }) => {
  const e = erreursConsole(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Réussir sa L3 LEA');
  await expect(page.locator('a.carte[href^="#/matiere/"]')).toHaveCount(22);
  await page.getByRole('button', { name: 'Gestion', exact: true }).click();
  await expect(page.locator('a.carte[href^="#/matiere/"]')).toHaveCount(3);
  expect(e).toEqual([]);
});

test('fiche : rubriques, prérequis et notion non rédigée', async ({ page }) => {
  await page.goto('/#/notion/tci.incoterms.transfert-risque');
  await expect(page.getByRole('heading', { level: 1, name: 'Le point de transfert des risques' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Définition/ })).toBeVisible();
  await expect(page.getByText('exemple fictif')).toBeVisible();
  test.skip(!nonRedigee, 'toutes les notions sont rédigées');
  await page.goto(`/#/notion/${nonRedigee}`);
  await expect(page.getByText('en cours de rédaction')).toBeVisible();
});

test('QCM : aucune correction avant validation, explication après, erreur enregistrée', async ({ page }) => {
  await page.goto('/#/entrainer/qcm?ids=q.tci.incoterms.004&g=1');
  const valider = page.getByRole('button', { name: 'Valider' });
  await expect(valider).toBeDisabled();
  await expect(page.getByText('Bonne réponse')).toHaveCount(0);
  await page.getByLabel(/Le vendeur, car il a payé le fret/).check();
  await valider.click();
  await expect(page.getByText('✘ Pas tout à fait')).toBeVisible();
  await expect(page.getByText(/confusion entre point de transfert des frais/)).toBeVisible();
  await page.getByRole('button', { name: 'Voir le bilan' }).click();
  await expect(page.getByRole('heading', { name: 'Bilan : 0/1' })).toBeVisible();
  // La progression survit au rechargement.
  await page.goto('/#/reviser');
  await page.reload();
  await expect(page.getByRole('link', { name: /Rejouer mes 1 QCM ratés/ })).toBeVisible();
});

test('QCM à réponses multiples : juste seulement si toutes les bonnes réponses sont cochées', async ({ page }) => {
  await page.goto('/#/entrainer/qcm?ids=q.tci.incoterms.013&g=1');
  await page.getByLabel(/Dédouaner la marchandise à l'import/).check();
  await page.getByLabel(/Payer les droits de douane/).check();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText('✘ Pas tout à fait')).toBeVisible();
  await expect(page.getByText('✔ Bonne réponse oubliée.')).toBeVisible();
});

test('exercice : saisie à la française et corrigé détaillé', async ({ page }) => {
  await page.goto('/#/exercice/e.tci.incoterms.01');
  const champs = page.getByLabel(/Votre réponse/);
  await champs.first().fill('37 000');
  await page.getByRole('button', { name: 'Valider' }).first().click();
  await expect(page.getByText('✔ Juste').first()).toBeVisible();
  await expect(page.getByText('FOB = 36 000 + 520 + 130 + 350 = 37 000 €')).toBeVisible();
});

test('flashcard : réponse de référence, critères, relance et répétition espacée', async ({ page }) => {
  await page.goto('/#/flashcards?p=tci.incoterms');
  await page.getByRole('button', { name: /Commencer/ }).click();
  await page.getByRole('button', { name: 'Voir la réponse de référence' }).click();
  await expect(page.getByText('Éléments indispensables')).toBeVisible();
  await expect(page.getByText('Question de relance')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Facile' })).toBeDisabled();
  await page.getByRole('button', { name: 'Correct' }).click();
  await expect(page.getByText('2/5')).toBeVisible();
  const etat = await page.evaluate(() => JSON.parse(localStorage.getItem('cours-l3-lea:progression')!));
  expect(Object.keys(etat.cartes)).toHaveLength(1);
});

test('examen : sans correction, reprise après rechargement, bilan', async ({ page }) => {
  await page.goto('/#/examen?p=tci.incoterms');
  await page.getByLabel('Nombre de questions').selectOption('10');
  await page.getByRole('button', { name: "Commencer l'examen" }).click();
  await expect(page.getByText('0/10 répondues')).toBeVisible();
  await page.locator('.qcm-choix input').first().check();
  await expect(page.getByText('1/10 répondues')).toBeVisible();
  await expect(page.locator('.expl')).toHaveCount(0);
  await page.getByRole('button', { name: 'Suivante →' }).click();
  await page.getByRole('button', { name: /Marquer à revoir/ }).click();
  await page.reload();
  await expect(page.getByText('1/10 répondues')).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Terminer et voir le bilan' }).click();
  await expect(page.getByRole('heading', { name: "Bilan de l'examen" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Par compétence' })).toBeVisible();
});

test('recherche : insensible aux accents, termes anglais', async ({ page }) => {
  await page.goto('/#/explorer');
  await page.getByLabel('Rechercher').fill('fret');
  await expect(page.getByRole('link', { name: /Fret/ }).first()).toBeVisible();
  await page.getByLabel('Rechercher').fill('shipment contract');
  await expect(page.getByRole('link', { name: /Vente au départ/ })).toBeVisible();
});

test('réglages : export et import de la progression', async ({ page }) => {
  await page.goto('/#/reglages');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: /Exporter/ }).click();
  expect((await dl).suggestedFilename()).toMatch(/progression-l3-lea-.*\.json/);
  await page.locator('input[type=file]').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from('{"foo":1}') });
  await expect(page.getByText(/Import impossible/)).toBeVisible();
});

test('pas de défilement horizontal', async ({ page }) => {
  for (const r of ['/', '/#/notion/tci.incoterms.transfert-risque', '/#/exercice/e.tci.incoterms.01', '/#/examen']) {
    await page.goto(r);
    await page.waitForTimeout(200);
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, r).toBeLessThanOrEqual(1);
  }
});
