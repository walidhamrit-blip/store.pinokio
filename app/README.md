# Store

An editorial storefront for a small catalogue: home page with hero, new
arrivals, categories, a lookbook section and bestsellers; a shop page with
category and price filters and sorting; product pages with options, quantity
and an accordion; a slide-out bag with free-shipping progress; and a demo
checkout with an order confirmation. The bag persists in the browser.

## Run it

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # dist/client (assets) + dist/store/index.js (Worker)
```

## Make it yours

- `src/data/products.ts` is the catalogue: products, categories, prices and
  copy. Images live in `public/images`.
- `src/app/pages/*` are the screens; `src/app/components/*` the pieces
  (nav, bag drawer, product card, footer, primitives).
- `src/styles.css` holds the tokens: cream canvas, ink text, a single
  terracotta accent, Instrument Serif for display type and Inter for the rest.
  Everything rounded is a squircle via `corner-shape`; true circles use `.round`.
- `src/worker/index.ts` handles `/api/orders` and `/api/newsletter`. The
  checkout is a demo: swap the order handler for a Stripe Checkout session
  (keep the secret in Sites → Secrets) or save orders to D1.

## Deploy with Freebuff Sites

`deploy.json` points at the build output. After `bun run build`, deploy with
the `sites_deploy` tool from this directory.
