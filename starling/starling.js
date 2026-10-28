/* The starling in motion.
   Articulated geometry and pure functions to animate the brand's bird.
   No dependency, no DOM access: every function returns SVG paths (the d attribute) or transforms.
   Frames: the perched bird lives in the viewBox "40 24 140 176", the flying bird in its own frame (centre ≈ 114, 80). */

/* ——— Helpers ——— */
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
const lp = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
/** Where t sits between a and b, from 0 to 1. */
export const progress = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
/** 0 → 1 → 0 as t goes from 0 to 1. */
export const bump = (t) => Math.sin(Math.PI * clamp(t, 0, 1));
/** Rotates point p by deg degrees around c. */
export const rotatePoint = (p, deg, c) => {
  const r = deg * Math.PI / 180, co = Math.cos(r), si = Math.sin(r), dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co];
};
const f = (n) => n.toFixed(2);
/** Points [start, (c1, c2, end)…] → closed path of cubic Bézier curves. */
export const closedPath = (P) => {
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 1; i < P.length; i += 3) d += `C${f(P[i][0])} ${f(P[i][1])} ${f(P[i + 1][0])} ${f(P[i + 1][1])} ${f(P[i + 2][0])} ${f(P[i + 2][1])}`;
  return d + 'Z';
};

/* ——— Easings ——— */
export const easings = {
  smooth: (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); },
  inOut: (t) => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  out: (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3),
  in: (t) => Math.pow(clamp(t, 0, 1), 3),
  /** ease-out with overshoot; k ≈ 1.3 for the wing, 2.2 for straightening up on landing */
  overshoot: (t, k = 1.3) => { t = clamp(t, 0, 1); const c = k + 1; return 1 + c * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2); },
};

/* ——— Perched bird ——— */
export const PERCHED = {
  BODY: 'M140 48 C132 34 108 32 98 46 C88 60 86 80 84 100 C82 130 70 160 52 192 L68 194 C80 176 92 164 102 156 C130 146 150 120 146 88 C145 78 143 70 140 66 Z',
  BELLY: 'M98 176 C100 136 120 108 164 98 L200 98 L200 200 L98 200 Z',
  BEAK: 'M138 49 L172 59 L139 65 Z',
  BEAK_FRONT: 'M114.5 60 L123.5 60 L119 70 Z', // the beak seen from the front, visible for an instant while the head turns
  EYE: { cx: 125, cy: 54, r: 4.6 }, HIGHLIGHT: { cx: 126.6, cy: 52.6, r: 1.4 },
  SKULL: { cx: 119, cy: 58, rx: 21, ry: 21 }, // round skull laid on the silhouette, same colour as the body
  HEAD_PIVOT: [119, 74],
  SHOULDER: [96, 100],
  HIPS: [[98, 150], [110, 146]], FEET: [[96, 192], [111, 192]], LEG: 42.05,
  TOES: [[-5, 2], [5, 3]],
  CHEST: [112, 105], // hand-over point with the flying bird
};

/* The wing: the same wing goes from folded (t = 0) to raised (t = 1) by rotating −185.3° around the shoulder,
   forwards, like an arm being raised. Beyond 1, the rotation goes on (overshoot). */
const FOLDED = [[94, 62], [118, 80], [122, 116], [106, 150], [89.3, 166], [72.7, 182], [56, 198], [65, 174], [71, 150.5], [76.5, 127.75], [82, 105], [87, 83], [94, 62]];
const RAISED = [[82, 116], [70, 86], [72, 46], [94, 16], [104, 2], [116, -6], [130, -12], [124, 8], [116, 34], [114, 64], [113, 84], [108, 102], [100, 116]];
export const WING_ANGLE = -185.3;
const RAISED_BACK = RAISED.map((p) => rotatePoint(p, -WING_ANGLE, PERCHED.SHOULDER));
/** Wing points at time t; index 6 is the wing tip (the "hand" that holds the ball). */
export const wingPoints = (t) => {
  const s = clamp(t, 0, 1);
  return FOLDED.map((p, i) => rotatePoint(lp(p, RAISED_BACK[i], s), WING_ANGLE * t, PERCHED.SHOULDER));
};
export const wing = (t) => closedPath(wingPoints(t));
export const WING_TIP = 6;
/** At rest, the folded wing cut out of the body (as in the guidelines) stays visible; as soon as it moves, an uncut copy comes to the front. */
export const wingOverlayOpacity = (t) => easings.smooth(Math.abs(t) / .12);

