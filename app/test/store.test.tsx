import { beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from '../src/app/App'
import { normaliseProduct, seedProducts } from '../src/data/products'

class IO { observe() {} unobserve() {} disconnect() {} }

type Call = { url: string; init?: RequestInit }

let calls: Call[] = []
let catalogue = [...seedProducts]
let loggedIn = false

beforeAll(() => {
  // @ts-expect-error stub
  window.IntersectionObserver = IO
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as never
  window.scrollTo = (() => {}) as never
})

beforeEach(() => {
  calls = []
  loggedIn = false
  document.documentElement.lang = 'fr'
  document.documentElement.dir = 'ltr'
  document.documentElement.dataset.lang = 'fr'
  document.documentElement.dataset.theme = 'sand'
  document.documentElement.dataset.mode = 'light'
  window.history.pushState({}, '', '/')
  localStorage.clear()
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
    if (url === '/api/products') return json({ products: catalogue })
    if (url === '/api/admin/session') return json({ authenticated: loggedIn, configured: true })
    if (url === '/api/admin/login') {
      const body = JSON.parse(String(init?.body))
      if (body.password !== 'secret') return json({ error: 'invalid' }, 401)
      loggedIn = true
      return json({ ok: true })
    }
    if (url === '/api/admin/products') return json({ products: catalogue })
    if (url === '/api/admin/orders') return json({ orders: [] })
    return json({ ok: true })
  }) as never
})

it('renders the catalogue coming from the API, not the bundle', async () => {
  catalogue = seedProducts.map((p, i) => (i === 0 ? { ...p, price: 320, copy: { ...p.copy, fr: { ...p.copy.fr!, name: 'Cabas édité' } } } : p))
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Cabas édité').length).toBeGreaterThan(0))
  expect(screen.getAllByText('320 LYD').length).toBeGreaterThan(0)
})

it('falls back to the bundled seed when the API fails', async () => {
  catalogue = []
  globalThis.fetch = (async () => new Response('boom', { status: 500 })) as never
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Nouveautés').length).toBeGreaterThan(0))
  expect(screen.getAllByText('Cabas en cuir camel').length).toBeGreaterThan(0)
})

it('guards the dashboard, then lets the owner create an article', async () => {
  window.history.pushState({}, '', '/admin')
  render(<App />)
  await waitFor(() => expect(screen.getByText('Connexion')).toBeTruthy())

  // wrong password first
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'nope' } })
  fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
  await waitFor(() => expect(screen.getByText('Mot de passe incorrect.')).toBeTruthy())

  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
  await waitFor(() => expect(screen.getByText('Tableau de bord')).toBeTruthy())

  // shop chrome is gone on the dashboard
  expect(screen.queryByText('Votre panier')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Nouvel article' }))
  await waitFor(() => expect(screen.getByText('Identifiant (URL)')).toBeTruthy())

  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Savon d’Alep' } })
  fireEvent.change(screen.getByLabelText('Prix'), { target: { value: '19' } })
  fireEvent.change(screen.getByLabelText('Chemin ou URL de l’image'), { target: { value: '/images/incense.jpg' } })
  fireEvent.click(screen.getAllByRole('button', { name: 'Enregistrer' })[0])

  await waitFor(() => {
    const post = calls.find((c) => c.url === '/api/admin/products' && c.init?.method === 'POST')
    expect(post).toBeTruthy()
    const body = JSON.parse(String(post!.init!.body))
    expect(body.slug).toBe('savon-d-alep')
    expect(body.price).toBe(19)
    // Filled in Arabic only: the server mirrors it into English.
    expect(body.copy.ar.name).toBe('Savon d’Alep')
    expect(body.copy.en.name).toBe('')
  })
})


