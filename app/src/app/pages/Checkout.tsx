import { Banknote, Check, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { FREE_SHIPPING_AT } from '../../data/products'
import { countryLabels, optionLabel } from '../../data/i18n'
import { localized } from '../../data/products'
import { ButtonLink, Container, inputClass } from '../components/ui'
import { money, useCart } from '../lib/cart'
import { DEMO, asset } from '../lib/demo'
import { buildOrderMessage, whatsappOrderLink } from '../lib/whatsapp'
import { WhatsAppGlyph } from '../components/WhatsAppButton'
import { shop } from '../../data/shop'
import { usePrefs } from '../lib/prefs'

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
    </label>
  )
}

export function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()
  const { lang, t } = usePrefs()
  const [form, setForm] = useState({ email: '', phone: '', first: '', last: '', address: '', city: '', postcode: '', country: 'Libya' })
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState('')

  if (cart.items.length === 0) return <Navigate to="/shop" replace />

  const shipping = cart.subtotal >= FREE_SHIPPING_AT ? 0 : 8
  const total = cart.subtotal + shipping
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value })

  /** The order as a WhatsApp message: bag, details and total, ready to send. */
  const waLink = whatsappOrderLink(
    buildOrderMessage({
      items: cart.items,
      lang,
      t,
      subtotal: cart.subtotal,
      shipping,
      total,
      details: {
        name: `${form.first} ${form.last}`.trim(),
        phone: form.phone,
        city: form.city,
        address: form.address,
        email: form.email,
      },
    }),
  )

  /**
   * WhatsApp first: the visitor is sent to the chat, and the site shows the
   * usual confirmation with a reference they can quote back to the shop.
   */
  function orderOnWhatsApp() {
    window.open(waLink, '_blank', 'noopener,noreferrer')
    const prefix = shop.name.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'ORDER'
    const reference = `${prefix}-${Date.now().toString(36).slice(-6).toUpperCase()}`
    const summary = { reference, email: form.email, items: cart.items, total }
    cart.clear()
    navigate(`/order/${reference}`, { state: summary })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setState('sending')
    // The sample has no backend: it confirms the order in the browser so the
    // whole flow can be clicked through from a shared link.
    if (DEMO) {
      const prefix = shop.name.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'DEMO'
      const reference = `${prefix}-${Date.now().toString(36).slice(-6).toUpperCase()}`
      const summary = { reference, email: form.email, items: cart.items, total }
      cart.clear()
      navigate(`/order/${reference}`, { state: summary })
      return
    }
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.email, items: cart.items.map((i) => ({ id: i.slug, option: i.option, quantity: i.quantity })) }),
      })
      const body = (await response.json()) as { reference?: string; error?: string }
      if (!response.ok || !body.reference) throw new Error(body.error ?? t('checkout.error.generic'))
      const summary = { reference: body.reference, email: form.email, items: cart.items, total }
      cart.clear()
      navigate(`/order/${body.reference}`, { state: summary })
    } catch {
      setState('error')
      setError(t('checkout.error.generic'))
    }
  }

  return (
    <Container className="pt-10 sm:pt-14">
      <h1 className="font-display text-[40px] sm:text-[52px] rtl:text-[34px] sm:rtl:text-[44px]">{t('checkout.title')}</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-20">
        <form onSubmit={submit} className="flex flex-col gap-10">
          <section>
            <h2 className="text-[16px] font-medium">{t('checkout.contact')}</h2>
            <Field label={t('checkout.email')} className="mt-4 block">
              <input type="email" dir="ltr" required className={inputClass} value={form.email} onChange={set('email')} autoComplete="email" />
            </Field>
            <Field label={t('wa.phone')} className="mt-3 block">
              <input type="tel" dir="ltr" required className={inputClass} value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+218 9…" />
            </Field>
          </section>
          <section>
            <h2 className="text-[16px] font-medium">{t('checkout.shipping')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label={t('checkout.first')}>
                <input required className={inputClass} value={form.first} onChange={set('first')} autoComplete="given-name" />
              </Field>
              <Field label={t('checkout.last')}>
                <input required className={inputClass} value={form.last} onChange={set('last')} autoComplete="family-name" />
              </Field>
              <Field label={t('checkout.address')} className="col-span-2">
                <input required className={inputClass} value={form.address} onChange={set('address')} autoComplete="street-address" />
              </Field>
              <Field label={t('checkout.city')}>
                <input required className={inputClass} value={form.city} onChange={set('city')} autoComplete="address-level2" />
              </Field>
              <Field label={t('checkout.postcode')}>
                <input required className={inputClass} value={form.postcode} onChange={set('postcode')} autoComplete="postal-code" />
              </Field>
              <Field label={t('checkout.country')} className="col-span-2">
                <select className={inputClass} value={form.country} onChange={set('country')} autoComplete="country-name">
                  {countryLabels.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.labels[lang] ?? c.key}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>
          <section>
            <h2 className="text-[16px] font-medium">{t('checkout.payment')}</h2>
            <div className="mt-4 rounded-card border border-line bg-surface p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-surface-2">
                  <Banknote className="size-4" />
                </span>
                <div>
                  <p className="text-[15px] font-medium">{t('checkout.cod')}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{t('checkout.cod.body')}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
                <Lock className="mt-0.5 size-4 shrink-0" />
                <span>
                  {t('checkout.demoBefore')}{' '}
                  <code dir="ltr" className="rounded-[6px] bg-surface-2 px-1.5 py-0.5 text-[12px]">
                    src/worker/index.ts
                  </code>{' '}
                  {t('checkout.demoAfter')}
                </span>
              </div>
            </div>
          </section>
          {state === 'error' && <p className="text-[14px] text-accent">{error}</p>}

          {/* The shop takes orders on WhatsApp: this is the main path. */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={orderOnWhatsApp}
              className="inline-flex h-13 min-h-12 w-full items-center justify-center gap-2.5 rounded-control bg-[#25D366] px-6 text-[15px] font-medium text-white transition-[filter] hover:brightness-95 sm:w-auto"
            >
              <WhatsAppGlyph className="size-5" />
              {t('checkout.whatsapp')} · {money(total)}
            </button>
            <p className="max-w-md text-[13px] leading-relaxed text-muted">{t('checkout.waHint')}</p>
            <button
              type="submit"
              disabled={state === 'sending'}
              className="mt-1 inline-flex h-10 items-center self-start text-[13.5px] text-muted underline underline-offset-4 transition-colors hover:text-fg"
            >
              {state === 'sending' ? t('admin.loading') : t('checkout.record')}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[16px] font-medium">{t('checkout.summary')}</h2>
            <ul className="mt-4 divide-y divide-line">
              {cart.items.map((item) => {
                const copy = localized(item.product, lang)
                return (
                  <li key={`${item.slug}-${item.option ?? ''}`} className="flex items-center gap-4 py-3">
                    <span className="image-frame relative size-16 shrink-0 rounded-[14px]">
                      <img src={asset(item.product.image)} alt="" className="size-full object-cover" />
                      <span className="round absolute -end-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-fg px-1.5 text-[11px] font-semibold tabular-nums text-bg">{item.quantity}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{copy.name}</span>
                      {item.option && <span className="block text-[13px] text-muted">{optionLabel(item.option, lang)}</span>}
                    </span>
                    <span className="tabular-nums">{money(item.product.price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>
            <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[14.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('cart.subtotal')}</dt>
                <dd className="tabular-nums">{money(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('checkout.shippingLabel')}</dt>
                <dd className="tabular-nums">{shipping === 0 ? t('checkout.free') : money(shipping)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-3 text-[16px] font-medium">
                <dt>{t('checkout.total')}</dt>
                <dd className="tabular-nums">{money(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </Container>
  )
}

export function OrderConfirmed() {
  const { state } = useLocation() as { state?: { reference: string; email: string; total: number } }
  const { t } = usePrefs()
  return (
    <Container className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-md text-center">
        <span className="round mx-auto grid size-14 place-items-center rounded-full bg-fg text-bg">
          <Check className="size-6" />
        </span>
        <h1 className="font-display mt-6 text-[40px] leading-[1.02] sm:text-[52px] rtl:text-[34px] sm:rtl:text-[44px]">{t('order.thanks')}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          {state ? (
            <>
              {t('order.prefix')} <span className="font-medium text-fg">{state.reference}</span> {t('order.mid')}{' '}
              <span dir="ltr" className="font-medium text-fg">
                {state.email}
              </span>
              .
            </>
          ) : (
            t('order.confirmed')
          )}
        </p>
        <ButtonLink to="/shop" variant="secondary" className="mt-8">
          {t('order.continue')}
        </ButtonLink>
        <p className="mt-10 text-[13px] text-faint">
          {t('order.questions')}{' '}
          <Link to="/about" className="underline underline-offset-4">
            {t('order.write')}
          </Link>
        </p>
      </div>
    </Container>
  )
}
