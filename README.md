# Store

A one-click Pinokio launcher for the **Store** storefront: an editorial
storefront for a small catalogue, with a hero and new arrivals on the home page,
a shop page with category and price filters and sorting, product pages with
options and an accordion, a slide-out bag with free-shipping progress that
persists in the browser, and a demo checkout with an order confirmation.

The store opens in **Arabic** with a full right-to-left layout, and can be read
in French or English from the language menu. A theme menu offers six palettes
made for clothes, accessories and beauty — sand, noir, rose, olive, terracotta
and lavender — and a sun/moon switch flips each of them between light and dark.
All three preferences are remembered in the browser and applied before the first
paint, so the store never flashes the wrong colour.

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
`app/src/data/products.ts`, its French and Arabic copy in
`app/src/data/i18n.ts`, the interface strings in `app/src/app/i18n/dict.ts`,
images in `app/public/images`, and the colours, type and all six themes in
`app/src/styles.css`.

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

The Worker behind the storefront exposes three routes. The base URL is the one
the launcher captured when it started the server (`http://127.0.0.1:5173`
unless that port was busy) — it is the same URL the **Open Web UI** button uses.

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

Places a demo order. Body: `{ "email": string, "items": [{ "id": string, "quantity": number }] }`.
Returns `{ "reference": "YS-XXXXXX" }` on success, or `400` with
`{ "error": string }` when the email is invalid or the bag is empty. The
checkout is a demo: swap the handler in `app/src/worker/index.ts` for a Stripe
Checkout session or persist orders to D1.

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
├── app/            # The storefront (React + Vite + Hono Worker)
├── icon.jpg        # Launcher icon
├── deploy.js       # Builds and deploys the Worker to Cloudflare
├── install.js      # npm install inside app/
├── start.js        # Starts the dev server, captures its URL
├── update.js       # Pulls the launcher and re-installs
├── reset.js        # Removes installed dependencies and build output
├── pinokio.js      # The launcher menu
└── pinokio.json    # Launcher metadata
```
