import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import { App } from '../src/app/App'
import { WHATSAPP } from '../src/data/contact'
import { seedProducts } from '../src/data/products'

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// This config runs without vitest globals, so cleanup is explicit.
afterEach(cleanup)

beforeAll(() => {
  // @ts-expect-error stub
  window.IntersectionObserver = IO
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as never
  window.scrollTo = (() => {}) as never
})

beforeEach(() => {
  document.documentElement.lang = 'fr'
  document.documentElement.dir = 'ltr'
  document.documentElement.dataset.lang = 'fr'
  document.documentElement.dataset.theme = 'sand'
  document.documentElement.dataset.mode = 'light'
  window.history.pushState({}, '', '/')
  localStorage.clear()
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url === '/api/products') {
      return new Response(JSON.stringify({ products: seedProducts }), { headers: { 'content-type': 'application/json' } })
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
  }) as never
})

it('keeps the WhatsApp line within reach, prefilled and pointed at the shop number', async () => {
  render(<App />)
  const fab = await screen.findByRole('link', { name: /WhatsApp/ }, { timeout: 3000 })
  expect(fab.getAttribute('href')).toMatch(new RegExp(`^https://wa\\.me/${WHATSAPP.number}\\?text=.+`))
  expect(fab.getAttribute('target')).toBe('_blank')
  expect(fab.getAttribute('rel')).toContain('noopener')
})

it('sends the bag to WhatsApp first, with every line in the message', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Nouveautés').length).toBeGreaterThan(0))

  fireEvent.click(screen.getAllByRole('button', { name: 'Ajouter au panier' })[0])

  const drawer = await screen.findByRole('dialog', { name: 'Votre panier' })
  const order = within(drawer).getByRole('link', { name: /Commander sur WhatsApp/ })
  const href = decodeURIComponent(order.getAttribute('href') ?? '')
  expect(href.startsWith(`https://wa.me/${WHATSAPP.number}?text=`)).toBe(true)
  expect(href).toContain(seedProducts[0].copy.fr?.name ?? '')
  expect(href).toMatch(/Sous-total/)
  // The card checkout is still there, one step behind.
  expect(within(drawer).getByRole('button', { name: 'Paiement' })).toBeTruthy()
})

it('offers a QR of the article that is on screen', async () => {
  window.history.pushState({}, '', '/shop')
  render(<App />)

  const grid = await screen.findAllByRole('button', { name: /QR code de/ })
  fireEvent.click(grid[0])

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(/\/product\//)).toBeTruthy()
  expect(within(dialog).getByRole('img', { name: /QR code/ })).toBeTruthy()
  expect(within(dialog).getByRole('link', { name: "Ouvrir l’article" })).toBeTruthy()

  // Clipboard access can be denied; copying must never take the dialog down.
  fireEvent.click(within(dialog).getByRole('button', { name: 'Copier le lien' }))
  expect(screen.getByRole('dialog')).toBeTruthy()
})

it('runs the signature strip under the hero', async () => {
  render(<App />)
  const strip = screen.getByRole('region', { name: 'Maisons suivies' })
  // Two identical rows: the seam never shows, and only one is read aloud.
  expect(within(strip).getAllByText('Rolex')).toHaveLength(2)
  expect(within(strip).getAllByText('Chanel')).toHaveLength(2)
})
