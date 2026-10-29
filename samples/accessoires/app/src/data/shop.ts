// The shop, as data.
//
// Everything the storefront says about NOOR — where it is, when it is open,
// how to reach it — lives here, so the address and the phone number are
// changed in one place. Copy is kept in the three languages of the store.
//
// This is the accessories SAMPLE: the brand, the address and the phone number
// are fictional, and the footer says so. Replace the values below with a
// client's real shop and the whole site follows.

import type { Lang } from '../app/i18n/dict'

export const shop = {
  /** Latin name, as on the shopfront. */
  name: 'NOOR',
  nameAr: 'نور',
  /** The kind of shop, shown on the sample's preview card. */
  kind: 'Fashion accessories store',
  /** A neutral map link: the sample has no real location. */
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tripoli+Libya',
  coordinates: { lat: 32.8872, lng: 13.1913 },
  phone: '+218 91 000 0000',
  whatsapp: '218910000000',
  /**
   * Orders go here first — the cart and the checkout write to this number.
   * Keep the digits only, with the country code (wa.me format).
   */
  orderWhatsapp: '218910000000',
  orderPhone: '+218 91 000 0000',
  facebook: 'https://www.facebook.com/',
  rating: 4.9,
  reviews: 128,
  /** Fictional address, used to show the layout. */
  address: {
    ar: 'طرابلس — شارع عمر المختار',
    fr: 'Tripoli — rue Omar Al Mukhtar',
    en: 'Tripoli — Omar Al Mukhtar Street',
  },
  city: { ar: 'طرابلس، ليبيا', fr: 'Tripoli, Libye', en: 'Tripoli, Libya' },
  hours: [
    { ar: 'السبت — الخميس', fr: 'Samedi — jeudi', en: 'Saturday — Thursday', open: '10:30', close: '21:00' },
    { ar: 'الجمعة', fr: 'Vendredi', en: 'Friday', open: '17:00', close: '19:00' },
  ] as { ar: string; fr: string; en: string; open: string; close: string }[],
  delivery: {
    ar: 'توصيل إلى طرابلس ومصراتة وكل ليبيا بالبريد.',
    fr: 'Livraison à Tripoli, Misrata et partout en Libye par transporteur.',
    en: 'Delivery in Tripoli, Misrata and across Libya by courier.',
  },
} as const

export const shopText = (value: { ar: string; fr: string; en: string }, lang: Lang) => value[lang] ?? value.en

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.coordinates.lat},${shop.coordinates.lng}`
