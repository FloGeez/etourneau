---
name: murmuration
description: "Animate the etourneau starlings with etourneau/murmuration: a flock that lands on points, draws a shape, circles a zone, shies away from the pointer, follows the page section by section; and with etourneau/starling, the articulated starling (wing, head, legs, flight) in an SVG. Use when adding, changing or debugging the flock or the bird on a page, a slide or an app's signature moment."
---

# The murmuration

`etourneau/murmuration` is the etourneau layer of `@flogeez/murmuration`, the open-source engine: plain ES modules, no build. Its `createMurmuration` is the engine's, with the starling (`STARLING`) as the perched bird and the brand's purple by default; everything else of the engine is re-exported from `etourneau/murmuration`. Outside the brand, use `@flogeez/murmuration` directly (a plain bird, greys). The brand's rules come first (`/etourneau:brand`): one bird, in profile; wings beat with time, never with scroll; a static version under `prefers-reduced-motion`, which the package already handles for the flock and the wing beat.

## The engine's API: its README

The flock's whole API is documented in one place, the engine's README: `node_modules/@flogeez/murmuration/README.md` (or [github.com/FloGeez/murmuration](https://github.com/FloGeez/murmuration)). Read it there rather than from memory, it is the version installed:

- `createMurmuration` options: `frame` (`'page'`, a fixed canvas over the page, or `'canvas'`, the flock inside a plate, a slide, a card), `count`, `colors`, `glyph`, `scale`;
- `m.perch(points, options)` and its options (`rest`, `zone`, `keep`, `anchor`, `shy`, `instant`), `fly`, `scatter`, `setColors`, `setGlyph`, `setCount`, `destroy`;
- shapes: `sampleShape`, `fitShape` and the drawing helpers;
- `createScenes`, for a page in scenes;
- the live demo of every option.

## The flock in the brand

```js
import { createMurmuration } from 'etourneau/murmuration';

const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const colors = () => [css('--fe-birds'), css('--fe-birds'), css('--fe-birds-2')]; // 2 birds out of 3, then 1
const m = createMurmuration(canvas, { count: innerWidth <= 860 ? 200 : 320, colors: colors() });
// on theme change: m.setColors(colors()); when the page or the component goes away: m.destroy()
```

- **Colours come from the tokens** (`--fe-birds`, `--fe-birds-2`), read at start and again on each theme change: never a hex value in the page.
- **The starling stays the glyph.** `setGlyph` and the `glyph` option are for the engine's other uses; in the brand, the bird is the logo's.
- **Swarms stay off the text**: a `zone` sits above a shape or in a margin, never over a paragraph.
- **One bird per point.** Give a shape about as many points as there are birds; `rest: 'double'` or `'leave'` handles the others.

## The brand's shapes

```js
import { shapes, sampleShape, fitShape } from 'etourneau/murmuration';
```

- `shapes.starling`, `shapes.basket`, and the steps of florian-etourneau.dev's story, shared by the site and the guidelines: `shapes.work`, `shapes.editor`, `shapes.maxds`, `shapes.cv`, `shapes.rennes` (`rennes.key()` changes with the time in Rennes). A new shape that only one project uses lives in that project; once a second one needs it, it moves here.
- A shape must read in one second: few holes and thick strokes (the site's shapes use 16 to 36 units on the 720 × 640 frame).
- Sampling runs on the main thread: warm the shapes up with `requestIdleCallback` before the flock needs them, as the site does. A shape that writes text is only cached once the fonts are loaded: sample again after `document.fonts.ready`.
- `?debug` in the address shows the scene's name, the places (crosses) and the swarm's zone: look at it before tuning numbers.

## The articulated starling

`etourneau/starling` holds the articulated starling, apart from the flock, with no dependency. Its geometry (`starling.js`) is pure: it returns SVG paths and transforms, with no DOM. The perched bird lives in the viewBox `40 24 140 176` (`PERCHED`), the flying bird in its own frame centred on 114, 80 (`FLYING`).

- Wing: `wing(t)` from folded (0) to raised (1), rotating forwards around the shoulder; above 1, it overshoots. Show the uncut copy in front with `wingOverlayOpacity(t)`.
- Head: `headTransform(direction, tilt)` (1 ahead, −1 behind) and `beakOpacities(direction)` for the profile and front beaks. A head turns in one snap (`HEAD_DURATION`) and then holds still.
- Body and legs: `perchedBody({ dx, dy, tilt, sx, sy })` and `perchedLegs(body, feet, toes)`: the feet stay where you put them.
- Flight: `flightWings(c, glide)` gives the `near` and `far` wing paths, `flightBob` the body's rise, `advanceFlight(state, dt, target)` moves the cycle on (target 1 glides). `placeFlying(world, rot, s)` puts the flying bird's chest on a point: the hand-over between perched and flying happens there, on one frame.
- Easings and durations: `easings` and `DURATIONS` mirror the `--fe-ease-*` and `--fe-duration-*` tokens.
- A static drawing (a logo in a header, a bird in a scene) takes its paths from `PERCHED` and `wing(0)` rather than copying them: the site renders them in its Astro frontmatter.

`createFlap` drives a flying bird in an SVG: its `<g>` holds `.flight-inner > .wing-far`, the body, `.wing-near`, the beak and the eye.

```js
import { createFlap } from 'etourneau/starling';

const flap = createFlap(flyingG, { onFrame: (dt) => moveAlongPath(dt) });
flap.start(); flap.state.target = slope > 15 ? 1 : 0; // glide while diving
flap.stop();
```

`animate(update)`, from `etourneau/starling` too, is the one animation loop for every bird: `update(dt)` returns `false` to stop, and the loop sleeps when nothing moves.

`starling/demo.html` plays every gesture (raise the wing, flap and glide, walk, take off and land, stay alive, turn the head), with slow motion: read it before writing a new gesture. `murmuration/demo.html` plays the flock in the brand.
