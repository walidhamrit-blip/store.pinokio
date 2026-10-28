// Labels that are not per-product: category names and blurbs, the choice
// values shown on product pages, and country names for the checkout.
// Product copy itself lives in the database (editable from /admin).
import type { Category } from './products'
import type { Lang } from '../app/i18n/dict'

// Choice values on the product pages ("Oat", "Sage", "Sea salt"...).
const optionLabels: Partial<Record<Lang, Record<string, string>>> = {
  fr: {
    Oatmeal: 'Avoine',
    Ash: 'Cendre',
    Clay: 'Argile',
    Oat: 'Avoine',
    Charcoal: 'Charbon',
    Sage: 'Sauge',
    'Cedar and fig': 'Cèdre et figue',
    'Tobacco leaf': 'Feuille de tabac',
    'Sea salt': 'Sel marin',
    Ivory: 'Ivoire',
    Stone: 'Pierre',
    Moss: 'Mousse',
    Natural: 'Naturel',
  },
  ar: {
    Oatmeal: 'الشوفان',
    Ash: 'الرماد',
    Clay: 'الطين',
    Oat: 'الشوفان',
    Charcoal: 'الفحمي',
    Sage: 'المريمي',
    'Cedar and fig': 'الأرز والتين',
    'Tobacco leaf': 'ورق التبغ',
    'Sea salt': 'ملح البحر',
    Ivory: 'العاجي',
    Stone: 'الحجري',
    Moss: 'الطحلبي',
    Natural: 'الطبيعي',
  },
}

const categoryLabels: Partial<Record<Lang, Partial<Record<Category, string>>>> = {
  fr: { ceramics: 'Céramiques', textiles: 'Textiles', lighting: 'Luminaires', kitchen: 'Cuisine', home: 'Maison' },
  ar: { ceramics: 'الخزف', textiles: 'المنسوجات', lighting: 'الإضاءة', kitchen: 'المطبخ', home: 'المنزل' },
}

const categoryBlurbs: Partial<Record<Lang, Partial<Record<Category, string>>>> = {
  fr: {
    ceramics: 'Tournées et émaillées à la main',
    textiles: 'Lin et coton lavés',
    lighting: 'Chaleureuse, basse et discrète',
  },
  ar: {
    ceramics: 'مشكول ومطلي باليد',
    textiles: 'كتّان وقطن مغسول',
    lighting: 'دافئة وخافتة وهادئة',
  },
}

export const countryLabels: { key: string; labels: Partial<Record<Lang, string>> }[] = [
  { key: 'United States', labels: { ar: 'الولايات المتحدة', fr: 'États-Unis' } },
  { key: 'United Kingdom', labels: { ar: 'المملكة المتحدة', fr: 'Royaume-Uni' } },
  { key: 'Canada', labels: { ar: 'كندا', fr: 'Canada' } },
  { key: 'Germany', labels: { ar: 'ألمانيا', fr: 'Allemagne' } },
  { key: 'France', labels: { ar: 'فرنسا', fr: 'France' } },
  { key: 'Netherlands', labels: { ar: 'هولندا', fr: 'Pays-Bas' } },
  { key: 'Portugal', labels: { ar: 'البرتغال', fr: 'Portugal' } },
  { key: 'Australia', labels: { ar: 'أستراليا', fr: 'Australie' } },
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
