# DAOS — داوس

A presentation storefront for **DAOS**, the accessories shop in Zliten, Libya
(bags, jewelry, hair accessories, scent and gifts). It is built from the shop's
real details: the address on Al Muaddat Street behind Al Wahda Bank, Google's
opening hours, the phone number, WhatsApp, the 4.7 rating, and delivery in
Zliten, Misrata and Tripoli.

Pages: home with hero, new arrivals, categories, editorial and a shop card;
a shop page with category and price filters and sorting; product pages with
options, quantity and an accordion; a slide-out bag with free-delivery progress;
and a cash-on-delivery checkout that records the order in the dashboard.

The shop speaks **Arabic first** (full RTL), with French and English a click
away, and ships six palettes for clothes, accessories and beauty — sand, noir,
rose, olive, terracotta and lavender — each with a light and a dark mode.

Prices are in Libyan dinar, formatted by `money()` in `src/app/lib/cart.tsx`.

## Run it

```sh
npm install
cp .dev.vars.example .dev.vars   # local dashboard password
npm run dev                      # http://localhost:5173 and /admin
npm run build                    # dist/client (assets) + dist/store/index.js
```

Local dev writes to a SQLite file in `.wrangler/` seeded with the starter
catalogue, so editing articles never touches production.

## Make it yours

- `src/data/shop.ts` is the shop itself: address, hours, phone, WhatsApp,
  Facebook, map link, rating and delivery line, in the three languages. Change
  it there and the header, the home card, the about page and the footer follow.
- `src/data/brands.ts` is the list on the running banner under the hero
  (accessories, ready-to-wear, watches). Reorder or replace it freely — the
  banner loops whatever names it gets.
- `src/app/components/BrandMarquee.tsx` is that banner: two copies of the list
  on one track, sliding by half its width, in the theme's own `line`, `muted`
  and `accent` tokens, paused on hover and stopped when the visitor asks for
  reduced motion.
- `src/app/components/QrDialog.tsx` gives every piece a QR code of its own
  address, generated in the browser (`qrcode.react`) — on the card as a small
  icon, and next to the price on the product page. Nothing is sent anywhere.
- `src/app/components/WhatsAppButton.tsx` is the floating WhatsApp bubble, fed
  by `shop.whatsapp`.
- `src/data/seed.json` is the starter catalogue (all three languages). It seeds
  D1 on first run and is the offline fallback for the storefront.
- `src/data/products.ts` holds the product shape, the categories and the
  validation used by the dashboard.
- `src/data/i18n.ts` holds labels that are not per-product: category names, the
  choice labels ("Camel", "Gold"…) and the country names (Libya first).
- `src/app/pages/Admin.tsx` is the dashboard: login, article editor with one tab
  per language, order list.
- `src/app/lib/catalog.tsx` fetches the catalogue; `src/app/lib/cart.tsx` reads
  it so the bag survives catalogue edits.
- `src/worker/index.ts` is the API: products, orders, newsletter, dashboard
  routes, D1 schema created lazily and seeded on first request.
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
- `src/worker/index.ts` handles the whole API (see the table below). The
  checkout is a demo: it stores the order and takes no money. Swap the order
  handler for a Stripe Checkout session when you want real payments, keeping
  the key in a Worker secret.

## Dashboard

`/admin` signs in with `ADMIN_PASSWORD` (a Worker secret; see
`.dev.vars.example` for local dev) and gives the owner:

- **Articles** — create/edit/delete, hide, reorder, price and compare-at price,
  badge, category, image path or URL, options, and one copy tab per language
  (Arabic first, English as fallback).
- **Orders** — every stored order with its lines and total.
- **Setup** — a reminder of where the data lives.

Auth is a 7-day HMAC cookie (`HttpOnly`, `SameSite=Strict`, `Secure` on https).
The dashboard is `noindex`. Everything is stored in D1, so edits survive deploys.

## Deploy

### Cloudflare Workers — the zero-cost path

```sh
# once
npx wrangler d1 create store          # paste database_id into wrangler.jsonc
npx wrangler secret put ADMIN_PASSWORD
npx wrangler login

# every time
npm run deploy        # build + wrangler deploy
npm run deploy:dry    # build + show the upload, no account needed
```

`wrangler.jsonc` bundles the Worker (`src/worker/index.ts`: API + dashboard +
assets binding with SPA fallback), so one deploy serves the shop and its API.
The live URL is `https://<name>.<subdomain>.workers.dev`; rename
`"name": "store"` to pick another, add a custom domain from the dashboard, and
watch logs with `npx wrangler tail`.

**From Git (no CLI):** connect the repo in Cloudflare → Workers & Pages →
Import, root `app`, build `cd app && npm ci && npm run build`, deploy
`cd app && npx wrangler deploy`. Then create the D1 database in
**Storage & Databases → D1** and paste its ID into `app/wrangler.jsonc` on
GitHub — the config file is the source of truth for Git deploys.

### Cloudflare Pages (static only)

Root `app`, build `npm run build`, output `dist/client`. Pages serves the shop
but not `/api/*`, so keep the Worker for the API or move those handlers to
Pages Functions (`functions/api/*.ts`).

### Freebuff Sites

`deploy.json` points at the build output. After `npm run build`, deploy with
the `sites_deploy` tool from this directory. `scripts/postbuild.mjs` strips
hidden files, source maps and their `sourceMappingURL` comments, so the same
`dist/` is accepted by both targets.

## Tests

```sh
npm run test        # jsdom: catalogue from D1, seed fallback, dashboard login, article creation
npm run typecheck
```
