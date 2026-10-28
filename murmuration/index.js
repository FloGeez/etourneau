/* etourneau/murmuration — the etourneau layer of @flogeez/murmuration: the same engine, with the starling as the perched
   bird and the brand's purple by default, and the brand's shapes. The articulated starling lives in etourneau/starling. */
import { createMurmuration as createFlock } from '@flogeez/murmuration';
import { PERCHED } from '../starling/index.js';

/** The starling of the logo, as the flock's perched bird (its feet on its place). */
export const STARLING = { path: PERCHED.BODY, anchor: [104, 195], scale: 0.065 };

/** createMurmuration of @flogeez/murmuration, with the starling and the brand's purple unless told otherwise. */
export const createMurmuration = (canvas, options = {}) => createFlock(canvas, { glyph: STARLING, colors: ['#5B2A9E', '#2A1245'], ...options });

export { createScenes, sampleShape, fitShape, SHAPE_WIDTH, SHAPE_HEIGHT, roundRect, solid, hollow, stroke, animate } from '@flogeez/murmuration';
export { shapes } from './shapes.js';
