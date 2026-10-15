// Tirage aléatoire reproductible (utile pour reprendre une session d'examen à l'identique).

export function generateur(graine: number) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function melanger<T>(items: readonly T[], graine: number): T[] {
  const r = generateur(graine);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Mélange les choix d'un QCM en laissant à la fin les choix du type « Aucune de ces réponses ». */
export function melangerChoix<T extends { texte: string }>(choix: readonly T[], graine: number): T[] {
  const fixes = choix.filter((c) => /^(aucune|toutes) (de|des) ces/i.test(c.texte));
  return [...melanger(choix.filter((c) => !fixes.includes(c)), graine), ...fixes];
}
