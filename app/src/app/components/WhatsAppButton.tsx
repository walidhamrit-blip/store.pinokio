import { usePrefs } from '../lib/prefs'

import { shop } from '../../data/shop'

/** The WhatsApp mark, drawn inline so no icon font is needed. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

/**
 * A shop that answers on WhatsApp: one button, fixed above the bag drawer's
 * layer, with the number's label sliding out on hover (desktop only, so a
 * thumb never covers the catalogue with a tooltip).
 *
 * Hidden on the dashboard by the site chrome, and hidden from print.
 */
export function WhatsAppButton() {
  const { t } = usePrefs()
  const href = `https://wa.me/${shop.whatsapp}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t('about.visit.whatsapp')}
      title={t('about.visit.whatsapp')}
      className="group/wa fixed bottom-5 end-5 z-30 inline-flex items-center gap-0 rounded-full bg-[#25D366] py-3 ps-3 pe-3 text-white shadow-lg shadow-[#25D366]/30 transition-[padding,transform] duration-300 hover:scale-[1.03] hover:pe-5 focus-visible:pe-5 print:hidden"
    >
      {/* A soft pulse, so the button reads as live without blinking forever. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.6s] motion-reduce:hidden"
      />
      <WhatsAppGlyph className="size-7 shrink-0" />
      <span className="grid max-w-0 grid-cols-1 overflow-hidden text-[14px] font-medium whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-300 group-hover/wa:ms-2 group-hover/wa:max-w-[220px] group-hover/wa:opacity-100 group-focus-visible/wa:ms-2 group-focus-visible/wa:max-w-[220px] group-focus-visible/wa:opacity-100">
        <span className="ps-0.5">{t('nav.whatsapp')}</span>
      </span>
    </a>
  )
}
