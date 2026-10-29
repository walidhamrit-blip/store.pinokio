import { motion } from 'motion/react'
import { Check, Copy, QrCode, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { qrMatrix, qrPath } from '../lib/qr'
import { cx } from '../lib/cx'
import { usePrefs } from '../lib/prefs'

/**
 * A QR for one article, built in the browser from the page's own address.
 *
 * The code is generated on open rather than stored, so it keeps pointing at
 * the right place if the shop moves to another domain, and the owner can print
 * a code today for an article created tomorrow.
 */
export function ProductQr({
  slug,
  name,
  variant = 'overlay',
  className,
}: {
  slug: string
  name: string
  variant?: 'overlay' | 'inline'
  className?: string
}) {
  const { t } = usePrefs()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  function show(event: React.MouseEvent) {
    // Cards wrap the whole tile in a link: the QR must not navigate.
    event.preventDefault()
    event.stopPropagation()
    setUrl(`${window.location.origin}/product/${slug}`)
    setCopied(false)
    setOpen(true)
  }

  return (
    <>
      {variant === 'inline' ? (
        <button
          type="button"
          onClick={show}
          aria-label={t('qr.button.aria', { name })}
          className={cx(
            'inline-flex h-10 items-center gap-2 rounded-[12px] border border-line-strong px-3.5 text-[13.5px] text-muted transition-colors hover:border-fg hover:text-fg',
            className,
          )}
        >
          <QrCode className="size-4" />
          {t('qr.button')}
        </button>
      ) : (
        <button
          type="button"
          onClick={show}
          aria-label={t('qr.button.aria', { name })}
          className={cx(
            'round absolute end-2.5 top-2.5 z-10 grid size-8 place-items-center rounded-[10px] bg-surface/90 text-fg backdrop-blur transition-opacity duration-200 hover:bg-surface focus-visible:opacity-100 sm:pointer-fine:opacity-0 sm:pointer-fine:group-hover:opacity-100 sm:pointer-fine:focus-visible:opacity-100',
            className,
          )}
        >
          <QrCode className="size-4" />
        </button>
      )}
      {open && <QrDialog name={name} url={url} copied={copied} setCopied={setCopied} onClose={() => setOpen(false)} />}
    </>
  )
}

function QrDialog({
  name,
  url,
  copied,
  setCopied,
  onClose,
}: {
  name: string
  url: string
  copied: boolean
  setCopied: (value: boolean) => void
  onClose: () => void
}) {
  const { t, dir } = usePrefs()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const code = useMemo(() => {
    try {
      return qrMatrix(url)
    } catch {
      return null
    }
  }, [url])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard blocked: the address is on screen and selectable instead. */
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-scrim p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-title"
        initial={{ opacity: 0, scale: 0.97, y: dir === 'rtl' ? -8 : 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[340px] rounded-dialog bg-bg p-6 shadow-drawer"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('nav.close')}
          className="absolute end-4 top-4 grid size-9 place-items-center rounded-control text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4.5" />
        </button>

        <p className="text-[12px] uppercase tracking-[0.1em] text-faint">{t('qr.title')}</p>
        <h2 id="qr-title" className="font-display mt-1.5 pe-8 text-[26px] leading-tight">
          {name}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{t('qr.body')}</p>

        <div className="mt-5 grid place-items-center rounded-card border border-line bg-surface p-4">
          {code ? (
            // Fixed light-on-dark contrast, whatever the theme: a scanner reads
            // ink on paper, not this month's palette.
            <svg
              viewBox={`-2 -2 ${code.size + 4} ${code.size + 4}`}
              role="img"
              aria-label={t('qr.svgAlt', { name })}
              shapeRendering="crispEdges"
              className="size-[196px]"
              style={{ background: '#ffffff', color: '#111111' }}
            >
              <path d={qrPath(code)} fill="currentColor" />
            </svg>
          ) : (
            <p className="p-10 text-center text-[13px] text-accent">{t('qr.error')}</p>
          )}
        </div>

        <p dir="ltr" className="mt-3 truncate text-center text-[12px] text-faint">
          {url}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-line-strong text-[14px] transition-colors hover:border-fg"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? t('qr.copied') : t('qr.copy')}
          </button>
          <a
            href={url}
            className="inline-flex h-11 items-center justify-center rounded-[12px] bg-fg text-[14px] font-medium text-bg transition-colors hover:bg-fg/90"
          >
            {t('qr.open')}
          </a>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
