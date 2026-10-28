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
  static assets (see [Deploy to Cloudflare](#deploy-to-cloudflare)). Not needed
  if you let GitHub Actions deploy on every push.
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

### The database (already wired)

The D1 database `store` exists and its **non-secret** id is committed in
`app/wrangler.jsonc`, so every deploy attaches it automatically:

```jsonc
"d1_databases": [{ "binding": "DB", "database_name": "store", "database_id": "ef27…e54a" }]
```

There are **no migrations to run**: the Worker creates its tables on the first
request and seeds them with the starter catalogue (`app/src/data/seed.json`).

What must *never* go in that file: passwords and tokens. `ADMIN_PASSWORD` is a
Worker secret, pushed automatically by the deploy workflow from the GitHub
secret of the same name (or once by hand:
`npx wrangler secret put ADMIN_PASSWORD`).

Starting from scratch (empty Cloudflare account)? Create the database once and
commit its id:

```sh
cd app
npx wrangler d1 create store        # prints the database_id
```

### Local development

```sh
cd app
cp .dev.vars.example .dev.vars   # local dashboard password
npm run dev                      # http://localhost:5173
```

Dev uses a local SQLite file in `app/.wrangler`, seeded automatically, so you can
edit articles without touching production data.

### Backups

Automatic, every night, committed to this repository — see
[Everything on GitHub](#everything-on-github-nothing-by-hand). Nothing to run.

```sh
npm run db:backup                                    # force one now (production)
npm run db:backup -- --keep=90                       # keep more history
npm run db:studio                                    # peek at the articles
```

Growing past the demo? D1 is 10 GB per database, with 30 days of point-in-time
recovery. If the shop ever needs more, heavy analytics or Postgres features
(JSONB, extensions), keep this code and move the data to Neon/Supabase behind
**Hyperdrive** — free on Workers Paid, same SQL.

### Images

The demo ships its photos in `app/public/images`. A dashboard article can point
at any `https://` URL (the *Image path or URL* field), which is the simplest way
for the owner to add new photos without a redeploy. Uploading files from the
dashboard would need **R2** (also free within 10 GB, no egress fees) — a small
addition if you want it.

## Everything on GitHub, nothing by hand

Three workflows do the work. Once the repository settings below are filled in,
you never open a terminal, the Cloudflare dashboard, or a "Retry build" button
again.

| Workflow | Trigger | What it does |
|---|---|---|
| [`deploy.yml`](.github/workflows/deploy.yml) | push to `main` | `npm ci`, typecheck, tests, build, pushes `ADMIN_PASSWORD`, `wrangler deploy`, then calls `/api/health` and fails loudly if the shop is not answering |
| [`backup.yml`](.github/workflows/backup.yml) | daily 03:17 UTC + *Run workflow* | exports D1 to `backups/<db>-<timestamp>.sql.gz`, commits it, keeps the newest `BACKUP_KEEP` (30 by default) |
| [`restore.yml`](.github/workflows/restore.yml) | *Actions → Restore D1* | puts a snapshot back into production, guarded by a `restore` confirmation |

A backup commit never restarts the shop (the deploy workflow ignores
`backups/**`, and the bot's own push cannot trigger workflows), and a docs edit
does not redeploy either.

### One-time setup: a single secret

1. **Create a Cloudflare API token** — Dashboard → *My Profile* → *API Tokens* →
   *Create Token* → *Custom token*:
   - Permissions: **Account → Workers Scripts → Edit**, **Account → D1 → Edit**
   - Zone resources: not needed (no route or DNS change)
   - Copy the value immediately: it is shown once.
2. **Paste it into GitHub** — *Settings → Secrets and variables → Actions →
   New repository secret*, name **`CLOUDFLARE_API_TOKEN`**.

That is the whole setup. Everything else is detected or already in place:

| Kind | Name | Needed? |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | **yes** — the only required field |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | no — the account id is committed in `app/wrangler.jsonc` (an id, not a credential) |
| Secret | `ADMIN_PASSWORD` | no — only to *change* the dashboard password from GitHub; a deploy never removes the secret already on the Worker |
| Variable | `STORE_URL` | no — the URL is read from `wrangler deploy` output for the health check |
| Variable | `BACKUP_KEEP` | no — 30 snapshots by default |

3. **Keep a single deploy pipeline** — Workers & Pages → `store` →
   *Settings → Builds*: **disconnect** the repository so only `deploy.yml`
   deploys. Leaving Cloudflare's build connected would race this workflow on
   every push; removing that build is the whole step.
4. Merge the branch. The first deploy runs on its own and `Actions` shows the
   health check result.
5. Take the first snapshot immediately instead of waiting for 03:17 UTC:
   *Actions → Backup D1 → Run workflow*. The dump lands in `backups/`.

Nothing else is manual: the D1 binding and the account id live in
`app/wrangler.jsonc` (committed, non-secret), the password already stored on the
Worker stays in place, and the database is snapshotted every night into
`backups/`.

### If a deploy fails

| Message | Cause | Fix |
|---|---|---|
| `Headers.set: "***" is an invalid header value` | the token secret holds something else than the bare token: a line break, an `export …=` line, a label, quotes | already handled: the workflows trim it and extract the 40-character token when it is embedded in longer text; the run shows a warning naming the extra characters |
| `Authentication error` / `403` | the token lacks **Workers Scripts:Edit** or **D1:Edit** | edit the token, or create a new one and update the secret |
| `database is false` in the health check | the D1 binding in `app/wrangler.jsonc` does not match the database | copy the `database_id` from *Storage & Databases → D1 → store* |
| `dashboard is false` | no `ADMIN_PASSWORD` is stored on the Worker | add the secret once, or run `npx wrangler secret put ADMIN_PASSWORD` |

The last lines of every failed `wrangler` call are published as GitHub
annotations, so the reason is visible on the run page without opening the raw
log.

### Where the articles live, then

Articles are **data**, not code: they are edited in `/admin` and stored in D1.
A `git clone` alone therefore does not contain the current catalogue — the last
nightly snapshot in [`backups/`](backups) does (plain SQL, readable and
restorable). That is the point of the backup workflow: the repository holds the
code *and* a daily copy of the content, without anyone exporting anything.

### Restoring a day-old catalogue

*Actions → Restore D1 → Run workflow*, paste
`backups/store-2026-10-28T03-17-42-681Z.sql.gz`, type `restore`. Locally, the
same thing:

```sh
cd app
npm run db:restore -- ../backups/store-2026-10-28T03-17-42-681Z.sql.gz --yes
```

Cloudflare also keeps 30 days of point-in-time recovery:
`npx wrangler d1 time-travel restore store --timestamp=2026-10-28T10:00:00Z`.

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
├── .github/        # Actions: deploy on push, nightly D1 backup, restore
├── backups/        # D1 snapshots committed by the backup workflow
├── app/            # The storefront (React + Vite + Hono Worker + D1 dashboard)
├── icon.jpg        # Launcher icon
├── deploy.js       # Builds and deploys the Worker to Cloudflare
├── install.js      # npm install inside app/
├── start.js        # Starts the dev server, captures its URL
├── update.js       # Pulls the launcher and re-installs
├── reset.js        # Removes installed dependencies and build output
├── pinokio.js      # The launcher menu
└── pinokio.json    # Launcher metadata
```
