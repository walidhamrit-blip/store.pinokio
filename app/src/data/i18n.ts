// Labels that are not per-product: category names and blurbs, the choice
// values shown on product pages, and country names for the checkout.
// Product copy itself lives in the database (editable from /admin).
import type { Category } from './products'
import type { Lang } from '../app/i18n/dict'

// Choice values on the product pages ("Camel", "Gold", "Amber"...).
const optionLabels: Partial<Record<Lang, Record<string, string>>> = {
  fr: {
    Camel: 'Camel',
    Black: 'Noir',
    Ivory: 'Ivoire',
    Tan: 'Fauve',
    Gold: 'Doré',
    Silver: 'Argenté',
    Steel: 'Acier',
    Sage: 'Sauge',
    Rose: 'Rose',
    Amber: 'Ambre',
    Musk: 'Musc',
    Cedar: 'Cèdre',
  },
  ar: {
    Camel: 'الجمل',
    Black: 'الأسود',
    Ivory: 'العاجي',
    Tan: 'البني الفاتح',
    Gold: 'الذهبي',
    Silver: 'الفضي',
    Steel: 'الستانلس',
    Sage: 'المريمي',
    Rose: 'الوردي',
    Amber: 'العنبر',
    Musk: 'المسك',
    Cedar: 'الأرز',
  },
}

const categoryLabels: Partial<Record<Lang, Partial<Record<Category, string>>>> = {
  fr: { bags: 'Sacs', jewelry: 'Bijoux', accessories: 'Accessoires', beauty: 'Beauté' },
  ar: { bags: 'الحقائب', jewelry: 'المجوهرات', accessories: 'الإكسسوارات', beauty: 'العطور والعناية' },
}

const categoryBlurbs: Partial<Record<Lang, Partial<Record<Category, string>>>> = {
  en: {
    bags: 'Totes, crossbodies and evening bags',
    jewelry: 'Gold, silver and pearls',
    accessories: 'Hair, silk and small things',
    beauty: 'Scent, care and gifts',
  },
  fr: {
    bags: 'Cabas, bandoulières et sacs de soirée',
    jewelry: 'Or, argent et perles',
    accessories: 'Cheveux, soie et petits riens',
    beauty: 'Parfums, soins et cadeaux',
  },
  ar: {
    bags: 'حقائب يد وكتف وحقائب سهرة',
    jewelry: 'ذهب وفضة ولؤلؤ',
    accessories: 'شعر وحرير وتفاصيل صغيرة',
    beauty: 'عطور وعناية وهدايا',
  },
}

// Libya first: most orders are delivered inside the country.
export const countryLabels: { key: string; labels: Partial<Record<Lang, string>> }[] = [
  { key: 'Libya', labels: { ar: 'ليبيا', fr: 'Libye' } },
  { key: 'Tunisia', labels: { ar: 'تونس', fr: 'Tunisie' } },
  { key: 'Algeria', labels: { ar: 'الجزائر', fr: 'Algérie' } },
  { key: 'Morocco', labels: { ar: 'المغرب', fr: 'Maroc' } },
  { key: 'Egypt', labels: { ar: 'مصر', fr: 'Égypte' } },
  { key: 'Saudi Arabia', labels: { ar: 'السعودية', fr: 'Arabie saoudite' } },
  { key: 'United Arab Emirates', labels: { ar: 'الإمارات', fr: 'Émirats arabes unis' } },
  { key: 'Türkiye', labels: { ar: 'تركيا', fr: 'Turquie' } },
]

export function localizeCategory<T extends { key: Category; label: string; blurb: string }>(category: T, lang: Lang): T {
  return {
    ...category,
    label: categoryLabels[lang]?.[category.key] ?? category.label,
    blurb: categoryBlurbs[lang]?.[category.key] ?? category.blurb,
  }
}

export function categoryLabel(category: Category, lang: Lang): string {
  const base = category.charAt(0).toUpperCase() + category.slice(1)
  return categoryLabels[lang]?.[category] ?? base
}

export function optionLabel(value: string, lang: Lang): string {
  return optionLabels[lang]?.[value] ?? value
}
