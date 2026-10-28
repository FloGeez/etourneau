/* The front page as a naturalist's plate. The starling is drawn large from etourneau/starling and annotated; each part is
   a package, and picking a part makes it move: the silhouette draws itself (brand), the plumage takes its colours (tokens),
   the wing rises around the shoulder (starling, the movement), the flock takes the bird's shape (murmuration). */
import { PERCHED, wing, wingOverlayOpacity, perchedLegs, easings, animate } from '../starling/index.js';
import { createMurmuration, shapes, sampleShape } from '../murmuration/index.js';

const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.append(e);
  return e;
};

// the version, read from the package
fetch('package.json').then((r) => r.json()).then((p) => { for (const e of document.querySelectorAll('[data-version]')) e.textContent = p.version; }, () => {});

/* ——— The twig and the specimen, in the plate's units (1000 × 640) ——— */
const figure = $('figure'), drawing = $('drawing');
const TWIG = { x0: 40, x1: 960, y0: 560, cy: 588 };
const twigY = (x) => { const t = (x - TWIG.x0) / (TWIG.x1 - TWIG.x0); return TWIG.y0 + 2 * (TWIG.cy - TWIG.y0) * t * (1 - t); };
$('twig').setAttribute('d', `M${TWIG.x0} ${TWIG.y0} Q${(TWIG.x0 + TWIG.x1) / 2} ${TWIG.cy} ${TWIG.x1} ${TWIG.y0}`);
const FOOT_X = 500, K = 2.5, X0 = FOOT_X - (103.5 - 40) * K, Y0 = twigY(FOOT_X) - 1 - (192 - 24) * K;
const toPlate = ([x, y]) => [X0 + (x - 40) * K, Y0 + (y - 24) * K];

const frame = el('svg', { class: 'specimen-svg', x: X0, y: Y0, width: 140 * K, height: 176 * K, viewBox: '40 24 140 176' }, $('specimen'));
el('path', { class: 'fe-pattes', d: perchedLegs({}) }, frame);
el('path', { d: PERCHED.BODY }, el('clipPath', { id: 'specimen-clip' }, frame));
const body = el('g', {}, frame);
el('path', { class: 'fe-corps', d: PERCHED.BODY }, body);
const inside = el('g', { 'clip-path': 'url(#specimen-clip)' }, body);
el('path', { class: 'fe-ventre', d: PERCHED.BELLY }, inside);
const folded = el('path', { class: 'fe-aile', d: wing(0) }, inside);
el('path', { class: 'fe-bec', d: PERCHED.BEAK }, body);
el('circle', { class: 'fe-oeil', ...PERCHED.EYE }, body);
el('circle', { class: 'fe-reflet', ...PERCHED.HIGHLIGHT }, body);
const over = el('path', { class: 'fe-aile', d: wing(0), opacity: 0 }, body);
// part ii: the silhouette's outline, which draws itself
el('path', { class: 'outline', d: `${PERCHED.BODY} ${PERCHED.BEAK}`, pathLength: 1 }, body);
// part iii: the shoulder, and the arc the wing tip goes along
const [sx, sy] = PERCHED.SHOULDER;
el('circle', { class: 'pivot', cx: sx, cy: sy, r: 64 }, frame);
el('circle', { class: 'pivot-dot', cx: sx, cy: sy, r: 3.5 }, frame);

// the wing goes up and down from where it is: a quick second pick reverses it
let raised = 0, target = 0, moving = false;
const drawWing = () => { const d = wing(easings.overshoot(raised)); folded.setAttribute('d', d); over.setAttribute('d', d); over.setAttribute('opacity', wingOverlayOpacity(raised).toFixed(3)); };
const raiseWing = (to) => {
  target = to;
  if (reduced) { raised = to; drawWing(); return; }
  if (moving) return; moving = true;
  animate((dt) => { raised += Math.sign(target - raised) * Math.min(Math.abs(target - raised), dt / 0.45); drawWing(); if (raised === target) { moving = false; return false; } });
};

/* ——— Leader lines: from a mark on the bird to its callout ——— */
const PARTS = {
  brand: { at: toPlate([160, 58]), num: 'i' },
  tokens: { at: toPlate([128, 128]), num: 'ii' },
  starling: { at: toPlate(PERCHED.SHOULDER), num: 'iii' },
  murmuration: { at: [300, twigY(300) - 16], num: 'iv' },
};
const leads = {};
for (const [name, p] of Object.entries(PARTS)) {
  const g = el('g', { class: 'lead', 'data-part': name }, $('leaders'));
  const line = el('line', { class: 'leader', x1: p.at[0], y1: p.at[1], x2: p.at[0], y2: p.at[1] }, g);
  el('circle', { class: 'mark', cx: p.at[0], cy: p.at[1], r: 6 }, g);
  el('text', { class: 'mark-num', x: p.at[0] + 14, y: p.at[1] - 12 }, g).textContent = p.num;
  el('circle', { class: 'hit', cx: p.at[0], cy: p.at[1], r: 30 }, g).addEventListener('click', () => pick(name));
  leads[name] = { g, line };
}
const callouts = [...document.querySelectorAll('.callout')];
// the line ends at the callout's edge facing the bird, level with its name
function drawLeaders() {
  const inv = drawing.getScreenCTM().inverse(), pt = drawing.createSVGPoint();
  for (const c of callouts) {
    const r = c.getBoundingClientRect(); if (!r.width) continue;
    pt.x = c.classList.contains('left') ? r.right : r.left; pt.y = r.top + r.height * 0.42;
    const q = pt.matrixTransform(inv), line = leads[c.dataset.part].line;
    line.setAttribute('x2', q.x.toFixed(1)); line.setAttribute('y2', q.y.toFixed(1));
  }
}

