import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { WHATSAPP, whatsappLink } from '../../data/contact'
import { translate } from '../i18n/dict'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'
import { WhatsAppIcon } from './icons'

/**
 * The line to the shop, always within reach.
 *
 * A circle rather than a bar: it has to sit over photography without stealing
 * the page, and it uses the theme's ink colour so it belongs to every palette.
 * The number it dials comes from `data/contact.ts`.
 */
export function WhatsAppFab() {
  const { t, lang } = usePrefs()
  const { pathname } = useLocation()
  const [ready, setReady] = useState(false)

  // Let the page settle before the button arrives, so it reads as an offer
  // rather than something that was already covering the hero.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 900)
    return () => window.clearTimeout(timer)
  }, [])

  if (pathname.startsWith('/admin')) return null

  const href = whatsappLink(translate(lang, 'wa.fab.message'))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cx('fixed bottom-4 end-4 z-30 sm:bottom-6 sm:end-6', !ready && 'pointer-events-none')}
    >
      <div className="group relative">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('wa.fab.aria', { number: WHATSAPP.display })}
          className="round relative grid size-[52px] place-items-center rounded-full bg-fg text-bg shadow-soft transition-[transform,background-color] duration-300 hover:scale-[1.04] focus-visible:scale-[1.04] sm:size-14"
        >
          <span aria-hidden className="wa-halo round absolute inset-0 rounded-full bg-[#25d366]" />
          <WhatsAppIcon className="relative size-6 sm:size-[26px]" />
          <span aria-hidden className="round absolute -end-0.5 -top-0.5 size-3 rounded-full bg-[#25d366] ring-2 ring-bg" />
        </a>

        {/* The number, for anyone who would rather save it than tap through. */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-full end-0 mb-3 hidden w-max max-w-[240px] rounded-[12px] border border-line bg-surface px-3 py-2 text-[12.5px] leading-snug text-muted opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 sm:block"
        >
          <span className="block font-medium text-fg">{t('wa.fab.label')}</span>
          <span dir="ltr" className="tabular-nums">
            {WHATSAPP.display}
          </span>
        </span>
      </div>
    </motion.div>
  )
}
