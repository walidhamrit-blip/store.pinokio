import { cx } from '../lib/cx'

import { brandNames } from '../../data/brands'

/**
 * A slow, seamless banner of the houses we carry — accessories, ready-to-wear
 * and watches.
 *
 * It is built from the theme tokens (`line`, `muted`, `accent`, `bg`), so it
 * follows whichever of the six palettes is active, in light or dark, without a
 * second list of colours. The track holds two copies of the list and slides by
 * exactly half its width, which is what makes the loop invisible.
 */
export function BrandMarquee({ className, seconds = 52 }: { className?: string; seconds?: number }) {
  // Two copies: one to read, one to close the gap when the first scrolls away.
  const track = [...brandNames, ...brandNames]
  const fade = (side: 'start' | 'end') => ({
    background: `linear-gradient(to ${side === 'start' ? 'right' : 'left'}, var(--color-bg), transparent)`,
  })

  return (
    <section
      aria-label={brandNames.join(', ')}
      // The banner scrolls left to right regardless of the page direction, so
      // the reading order of the names stays the same in Arabic and in French.
      dir="ltr"
      className={cx('group relative overflow-hidden border-y border-line py-4 sm:py-5', className)}
    >
      <div className="marquee-track flex w-max items-center gap-10 sm:gap-14" style={{ animationDuration: `${seconds}s` }}>
        {track.map((name, i) => (
          <span
            key={`${name}-${i}`}
            aria-hidden={i >= brandNames.length}
            className="whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.3em] text-muted transition-colors duration-300 hover:text-accent sm:text-[13px]"
          >
            {name}
          </span>
        ))}
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-16 sm:w-28" style={fade('start')} />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 end-0 w-16 sm:w-28" style={fade('end')} />
    </section>
  )
}
