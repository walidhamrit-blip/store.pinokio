import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { usePrefs } from '../lib/prefs'
import { productUrl } from '../lib/whatsapp'

export { productUrl }

/**
 * The QR code of one article, in a small dialog.
 *
 * It is generated in the browser from the address the visitor is actually on —
 * a laptop, a preview link, a client's domain — so a phone can scan it and land
 * on the same piece. Nothing is sent anywhere.
 */
export function QrDialog({
  open,
  onClose,
  url,
  name,
}: {
  open: boolean
  onClose: () => void
  url: string
  name: string
}) {
  const { t } = usePrefs()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // No clipboard permission: the field is selectable, which is enough.
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-scrim p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('qr.title')}
        dir={document.documentElement.dir as 'rtl' | 'ltr'}
        className="w-full max-w-[360px] rounded-dialog border border-line bg-bg p-6 shadow-drawer"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-muted">{t('qr.eyebrow')}</p>
            <h2 className="font-display mt-1 text-[24px] leading-tight">{name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.close')}
            className="grid size-9 shrink-0 place-items-center rounded-control transition-colors hover:bg-surface-2"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* White on purpose: a tinted theme would hurt the scan. */}
        <div className="mt-5 grid place-items-center rounded-[18px] bg-white p-4">
          <QRCodeSVG
            value={url}
            size={208}
            level="M"
            marginSize={1}
            fgColor="#1c1a17"
            bgColor="#ffffff"
            title={`${t('qr.title')} — ${name}`}
          />
        </div>

        <p className="mt-5 text-[13.5px] leading-relaxed text-muted">{t('qr.hint')}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-control border border-line text-[13.5px] font-medium transition-colors hover:bg-surface-2"
          >
            {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
            {copied ? t('qr.copied') : t('qr.copy')}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-control bg-fg text-[13.5px] font-medium text-bg transition-opacity hover:opacity-90"
          >
            <ExternalLink className="size-4" />
            {t('qr.open')}
          </a>
        </div>

        <p dir="ltr" className="mt-4 truncate rounded-[10px] bg-surface-2 px-3 py-2 text-[11.5px] text-faint">
          {url}
        </p>
      </div>
    </div>,
    document.body,
  )
}
