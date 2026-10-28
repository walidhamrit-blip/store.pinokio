# Store

An editorial storefront for a small catalogue: home page with hero, new
arrivals, categories, a lookbook section and bestsellers; a shop page with
category and price filters and sorting; product pages with options, quantity
and an accordion; a slide-out bag with free-shipping progress; and a demo
checkout with an order confirmation. The bag persists in the browser.

The store speaks **Arabic first** (full RTL), with French and English a click
away, and ships six palettes for clothes, accessories and beauty — sand, noir,
rose, olive, terracotta and lavender — each with a light and a dark mode.

## Run it

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # dist/client (assets) + dist/store/index.js (Worker)
```

## Make it yours

- `src/data/products.ts` is the catalogue: products, categories, prices and
  English copy. Images live in `public/images`.
- `src/data/i18n.ts` holds the French and Arabic catalogue copy, the choice
  labels ("Oat", "Sage"…) and the country names. Anything left out falls back
  to English.
- `src/app/i18n/dict.ts` is every interface string, keyed, for `ar`, `fr` and
  `en`. English is the source of truth; missing translations fall back to it.
- `src/app/pages/*` are the screens; `src/app/components/*` the pieces
  (nav, bag drawer, product card, footer, primitives).
- `src/styles.css` holds the tokens: canvas, surface, ink, muted, line and one
  accent. Instrument Serif sets display type in French and English, Inter the
  rest; Arabic uses Noto Kufi for display and Noto Sans Arabic for text.
  Everything rounded is a squircle via `corner-shape`; true circles use `.round`.
- `src/app/lib/prefs.tsx` stores language, theme and light/dark in
  `localStorage` and writes them onto `<html>` (`lang`, `dir`, `data-theme`,
  `.dark`). The small script in `index.html` applies them before first paint.
- Themes are pure token swaps: six blocks at the top of `src/styles.css` plus
  six `html.dark[data-theme=…]` blocks. Add one and it appears in the picker.
- `src/worker/index.ts` handles `/api/orders` and `/api/newsletter`. The
  checkout is a demo: swap the order handler for a Stripe Checkout session
  (keep the secret in Sites → Secrets) or save orders to D1.

## Deploy

### Cloudflare Workers (recommended)

```sh
npx wrangler login   # once
npm run deploy       # build + wrangler deploy
npm run deploy:dry   # build + show what would be uploaded, no account needed
```

`wrangler.jsonc` bundles the Worker (`src/worker/index.ts`, the `/api/*` routes)
with the built store as static assets and SPA fallback, so a single deploy
serves both. The live URL is `https://<name>.<subdomain>.workers.dev`; rename
`"name": "store"` in `wrangler.jsonc` to pick another subdomain, and add a
custom domain from the dashboard. Logs: `npx wrangler tail`.

If you would rather not touch Wrangler, deploy the same `dist/` with
Cloudflare Pages: root directory `app`, build `npm run build`, output
`dist/client`. Pages then serves the static store only — the `/api/*` routes
live in the Worker, so keep the Worker deployed or move those handlers to
Pages Functions (`functions/api/*.ts`).

### Freebuff Sites

`deploy.json` points at the build output. After `npm run build`, deploy with
the `sites_deploy` tool from this directory. `scripts/postbuild.mjs` strips
hidden files, source maps and their `sourceMappingURL` comments, so the same
`dist/` is accepted by both targets.
