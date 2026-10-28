import { ButtonLink, Container, Reveal } from '../components/ui'
import { usePrefs } from '../lib/prefs'

export function About() {
  const { t } = usePrefs()
  return (
    <Container className="pt-10 sm:pt-16">
      <div className="max-w-3xl">
        <p className="text-[14px] text-muted">{t('about.eyebrow')}</p>
        <h1 className="font-display mt-3 text-balance text-[44px] leading-[1] sm:text-[68px] rtl:text-[34px] sm:rtl:text-[50px]">{t('about.title')}</h1>
      </div>
      <Reveal className="image-frame mt-12 aspect-[16/9] rounded-[32px]">
        <img src="/images/lookbook.jpg" alt={t('about.imageAlt')} className="size-full object-cover" />
      </Reveal>
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
      <dl className="mt-20 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
        {[
          [t('about.stats.makers'), '11'],
          [t('about.stats.countries'), '3'],
          [t('about.stats.returns'), '0.8%'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[14px] text-muted">{label}</dt>
            <dd className="font-display mt-2 text-[48px] leading-none">{value}</dd>
          </div>
        ))}
      </dl>
    </Container>
  )
}
