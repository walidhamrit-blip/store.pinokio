import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { seedProducts, type Product } from '../../data/products'

interface CatalogState {
  products: Product[]
  /** False while the first fetch is in flight. */
  ready: boolean
  /** True when the list came from the API rather than the bundled seed. */
  live: boolean
  error: string | null
  bySlug: (slug: string) => Product | undefined
  refresh: () => Promise<void>
}

const CatalogContext = createContext<CatalogState | null>(null)

/**
 * Products come from the Worker (`GET /api/products`, backed by D1) so the shop
 * owner can edit them from the dashboard. If the API is unavailable — a local
 * dev server without D1, an offline preview — the bundled seed keeps the store
 * browsable instead of showing an empty grid.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [ready, setReady] = useState(false)
  const [live, setLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/products', { headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = (await response.json()) as { products?: Product[] }
      if (!Array.isArray(body.products)) throw new Error('Malformed catalogue')
      setProducts(body.products.length > 0 ? body.products : seedProducts)
      setLive(body.products.length > 0)
      setError(null)
    } catch (err) {
      setProducts(seedProducts)
      setLive(false)
      setError(err instanceof Error ? err.message : 'Catalogue indisponible')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<CatalogState>(
    () => ({
      products,
      ready,
      live,
      error,
      bySlug: (slug: string) => products.find((p) => p.slug === slug),
      refresh,
    }),
    [products, ready, live, error, refresh],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}
