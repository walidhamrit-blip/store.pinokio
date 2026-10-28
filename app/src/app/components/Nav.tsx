import { AnimatePresence, motion } from 'motion/react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { useCart } from '../lib/cart'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'
import { HeaderControls, PreferencesPanel } from './preferences'

const linkDefs = [
  { to: '/shop', key: 'nav.shop' },
  { to: '/shop?category=ceramics', key: 'nav.ceramics' },
  { to: '/shop?category=textiles', key: 'nav.textiles' },
  { to: '/shop?category=lighting', key: 'nav.lighting' },
  { to: '/about', key: 'nav.about' },
] as const

export function Logo({ className }: { className?: string }) {
  const { t } = usePrefs()
  return (
    <Link to="/" className={cx('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
        <path d="M9 4c0 4-3 5-3 10a6 6 0 0 0 12 0c0-5-3-6-3-10z" />
      </svg>
      <span className="font-display whitespace-nowrap text-[19px] leading-none min-[380px]:text-[21px] sm:text-[23px]">{t('brand')}</span>
    </Link>
  )
}

export function Nav() {
  const cart = useCart()
  const { t, dir } = usePrefs()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="flex h-9 items-center justify-center bg-fg px-4 text-center text-[12.5px] text-bg">{t('announcement')}</div>
      <header className={cx('sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300', scrolled ? 'border-b border-line bg-bg/85 backdrop-blur-xl' : 'bg-bg')}>
        <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden items-center gap-1 lg:flex">
            {linkDefs.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'inline-flex h-9 items-center rounded-[11px] px-3 text-[14px] transition-colors hover:bg-surface-2',
                    isActive && l.to === location.pathname + location.search ? 'text-fg' : 'text-muted hover:text-fg',
                  )
                }
              >
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
          <button type="button" aria-label={t('nav.menu')} onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-control transition-colors hover:bg-surface-2 lg:hidden">
            <Menu className="size-5" />
          </button>

          <div className="justify-self-center">
            <Logo />
          </div>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <Link to="/about" className="hidden h-9 items-center rounded-[11px] px-3 text-[14px] text-muted transition-colors hover:bg-surface-2 hover:text-fg sm:inline-flex lg:hidden">
              {t('nav.about')}
            </Link>
            <HeaderControls />
            <button
              type="button"
              aria-label={t('nav.bagCount', { n: cart.count })}
              onClick={() => cart.setOpen(true)}
              className="relative inline-flex h-9 items-center gap-1.5 rounded-[11px] px-2 text-[14px] transition-colors hover:bg-surface-2 sm:h-10 sm:px-3"
            >
              <ShoppingBag className="size-5" />
              <span className="hidden sm:inline">{t('nav.bag')}</span>
              <AnimatePresence>
                {cart.count > 0 && (
                  <motion.span
                    key={cart.count}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="round grid min-w-5 place-items-center rounded-full bg-fg px-1.5 text-[11px] font-semibold tabular-nums text-bg"
                  >
                    {cart.count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-scrim lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.nav
              initial={{ x: dir === 'rtl' ? 24 : -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir === 'rtl' ? 24 : -24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-2 start-2 flex w-[min(320px,calc(100vw-16px))] flex-col overflow-y-auto rounded-dialog bg-bg p-5 shadow-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button type="button" aria-label={t('nav.close')} onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-control hover:bg-surface-2">
                  <X className="size-5" />
                </button>
              </div>
              <ul className="mt-7 flex flex-col gap-0.5">
                {linkDefs.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="flex h-11 items-center rounded-control px-3 font-display text-[22px] hover:bg-surface-2">
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PreferencesPanel />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
