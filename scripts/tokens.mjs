// Generates from tokens.json (the single source) everything that carries fixed colours:
//   tokens.css;
//   illustrations/le-tir-nuit.svg, the shot in the dark theme's colours (an image does not read CSS variables);
//   the browser bar colours of favicon/head.html and favicon/site.webmanifest.
// Usage: npm run tokens
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const j = JSON.parse(readFileSync(new URL('tokens/tokens.json', root), 'utf8'));

// the JSON groups that become primitives, named after their CSS prefix
const GROUPS = ['font', 'size', 'space', 'radius', 'shadow', 'leading', 'tracking', 'page', 'duration', 'ease'];

const value = (t) => {
  const v = t.$value;
  // W3C curve: [x1, y1, x2, y2] → cubic-bezier(x1, y1, x2, y2)
  if (t.$type === 'cubicBezier') return `cubic-bezier(${v.join(', ')})`;
  if (Array.isArray(v)) return v.map((f) => (/[\s-]/.test(f) && !/^[a-z-]+$/.test(f) ? `'${f}'` : f)).join(', ');
  return String(v);
};
const leaves = (o) => Object.entries(o).filter(([k, v]) => !k.startsWith('$') && v && typeof v === 'object');

const primitives = [];
for (const [scale, g] of leaves(j.color)) {
  if ('$value' in g) primitives.push([`${scale}`, value(g)]);
  else for (const [step, t] of leaves(g)) primitives.push([`${scale}-${step}`, value(t)]);
}
for (const group of GROUPS) {
  for (const [k, t] of leaves(j[group] || {})) primitives.push([`${group}-${k}`, value(t)]);
}
const theme = (name) => leaves(j.theme[name]).map(([k, t]) => [k, value(t)]);
const block = (lines, indent) => lines.map(([k, v]) => `${indent}--fe-${k}: ${v};`).join('\n');
// both themes also as constants (--fe-light-*, --fe-dark-*): to show one theme next to the other (the guidelines)
const constants = (name, lines) => lines.map(([k, v]) => [`${name}-${k}`, v]);

const light = theme('light'), dark = theme('dark');
const css = `/* Florian Etourneau — CSS tokens. Generated from tokens.json (npm run tokens): do not edit by hand. */
:root {
${block(primitives, '  ')}
${block(light, '  ')}
${block(constants('light', light), '  ')}
${block(constants('dark', dark), '  ')}
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${block(dark, '    ')}
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
${block(dark, '  ')}
  color-scheme: dark;
}

/* A theme forced on a block, whatever the page's theme */
.fe-light {
${block(light, '  ')}
  color-scheme: light;
}

.fe-dark {
${block(dark, '  ')}
  color-scheme: dark;
}
`;

writeFileSync(new URL('tokens/tokens.css', root), css);

// The night shot: the shot, where each var(--fe-…, fallback) takes its dark theme value, laid on the dark background
const lightValues = new Map([...primitives, ...light]);
const darkValues = new Map([...primitives, ...dark]);
const shot = readFileSync(new URL('illustrations/le-tir.svg', root), 'utf8');
const night = shot
  .replace(/var\(--fe-([a-z0-9-]+),\s*([^)]+)\)/g, (_, name, fallback) => darkValues.get(name) ?? fallback.trim())
  .replace(/<title>([^<]*)<\/title>/, (_, t) => `<title>${t}, de nuit</title><rect x="0" y="40" width="1200" height="330" fill="${darkValues.get('bg')}"/>`)
  .replace(/aria-label="([^"]*)"/, (_, t) => `aria-label="${t}, de nuit"`);
if (/var\(/.test(night)) throw new Error('le-tir-nuit.svg: a variable of the shot has no value');
writeFileSync(new URL('illustrations/le-tir-nuit.svg', root), `<!-- Generated from le-tir.svg and tokens.json (npm run tokens): do not edit by hand. -->\n${night}`);

// The browser bar: the brand colour in light, the background in dark
const barLight = lightValues.get('primary'), barDark = darkValues.get('bg');
const replace = (path, ...pairs) => {
  const url = new URL(path, root);
  let text = readFileSync(url, 'utf8');
  for (const [pattern, replacement] of pairs) {
    if (!pattern.test(text)) throw new Error(`${path}: pattern not found ${pattern}`);
    text = text.replace(pattern, replacement);
  }
  writeFileSync(url, text);
};
replace('favicon/head.html',
  [/content="#[0-9A-Fa-f]{6}" media="\(prefers-color-scheme: light\)"/, `content="${barLight}" media="(prefers-color-scheme: light)"`],
  [/content="#[0-9A-Fa-f]{6}" media="\(prefers-color-scheme: dark\)"/, `content="${barDark}" media="(prefers-color-scheme: dark)"`]);
replace('favicon/site.webmanifest',
  [/"theme_color": "#[0-9A-Fa-f]{6}"/, `"theme_color": "${barLight}"`],
  [/"background_color": "#[0-9A-Fa-f]{6}"/, `"background_color": "${lightValues.get('bg')}"`]);

console.log(`tokens.css generated: ${primitives.length} primitives, ${dark.length} theme tokens.`);
console.log('le-tir-nuit.svg, favicon/head.html and favicon/site.webmanifest updated.');
