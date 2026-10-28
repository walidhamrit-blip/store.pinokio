import { AnimatePresence, motion } from 'motion/react'
import { Check, Globe, Moon, Palette, Sun } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import { LANGUAGES } from '../i18n/dict'
import { THEMES, usePrefs, type ThemeKey } from '../lib/prefs'
import { cx } from '../lib/cx'

const triggerClass =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-[11px] px-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg sm:h-10 sm:px-2.5'

/** Closes a popover on outside click or Escape. */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (ref.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return { open, setOpen, ref, panelRef }
}

/**
 * Panels are portalled to the body and positioned against the trigger, then
 * clamped to the viewport. That keeps them inside the screen in both
 * directions and at any width, without fighting the sticky header.
 */
function Panel({
  anchor,
  panelRef,
  width,
  children,
}: {
  anchor: RefObject<HTMLDivElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  width: number
  children: ReactNode
}) {
  const { dir } = usePrefs()
  const [box, setBox] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    const place = () => {
      const el = anchor.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const w = Math.min(width, window.innerWidth - 24)
      const preferred = dir === 'rtl' ? rect.left : rect.right - w
      setBox({
        left: Math.max(12, Math.min(preferred, window.innerWidth - w - 12)),
        top: Math.min(rect.bottom + 10, window.innerHeight - 80),
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchor, dir, width])

  if (!box) return null

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{ left: box.left, top: box.top, width: Math.min(width, window.innerWidth - 24) }}
      className="fixed z-[60] max-h-[calc(100vh-96px)] overflow-y-auto rounded-card border border-line bg-surface p-1.5 shadow-soft"
    >
      {children}
    </motion.div>,
    document.body,
  )
}

function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="px-2.5 pb-1 pt-1.5 text-[11.5px] font-medium uppercase tracking-[0.08em] text-faint">{children}</p>
}

/* ------------------------------- language ------------------------------- */

export function LangMenu({ full }: { full?: boolean }) {
  const { lang, setLang, t } = usePrefs()
  const { open, setOpen, ref, panelRef } = usePopover()
  const current = LANGUAGES.find((l) => l.key === lang) ?? LANGUAGES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('settings.language')}
        title={t('settings.language')}
        className={cx(triggerClass, full && 'w-full justify-between px-3')}
      >
        <Globe className="size-[17px]" />
        <span className="hidden text-[12.5px] font-medium tabular-nums min-[380px]:inline">{current.code}</span>
      </button>
      <AnimatePresence>
        {open && (
          <Panel anchor={ref} panelRef={panelRef} width={196}>
            <PanelLabel>{t('settings.language')}</PanelLabel>
            {LANGUAGES.map((l) => (
              <button
                key={l.key}
                type="button"
                dir={l.dir}
                onClick={() => {
                  setLang(l.key)
                  setOpen(false)
                }}
                aria-pressed={l.key === lang}
                className={cx(
                  'flex h-10 w-full items-center justify-between rounded-[11px] px-2.5 text-[14px] transition-colors hover:bg-surface-2',
                  l.key === lang ? 'text-fg' : 'text-muted',
                )}
              >
                <span className={cx(l.key === lang && 'font-medium')}>{l.label}</span>
                {l.key === lang && <Check className="size-4" />}
              </button>
            ))}
          </Panel>
        )}
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------- themes -------------------------------- */

function ThemeDots({ swatch, active }: { swatch: [string, string, string]; active?: boolean }) {
  return (
    <span
      className={cx('grid size-8 shrink-0 grid-cols-2 grid-rows-2 gap-[3px] rounded-[10px] border p-[3px]', active ? 'border-fg' : 'border-line-strong')}
      aria-hidden
    >
      <span className="col-span-2 rounded-[3px]" style={{ background: swatch[0] }} />
      <span className="rounded-[3px]" style={{ background: swatch[1] }} />
      <span className="rounded-[3px]" style={{ background: swatch[2] }} />
    </span>
  )
}

