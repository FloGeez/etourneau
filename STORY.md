# The story of the starling

How the brand came to be, and the choices along the way. The code says what the brand is; this page says why.

## September 2026 — the guidelines first

The brand started as guidelines, validated before a single page of the site was built: the logo, the palette, the icons, the illustrations, the animation script.

- **Why a starling.** Etourneau is my name, and I have always liked the amethyst starling: it was my Slack profile picture some fifteen years ago.
- **The purple starling.** The amethyst starling in three flat colours: amethyst back, night wing, cream breast, a black eye with a highlight, a pointed beak. No yellow: one colour too many, too much, it lacked class.
- **Then the site wins.** Building the site sharpened the direction, so the guidelines caught up with it, and the rule stayed: where they differ, the site wins.
- **One source for the values.** `tokens.json` became the single source; the CSS and every file that carries a fixed colour are generated from it.
- **The articulated starling.** The same bird as the logo, cut into parts (wing, head, body, legs) that turn around their pivots, instead of swapping two drawings. One drawing, every gesture, and the bird stays the logo's.
- **Basketball.** I played competitive basketball for more than twenty years, so the bird plays too: it shoots, cocks the ball, dribbles, sits on the rim, and the ball keeps its terracotta. The scoreboard palette is a Bodet board, the one hanging in French gyms: my father worked at Bodet, and the board is a tribute to him. It is the only exception to the palette.
- **The dark theme.** A beautiful dark with just a hint of colour: not a dark grey, not a dark purple, a black tinted with purple (variant C, "Night"), next to "Amethyst & sand" in light. No theme colour is written by hand anywhere.

## 19 October — going public

The repository opened, so everything moved to English: the tokens, the API, the texts. Then what nothing used went: the Angular components, the SCSS output, the take-off and breathing gestures.

- **One flock.** The site and the guidelines each had their murmuration; they became one engine, then the engine left the brand: [`@flogeez/murmuration`](https://github.com/FloGeez/murmuration), open source under MIT, with a plain bird. The brand only gives it the starling, the purple and its shapes.
- **Packages.** The brand was cut into `@etourneau` packages, one per kind of piece, published by a workflow through npm trusted publishing.
- **Skills.** A Claude Code plugin, so that an agent applies the brand and animates the flock the way the brand wants.

## 26 October — the plate

- **The starling gets its own package**: its geometry, its gestures and one animation loop, with no dependency.
- **The front page as a naturalist's plate.** The starling drawn large and annotated, one part of the bird per part of the brand: the silhouette (the drawings), the plumage (the tokens), the movement (the starling), the flock (the murmuration). The parts keep their French names. The silhouette draws itself, the plumage takes its colours one token after another, the flock is shy: the pointer comes close, the birds take off, then land on their place again.

## 28 October — one package

Four packages, one repository, one consumer: too much to maintain for what it gives. So one package with an entry per part: `etourneau` 1.0.0, a fresh start, with `etourneau/tokens.css`, `etourneau/starling`, `etourneau/murmuration` and the drawings. Its one dependency is the flock's engine. A separate package only when a piece needs a life of its own, with its own releases, as the slides may one day.

## The choices that hold

- **Colours**: "Amethyst & sand" in light, "Night" in dark. Terracotta for the ball and for markers only. Two illustration palettes: the plumage (the family) and the scoreboard.
- **Type**: Bricolage Grotesque (titles 800, subtitles and labels 700, body 400) and JetBrains Mono 14/500 for markers and code. Scale 14 / 16 / 20 / 24 / 32 / 48 / 72.
- **Motifs**: the point (the beak's triangle) and the wire.
- **Icons**: a 24 px grid, a 2 px stroke, a single flat fill, the point. Only exception: GitHub and LinkedIn's official logos.
- **Motion**: one bird, in profile only. Its wings beat with time, never with scroll; a gesture driven by scroll never waits for a timed animation. Animations only at the moments of the script, always a static version when motion is reduced.
- **Tone**: obvious, concrete, collective.
