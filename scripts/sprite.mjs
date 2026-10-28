// Regénère sprite.svg à partir des pictos unitaires (symboles #fe-<nom>). Usage : npm run sprite
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dossier = new URL('../icons/', import.meta.url);
// ordre d’affichage de la planche : l’oiseau et le basket, le travail, les usages, l’interface
const ORDRE = ['oiseau', 'ballon', 'panier', 'tir', 'fil', 'famille', 'code', 'composants', 'monorepo', 'outillage', 'ia', 'travail', 'editeur', 'maxds', 'cv', 'terminal', 'manette', 'competition', 'mail', 'lieu', 'telecharger', 'externe', 'fleche', 'calendrier', 'maison', 'soleil', 'lune', 'menu', 'valider'];

const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.svg') && f !== 'sprite.svg').map((f) => f.slice(0, -4));
const oublies = fichiers.filter((f) => !ORDRE.includes(f));
if (oublies.length) throw new Error(`Pictos absents de ORDRE : ${oublies.join(', ')}`);

const symboles = ORDRE.map((nom) => {
  const svg = readFileSync(new URL(`${nom}.svg`, dossier), 'utf8').trim();
  const contenu = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<symbol id="fe-${nom}" viewBox="0 0 24 24">${contenu}</symbol>`;
});
writeFileSync(new URL('sprite.svg', dossier), `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symboles.join('')}</svg>`);
console.log(`sprite.svg : ${symboles.length} pictos.`);
