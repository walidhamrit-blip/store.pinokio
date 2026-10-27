import { Hono } from 'hono'

// The Worker in front of the storefront. The catalogue is static data shipped
// with the app; this handles the parts a storefront needs a server for.
type Env = { ASSETS: Fetcher }

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true }))

// Demo checkout: validates the order and returns a reference. Replace the body
// with a Stripe Checkout session (server-side secret via Sites → Secrets) or
// persist orders to D1 when you connect a database.
app.post('/api/orders', async (c) => {
  const order = await c.req.json<{ email?: string; items?: { id: string; quantity: number }[] }>().catch(() => null)
  if (!order?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) return c.json({ error: 'Enter a valid email address.' }, 400)
  if (!order.items?.length) return c.json({ error: 'Your bag is empty.' }, 400)
  const reference = `YS-${Date.now().toString(36).toUpperCase().slice(-6)}`
  return c.json({ reference })
})

app.post('/api/newsletter', async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}) as { email?: string })
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return c.json({ error: 'Enter a valid email address.' }, 400)
  return c.json({ ok: true })
})

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
