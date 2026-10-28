// The real shop, as data.
//
// Everything the storefront says about DAOS — where it is, when it is open,
// how to reach it — lives here, so the address and the phone number are
// changed in one place. Copy is kept in the three languages of the store.
//
// Source: the shop's Google Maps listing and its Facebook page (@daosworld).

import type { Lang } from '../app/i18n/dict'

export const shop = {
  /** Latin name, as on the shopfront. */
  name: 'DAOS',
  nameAr: 'داوس',
  /** Google Maps category of the listing. */
  kind: 'Fashion accessories store',
  /** The public listing, used for the map link and the rating. */
  mapUrl:
    'https://www.google.com/maps/place/DAOS+%D8%AF%D8%A7%D9%88%D8%B3/@32.4661282,14.5610501,17z/data=!4m6!3m5!1s0x13a893914c693807:0xcdc4ac59c8aa4d2a!8m2!3d32.4661282!4d14.5610501!16s%2Fg%2F11j99lf0cw',
  coordinates: { lat: 32.4661282, lng: 14.5610501 },
  phone: '+218 92-5252526',
  whatsapp: '218925252526',
  facebook: 'https://www.facebook.com/daosworld',
  rating: 4.7,
  reviews: 7,
  /** Zliten, behind Wahda Bank — as the shop writes it on Facebook. */
  address: {
    ar: 'زليتن — خلف مصرف الوحدة، شارع المعدات',
    fr: 'Zliten — derrière la Banque Al Wahda, rue Al Muaddat',
    en: 'Zliten — behind Al Wahda Bank, Al Muaddat Street',
  },
  city: { ar: 'زليتن، ليبيا', fr: 'Zliten, Libye', en: 'Zliten, Libya' },
  /** Google's opening hours: closed early on Friday afternoon. */
  hours: [
    { ar: 'السبت — الخميس', fr: 'Samedi — jeudi', en: 'Saturday — Thursday', open: '10:30', close: '21:00' },
    { ar: 'الجمعة', fr: 'Vendredi', en: 'Friday', open: '17:00', close: '19:00' },
  ] as { ar: string; fr: string; en: string; open: string; close: string }[],
  delivery: {
    ar: 'توصيل إلى زليتن ومصراتة وطرابلس، وكل ليبيا بالبريد.',
    fr: 'Livraison à Zliten, Misrata et Tripoli, partout en Libye par transporteur.',
    en: 'Delivery in Zliten, Misrata and Tripoli, and across Libya by courier.',
  },
} as const

export const shopText = (value: { ar: string; fr: string; en: string }, lang: Lang) => value[lang] ?? value.en

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.coordinates.lat},${shop.coordinates.lng}`
