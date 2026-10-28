import { motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'

import { money, useCart } from '../lib/cart'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'
import { localized, type Product } from '../../data/products'

export function ProductCard({ product, index = 0, priority }: { product: Product; index?: number; priority?: boolean }) {
  const cart = useCart()
  const { lang, t } = usePrefs()
  const [added, setAdded] = useState(false)
  const copy = localized(product, lang)

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    cart.add(product, copy.options?.values[0])
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="image-frame relative aspect-[3/4] rounded-image">
          <img
            src={product.image}
            alt={copy.name}
            loading={priority ? 'eager' : 'lazy'}
            className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          {product.badge && (
            <span
              className={cx(
                'absolute start-3 top-3 rounded-[10px] px-2.5 py-1 text-[12px] font-medium backdrop-blur',
                product.badge === 'Low stock' ? 'bg-accent-soft/90 text-accent' : 'bg-surface/90 text-fg',
              )}
            >
              {t(`badge.${product.badge}`)}
            </span>
          )}
          <button
            type="button"
            onClick={quickAdd}
            className={cx(
              'absolute inset-x-3 bottom-3 h-11 translate-y-2 rounded-[12px] bg-fg text-[14px] font-medium text-bg opacity-0 transition-[opacity,transform,background-color] duration-300 hover:bg-fg/90 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100',
              added && 'bg-accent hover:bg-accent',
            )}
          >
            {added ? t('shop.added') : t('shop.addToBag')}
          </button>
        </div>
        <div className="mt-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-medium">{copy.name}</h3>
            <p className="mt-0.5 truncate text-[13px] text-muted">{copy.short}</p>
          </div>
          <p className="shrink-0 text-[15px] tabular-nums">
            {product.compareAt && <span className="me-2 text-faint line-through">{money(product.compareAt)}</span>}
            {money(product.price)}
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