/* ——— The flock: on the twig, until it takes the bird's shape ——— */
const canvas = $('flock');
const colours = () => [css('--fe-birds'), css('--fe-birds'), css('--fe-birds-2')];
const flock = createMurmuration(canvas, { frame: 'canvas', count: 240, colors: colours() });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => flock.setColors(colours()));
// from the plate's units to the canvas: through the drawing's own matrix, whatever its framing
const toCanvas = () => {
  const m = drawing.getScreenCTM(), c = canvas.getBoundingClientRect(), pt = drawing.createSVGPoint();
  const map = ([x, y]) => { pt.x = x; pt.y = y; const q = pt.matrixTransform(m); return [q.x - c.left, q.y - c.top]; };
  map.unit = m.a;
  return map;
};
const onTwig = () => {
  const map = toCanvas(), pts = [], [vx, , vw] = drawing.getAttribute('viewBox').split(' ').map(Number);
  for (const [a, b] of [[60, 340], [670, 940]]) for (let x = Math.max(a, vx + 8); x < Math.min(b, vx + vw - 8); x += 13 / map.unit) pts.push(map([x, twigY(x) - 1]));
  return pts;
};
// shapes.starling draws the logo's body at 3.4 × around (112, 115) of the bird's frame, centred on the 720 × 640 frame:
// its points go back to the bird's frame, then onto the specimen
const inBird = () => { const map = toCanvas(); return sampleShape(shapes.starling, 240).map(([x, y]) => map(toPlate([112 + (x - 360) / 3.4, 115 + (y - 320) / 3.4]))); };
// in the bird, each small bird's middle goes on its point (centred), so that the flock fills the silhouette exactly; on the twig, its feet.
// Everywhere, they are shy: the pointer comes close, they take off, circle, then land on their place again
const land = (instant = false) => flock.perch(part === 'murmuration' ? inBird() : onTwig(), { rest: 'leave', instant, centred: part === 'murmuration', shy: true });

/* ——— Picking a part: one is always open, any other is one click (or one arrow key) away ——— */
const NAMES = Object.keys(PARTS);
let part = '';
const plate = figure.closest('.plate'), themeButton = $('theme');
// the plumage's button dresses the bird for the other theme than the page's, then back
const otherTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'day' : 'night');
const showTheme = () => { const on = Boolean(plate.dataset.swatch); themeButton.setAttribute('aria-pressed', on); themeButton.textContent = on ? "Back to the page's colours" : `Dress it for the ${otherTheme()}`; };
themeButton.addEventListener('click', () => { if (plate.dataset.swatch) delete plate.dataset.swatch; else plate.dataset.swatch = otherTheme(); showTheme(); });
const entries = [...document.querySelectorAll('.entry')], tabs = [...document.querySelectorAll('.switch [role="tab"]')], pill = document.querySelector('.pill');
// the pill slides under the open part's tab
const movePill = () => { const t = tabs.find((x) => x.dataset.part === part); if (!t || !t.offsetWidth) return; pill.style.width = `${t.offsetWidth}px`; pill.style.transform = `translateX(${t.offsetLeft}px)`; };
function pick(name, { instant = false } = {}) {
  if (name === part) return;
  const was = part; part = name;
  figure.dataset.part = part;
  callouts.forEach((c) => c.setAttribute('aria-pressed', c.dataset.part === part));
  tabs.forEach((t) => { const on = t.dataset.part === part; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
  Object.entries(leads).forEach(([n, l]) => l.g.classList.toggle('on', n === part));
  entries.forEach((e) => { const on = e.dataset.entry === part; e.classList.toggle('active', on); e.inert = !on; });
  pill.classList.toggle('instant', instant); movePill();
  if (instant) requestAnimationFrame(() => requestAnimationFrame(() => pill.classList.remove('instant')));
  // the plumage's day or night stays with the plumage
  if (part !== 'tokens') delete plate.dataset.swatch;
  showTheme();
  // iii: the wing turns around the shoulder
  raiseWing(part === 'starling' ? 1 : 0);
  // iv: the flock leaves the twig and takes the bird's shape, or goes back
  if (part === 'murmuration' || was === 'murmuration') land();
}
document.querySelectorAll('button[data-part]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.part)));
// ← → move from part to part on the tabs and on the callouts (the focus follows), Home and End go to the ends
const step = (e) => {
  const i = NAMES.indexOf(part), to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: NAMES.length - 1 }[e.key];
  if (to == null) return;
  e.preventDefault();
  const name = NAMES[(to + NAMES.length) % NAMES.length];
  pick(name, { instant: true });
  const group = e.currentTarget.querySelectorAll('button[data-part]');
  [...group].find((b) => b.dataset.part === name).focus();
};
document.querySelector('.switch').addEventListener('keydown', step);
document.querySelector('.callouts').addEventListener('keydown', step);

/* ——— Start ——— */
// on a small screen, the plate is framed around the specimen: otherwise the bird and its numerals are too small
const small = matchMedia('(max-width: 960px)');
const frameFigure = () => drawing.setAttribute('viewBox', small.matches ? '230 50 540 540' : '0 0 1000 640');
frameFigure(); drawWing(); pick('brand', { instant: true }); drawLeaders(); land(true);
addEventListener('resize', () => { frameFigure(); drawLeaders(); movePill(); land(true); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawLeaders(); movePill(); sampleShape(shapes.starling, 240); });
