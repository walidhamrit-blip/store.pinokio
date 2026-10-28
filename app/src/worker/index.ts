import { Hono } from 'hono'

import seed from '../data/seed.json'
import { normaliseProduct, type Product } from '../data/products'

// The Worker in front of the storefront: it serves the catalogue, records
// orders and hosts the dashboard API. Everything persistent lives in D1, which
// is free at this scale (5 GB, 5M rows read / 100k written per day).
type Env = {
  ASSETS: Fetcher
  /** D1 binding. Optional so the store still runs without a database. */
  DB?: D1Database
  /** Dashboard password, set with `wrangler secret put ADMIN_PASSWORD`. */
  ADMIN_PASSWORD?: string
}

type ProductRow = {
  slug: string
  price: number
  compare_at: number | null
  category: string
  image: string
  badge: string | null
  featured: number
  published: number
  sort_order: number
  copy: string
}

const SEED = seed.products as Product[]
const COOKIE = 'store_admin'
const SESSION_DAYS = 7

const app = new Hono<{ Bindings: Env }>()

/* ------------------------------- schema -------------------------------- */

// Migrations run lazily on first use instead of as a deploy step, so a fresh
// deployment works without any CLI command. The promise is cached per isolate.
let schemaReady: Promise<void> | null = null

function ensureSchema(db: D1Database): Promise<void> {
  schemaReady ??= (async () => {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS products (
        slug TEXT PRIMARY KEY,
        price REAL NOT NULL,
        compare_at REAL,
        category TEXT NOT NULL,
        image TEXT NOT NULL,
        badge TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        published INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 999,
        copy TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        subtotal REAL NOT NULL,
        shipping REAL NOT NULL,
        total REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        slug TEXT NOT NULL,
        option TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS newsletter (
        email TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_products_order ON products(published, sort_order)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`),
    ])
    const count = await db.prepare('SELECT COUNT(*) AS n FROM products').first<{ n: number }>()
    if (!count?.n) await seedCatalogue(db)
  })().catch((error) => {
    // Let the next request try again instead of caching the failure.
    schemaReady = null
    throw error
  })
  return schemaReady
}

async function seedCatalogue(db: D1Database) {
  const statements = SEED.map((product, index) =>
    db
      .prepare(
        `INSERT OR REPLACE INTO products (slug, price, compare_at, category, image, badge, featured, published, sort_order, copy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        product.slug,
        product.price,
        product.compareAt ?? null,
        product.category,
        product.image,
        product.badge ?? null,
        product.featured ? 1 : 0,
        1,
        index,
        JSON.stringify(product.copy),
      ),
  )
  if (statements.length) await db.batch(statements)
}

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    price: Number(row.price),
    compareAt: row.compare_at ?? null,
    category: row.category as Product['category'],
    image: row.image,
    badge: (row.badge as Product['badge']) ?? null,
    featured: !!row.featured,
    published: !!row.published,
    sortOrder: Number(row.sort_order),
    copy: JSON.parse(row.copy),
  }
}

/* --------------------------------- auth -------------------------------- */

const encoder = new TextEncoder()

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))))
}

/** Constant-time-ish comparison, so a wrong cookie cannot be guessed byte by byte. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function readCookie(header: string | undefined, name: string) {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return undefined
}

async function isAuthed(c: { env: Env; req: { header: (n: string) => string | undefined } }) {
  const password = c.env.ADMIN_PASSWORD
  if (!password) return false
  const cookie = readCookie(c.req.header('cookie'), COOKIE)
  if (!cookie) return false
  const [expiry, signature] = cookie.split('.')
  if (!expiry || !signature) return false
  if (Number(expiry) < Date.now()) return false
  return safeEqual(signature, await sign(password, `admin.${expiry}`))
}

/* -------------------------------- public ------------------------------- */

app.get('/api/health', (c) => c.json({ ok: true, database: !!c.env.DB, dashboard: !!c.env.ADMIN_PASSWORD }))

