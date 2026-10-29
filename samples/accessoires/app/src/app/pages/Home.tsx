import { motion } from 'motion/react'
import { ArrowRight, Clock, Leaf, MapPin, MessageCircle, RefreshCcw, Truck } from 'lucide-react'
import { Link } from 'react-router'

import { shop, directionsUrl, shopText } from '../../data/shop'
import { categories, localized } from '../../data/products'
import { localizeCategory } from '../../data/i18n'
import { useCatalog } from '../lib/catalog'
import { asset } from '../lib/demo'
import { BrandMarquee } from '../components/BrandMarquee'
import { ProductCard } from '../components/ProductCard'
import { ButtonLink, Container, Reveal, SectionTitle } from '../components/ui'
import { money } from '../lib/cart'
import { usePrefs } from '../lib/prefs'

const ease = [0.22, 1, 0.36, 1] as const

export function Home() {
  const { t, lang } = usePrefs()
  const { products } = useCatalog()
  const newArrivals = products.slice(0, 4)
  const featured = products.filter((p) => p.featured)
  const heroProduct = localized(products[0], lang)
  const heroLines = [t('home.hero.line1'), t('home.hero.line2')]

  return (
    <>
      {/* Hero */}
      <section className="pt-10 sm:pt-16">
        <Container>
          <div className="grid items-end gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div className="pb-4">
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="text-[14px] text-muted">
                {t('home.eyebrow')}
              </motion.p>
              <h1 className="font-display mt-4 text-[56px] leading-[0.98] sm:text-[80px] lg:text-[96px] rtl:text-[44px] sm:rtl:text-[62px] lg:rtl:text-[76px]">
                {heroLines.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.18em] -mb-[0.18em]">
                    <motion.span className="block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}>
                      {i === 1 ? (
                        <>
                          {line}
                          <em className={lang === 'ar' ? 'text-accent' : 'italic text-accent'}>{t('home.hero.em')}</em>
                        </>
                      ) : (
                        line
                      )}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45, ease }}
                className="mt-6 max-w-md text-[17px] leading-relaxed text-muted"
              >
                {t('home.hero.body')}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease }} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/shop" size="lg" className="w-full sm:w-auto">
                  {t('home.hero.cta')}
                  <ArrowRight className="rtl:rotate-180" />
                </ButtonLink>
                <ButtonLink to="/about" size="lg" variant="secondary" className="w-full sm:w-auto">
                  {t('home.hero.cta2')}
                </ButtonLink>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
              className="image-frame relative aspect-[4/3] rounded-[32px] lg:aspect-[5/4]"
            >
              <img src={asset("/images/hero.jpg")} alt={heroProduct.name} className="size-full object-cover" fetchPriority="high" />
              <Link
                to={`/product/${heroProduct.slug}`}
                className="absolute bottom-4 start-4 flex items-center gap-3 rounded-[16px] bg-surface/90 py-2 ps-2 pe-4 text-[13px] shadow-soft backdrop-blur transition-colors hover:bg-surface"
              >
                <span className="image-frame size-10 rounded-[12px]">
                  <img src={asset(heroProduct.image)} alt="" className="size-full object-cover" />
                </span>
                <span>
                  <span className="block font-medium">{heroProduct.name}</span>
                  <span className="text-muted">{money(heroProduct.price)}</span>
                </span>
                <ArrowRight className="size-4 text-muted rtl:rotate-180" />
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* The houses we carry — a quiet running banner between hero and grid */}
      <div className="pt-16 sm:pt-20">
        <BrandMarquee />
      </div>

      {/* New arrivals */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow={t('home.new.eyebrow')}
              title={t('home.new.title')}
              action={
                <Link to="/shop" className="hidden items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-fg sm:inline-flex">
                  {t('home.new.viewAll')}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              }
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} priority={i < 2} />
            ))}
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
            {categories.map((raw, i) => {
              const c = localizeCategory(raw, lang)
              return (
                <Reveal key={c.key} delay={i * 0.08}>
                  <Link to={`/shop?category=${c.key}`} className="group image-frame relative block aspect-[4/5] rounded-image">
                    <img
                      src={asset(c.image)}
                      alt={c.label}
                      className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-[18px] bg-surface/90 p-4 backdrop-blur">
                      <div>
                        <p className="font-display text-[24px] leading-none sm:text-[28px]">{c.label}</p>
                        <p className="mt-1.5 text-[13px] text-muted">{c.blurb}</p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-fg text-bg transition-transform duration-300 group-hover:scale-105">
                        <ArrowRight className="size-4 rtl:rotate-180" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Editorial */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <div className="grid items-center gap-10 rounded-[32px] bg-surface-2/60 p-5 sm:p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
            <Reveal className="image-frame aspect-[4/3] rounded-image">
              <img src={asset("/images/lookbook.jpg")} alt={t('about.imageAlt')} className="size-full object-cover" loading="lazy" />
            </Reveal>
            <Reveal delay={0.1} className="lg:pe-8">
              <p className="text-[14px] text-muted">{t('home.editorial.eyebrow')}</p>
              <h2 className="font-display mt-3 text-balance text-[40px] leading-[1.02] sm:text-[52px] rtl:text-[32px] sm:rtl:text-[40px]">{t('home.editorial.title')}</h2>
              <p className="mt-5 text-pretty text-[16px] leading-relaxed text-muted">{t('home.editorial.body')}</p>
              <ButtonLink to="/about" variant="secondary" className="mt-8">
                {t('home.editorial.cta')}
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Bestsellers */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <Reveal>
            <SectionTitle eyebrow={t('home.best.eyebrow')} title={t('home.best.title')} />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
            {featured.slice(0, 6).map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <ButtonLink to="/shop" variant="secondary" size="lg">
              {t('home.best.cta')}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Promises */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <ul className="grid gap-4 border-y border-line py-10 sm:grid-cols-3">
            {[
              { icon: Truck, title: t('home.promise1.title'), body: t('home.promise1.body') },
              { icon: RefreshCcw, title: t('home.promise2.title'), body: t('home.promise2.body') },
              { icon: Leaf, title: t('home.promise3.title'), body: t('home.promise3.body') },
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <li className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-surface-2 text-fg">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium">{title}</p>
                    <p className="mt-0.5 text-[14px] text-muted">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* The shop itself: where it is, when it is open, how to reach it. */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <Reveal>
            <div className="grid gap-8 rounded-[32px] border border-line bg-surface p-6 sm:p-9 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14">
              <div>
                <p className="text-[14px] text-muted">
                  {shop.name} · {shopText(shop.city, lang)}
                </p>
                <h2 className="font-display mt-3 text-balance text-[34px] leading-[1.05] sm:text-[44px] rtl:text-[28px] sm:rtl:text-[36px]">
                  {shopText(shop.address, lang)}
                </h2>
                <div className="mt-6 flex flex-col gap-3 text-[15px] text-muted">
                  <p className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {shop.hours.map((h) => `${shopText(h, lang)} · ${h.open}–${h.close}`).join(' · ')}
                    </span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Truck className="mt-0.5 size-4 shrink-0" />
                    <span>{shopText(shop.delivery, lang)}</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span dir="ltr">{shop.phone}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <ButtonLink to="/about" size="lg">
                  {t('home.hero.cta2')}
                </ButtonLink>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-line text-[15px] font-medium transition-colors hover:bg-surface-2"
                >
                  <MapPin className="size-4" />
                  {t('about.visit.map')}
                </a>
                <a
                  href={`https://wa.me/${shop.whatsapp}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-line text-[15px] font-medium transition-colors hover:bg-surface-2"
                >
                  <MessageCircle className="size-4" />
                  {t('about.visit.whatsapp')}
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
