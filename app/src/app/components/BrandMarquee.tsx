import { BRANDS, type BrandStyle } from '../../data/brands'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'

const STYLE_CLASS: Record<BrandStyle, string> = {
  // Couture houses read as engraved serif wordmarks.
  couture: 'font-display text-[21px] sm:text-[23px] tracking-[-0.01em]',
  // Watches sit in wide-tracked caps, the way they are printed on a dial.
  watch: 'text-[13px] uppercase tracking-[0.22em] font-medium',
  accessory: 'text-[13px] uppercase tracking-[0.14em]',
}

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-9 pe-9 sm:gap-12 sm:pe-12">
      {BRANDS.map((brand) => (
        <li key={brand.name} className="flex items-center gap-9 sm:gap-12">
          <span className={cx('whitespace-nowrap text-muted/80 transition-colors duration-200 hover:text-fg', STYLE_CLASS[brand.style])}>
            {brand.name}
          </span>
          <span aria-hidden className="size-1 shrink-0 rounded-full bg-accent/40" />
        </li>
      ))}
    </ul>
  )
}

/**
 * A band of house names that drifts past, in the theme's own colours.
 *
 * Two identical rows are animated by exactly half their own width, so the loop
 * has no seam. In Arabic the band travels the other way round, matching the
 * reading direction. Motion is paused for visitors who ask for less of it.
 */
export function BrandMarquee({ className }: { className?: string }) {
  const { t, dir } = usePrefs()

  return (
    <section aria-label={t('brands.label')} className={cx('border-y border-line bg-surface-2/50', className)}>
      <div className="mx-auto flex max-w-[1280px] items-center gap-5 px-5 py-5 sm:gap-8 sm:px-8">
        <p className="hidden shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-faint sm:flex">
          <span aria-hidden className="h-px w-6 bg-line-strong" />
          {t('brands.label')}
        </p>
        <div className="marquee relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
          <div className="marquee-track flex w-max" data-direction={dir === 'rtl' ? 'reverse' : 'forward'}>
            <Row />
            <Row hidden />
          </div>
        </div>
      </div>
    </section>
  )
}
