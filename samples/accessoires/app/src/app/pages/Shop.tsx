import { AnimatePresence, motion } from 'motion/react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { categoryKeys, type Category } from '../../data/products'
import { categoryLabel } from '../../data/i18n'
import { useCatalog } from '../lib/catalog'
import { ProductCard } from '../components/ProductCard'
import { Button, Container } from '../components/ui'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'

export function Shop() {
  const { t, lang } = usePrefs()
  const { products } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const category = params.get('category') ?? ''
  const price = params.get('price') ?? ''
  const sort = params.get('sort') ?? 'featured'

  const priceOptions = [
    { key: '', label: t('shop.price.any') },
    { key: '0-50', label: t('shop.price.under50') },
    { key: '50-100', label: t('shop.price.50to100') },
    { key: '100-', label: t('shop.price.over100') },
  ]
  const sortOptions = [
    { key: 'featured', label: t('shop.sort.featured') },
    { key: 'new', label: t('shop.sort.new') },
    { key: 'price-asc', label: t('shop.sort.priceAsc') },
    { key: 'price-desc', label: t('shop.sort.priceDesc') },
  ]

  function update(next: Record<string, string>) {
    const merged = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) v ? merged.set(k, v) : merged.delete(k)
    setParams(merged, { replace: true })
  }

  const list = useMemo(() => {
    let items = products.filter((p) => !category || p.category === category)
    if (price) {
      const [min, max] = price.split('-').map((v) => (v === '' ? undefined : Number(v)))
      items = items.filter((p) => (min === undefined || p.price >= min) && (max === undefined || p.price < max))
    }
    if (sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price)
    if (sort === 'new') items = [...items].sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0))
    if (sort === 'featured') items = [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    return items
  }, [products, category, price, sort])

  const title = category ? categoryLabel(category as Category, lang) : t('shop.all')
  const activeCount = (category ? 1 : 0) + (price ? 1 : 0)

  const filters = (
    <div className="flex flex-col gap-8">
      <FilterGroup label={t('shop.category')}>
        {[{ key: '', label: t('shop.everything') }, ...categoryKeys.map((key) => ({ key, label: categoryLabel(key, lang) }))].map((c) => (
          <FilterOption key={c.key} active={category === c.key} onClick={() => update({ category: c.key })}>
            {c.label}
            <span className="ms-auto text-[12.5px] tabular-nums text-faint">{c.key ? products.filter((p) => p.category === c.key).length : products.length}</span>
          </FilterOption>
        ))}
      </FilterGroup>
      <FilterGroup label={t('shop.price')}>
        {priceOptions.map((p) => (
          <FilterOption key={p.key} active={price === p.key} onClick={() => update({ price: p.key })}>
            {p.label}
          </FilterOption>
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <Container className="pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[14px] text-muted">{t('shop.eyebrow')}</p>
          <h1 className="font-display mt-2 text-[40px] sm:text-[52px] rtl:text-[34px] sm:rtl:text-[44px]">
            {title} <span className="text-[22px] text-faint sm:text-[24px]">{list.length}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal />
            {activeCount > 0 ? t('shop.filtersWith', { n: activeCount }) : t('shop.filters')}
          </Button>
          <label className="relative">
            <span className="sr-only">{t('shop.sort')}</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
              className="h-10 appearance-none rounded-[12px] border border-line-strong bg-transparent ps-4 pe-9 text-[14px] focus:border-fg focus:outline-none"
            >
              {sortOptions.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filters}</div>
        </aside>
        <div>
          <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 xl:grid-cols-3 xl:gap-x-6">
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <motion.div key={p.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {list.length === 0 && (
            <div className="py-24 text-center">
              <p className="font-display text-[26px] sm:text-[32px]">{t('shop.nothing')}</p>
              <Button variant="secondary" className="mt-6" onClick={() => update({ category: '', price: '' })}>
                {t('shop.clear')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 bg-scrim lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-2 bottom-2 rounded-dialog bg-bg p-6 shadow-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-[24px]">{t('shop.filters')}</p>
                <button type="button" aria-label={t('nav.close')} onClick={() => setMobileOpen(false)} className="grid size-10 place-items-center rounded-control hover:bg-surface-2">
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-6">{filters}</div>
              <Button className="mt-8 w-full" onClick={() => setMobileOpen(false)}>
                {list.length === 1 ? t('shop.showOne', { n: list.length }) : t('shop.showMany', { n: list.length })}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-medium">{label}</p>
      <ul className="mt-3 flex flex-col gap-0.5">{children}</ul>
    </div>
  )
}

function FilterOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cx('flex h-9 w-full items-center gap-2 rounded-[11px] px-2.5 text-start text-[14px] transition-colors', active ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg')}
      >
        {children}
      </button>
    </li>
  )
}
