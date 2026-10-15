// Outil de développement : captures d'écran de routes du site (vite preview doit tourner sur :4173).
// Usage : node scripts/capture.mjs <dossier> [--mobile] <route> [route…]
import { chromium, devices } from '@playwright/test';
const args = process.argv.slice(2);
const out = args.shift();
const mobile = args[0] === '--mobile' ? args.shift() : null;
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1400, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
for (const [i, r] of args.entries()) {
  await p.goto('http://127.0.0.1:4173/' + r);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${mobile ? 'm' : 's'}${i}.png`, fullPage: false });
}
console.log('erreurs :', errs.length ? errs : 'aucune');
await b.close();
