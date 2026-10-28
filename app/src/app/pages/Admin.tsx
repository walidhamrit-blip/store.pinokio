import { motion } from 'motion/react'
import { ArrowLeft, Box, ClipboardList, ImagePlus, LogOut, Plus, RotateCcw, Settings2, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { BADGES, OPTION_NAMES, categoryKeys, slugify, type Badge, type Category, type Product, type ProductCopy } from '../../data/products'
import { categoryLabel } from '../../data/i18n'
import { Button, Container, inputClass } from '../components/ui'
import { ModeToggle } from '../components/preferences'
import { LANGUAGES, type Lang } from '../i18n/dict'
import { cx } from '../lib/cx'
import { money } from '../lib/cart'
import { asset } from '../lib/demo'
import { usePrefs } from '../lib/prefs'

type Tab = 'products' | 'orders' | 'settings'

type AdminOrder = { id: number; reference: string; email: string; subtotal: number; shipping: number; total: number; created_at: string; items: { slug: string; option: string | null; quantity: number; unit_price: number | null }[] }

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'same-origin',
  })
  const body = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
  return body
}

const emptyCopy = (): ProductCopy => ({ name: '', short: '', description: '', details: [], materials: '' })

const blankProduct = (): Product => ({
  slug: '',
  price: 0,
  compareAt: null,
  category: 'accessories',
  image: '/images/hero.jpg',
  badge: null,
  featured: false,
  published: true,
  sortOrder: 999,
  copy: { en: emptyCopy(), ar: emptyCopy(), fr: emptyCopy() },
})

