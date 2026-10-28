---
name: brand
description: "Apply the etourneau brand (the etourneau package: tokens, logo, icons, illustrations) to a page or an app: install, Tailwind / Shadcn theme, what each design role becomes in the --fe-* tokens, logo, icons, illustrations, light and dark. Use before creating or restyling a screen, a component or a page that carries the etourneau brand."
---

# The etourneau brand

The purple starling: Florian Etourneau's identity. This skill says what the brand's pieces are and how an app uses them. The values live in the `etourneau` package (`etourneau/tokens.json` is the source, `etourneau/tokens.css` the `--fe-*` variables): read them there, never copy them into the app.

## Install

```sh
npm i etourneau
```

Load `etourneau/tokens.css` before the app's own CSS, and the fonts:
`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500&display=swap`

Light and dark follow `prefers-color-scheme`; `data-theme="light"` or `"dark"` on `<html>` forces one; the `.fe-light` / `.fe-dark` classes force a theme on a single block. Every `--fe-*` theme token switches on its own: write no colour by hand, in either theme.

With Tailwind v4 and Shadcn, map the Shadcn variables onto the tokens once, in the global CSS:

```css
@import "etourneau/tokens.css";
:root {
  --background: var(--fe-bg); --foreground: var(--fe-text);
  --card: var(--fe-surface); --card-foreground: var(--fe-text);
  --popover: var(--fe-surface); --popover-foreground: var(--fe-text);
  --primary: var(--fe-primary); --primary-foreground: var(--fe-on-primary);
  --secondary: var(--fe-surface-2); --secondary-foreground: var(--fe-text);
  --muted: var(--fe-surface-2); --muted-foreground: var(--fe-text-muted);
  --accent: var(--fe-primary-soft); --accent-foreground: var(--fe-text);
  --destructive: var(--fe-danger);
  --border: var(--fe-border); --input: var(--fe-border); --ring: var(--fe-focus);
  --radius: var(--fe-radius-md);
}
@theme inline {
  --font-sans: var(--fe-font-heading); --font-mono: var(--fe-font-code);
  --ease-out: var(--fe-ease-out); --ease-in-out: var(--fe-ease-in-out); --ease-overshoot: var(--fe-ease-overshoot);
}
```

Shadcn's `accent` is a hover background: it maps to `--fe-primary-soft`, not to the brand's `--fe-accent` (terracotta).

## Motifs

- *The point*, the beak's triangle: links, tags, bullets.
- *The wire*: separators, a progress line, the support of illustrations.
- *The murmuration*: the signature moment, see `/etourneau:murmuration`.

## Fixed rules

- **Terracotta (`--fe-accent`) is for markers only**: section markers, the ball, a punctuation. Never a large surface, never the accent role.
- Type: Bricolage Grotesque for everything (titles 800, subtitles and labels 700, text 400); JetBrains Mono 14 / 500 for markers, code and figures that tick. Scale: 14 / 16 / 20 / 24 / 32 / 48 / 72 (`--fe-size-*`).
- Section markers: mono 14 / 500 in terracotta, above the content, unnumbered.
- Body text is `--fe-text` on `--fe-bg`. In each colour scale, the **600** passes AA on white; the **700** of purple is the brand colour.
- Focus: a solid 3 px outline in `--fe-focus`, offset by 3 px. Targets of 44 px.
- One bird, in profile only. Its wings beat with time, never with scroll. Every animation has a static version under `prefers-reduced-motion`.

## The drawings

- **Logo** (`etourneau/logo/*`): right, left, night, mono, perched (with legs), head only; SVG coloured by the `--fe-logo-*` tokens, PNG next to them. Clear space: a quarter of its height. Minimum 24 px; below that, the head alone. It is never distorted, recoloured, shaded or redrawn as an outline.
- **Icons** (`etourneau/icons/*`): 29 icons on a 24 px grid, 2 px stroke in `currentColor`, a single filled point in `--fe-picto-accent` (cut-outs in `--fe-picto-bg`): two variables set on a parent, defaulting to the brand purple and white. Use the sprite: `<svg width="24" height="24"><use href="…/sprite.svg#fe-mail"/></svg>`. Only exception: GitHub and LinkedIn's official logos, in one colour, at 18 px.
- **Illustrations** (`etourneau/illustrations/*`): the shot, cocked, in flight (two), the family on the wire, on the rim, dribble. The same bird as the logo; colours driven by the tokens, so one file serves both themes.
- **Avatars** (`etourneau/avatars/*`): sand, night, purple, made for a round crop.
- **Favicons** (`etourneau/favicon/*`): copy the folder into the public folder and paste `favicon/head.html` into the `<head>`.

The identity (the starling, its drawings, the token values) is Florian Etourneau's, all rights reserved: use it only in his own projects.