it('normalises dashboard input: mirrors English, keeps slugs and prices valid', () => {
  const onlyArabic = normaliseProduct({
    price: 19,
    category: 'home',
    image: '/images/incense.jpg',
    copy: { en: { name: '', short: '', description: '', details: [], materials: '' }, ar: { name: 'صابون حلبي', short: 'قطعة', description: '', details: [], materials: '' } },
  })
  expect(onlyArabic.ok).toBe(true)
  if (onlyArabic.ok) {
    expect(onlyArabic.product.copy.en.name).toBe('صابون حلبي')
    expect(onlyArabic.product.copy.ar?.short).toBe('قطعة')
    expect(onlyArabic.product.slug.startsWith('article-')).toBe(true)
    expect(onlyArabic.product.published).toBe(true)
  }

  const slugged = normaliseProduct({ price: 20, category: 'textiles', copy: { en: { name: 'Écharpe en lin', short: '', description: '', details: [], materials: '' } } })
  expect(slugged.ok && slugged.product.slug).toBe('echarpe-en-lin')

  expect(normaliseProduct({ price: -1, copy: { en: { name: 'x', short: '', description: '', details: [], materials: '' } } })).toEqual({ ok: false, error: expect.any(String) })
  expect(normaliseProduct({ price: 10, copy: {} })).toEqual({ ok: false, error: expect.any(String) })
  expect(normaliseProduct({ price: 10, category: 'nope' as never, copy: { en: { name: 'x', short: '', description: '', details: [], materials: '' } } }).ok).toBe(true)
})

it('runs the brands banner, the per-piece QR code and the WhatsApp button', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('CHANEL').length).toBeGreaterThan(0))

  // One track holds the list twice: the second copy only closes the loop and
  // is hidden from screen readers, so nothing is announced twice.
  const track = document.querySelector('.marquee-track')
  expect(track).toBeTruthy()
  const names = track!.querySelectorAll('span')
  expect(names.length).toBe(22 * 2)
  expect(track!.querySelectorAll('span[aria-hidden="true"]').length).toBe(22)

  // Every card carries a QR trigger, in French like the rest of the page.
  const triggers = screen.getAllByRole('button', { name: 'Code QR' })
  expect(triggers.length).toBeGreaterThan(0)
  fireEvent.click(triggers[0])

  await waitFor(() => expect(screen.getByRole('dialog', { name: /Code QR/ })).toBeTruthy())
  // qrcode.react renders a real <svg> with a <title>, so the code is there.
  expect(document.querySelector('svg > title')).toBeTruthy()
  expect(screen.getByText(/\/product\/camel-leather-tote$/)).toBeTruthy()

  fireEvent.keyDown(document, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

  // WhatsApp: the floating button and the footer link both point at wa.me.
  const links = screen.getAllByRole('link', { name: /WhatsApp/ })
  expect(links.some((a) => a.getAttribute('href')?.startsWith('https://wa.me/'))).toBe(true)
})

it('turns the bag into a WhatsApp message for the priority number', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Cabas en cuir camel').length).toBeGreaterThan(0))

  window.history.pushState({}, '', '/shop')
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Ajouter au panier' }).length).toBeGreaterThan(0))
  fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter au panier' })[0])

  // The header button is labelled 'Panier, N articles'.
  // Two bag buttons exist for the two header layouts; either opens the drawer.
  fireEvent.click(screen.getAllByRole('button', { name: /^Panier,/ })[0])

  const link = await waitFor(() => {
    // The bag's link carries the order; the floating bubble is contact only.
    const found = screen.getAllByRole('link').find((a) => a.getAttribute('href')?.includes('?text='))
    expect(found).toBeTruthy()
    return found!
  })

  const href = link.getAttribute('href')!
  // The order number, not the general contact number.
  expect(href.startsWith('https://wa.me/218913442640?text=')).toBe(true)

  const text = decodeURIComponent(href.split('text=')[1])
  expect(text).toContain('Bonjour DAOS, je souhaite commander')
  expect(text).toContain('×1 —')
  expect(text).toContain('Total')
  expect(text).toContain('LYD')
})