/** Head transform. direction: 1 looks ahead, −1 looks back. tilt: degrees (positive = beak down). */
export const headTransform = (direction, tilt = 0) => {
  const [px, py] = PERCHED.HEAD_PIVOT;
  return `rotate(${f(tilt)} ${px} ${py}) translate(${px} 0) scale(${f(direction)} 1) translate(${-px} 0)`;
};
/** Opacities of the profile beak and the front beak depending on the head's direction. */
export const beakOpacities = (direction) => {
  const a = Math.abs(direction);
  return { profile: clamp((a - .12) / .3, 0, 1), front: 1 - clamp(a / .4, 0, 1) };
};
/** Durations in seconds. Mirror of the --fe-duration-* tokens (tokens.json, group "duration"), keys included: a module without
    DOM does not read CSS, so any change is made on both sides. */
export const DURATIONS = { flash: .13, short: .25, medium: .45, long: .65 };
export const HEAD_DURATION = DURATIONS.flash; // a bird turns its head in one snap, then holds it still

/** Two-segment legs (heel pointing back): hips and feet in the perched bird's frame. */
export const legs = (hips, feet, toes = [0, 0]) => {
  const L = PERCHED.LEG; let d = '';
  for (let k = 0; k < 2; k++) {
    const h = hips[k]; let p = feet[k];
    let vx = p[0] - h[0], vy = p[1] - h[1], dd = Math.hypot(vx, vy);
    if (dd > L) { p = [h[0] + vx * L / dd, h[1] + vy * L / dd]; vx = p[0] - h[0]; vy = p[1] - h[1]; dd = L; }
    if (dd < L - .3) {
      const hh = Math.sqrt(L * L / 4 - dd * dd / 4); let nx = -vy / dd, ny = vx / dd; if (nx > 0) { nx = -nx; ny = -ny; }
      d += `M${f(h[0])} ${f(h[1])}L${f((h[0] + p[0]) / 2 + nx * hh)} ${f((h[1] + p[1]) / 2 + ny * hh)}L${f(p[0])} ${f(p[1])}`;
    } else d += `M${f(h[0])} ${f(h[1])}L${f(p[0])} ${f(p[1])}`;
    const a = rotatePoint([p[0] + PERCHED.TOES[0][0], p[1] + PERCHED.TOES[0][1]], toes[k], p);
    const b = rotatePoint([p[0] + PERCHED.TOES[1][0], p[1] + PERCHED.TOES[1][1]], toes[k], p);
    d += `M${f(a[0])} ${f(a[1])}L${f(p[0])} ${f(p[1])}L${f(b[0])} ${f(b[1])}`;
  }
  return d;
};

/* ——— Flying bird ——— */
export const FLYING = {
  BODY: 'M150 70 C162 70 170 78 170 86 C166 100 156 108 142 112 C118 118 92 116 72 110 L34 126 L44 108 L28 100 L70 96 C86 84 110 76 132 74 C138 71 144 70 150 70 Z',
  BELLY: 'M60 118 C96 98 136 96 180 90 L180 130 L60 130 Z',
  BEAK: 'M166 80 L198 88 L167 94 Z',
  EYE: { cx: 156, cy: 80, r: 4.4 }, HIGHLIGHT: { cx: 157.6, cy: 78.6, r: 1.3 },
  CENTER: [114, 80],
  CHEST: [120, 92], // hand-over point with the perched bird
  AXIS: -16, // body angle in flight; the perched bird is at −64 (a 48° gap)
};
const NEAR_UP = [[104, 88], [96, 58], [102, 30], [120, 6], [122, 32], [128, 58], [130, 84]];
const NEAR_DOWN = [[106, 94], [104, 116], [112, 136], [132, 150], [126, 128], [124, 110], [130, 92]];
const FAR_UP = [[122, 80], [128, 54], [146, 30], [172, 16], [162, 40], [154, 62], [142, 82]];
const FAR_DOWN = [[126, 92], [134, 112], [148, 124], [170, 132], [160, 118], [152, 104], [146, 90]];
const LAG = [0, .5, .8, 1, .8, .5, 0]; // the wing tip follows with a lag
export const FLAP = { frequency: 4.2, downstroke: .42, lag: .12, bob: 2 };
const phase = (c) => { c = ((c % 1) + 1) % 1; const d = FLAP.downstroke; return c < d ? Math.PI * c / d : Math.PI + Math.PI * (c - d) / (1 - d); };
const opening = (c) => (1 - Math.cos(phase(c))) / 2; // 0: wings up · 1: wings down