export function Admin() {
  const { t, lang } = usePrefs()
  const [session, setSession] = useState<{ authenticated: boolean; configured: boolean } | null>(null)
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [editing, setEditing] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Keep the dashboard out of search engines without noindexing the shop.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'robots')
    meta.setAttribute('content', 'noindex, nofollow')
    document.head.appendChild(meta)
    return () => {
      meta.parentNode?.removeChild(meta)
    }
  }, [])

  const loadSession = useCallback(async () => {
    try {
      setSession(await api<{ authenticated: boolean; configured: boolean }>('/api/admin/session'))
    } catch {
      setSession({ authenticated: false, configured: false })
    }
  }, [])

  const loadProducts = useCallback(async () => {
    const body = await api<{ products: Product[] }>('/api/admin/products')
    setProducts([...body.products].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)))
  }, [])

  const loadOrders = useCallback(async () => {
    const body = await api<{ orders: AdminOrder[] }>('/api/admin/orders')
    setOrders(body.orders)
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!session?.authenticated) return
    setBusy(true)
    Promise.all([loadProducts(), loadOrders()])
      .catch((error) => setNotice(error instanceof Error ? error.message : t('admin.error.generic')))
      .finally(() => setBusy(false))
  }, [session?.authenticated, loadProducts, loadOrders, t])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  if (!session) return <Container className="py-24 text-[14px] text-muted">{t('admin.loading')}</Container>

  if (!session.authenticated) return <Login configured={session.configured} onDone={loadSession} />

  return (
    <Container className="pt-8 sm:pt-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[13px] text-muted">{t('admin.subtitle')}</p>
          <h1 className="font-display mt-1.5 text-[36px] sm:text-[46px] rtl:text-[30px] sm:rtl:text-[38px]">{t('admin.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="secondary" size="sm" onClick={() => window.open('/', '_self')}>
            <ArrowLeft className="rtl:rotate-180" />
            {t('admin.backToShop')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await api('/api/admin/logout', { method: 'POST' }).catch(() => null)
              setSession({ authenticated: false, configured: session.configured })
            }}
          >
            <LogOut className="rtl:rotate-180" />
            {t('admin.logout')}
          </Button>
        </div>
      </header>

      <nav className="mt-6 flex gap-1 overflow-x-auto scrollbar-none">
        {(
          [
            { key: 'products', label: t('admin.tab.products'), icon: Box },
            { key: 'orders', label: t('admin.tab.orders'), icon: ClipboardList },
            { key: 'settings', label: t('admin.tab.settings'), icon: Settings2 },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={cx(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-[12px] px-3.5 text-[14px] transition-colors',
              tab === key ? 'bg-fg text-bg' : 'text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            <Icon className="size-4" />
            {label}
            {key === 'products' && products.length > 0 && <span className="text-[12px] opacity-70">{products.length}</span>}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="mt-4 inline-flex min-h-10 items-center rounded-[12px] bg-surface-2 px-4 text-[13px]">{notice}</p>
      )}

      {tab === 'products' && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted">{t('admin.products.count', { n: products.length })}</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (!window.confirm(t('admin.products.restoreConfirm'))) return
                  await api('/api/admin/restore', { method: 'POST' }).catch(() => null)
                  await loadProducts()
                  setNotice(t('admin.products.saved'))
                }}
              >
                <RotateCcw />
                {t('admin.products.restore')}
              </Button>
              <Button size="sm" onClick={() => setEditing(blankProduct())}>
                <Plus />
                {t('admin.products.new')}
              </Button>
            </div>
          </div>

          {products.length === 0 ? (
            <p className="mt-10 rounded-card border border-dashed border-line-strong p-10 text-center text-[14px] text-muted">{t('admin.products.empty')}</p>
          ) : (
            <ul className="mt-5 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
              {products.map((product) => {
                const copy = product.copy[lang] ?? product.copy.en
                return (
                  <li key={product.slug} className="flex flex-wrap items-center gap-4 p-3 sm:p-4">
                    <span className="image-frame size-14 shrink-0 rounded-[14px]">
                      <img src={asset(product.image)} alt="" className="size-full object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{copy.name || product.copy.en.name}</p>
                      <p className="mt-0.5 truncate text-[12.5px] text-muted">
                        /{product.slug} · {categoryLabel(product.category, lang)} · {money(product.price)}
                      </p>
                    </div>
                    <span
                      className={cx(
                        'round hidden shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium sm:inline-flex',
                        product.published === false ? 'bg-surface-2 text-muted' : 'bg-accent-soft text-accent',
                      )}
                    >
                      {product.published === false ? t('admin.products.draft') : t('admin.products.published')}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="secondary" size="sm" onClick={() => setEditing(product)}>
                        {t('admin.products.edit')}
                      </Button>
                      <button
                        type="button"
                        aria-label={t('admin.products.delete')}
                        onClick={async () => {
                          if (!window.confirm(t('admin.products.deleteConfirm'))) return
                          await api(`/api/admin/products/${encodeURIComponent(product.slug)}`, { method: 'DELETE' }).catch(() => null)
                          await loadProducts()
                          setNotice(t('admin.products.deleted'))
                        }}
                        className="grid size-10 place-items-center rounded-[12px] text-muted transition-colors hover:bg-surface-2 hover:text-accent"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {busy && <p className="mt-3 text-[12.5px] text-faint">{t('admin.loading')}</p>}
        </section>
      )}

      {tab === 'orders' && (
        <section className="mt-8">
          {orders.length === 0 ? (
            <p className="rounded-card border border-dashed border-line-strong p-10 text-center text-[14px] text-muted">{t('admin.orders.empty')}</p>
          ) : (
            <div className="overflow-hidden rounded-card border border-line bg-surface">
              <table className="w-full text-start text-[13.5px]">
                <thead className="bg-surface-2/60 text-[12.5px] text-muted">
                  <tr>
                    <th className="p-3 text-start font-medium">{t('admin.orders.reference')}</th>
                    <th className="hidden p-3 text-start font-medium sm:table-cell">{t('admin.orders.customer')}</th>
                    <th className="hidden p-3 text-start font-medium md:table-cell">{t('admin.orders.date')}</th>
                    <th className="p-3 text-start font-medium">{t('admin.orders.total')}</th>
                    <th className="hidden p-3 text-start font-medium lg:table-cell">{t('admin.orders.items')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="p-3 font-medium tabular-nums">{order.reference}</td>
                      <td dir="ltr" className="hidden p-3 text-start text-muted sm:table-cell">
                        {order.email}
                      </td>
                      <td className="hidden p-3 text-muted md:table-cell">{order.created_at} UTC</td>
                      <td className="p-3 tabular-nums">{money(order.total)}</td>
                      <td className="hidden p-3 text-muted lg:table-cell">
                        {order.items.map((item) => `${item.quantity}× ${item.slug}${item.option ? ` (${item.option})` : ''}`).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'settings' && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-medium">{t('admin.settings.title')}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{t('admin.settings.body')}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-faint">{t('admin.settings.seedHint')}</p>
          </div>
          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-medium">{t('admin.settings.password')}</h2>
            <code dir="ltr" className="mt-3 block rounded-[10px] bg-surface-2 px-3 py-2 text-[12.5px]">
              npx wrangler secret put ADMIN_PASSWORD
            </code>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{t('admin.settings.passwordHint')}</p>
          </div>
        </section>
      )}

      {editing && (
        <Editor
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await loadProducts()
            setNotice(t('admin.products.saved'))
          }}
        />
      )}
    </Container>
  )
}

/* --------------------------------- login -------------------------------- */

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const { t } = usePrefs()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      onDone()
    } catch (err) {
      setError(err instanceof Error && err.message === 'unconfigured' ? t('admin.login.unconfigured') : t('admin.login.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className="pt-16 sm:pt-24">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-sm rounded-card border border-line bg-surface p-7"
      >
        <h1 className="font-display text-[30px]">{t('admin.login.title')}</h1>
        <p className="mt-2 text-[14px] text-muted">{t('admin.login.body')}</p>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-[13px] font-medium">{t('admin.login.password')}</span>
          <input type="password" dir="ltr" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>
        {error && <p className="mt-3 text-[13px] text-accent">{error}</p>}
        {!configured && <p className="mt-3 rounded-[10px] bg-accent-soft px-3 py-2 text-[12.5px] text-accent">{t('admin.login.unconfigured')}</p>}
        <Button type="submit" size="lg" loading={busy} className="mt-5 w-full">
          {t('admin.login.submit')}
        </Button>
        <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          {t('admin.backToShop')}
        </Link>
      </motion.form>
    </Container>
  )
}

/* -------------------------------- editor -------------------------------- */

function Editor({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const { t, lang } = usePrefs()
  const [draft, setDraft] = useState<Product>(product)
  // The shop is Arabic-first: that is the tab the owner should fill first.
  const [copyLang, setCopyLang] = useState<Lang>('ar')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isNew = !product.slug

  const copy = draft.copy[copyLang] ?? emptyCopy()
  const setCopyField = <K extends keyof ProductCopy>(key: K, value: ProductCopy[K]) => {
    setDraft((prev) => {
      const nextCopy = { ...(prev.copy[copyLang] ?? emptyCopy()), [key]: value }
      return { ...prev, copy: { ...prev.copy, [copyLang]: nextCopy } }
    })
  }

  const autoSlug = useMemo(
    () => slugify(draft.slug || draft.copy.en.name || draft.copy.ar?.name || draft.copy.fr?.name || ''),
    [draft.slug, draft.copy.en.name, draft.copy.ar?.name, draft.copy.fr?.name],
  )

  async function save() {
    setBusy(true)
    setError(null)
    const payload: Product = {
      ...draft,
      // The identifier follows the English name until it is typed by hand.
      slug: draft.slug ? slugify(draft.slug) : autoSlug,
      copy: {
        ...draft.copy,
        // An untranslated language is dropped so the store falls back to English.
        ...(draft.copy[copyLang]?.name ? {} : {}),
      },
    }
    try {
      if (isNew) await api('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) })
      else await api(`/api/admin/products/${encodeURIComponent(product.slug)}`, { method: 'PUT', body: JSON.stringify(payload) })
      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(message === 'exists' ? 'Slug déjà utilisé.' : message || t('admin.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute inset-x-0 bottom-0 top-4 mx-auto flex max-w-[1000px] flex-col overflow-hidden rounded-t-dialog bg-bg shadow-drawer sm:inset-4 sm:rounded-dialog"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-[24px]">{isNew ? t('admin.products.new') : t('admin.products.edit')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('admin.cancel')}
            </Button>
            <Button size="sm" loading={busy} onClick={save}>
              {t('admin.save')}
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-1 rounded-[12px] bg-surface-2 p-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => setCopyLang(l.key)}
                    aria-pressed={copyLang === l.key}
                    className={cx(
                      'h-9 flex-1 rounded-[9px] text-[13px] transition-colors',
                      copyLang === l.key ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg',
                    )}
                  >
                    {t(`admin.lang.${l.key}`)}
                    {draft.copy[l.key]?.name ? ' •' : ''}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-faint">{t('admin.langHint')}</p>
            </div>

            <Field label={t('admin.field.name')}>
              <input className={inputClass} value={copy.name} onChange={(e) => setCopyField('name', e.target.value)} dir={copyLang === 'ar' ? 'rtl' : 'ltr'} />
            </Field>
            <Field label={t('admin.field.short')}>
              <input className={inputClass} value={copy.short} onChange={(e) => setCopyField('short', e.target.value)} dir={copyLang === 'ar' ? 'rtl' : 'ltr'} />
            </Field>
            <Field label={t('admin.field.description')}>
              <textarea rows={4} className={cx(inputClass, 'h-auto py-3 leading-relaxed')} value={copy.description} onChange={(e) => setCopyField('description', e.target.value)} dir={copyLang === 'ar' ? 'rtl' : 'ltr'} />
            </Field>
            <Field label={t('admin.field.details')}>
              <textarea
                rows={3}
                className={cx(inputClass, 'h-auto py-3 leading-relaxed')}
                value={(copy.details ?? []).join('\n')}
                onChange={(e) => setCopyField('details', e.target.value.split('\n'))}
                dir={copyLang === 'ar' ? 'rtl' : 'ltr'}
              />
            </Field>
            <Field label={t('admin.field.materials')}>
              <input className={inputClass} value={copy.materials} onChange={(e) => setCopyField('materials', e.target.value)} dir={copyLang === 'ar' ? 'rtl' : 'ltr'} />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('admin.field.optionName')}>
                <select
                  className={inputClass}
                  value={copy.options?.name ?? ''}
                  onChange={(e) => setCopyField('options', e.target.value ? { name: e.target.value, values: copy.options?.values ?? [] } : undefined)}
                >
                  <option value="">{t('admin.field.optionNone')}</option>
                  {OPTION_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {t(`option.${name}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('admin.field.optionValues')}>
                <input
                  className={inputClass}
                  value={(copy.options?.values ?? []).join(', ')}
                  onChange={(e) =>
                    setCopyField('options', copy.options ? { name: copy.options.name, values: e.target.value.split(',').map((v) => v.trim()) } : undefined)
                  }
                  placeholder="Oat, Sage, Charcoal"
                />
              </Field>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="image-frame relative aspect-[4/5] rounded-image">
              <img src={asset(draft.image)} alt="" className="size-full object-cover" />
              <span className="absolute bottom-3 end-3 grid size-9 place-items-center rounded-[10px] bg-surface/90 text-muted">
                <ImagePlus className="size-4" />
              </span>
            </div>
            <Field label={t('admin.field.image')}>
              <input className={inputClass} dir="ltr" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
            </Field>
            <p className="-mt-2 text-[12px] text-faint">{t('admin.field.imageHint')}</p>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('admin.field.price')}>
                <input type="number" min="0" step="0.01" className={inputClass} dir="ltr" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
              </Field>
              <Field label={t('admin.field.compareAt')}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  dir="ltr"
                  value={draft.compareAt ?? ''}
                  onChange={(e) => setDraft({ ...draft, compareAt: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
              <Field label={t('admin.field.category')}>
                <select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                  {categoryKeys.map((key) => (
                    <option key={key} value={key}>
                      {categoryLabel(key, lang)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('admin.field.badge')}>
                <select className={inputClass} value={draft.badge ?? ''} onChange={(e) => setDraft({ ...draft, badge: (e.target.value || null) as Badge | null })}>
                  <option value="">{t('admin.field.badgeNone')}</option>
                  {BADGES.map((badge) => (
                    <option key={badge} value={badge}>
                      {t(`badge.${badge}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('admin.field.slug')}>
                <input className={inputClass} dir="ltr" value={draft.slug} placeholder={autoSlug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </Field>
              <Field label={t('admin.field.sortOrder')}>
                <input type="number" className={inputClass} dir="ltr" value={draft.sortOrder ?? 999} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
              </Field>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-[12px] border border-line px-3 py-2.5 text-[13.5px]">
              {t('admin.field.published')}
              <input type="checkbox" checked={draft.published !== false} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="size-4 accent-current" />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-[12px] border border-line px-3 py-2.5 text-[13.5px]">
              {t('admin.field.featured')}
              <input type="checkbox" checked={!!draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="size-4 accent-current" />
            </label>

            {error && <p className="text-[13px] text-accent">{error}</p>}
          </aside>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}
