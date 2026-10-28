/* The flying starling in an SVG: its wing beat, driven by the package's animation loop (loop.js).
   The wings beat with time, never with scroll. The starling flaps while climbing and glides while diving.

   The flying bird's <g> holds: .flight-inner > .wing-far (far wing), body, belly, .wing-near (near wing), beak, eye.
   Its geometry comes from starling.js (FLYING); other class names can be passed as options. */
import { animate } from './loop.js';
import { flightWings, flightBob, advanceFlight } from './starling.js';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ——— The wing beat ———
   const flap = createFlap(g);  flap.start();  flap.state.target = 1 (glide) or 0 (flap);  flap.stop();
   state: { c, glide, target, glideAt } — glideAt 0.3 for a glide, 0.05 wings raised to brake.
   onFrame(dt), optional: called on each frame while flapping (to move the bird along with its wings). */
export function createFlap(g, { near = '.wing-near', far = '.wing-far', inner = '.flight-inner', onFrame = null } = {}) {
  const nearEl = g.querySelector(near), farEl = g.querySelector(far), innerEl = g.querySelector(inner);
  const state = { c: 0, glide: 0, target: 0, glideAt: 0.3, active: false };
  // an SVG without the parts: the bird moves along, wings still, without errors
  const articulated = Boolean(nearEl && farEl && innerEl);
  const draw = () => {
    if (!articulated) return;
    const w = flightWings(state.c, state.glide, state.glideAt);
    nearEl.setAttribute('d', w.near); farEl.setAttribute('d', w.far);
    innerEl.setAttribute('transform', `translate(0 ${flightBob(state.c, state.glide).toFixed(2)})`);
  };
  const update = (dt) => {
    if (!state.active) return false;
    advanceFlight(state, dt, state.target);
    draw();
    if (onFrame) onFrame(dt);
  };
  return {
    state, draw,
    start() { if (state.active || reducedMotion()) return; state.active = true; animate(update); },
    stop() { state.active = false; },
  };
}
