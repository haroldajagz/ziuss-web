# ZIUSS Energy & Power — website

Static HTML, CSS and JavaScript. No build step.

## Preview locally

The pages use clean routes (`/about/`, `/solutions/diesel-generators/`) and root-relative asset paths, so open the site through a server rather than by double-clicking a file:

```bash
node serve.mjs
```

Then visit http://localhost:4173. Any static host works for deployment, as long as the site sits at the domain root.

## Pages

| Route | File |
| --- | --- |
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/solutions/diesel-generators/` | `solutions/diesel-generators/index.html` |
| `/solutions/gas-engines/` | `solutions/gas-engines/index.html` |
| `/solutions/hybrid-renewable/` | `solutions/hybrid-renewable/index.html` |
| `/services/` | `services/index.html` |
| `/contact/` | `contact/index.html` |

The header, mobile menu, footer and SVG sprite are repeated in every page. A change to navigation or footer has to be made in all seven files.

## Design system

Everything follows the 2026 brand guidelines. Tokens live at the top of `assets/css/site.css`.

- **Colour:** ink `#05170B` / `#01221B`, forest `#146334`, lime `#95F071`, mint `#DEFCD4`, yellow `#FBFD05`, cream `#FBFFD7`. No pure white or pure black.
- **Type:** Exo (700, 800, 900) for headings, always uppercase. Geist for body.
- **Section themes:** add `t-ink`, `t-forest`, `t-mint`, `t-cream`, `t-yellow` or `t-lime` to a section; buttons, tiles and links pick up the right contrast.
- **Brand marks:** the logotype and the "Eco Power Generation" mark are the vector originals from the brand guide, inlined as an SVG sprite (`#i-logo`, `#i-ring`, `#i-bolt`, `#i-zap`).
- **Photos:** `assets/img/*.webp` are taken from the brand guide. Swap in higher-resolution originals when available, keeping the same file names.

## Motion

- `data-reveal` fades and lifts an element in when it enters the viewport. `data-stagger` on a parent staggers its `data-reveal` children.
- `data-split` on a heading reveals it word by word.
- `data-count="5000"` counts a number up when revealed.
- `data-tilt` adds the pointer tilt used on the poster cards.
- All of it is disabled for visitors with reduced motion turned on, and the page is fully visible without JavaScript.

## Audit form

The form is not connected to a backend yet. With no endpoint set, submitting opens the visitor's email app with the request addressed to contact@ziusspowerng.com.

To post submissions to a service instead, set `data-endpoint` on the `<form data-audit>` element in `index.html` and `contact/index.html`. The form sends JSON with `name`, `email`, `phone`, `facility` and `power`.

## Fuel savings calculator

Applies the 30% to 60% fuel reduction range from the site copy to a monthly diesel spend. It is labelled as an illustrative estimate. The range and bounds are in the `data-calc` block in the HTML and the calculator section of `assets/js/site.js`.

## Placeholders to resolve

- "Download Technical Specs" on the diesel page links to the contact form because there is no spec sheet file yet.

## Review overlay (Agentation)

`node serve.mjs` adds the Agentation toolbar (bottom-right corner) to every page so changes can be marked up in the browser and sent to Claude Code. The page files themselves are untouched: the script is injected by the preview server only.

- Tooling lives in `.dev/` (its own `package.json` and `node_modules`). Do not upload `.dev/` when deploying.
- Run without the overlay: `OVERLAY=0 node serve.mjs`.
- The bundle is not kept in git. After a fresh clone, or after updating the package, build it with `cd .dev && npm install && npm run build`. Without it the preview simply runs with no toolbar.
- Annotations go to the Agentation MCP server on `http://localhost:4747`, which Claude Code starts from the user-level MCP config.
