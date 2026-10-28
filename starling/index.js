/* etourneau/starling — the brand's articulated starling: its geometry and the maths of each gesture (starling.js, no DOM),
   the flying bird's wing beat in an SVG (flight.js), and one animation loop for every bird that moves (loop.js). */
export * from './starling.js';
export { createFlap } from './flight.js';
export { animate } from './loop.js';