app.get('/api/products', async (c) => {
  if (!c.env.DB) return c.json({ products: SEED, source: 'seed' })
  await ensureSchema(c.env.DB)
  const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE published = 1 ORDER BY sort_order, slug').all<ProductRow>()
  const products = results.map(toProduct)
  // An empty table (all drafts) still gets the seed so the shop is never blank.
  return c.json({ products: products.length ? products : SEED, source: 'd1' })
})

app.post('/api/newsletter', async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}) as { email?: string })
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return c.json({ error: 'Enter a valid email address.' }, 400)
  if (c.env.DB) {
    await ensureSchema(c.env.DB)
    await c.env.DB.prepare('INSERT OR IGNORE INTO newsletter (email) VALUES (?)').bind(body.email.toLowerCase()).run()
  }
  return c.json({ ok: true })
})

app.post('/api/orders', async (c) => {
  const order = await c.req
    .json<{ email?: string; items?: { id: string; option?: string; quantity: number }[]; subtotal?: number; shipping?: number }>()
    .catch(() => null)
  if (!order?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) return c.json({ error: 'Enter a valid email address.' }, 400)
  if (!order.items?.length) return c.json({ error: 'Your bag is empty.' }, 400)

  const reference = `YS-${Date.now().toString(36).toUpperCase().slice(-6)}`
  if (c.env.DB) {
    await ensureSchema(c.env.DB)
    const subtotal = Number(order.subtotal ?? 0)
    const shipping = Number(order.shipping ?? 0)
    const created = await c.env.DB.prepare('INSERT INTO orders (reference, email, subtotal, shipping, total) VALUES (?, ?, ?, ?, ?)')
      .bind(reference, order.email.toLowerCase(), subtotal, shipping, subtotal + shipping)
      .run()
    const orderId = created.meta.last_row_id
    const lines = order.items.map((item) =>
      c.env.DB!.prepare('INSERT INTO order_items (order_id, slug, option, quantity, unit_price) VALUES (?, ?, ?, ?, (SELECT price FROM products WHERE slug = ?))').bind(
        orderId,
        item.id,
        item.option ?? null,
        item.quantity,
        item.id,
      ),
    )
    if (lines.length) await c.env.DB.batch(lines)
  }
  return c.json({ reference })
})

/* -------------------------------- admin -------------------------------- */

app.get('/api/admin/session', async (c) => c.json({ authenticated: await isAuthed(c), configured: !!c.env.ADMIN_PASSWORD }))

app.post('/api/admin/login', async (c) => {
  const { password } = await c.req.json<{ password?: string }>().catch(() => ({}) as { password?: string })
  if (!c.env.ADMIN_PASSWORD) return c.json({ error: 'unconfigured' }, 503)
  if (!password || !safeEqual(password, c.env.ADMIN_PASSWORD)) return c.json({ error: 'invalid' }, 401)
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const token = `${expiry}.${await sign(c.env.ADMIN_PASSWORD, `admin.${expiry}`)}`
  c.header(
    'set-cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${new URL(c.req.url).protocol === 'https:' ? '; Secure' : ''}`,
  )
  return c.json({ ok: true })
})

app.post('/api/admin/logout', (c) => {
  c.header('set-cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`)
  return c.json({ ok: true })
})

app.use('/api/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (path === '/api/admin/login' || path === '/api/admin/logout' || path === '/api/admin/session') return next()
  if (!(await isAuthed(c))) return c.json({ error: 'unauthorized' }, 401)
  return next()
})

app.get('/api/admin/products', async (c) => {
  if (!c.env.DB) return c.json({ products: SEED, source: 'seed' })
  await ensureSchema(c.env.DB)
  const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY sort_order, slug').all<ProductRow>()
  return c.json({ products: results.map(toProduct), source: 'd1' })
})