/**
 * Wings in flight.
 * c: position in the flapping cycle (advances by dt × frequency, driven by time, never by scroll).
 * glide: 0 flaps, 1 glides (wings held at glideAt). glideAt: 0.3 for a glide, 0.05 wings raised to brake.
 */
export const flightWings = (c, glide = 0, glideAt = .3) => {
  const tt = LAG.map((w) => lerp(opening(c - FLAP.lag * w), glideAt, glide));
  return {
    near: closedPath(NEAR_UP.map((p, i) => lp(p, NEAR_DOWN[i], tt[i]))),
    far: closedPath(FAR_UP.map((p, i) => lp(p, FAR_DOWN[i], tt[i]))),
  };
};
/** The body rises on each downstroke (in the bird's frame units). amplitude: 2 by default, less for a bird that flaps fast. */
export const flightBob = (c, glide = 0, amplitude = FLAP.bob) => -amplitude * Math.sin(phase(c)) * (1 - glide);

/**
 * Moves a flying bird forward by a time step dt (seconds), towards `target` (0 flaps, 1 glides).
 * state: { c, glide } — updated in place; c and glide are then passed to flightWings and flightBob.
 * While gliding, the bird holds its wings, without flapping again.
 */
export const advanceFlight = (state, dt, target) => {
  state.target = target;
  state.glide = (state.glide || 0) + (target - (state.glide || 0)) * (1 - Math.exp(-dt * 10));
  if (state.glide < .6) state.c += dt * FLAP.frequency;
  return state;
};

/* ——— Placing the birds ——— */
/** Body of the perched bird: dx, dy (units), tilt (degrees, around the hips 104,150), sx, sy (squash).
    Returns the body group's transform and a function that transforms a point of the same frame. */
export const BODY_CENTER = [104, 150];
export const perchedBody = ({ dx = 0, dy = 0, tilt = 0, sx = 1, sy = 1 } = {}) => {
  const [cx, cy] = BODY_CENTER;
  return {
    transform: `translate(${f(dx)} ${f(dy)}) rotate(${f(tilt)} ${cx} ${cy}) translate(${cx} ${cy}) scale(${f(sx)} ${f(sy)}) translate(${-cx} ${-cy})`,
    point: (p) => { let x = cx + (p[0] - cx) * sx, y = cy + (p[1] - cy) * sy; [x, y] = rotatePoint([x, y], tilt, [cx, cy]); return [x + dx, y + dy]; },
  };
};
/** Legs of the perched bird when its body moves: the hips follow the body, the feet stay where they are put. */
export const perchedLegs = (bodyState, feet = PERCHED.FEET, toes = [0, 0]) => {
  const c = perchedBody(bodyState);
  return legs(PERCHED.HIPS.map(c.point), feet, toes);
};
/** Position (x, y) to give the flying bird — transform "translate(x y) rotate(rot) scale(s) translate(-114 -80)" —
    so that its local point `local` lands on the point `world`. */
export const placeFlying = (world, rot, s, local = FLYING.CHEST) => {
  const q = rotatePoint([(local[0] - FLYING.CENTER[0]) * s, (local[1] - FLYING.CENTER[1]) * s], rot, [0, 0]);
  return [world[0] - q[0], world[1] - q[1]];
};

/* ——— Gestures at rest (available for tools) ——— */
/** blink: 0 → 1 → 0 in 140 ms from start (a gesture of its own at rest, without a token) */
export const BLINK_DURATION = .14;
export const blink = (t, start) => bump(progress(t, start, start + BLINK_DURATION));
