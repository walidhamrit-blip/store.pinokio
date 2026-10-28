// The catalogue, as data.
//
// Products live in D1 so the shop owner can edit them from /admin without
// touching code. This file holds the shapes, the category facets, and the
// starting catalogue (seed.json) — used to seed the database on first run and
// as an offline fallback if the API is unreachable.

import seed from './seed.json'
import type { Lang } from '../app/i18n/dict'

export type Category = 'ceramics' | 'textiles' | 'lighting' | 'kitchen' | 'home'
export type Badge = 'New' | 'Bestseller' | 'Low stock'
export type OptionName = 'Glaze' | 'Colour' | 'Scent'

export const BADGES: Badge[] = ['New', 'Bestseller', 'Low stock']
export const OPTION_NAMES: OptionName[] = ['Glaze', 'Colour', 'Scent']

export const categories: { key: Category; label: string; image: string; blurb: string }[] = seed.categories as {
  key: Category
  label: string
  image: string
  blurb: string
}[]

export const categoryKeys: Category[] = ['ceramics', 'textiles', 'lighting', 'kitchen', 'home']

/** Copy for one language. English is always present; others fall back to it. */
export interface ProductCopy {
  name: string
  short: string
  description: string
  details: string[]
  materials: string
  options?: { name: string; values: string[] }
}

export interface Product {
  slug: string
  price: number
  compareAt?: number | null
  category: Category
  image: string
  badge?: Badge | null
  featured?: boolean
  /** Hidden from the shop when false; still editable in the dashboard. */
  published?: boolean
  sortOrder?: number
  copy: { en: ProductCopy } & Partial<Record<Lang, ProductCopy>>
}

export const seedProducts = seed.products as Product[]
export const FREE_SHIPPING_AT: number = seed.freeShippingAt

/** The copy to render: the requested language, or English if it is missing. */
export function copyFor(product: Product, lang: Lang): ProductCopy {
  return product.copy?.[lang] ?? product.copy.en
}

/** A product with its copy flattened into the active language. */
export function localized(product: Product, lang: Lang) {
  const copy = copyFor(product, lang)
  return {
    slug: product.slug,
    price: product.price,
    compareAt: product.compareAt,
    category: product.category,
    image: product.image,
    badge: product.badge,
    featured: product.featured,
    name: copy.name,
    short: copy.short,
    description: copy.description,
    details: copy.details,
    materials: copy.materials,
    options: copy.options,
  }
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

/**
 * Validates and normalises a product coming from the dashboard.
 *
 * English is the fallback language, but the shop owner is not forced to write
 * it: if only Arabic (or French) is filled in, the first translated language
 * is copied into `en` so the store never shows an empty card.
 */
export function normaliseProduct(input: Partial<Product>): { ok: true; product: Product } | { ok: false; error: string } {
  const price = Number(input.price)
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: 'Le prix doit être un nombre positif.' }
  const category = (categoryKeys as string[]).includes(String(input.category)) ? (input.category as Category) : 'home'
  const copy = input.copy ?? ({} as Product['copy'])
  const filled = (['en', 'ar', 'fr'] as const).map((lang) => [lang, copy[lang]] as const).filter(([, value]) => value?.name?.trim())
  if (filled.length === 0) return { ok: false, error: 'Un nom est requis dans au moins une langue.' }
  const [primaryLang, primaryCopy] = filled[0]
  const slug = slugify(String(input.slug || primaryCopy!.name)) || `article-${Date.now().toString(36).slice(-5)}`

  const clean: { en: ProductCopy } & Partial<Record<Lang, ProductCopy>> = { en: cleanCopy(copy.en?.name ? copy.en : primaryCopy!) }
  for (const lang of ['ar', 'fr'] as const) {
    const value = copy[lang]
    if (value?.name?.trim()) clean[lang] = cleanCopy(value)
  }
  if (!clean.en.name) clean.en = clean[primaryLang as Lang] ?? cleanCopy(primaryCopy!)
  return {
    ok: true,
    product: {
      slug,
      price: Math.round(price * 100) / 100,
      compareAt: input.compareAt ? Number(input.compareAt) : null,
      category,
      image: String(input.image || '/images/hero.jpg'),
      badge: BADGES.includes(input.badge as Badge) ? (input.badge as Badge) : null,
      featured: !!input.featured,
      published: input.published !== false,
      sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 999,
      copy: clean,
    },
  }
}

function cleanCopy(copy: ProductCopy): ProductCopy {
  return {
    name: String(copy.name ?? '').trim(),
    short: String(copy.short ?? '').trim(),
    description: String(copy.description ?? '').trim(),
    details: (copy.details ?? []).map((line) => String(line).trim()).filter(Boolean),
    materials: String(copy.materials ?? '').trim(),
    options: copy.options?.name && copy.options.values?.filter(Boolean).length ? { name: copy.options.name, values: copy.options.values.map((v) => String(v).trim()).filter(Boolean) } : undefined,
  }
}
