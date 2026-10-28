import { MessageCircle } from 'lucide-react'

import { shop } from '../../data/shop'
import { usePrefs } from '../lib/prefs'

/**
 * A shop that answers on WhatsApp: one fixed button, above the bag drawer's
 * layer, hidden on the dashboard by the site chrome.
 */
export function WhatsAppButton() {
  const { t } = usePrefs()
  return (
    <a
      href={`https://wa.me/${shop.whatsapp}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t('about.visit.whatsapp')}
      title={t('about.visit.whatsapp')}
      className="round fixed bottom-5 end-5 z-30 grid size-12 place-items-center rounded-full bg-fg text-bg shadow-soft transition-transform duration-300 hover:scale-105"
    >
      <MessageCircle className="size-5" />
    </a>
  )
}
