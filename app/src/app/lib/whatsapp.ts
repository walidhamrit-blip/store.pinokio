// Messages that open a WhatsApp chat with the shop.
//
// Kept out of the components so the wording can be changed — or a second
// language added — without touching the layout.

import { optionLabel } from '../../data/i18n'
import { localized, type Product } from '../../data/products'
import { translate, type Lang } from '../i18n/dict'
import { money } from './cart'

export interface MessageLine {
  product: Product
  option?: string
  quantity: number
}

/** The bag, as a short list the shop can read on a phone. */
export function cartMessage(items: MessageLine[], subtotal: number, lang: Lang): string {
  const lines = items.map((item) => {
    const name = localized(item.product, lang).name
    const option = item.option ? ` (${optionLabel(item.option, lang)})` : ''
    return `• ${item.quantity} × ${name}${option} — ${money(item.product.price * item.quantity)}`
  })
  return [
    translate(lang, 'wa.greeting', { brand: translate(lang, 'brand') }),
    '',
    ...lines,
    '',
    `${translate(lang, 'cart.subtotal')}: ${money(subtotal)}`,
    '',
    translate(lang, 'wa.signature'),
  ].join('\n')
}

/** One article, for the "ask about this piece" link on a product page. */
export function productMessage(product: Product, lang: Lang, url: string, option?: string): string {
  const name = localized(product, lang).name
  const choice = option ? ` (${optionLabel(option, lang)})` : ''
  return [
    translate(lang, 'wa.greeting', { brand: translate(lang, 'brand') }),
    '',
    `• ${name}${choice} — ${money(product.price)}`,
    url,
    '',
    translate(lang, 'wa.signature'),
  ].join('\n')
}