app.post('/api/admin/products', async (c) => {
  if (!c.env.DB) return c.json({ error: 'database' }, 503)
  const input = await c.req.json<Partial<Product>>().catch(() => null)
  if (!input) return c.json({ error: 'bad-request' }, 400)
  const parsed = normaliseProduct(input)
  if (!parsed.ok) return c.json({ error: parsed.error }, 400)
  await ensureSchema(c.env.DB)
  const exists = await c.env.DB.prepare('SELECT 1 FROM products WHERE slug = ?').bind(parsed.product.slug).first()
  if (exists) return c.json({ error: 'exists' }, 409)
  await upsert(c.env.DB, parsed.product)
  return c.json({ product: parsed.product }, 201)
})

app.put('/api/admin/products/:slug', async (c) => {
  if (!c.env.DB) return c.json({ error: 'database' }, 503)
  const previous = c.req.param('slug')
  const input = await c.req.json<Partial<Product>>().catch(() => null)
  if (!input) return c.json({ error: 'bad-request' }, 400)
  const parsed = normaliseProduct({ ...input, slug: input.slug || previous })
  if (!parsed.ok) return c.json({ error: parsed.error }, 400)
  await ensureSchema(c.env.DB)
  if (parsed.product.slug !== previous) {
    const clash = await c.env.DB.prepare('SELECT 1 FROM products WHERE slug = ?').bind(parsed.product.slug).first()
    if (clash) return c.json({ error: 'exists' }, 409)
    await c.env.DB.prepare('DELETE FROM products WHERE slug = ?').bind(previous).run()
  }
  await upsert(c.env.DB, parsed.product)
  return c.json({ product: parsed.product })
})

app.delete('/api/admin/products/:slug', async (c) => {
  if (!c.env.DB) return c.json({ error: 'database' }, 503)
  await ensureSchema(c.env.DB)
  await c.env.DB.prepare('DELETE FROM products WHERE slug = ?').bind(c.req.param('slug')).run()
  return c.json({ ok: true })
})

app.post('/api/admin/restore', async (c) => {
  if (!c.env.DB) return c.json({ error: 'database' }, 503)
  await ensureSchema(c.env.DB)
  await c.env.DB.prepare('DELETE FROM products').run()
  await seedCatalogue(c.env.DB)
  return c.json({ ok: true, products: SEED })
})

app.get('/api/admin/orders', async (c) => {
  if (!c.env.DB) return c.json({ orders: [] })
  await ensureSchema(c.env.DB)
  const { results } = await c.env.DB.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 100').all<{
    id: number
    reference: string
    email: string
    subtotal: number
    shipping: number
    total: number
    created_at: string
  }>()
  const items = await c.env.DB.prepare('SELECT order_id, slug, option, quantity, unit_price FROM order_items').all<{
    order_id: number
    slug: string
    option: string | null
    quantity: number
    unit_price: number | null
  }>()
  const byOrder = new Map<number, typeof items.results>()
  for (const item of items.results) byOrder.set(item.order_id, [...(byOrder.get(item.order_id) ?? []), item])
  return c.json({ orders: results.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] })) })
})

async function upsert(db: D1Database, product: Product) {
  await db
    .prepare(
      `INSERT INTO products (slug, price, compare_at, category, image, badge, featured, published, sort_order, copy, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(slug) DO UPDATE SET
         price = excluded.price, compare_at = excluded.compare_at, category = excluded.category,
         image = excluded.image, badge = excluded.badge, featured = excluded.featured,
         published = excluded.published, sort_order = excluded.sort_order, copy = excluded.copy,
         updated_at = excluded.updated_at`,
    )
    .bind(
      product.slug,
      product.price,
      product.compareAt ?? null,
      product.category,
      product.image,
      product.badge ?? null,
      product.featured ? 1 : 0,
      product.published === false ? 0 : 1,
      product.sortOrder ?? 999,
      JSON.stringify(product.copy),
    )
    .run()
}

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