export function ThemeMenu() {
  const { theme, setTheme, t } = usePrefs()
  const { open, setOpen, ref, panelRef } = usePopover()
  const current = THEMES.find((item) => item.key === theme) ?? THEMES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${t('settings.theme')}: ${t(`theme.${current.key}.name`)}`}
        title={t('settings.theme')}
        className={triggerClass}
      >
        <Palette className="size-[17px]" />
      </button>
      <AnimatePresence>
        {open && (
          <Panel anchor={ref} panelRef={panelRef} width={286}>
            <PanelLabel>{t('settings.selectTheme')}</PanelLabel>
            <div className="flex flex-col">
              {THEMES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTheme(item.key)}
                  aria-pressed={item.key === theme}
                  className={cx(
                    'flex items-center gap-3 rounded-[12px] px-2 py-2 text-start transition-colors hover:bg-surface-2',
                    item.key === theme && 'bg-surface-2/70',
                  )}
                >
                  <ThemeDots swatch={item.swatch} active={item.key === theme} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{t(`theme.${item.key}.name`)}</span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-muted">{t(`theme.${item.key}.desc`)}</span>
                  </span>
                  {item.key === theme && <Check className="size-4 shrink-0 text-accent" />}
                </button>
              ))}
            </div>
          </Panel>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------ light / dark ----------------------------- */

export function ModeToggle({ wide }: { wide?: boolean }) {
  const { mode, setMode, t } = usePrefs()
  return (
    <div
      className={cx('flex h-9 items-center rounded-full border border-line-strong bg-surface p-0.5 sm:h-10', wide && 'h-11 w-full sm:h-11')}
      role="group"
      aria-label={t('settings.mode')}
    >
      {(
        [
          { key: 'light', icon: Sun, label: t('settings.light') },
          { key: 'dark', icon: Moon, label: t('settings.dark') },
        ] as const
      ).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setMode(key)}
          aria-pressed={mode === key}
          aria-label={label}
          title={label}
          className={cx(
            'grid h-full place-items-center rounded-full text-muted transition-colors duration-300',
            wide ? 'flex-1 gap-1.5 px-3 text-[13px]' : 'aspect-square px-1.5',
            mode === key && 'bg-fg text-bg',
          )}
        >
          <Icon className="size-[15px]" />
          {wide && <span>{label}</span>}
        </button>
      ))}
    </div>
  )
}

/* --------------------------- drawer / mobile panel ------------------------ */

export function PreferencesPanel() {
  const { lang, setLang, theme, setTheme, t } = usePrefs()

  return (
    <div className="flex flex-col gap-5 border-t border-line pt-5">
      <div>
        <p className="text-[12px] font-medium text-muted">{t('settings.language')}</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.key}
              type="button"
              dir={l.dir}
              onClick={() => setLang(l.key)}
              aria-pressed={l.key === lang}
              className={cx(
                'h-10 rounded-[11px] border text-[13px] transition-colors',
                l.key === lang ? 'border-fg bg-fg text-bg' : 'border-line-strong text-muted hover:text-fg',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-medium text-muted">{t('settings.theme')}</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {THEMES.map((item) => (
            <ThemeTile key={item.key} item={item} active={item.key === theme} onSelect={() => setTheme(item.key)} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium text-muted">{t('settings.mode')}</p>
        <ModeToggle wide />
      </div>
    </div>
  )
}

function ThemeTile({ item, active, onSelect }: { item: { key: ThemeKey; swatch: [string, string, string] }; active: boolean; onSelect: () => void }) {
  const { t } = usePrefs()
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cx('flex items-center gap-2 rounded-[12px] border p-2 text-start transition-colors', active ? 'border-fg' : 'border-line hover:border-line-strong')}
    >
      <ThemeDots swatch={item.swatch} active={active} />
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{t(`theme.${item.key}.name`)}</span>
    </button>
  )
}

export function HeaderControls() {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <LangMenu />
      <ThemeMenu />
      <ModeToggle />
    </div>
  )
}
