// Turning the bag into a WhatsApp message.
//
// This shop takes orders on WhatsApp rather than through a payment provider:
// the bag, the quantities, the options and the total are written into a
// message, and the customer only has to press send. That keeps the checkout
// honest with a Market that pays cash on delivery — nothing to integrate, and
// the order lands on the phone the shop actually watches.
//
// The number is `shop.orderWhatsapp` (data/shop.ts), not the general contact
// number: orders go to one phone, questions to the other.

import { copyFor } from '../../data/products'
import { shop } from '../../data/shop'
import type { Lang, TKey } from '../i18n/dict'
import type { Product } from '../../data/products'

export interface WhatsAppLine {
  slug: string
  option?: string
  quantity: number
  product: Product
}

type Translate = (key: TKey, vars?: Record<string, string | number>) => string

const amount = (value: number) => `${value.toFixed(value % 1 === 0 ? 0 : 2)} LYD`

/** "1234.5 LYD" → the price as the store prints it. */
const money = amount

/** The absolute address of a piece, on whatever host is serving the shop. */
export function productUrl(slug: string, base = ''): string {
  return `${window.location.origin}${base}/product/${slug}`
}

/**
 * The message for one order. Plain text, one line per piece, then the total:
 * readable in the WhatsApp notification preview without opening the chat.
 */
export function buildOrderMessage({
  items,
  lang,
  t,
  subtotal,
  shipping,
  total,
  details,
}: {
  items: WhatsAppLine[]
  lang: Lang
  t: Translate
  subtotal: number
  shipping: number
  total: number
  details?: { name?: string; phone?: string; city?: string; address?: string; email?: string }
}): string {
  const name = shop.name
  const lines: string[] = [`${t('wa.intro', { shop: name })}`, '']

  for (const item of items) {
    const copy = copyFor(item.product, lang)
    const option = item.option ? ` (${item.option})` : ''
    lines.push(`• ${copy.name}${option} ×${item.quantity} — ${money(item.product.price * item.quantity)}`)
  }

  lines.push('', `${t('wa.subtotal')}: ${money(subtotal)}`)
  lines.push(`${t('wa.shipping')}: ${shipping === 0 ? t('wa.free') : money(shipping)}`)
  lines.push(`${t('wa.total')}: ${money(total)}`)

  const filled = details && Object.entries(details).filter(([, value]) => (value ?? '').trim())
  if (filled && filled.length > 0) {
    lines.push('', `${t('wa.details')}`)
    const labels: Record<string, TKey> = {
      name: 'wa.name',
      phone: 'wa.phone',
      city: 'wa.city',
      address: 'wa.address',
      email: 'wa.email',
    }
    for (const [key, value] of filled) {
      const label = labels[key]
      if (label) lines.push(`${t(label)}: ${value}`)
    }
  }

  lines.push('', t('wa.note'))
  return lines.join('\n')
}

/** A wa.me link to the order number, with the message already written. */
export function whatsappOrderLink(message: string): string {
  return `https://wa.me/${shop.orderWhatsapp}?text=${encodeURIComponent(message)}`
}
