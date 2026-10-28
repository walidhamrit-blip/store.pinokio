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

## Deploy with Freebuff Sites

`deploy.json` points at the build output. After `bun run build`, deploy with
the `sites_deploy` tool from this directory.
