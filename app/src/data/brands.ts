// The houses a shop like this one keeps an eye on.
//
// Names only, set as wordmarks: the strip is decorative and stays readable in
// every theme because it inherits the palette instead of hard-coding colours.
// `style` mirrors the register of each house — couture set in serif, watches
// in wide-tracked caps — so the band feels like a row of logos, not a list.

export type BrandStyle = 'couture' | 'watch' | 'accessory'

export interface Brand {
  name: string
  style: BrandStyle
}

export const BRANDS: Brand[] = [
  { name: 'Chanel', style: 'couture' },
  { name: 'Rolex', style: 'watch' },
  { name: 'Hermès', style: 'couture' },
  { name: 'Cartier', style: 'watch' },
  { name: 'Dior', style: 'couture' },
  { name: 'Ray-Ban', style: 'accessory' },
  { name: 'Patek Philippe', style: 'watch' },
  { name: 'Gucci', style: 'couture' },
  { name: 'Tiffany & Co.', style: 'accessory' },
  { name: 'Audemars Piguet', style: 'watch' },
  { name: 'Prada', style: 'couture' },
  { name: 'Montblanc', style: 'accessory' },
  { name: 'Omega', style: 'watch' },
  { name: 'Saint Laurent', style: 'couture' },
  { name: 'Bottega Veneta', style: 'couture' },
  { name: 'Bvlgari', style: 'watch' },
  { name: 'Burberry', style: 'couture' },
  { name: 'Swarovski', style: 'accessory' },
  { name: 'Longines', style: 'watch' },
  { name: 'Fendi', style: 'couture' },
  { name: 'TAG Heuer', style: 'watch' },
  { name: 'Pandora', style: 'accessory' },
  { name: 'Versace', style: 'couture' },
  { name: 'Hublot', style: 'watch' },
]
