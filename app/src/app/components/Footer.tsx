import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { Container, inputClass } from './ui'
import { Logo } from './Nav'
import { shop } from '../../data/shop'
import { usePrefs } from '../lib/prefs'
import type { TKey } from '../i18n/dict'

const columns: { title: TKey; links: [TKey, string][] }[] = [
  {
    title: 'footer.col.shop',
    links: [
      ['footer.link.all', '/shop'],
      ['cat.bags', '/shop?category=bags'],
      ['cat.jewelry', '/shop?category=jewelry'],
      ['cat.accessories', '/shop?category=accessories'],
      ['cat.beauty', '/shop?category=beauty'],
    ],
  },
  {
    title: 'footer.col.help',
    links: [
      ['footer.link.shipping', '/about'],
      ['footer.link.returns', '/about'],
      ['footer.link.care', '/about'],
      ['footer.link.contact', '/about'],
    ],
  },
  {
    title: 'footer.col.studio',
    links: [
      ['footer.link.about', '/about'],
      ['footer.link.visit', '/about'],
      ['footer.link.facebook', shop.facebook],
      ['footer.link.whatsapp', `https://wa.me/${shop.whatsapp}`],
    ],
  },
]

export function Footer() {
  const { t } = usePrefs()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setState('sending')
    const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
    setState(response.ok ? 'done' : 'error')
  }

  return (
    <footer className="mt-24 border-t border-line">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-md">
            <h2 className="font-display text-[32px] leading-[1.05] sm:text-[36px]">{t('footer.newsletter.title')}</h2>
            <p className="mt-3 text-[15px] text-muted">{t('footer.newsletter.body')}</p>
            {state === 'done' ? (
              <p className="mt-6 inline-flex h-12 items-center rounded-control bg-surface-2 px-5 text-[15px]">{t('footer.newsletter.thanks')}</p>
            ) : (
              <form onSubmit={submit} className="mt-6 flex gap-2">
                <label className="sr-only" htmlFor="newsletter">
                  {t('footer.newsletter.email')}
                </label>
                <input
                  id="newsletter"
                  type="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletter.placeholder')}
                  className={inputClass}
                />
                <button
                  type="submit"
                  aria-label={t('footer.newsletter.aria')}
                  disabled={state === 'sending'}
                  className="grid size-12 shrink-0 place-items-center rounded-control bg-fg text-bg transition-colors hover:bg-fg/90"
                >
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </button>
              </form>
            )}
            {state === 'error' && <p className="mt-2 text-[13px] text-accent">{t('footer.newsletter.error')}</p>}
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] font-medium">{t(col.title)}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      {to.startsWith('http') ? (
                        <a
                          href={to}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[14px] text-muted transition-colors hover:text-fg"
                        >
                          {t(label)}
                        </a>
                      ) : (
                        <Link to={to} className="text-[14px] text-muted transition-colors hover:text-fg">
                          {t(label)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-faint">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <Logo className="text-muted" />
        </div>
      </Container>
    </footer>
  )
}
