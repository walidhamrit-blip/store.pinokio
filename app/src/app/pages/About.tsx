import { Clock, MapPin, MessageCircle, Navigation, Phone, Star, Truck } from 'lucide-react'

import { shop, directionsUrl, shopText } from '../../data/shop'
import { ButtonLink, Container, Reveal } from '../components/ui'
import { asset } from '../lib/demo'
import { usePrefs } from '../lib/prefs'

export function About() {
  const { t, lang } = usePrefs()
  const rating = shop.rating.toLocaleString(lang === 'ar' ? 'ar-LY' : lang === 'fr' ? 'fr-FR' : 'en-GB', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return (
    <Container className="pt-10 sm:pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
        <div className="max-w-3xl">
          <p className="text-[14px] text-muted">{t('about.eyebrow')}</p>
          <h1 className="font-display mt-3 text-balance text-[44px] leading-[1] sm:text-[64px] rtl:text-[34px] sm:rtl:text-[48px]">
            {t('about.title')}
          </h1>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-current text-accent" />
              <span className="font-medium text-fg tabular-nums">{rating}</span>
              {t('about.reviews', { n: shop.reviews })}
            </span>
            <span className="text-faint">·</span>
            <span dir="ltr">{shop.name} · {shop.nameAr}</span>
          </p>
        </div>
        <Reveal className="image-frame aspect-[4/3] rounded-[28px]">
          <img src={asset("/images/hero.jpg")} alt={t('about.imageAlt')} className="size-full object-cover" />
        </Reveal>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <p className="font-display text-[26px] leading-[1.15] sm:text-[32px] rtl:text-[24px]">{t('about.quote')}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-5 text-[17px] leading-relaxed text-muted">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
          <ButtonLink to="/shop" className="mt-2 self-start">
            {t('about.cta')}
          </ButtonLink>
        </Reveal>
      </div>

      {/* The shop, for real: address, hours, phone, delivery. */}
      <section className="mt-20 border-t border-line pt-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MapPin,
              label: t('about.visit.address'),
              body: shopText(shop.address, lang),
              hint: shopText(shop.city, lang),
            },
            {
              icon: Clock,
              label: t('about.visit.hours'),
              body: shop.hours.map((h) => `${shopText(h, lang)} · ${h.open}–${h.close}`).join('\n'),
            },
            {
              icon: Phone,
              label: t('about.visit.phone'),
              body: shop.phone,
              ltr: true,
            },
            {
              icon: Truck,
              label: t('about.visit.delivery'),
              body: shopText(shop.delivery, lang),
            },
          ].map(({ icon: Icon, label, body, hint, ltr }, i) => (
            <Reveal key={label} delay={i * 0.06}>
              <div className="flex h-full flex-col gap-2 rounded-card border border-line bg-surface p-5">
                <span className="grid size-9 place-items-center rounded-[11px] bg-surface-2">
                  <Icon className="size-4" />
                </span>
                <p className="mt-1 text-[13px] font-medium text-muted">{label}</p>
                <p
                  dir={ltr ? 'ltr' : undefined}
                  className={`whitespace-pre-line text-[15px] leading-relaxed ${ltr ? 'text-start' : ''}`}
                >
                  {body}
                </p>
                {hint && <p className="text-[13px] text-faint">{hint}</p>}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-control bg-fg px-4 text-[14px] font-medium text-bg transition-opacity hover:opacity-90"
          >
            <Navigation className="size-4" />
            {t('about.visit.map')}
          </a>
          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-control border border-line px-4 text-[14px] font-medium transition-colors hover:bg-surface-2"
          >
            <MessageCircle className="size-4" />
            {t('about.visit.whatsapp')}
          </a>
          <a
            href={shop.facebook}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-control border border-line px-4 text-[14px] font-medium transition-colors hover:bg-surface-2"
          >
            <span aria-hidden className="text-[13px] font-semibold leading-none">
              f
            </span>
            Facebook
          </a>
          <a
            href={`tel:${shop.phone.replace(/\s/g, '')}`}
            className="inline-flex h-11 items-center gap-2 rounded-control border border-line px-4 text-[14px] font-medium transition-colors hover:bg-surface-2"
          >
            <Phone className="size-4" />
            <span dir="ltr">{shop.phone}</span>
          </a>
        </div>
      </section>
    </Container>
  )
}
