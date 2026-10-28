# DAOS — داوس

A one-click Pinokio launcher for **DAOS**, the accessories shop in Zliten, Libya:
a presentation storefront built from the shop's real listing — address, opening
hours, phone, WhatsApp, Google rating and the pieces it sells (bags, jewelry,
hair accessories, scent and gifts).

The shop opens in **Arabic** with a full right-to-left layout and a second name
in Latin letters, and can be read in French or English from the language menu.
A theme menu offers six palettes made for clothes, accessories and beauty —
sand, noir, rose, olive, terracotta and lavender — and a sun/moon switch flips
each of them between light and dark. All three preferences are remembered in the
browser and applied before the first paint.

Prices are in **Libyan dinar (LYD)**, delivery inside Libya is free over 250 LYD,
and checkout is cash on delivery: nothing is charged, the order is recorded in
the shop dashboard.

The shop, its address and its hours are data — [`app/src/data/shop.ts`](app/src/data/shop.ts)
is the only place to change them. The catalogue is in
[`app/src/data/seed.json`](app/src/data/seed.json) and editable from `/admin`.

The storefront is a React + Vite single page app served by a small
[Hono](https://hono.dev) Worker that handles the API routes. The app ships
inside this launcher under [`app/`](app), so Install only installs its
dependencies.

## Install with one click

Pinokio handles `pinokio://` links, so this one downloads the launcher straight
into your Pinokio app:

```
pinokio://?mode=download&url=https://github.com/walidhamrit-blip/store.pinokio.git
```

You can also clone it by hand:

```sh
git clone https://github.com/walidhamrit-blip/store.pinokio.git
```

Repository: https://github.com/walidhamrit-blip/store.pinokio — tagged with the
`pinokio` topic, so it also appears on Pinokio's Discover page.

## Install

1. Open this launcher in Pinokio.
2. Click **Install**. This runs `npm install` inside `app/` and marks the install
   complete.
3. Click **Start**. Pinokio runs the Vite dev server on loopback and then offers
   an **Open Web UI** button as soon as the server reports its URL.

Vite serves the store on `http://127.0.0.1:5173`. If that port is already taken
it automatically moves to the next free port, and the launcher picks up whatever
port it actually chose, so you never have to configure one.

## Use

- **Open Web UI** opens the running storefront.
- **Terminal** shows the live server log for the running session.
- **Deploy to Cloudflare** builds the store and uploads it as a Worker with
  static assets (see [Deploy to Cloudflare](#deploy-to-cloudflare)).
- **Update** pulls this launcher (when it is a git checkout) and re-runs Install.
- **Reinstall** runs Install again, for example after changing package.json.
- **Reset** removes `app/node_modules`, `app/dist`, `app/.wrangler` and the
  install marker. Your storefront source in `app/` is kept, so the next Install
  rebuilds a clean environment.

Everything visible in the store is data, not code: the catalogue lives in
Cloudflare D1 and is edited from `/admin` (the starter catalogue is bundled in
`app/src/data/seed.json`), the interface strings in
`app/src/app/i18n/dict.ts`, images in `app/public/images`, and the colours, type
and all six themes in `app/src/styles.css`.

## Demo shop with a dashboard — $0

The shop is a demo: no payment provider, no storage bills. Everything the owner
needs to change lives in **Cloudflare D1**, which is free at this scale, and the
dashboard is a page of the same Worker.

| Piece | Service | Free plan |
|---|---|---|
| Storefront + API + dashboard | Cloudflare Workers | 100k requests/day |
| Articles, orders, newsletter | Cloudflare D1 (SQLite) | 5 GB, 5M rows read/day, 100k written/day |
| Fonts, images, CSS, JS | Workers static assets | included |
| Dashboard login | one Worker secret | free |

Limits are per day and reset at 00:00 UTC; past them queries stop until the
reset. For a showcase catalogue that is far away — 100k writes/day is thousands
of orders. No credit card, no add-on.

### The dashboard (`/admin`)

Open `https://<your-worker>/admin` (or `http://localhost:5173/admin` in dev).

- **Articles** — create, edit, duplicate, delete, hide (draft), reorder, mark as
  bestseller, set price/compare-at price, badge, image, and the option list
  (glaze, colour, scent…). Every article has one tab per language: **Arabic,
  French, English**. Arabic is the one customers see first; English is the
  fallback if a translation is missing, and it mirrors the filled language so a
  card is never blank.
- **Orders** — the demo checkout now really stores orders (reference, e-mail,
  lines, total) instead of generating a reference and forgetting it.
- **Setup** — where the data lives and the reminder for the password command.

Changes are live immediately: the storefront reads `GET /api/products` on load,
and falls back to the catalogue bundled in the app if the API is unreachable.
The bag, language, theme and light/dark mode keep working offline.

### Three commands to switch it on

```sh
cd app
npx wrangler d1 create store        # prints the database_id
npx wrangler secret put ADMIN_PASSWORD
npm run deploy
```

`npx wrangler d1 create store` prints a `database_id`. **Paste it into
`app/wrangler.jsonc`**, replacing the `00000000-…` placeholder. Without a CLI:

1. Cloudflare → **Storage & Databases → D1 → Create** → name it `store`.
2. Copy the **Database ID**.
3. On GitHub, open `app/wrangler.jsonc` on `main` → pencil → replace the
   placeholder with that ID → *Commit changes*.

Keeping the ID in `wrangler.jsonc` matters when Cloudflare builds from Git: the
file is the source of truth for the deploy, so a binding added only in the
dashboard would be overwritten on the next push.

There are **no migrations to run**: the Worker creates its tables on the first
request and seeds them with the starter catalogue.

### Local development

```sh
cd app
cp .dev.vars.example .dev.vars   # local dashboard password
npm run dev                      # http://localhost:5173
```

Dev uses a local SQLite file in `app/.wrangler`, seeded automatically, so you can
edit articles without touching production data.

### Backups, and what it costs if the demo grows

```sh
npx wrangler d1 export store --remote --output backup.sql   # full dump
npm run db:studio                                           # list the articles
```

D1 has Time Travel (30 days of point-in-time recovery). If the shop ever needs
more than 10 GB per database, heavy analytics, or Postgres features (JSONB,
extensions), keep this code and move the data to Neon/Supabase behind
**Hyperdrive** — it is free on Workers Paid and works with the same SQL.

### Images

The demo ships its photos in `app/public/images`. A dashboard article can point
at any `https://` URL (the *Image path or URL* field), which is the simplest way
for the owner to add new photos without a redeploy. Uploading files from the
dashboard would need **R2** (also free within 10 GB, no egress fees) — a small
addition if you want it.

## Deploy to Cloudflare

The app already ships as a Cloudflare **Worker with static assets**: `src/worker/index.ts`
is the Worker (it serves `/api/orders`, `/api/newsletter`, `/api/health` and hands
everything else to the assets binding), `wrangler.jsonc` points the assets binding at
the build output with SPA fallback, and `npm run build` writes both halves:

```
dist/client/   the store (HTML, JS, CSS, fonts, images)
dist/store/    index.js — the Worker bundle
```

### Option A — from the Pinokio menu (easiest)

1. Install and start the launcher once (for the node modules).
2. In `app/`, sign in once: open **Terminal** and run `npx wrangler login`
   (a browser tab opens; approve it). A `CLOUDFLARE_API_TOKEN` +
   `CLOUDFLARE_ACCOUNT_ID` pair in the environment works too, for CI.
3. Click **Deploy to Cloudflare** in the menu. It builds and runs `wrangler deploy`.

### Option B — from a terminal

```sh
cd app
npm install
npx wrangler login      # once
npm run deploy          # build + wrangler deploy
```

Check the result before uploading, without touching your account:

```sh
npm run deploy:dry      # builds and prints what would be uploaded
npm run build && npx wrangler dev   # runs the real Worker + assets on :8787
```

The first deploy prints the live URL, e.g.
`https://store.<your-subdomain>.workers.dev`. Routes are SPA-friendly, so
`/shop`, `/product/linen-apron` or `/checkout` all open directly.

### Useful knobs

- **Rename the Worker** — change `"name": "store"` in `app/wrangler.jsonc`
  (the workers.dev subdomain name comes from it, and must be free in your account).
- **Your own domain** — Dashboard → Workers & Pages → `store` → Settings →
  Domains & Routes → *Add custom domain*, then point the DNS record at it.
- **Arabic-friendly headers** — nothing to do: the HTML is served with
  `lang="ar" dir="rtl"` already, and fonts are self-hosted (no Google Fonts call).
- **Secrets** — `npx wrangler secret put STRIPE_SECRET_KEY` (or Dashboard →
  Settings → Variables) when you replace the demo checkout with Stripe.
- **Logs** — `npx wrangler tail` streams requests from production.
- **Order data** — the demo returns a reference without storing anything. To keep
  orders, add a D1 database (`npx wrangler d1 create store`), bind it in
  `wrangler.jsonc`, and write to it in the `/api/orders` handler.

### Alternative: Cloudflare Pages

Pages works too if you prefer Git-based deploys: create a Pages project, connect
the repo, and use `app` as the root directory, `npm run build` as the build
command and `dist/client` as the output directory. Note that Pages then serves
only the static storefront — the `/api/*` routes belong to the Worker, so either
deploy the Worker separately or move those handlers to Pages Functions
(`app/functions/api/orders.ts`) if you go that way. The Workers route above keeps
both halves in one deployment and is what `deploy.js` uses.

## API

The Worker behind the storefront exposes the shop routes and the dashboard
routes. The base URL is the one the launcher captured when it started the
server (`http://127.0.0.1:5173` unless that port was busy) — it is the same URL
the **Open Web UI** button uses.

| Route | Auth | What it does |
|---|---|---|
| `GET /api/health` | – | Liveness, plus whether D1 and the dashboard are configured |
| `GET /api/products` | – | Published articles, ordered; falls back to the bundled seed |
| `POST /api/orders` | – | Validates and stores an order in D1 |
| `POST /api/newsletter` | – | Stores a subscriber |
| `GET /api/admin/session` | – | `{ authenticated, configured }` |
| `POST /api/admin/login` / `logout` | – | Sets or clears the HMAC-signed cookie |
| `GET /api/admin/products` | cookie | Every article, drafts included |
| `POST /api/admin/products` | cookie | Creates an article |
| `PUT /api/admin/products/:slug` | cookie | Updates it (slug changes allowed) |
| `DELETE /api/admin/products/:slug` | cookie | Deletes it |
| `GET /api/admin/orders` | cookie | The 100 latest orders with their lines |
| `POST /api/admin/restore` | cookie | Replaces everything with the starter catalogue |

Auth is a password (`ADMIN_PASSWORD`) exchanged for an HttpOnly, SameSite=Strict
cookie holding an HMAC-SHA256 signature with a 7-day expiry. Nothing secret is
ever sent back to the browser.

### `GET /api/health`

Returns `{"ok":true}` when the Worker is serving.

```sh
curl http://127.0.0.1:5173/api/health
```

```js
const res = await fetch("http://127.0.0.1:5173/api/health")
console.log(await res.json()) // { ok: true }
```

```python
import requests

print(requests.get("http://127.0.0.1:5173/api/health").json())  # {'ok': True}
```

### `POST /api/orders`

Places a demo order. Body:
`{ "email": string, "items": [{ "id": string, "option"?: string, "quantity": number }], "subtotal"?: number, "shipping"?: number }`.
Returns `{ "reference": "YS-XXXXXX" }` on success, or `400` with
`{ "error": string }` when the email is invalid or the bag is empty. Orders are
stored in D1 and appear in the dashboard; no payment is taken. Swap the handler
for a Stripe Checkout session when you want real money.

```sh
curl -X POST http://127.0.0.1:5173/api/orders \
  -H 'content-type: application/json' \
  -d '{"email":"ada@example.com","items":[{"id":"carafe","quantity":1}]}'
```

```js
const res = await fetch("http://127.0.0.1:5173/api/orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "ada@example.com", items: [{ id: "carafe", quantity: 1 }] })
})
console.log(await res.json()) // { reference: "YS-1A2B3C" }
```

```python
import requests

res = requests.post(
    "http://127.0.0.1:5173/api/orders",
    json={"email": "ada@example.com", "items": [{"id": "carafe", "quantity": 1}]},
)
print(res.json())  # {'reference': 'YS-1A2B3C'}
```

### `POST /api/newsletter`

Subscribes an email. Body: `{ "email": string }`. Returns `{ "ok": true }`, or
`400` with `{ "error": string }` for an invalid address.

```sh
curl -X POST http://127.0.0.1:5173/api/newsletter \
  -H 'content-type: application/json' \
  -d '{"email":"ada@example.com"}'
```

```js
const res = await fetch("http://127.0.0.1:5173/api/newsletter", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "ada@example.com" })
})
console.log(await res.json()) // { ok: true }
```

```python
import requests

res = requests.post(
    "http://127.0.0.1:5173/api/newsletter",
    json={"email": "ada@example.com"},
)
print(res.json())  # {'ok': True}
```

## Files

```
store/
├── app/            # The DAOS storefront (React + Vite + Hono Worker + D1 dashboard)
├── icon.jpg        # Launcher icon
├── deploy.js       # Builds and deploys the Worker to Cloudflare
├── install.js      # npm install inside app/
├── start.js        # Starts the dev server, captures its URL
├── update.js       # Pulls the launcher and re-installs
├── reset.js        # Removes installed dependencies and build output
├── pinokio.js      # The launcher menu
└── pinokio.json    # Launcher metadata
```
