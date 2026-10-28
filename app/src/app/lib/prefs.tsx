import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { dirFor, translate, type Lang, type TKey } from '../i18n/dict'

export type ThemeKey = 'sand' | 'noir' | 'rose' | 'olive' | 'terra' | 'lavender'
export type Mode = 'light' | 'dark'

export interface ThemeChoice {
  key: ThemeKey
  /** Three dots shown in the picker: canvas, accent, ink. */
  swatch: [string, string, string]
}

// Six directions that sell clothes, accessories and beauty: warm neutrals,
// editorial black, rose, botanical green, terracotta and lilac.
export const THEMES: ThemeChoice[] = [
  { key: 'sand', swatch: ['#f6f1ea', '#b4573b', '#1c1a17'] },
  { key: 'noir', swatch: ['#ffffff', '#b08d4f', '#0b0b0b'] },
  { key: 'rose', swatch: ['#fdf5f4', '#c25470', '#2a1a1c'] },
  { key: 'olive', swatch: ['#f4f3ea', '#6b7a4f', '#1e2118'] },
  { key: 'terra', swatch: ['#fbf0e6', '#c25a2e', '#2b1a12'] },
  { key: 'lavender', swatch: ['#f6f4fb', '#7a5cc4', '#1f1a2b'] },
]

export const themeKeyOf = (value: string | undefined): ThemeKey =>
  THEMES.some((t) => t.key === value) ? (value as ThemeKey) : 'sand'

const KEY = 'your-store-prefs'

interface PrefsState {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
  dir: 'rtl' | 'ltr'
  t: (key: TKey, vars?: Record<string, string | number>) => string
}

const PrefsContext = createContext<PrefsState | null>(null)

function initialPrefs(): { lang: Lang; theme: ThemeKey; mode: Mode } {
  const root = document.documentElement
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<{ lang: Lang; theme: ThemeKey; mode: Mode }> | null
    } catch {
      return null
    }
  })()
  // The inline script in index.html has already resolved these into data
  // attributes, so the first render matches what the browser painted.
  const lang = stored?.lang ?? (root.dataset.lang as Lang | undefined) ?? 'ar'
  return {
    lang: ['ar', 'fr', 'en'].includes(lang) ? lang : 'ar',
    theme: themeKeyOf(stored?.theme ?? root.dataset.theme),
    mode: (stored?.mode ?? root.dataset.mode) === 'dark' ? 'dark' : 'light',
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialPrefs)

  const lang = state.lang
  const dir = dirFor(lang)

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    root.dataset.lang = lang
    root.dataset.theme = state.theme
    root.dataset.mode = state.mode
    root.classList.toggle('dark', state.mode === 'dark')
    root.style.colorScheme = state.mode
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* private mode: preferences simply do not persist */
    }
    const canvas = getComputedStyle(root).getPropertyValue('--color-bg').trim()
    if (canvas) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', canvas)
  }, [lang, dir, state])

  const setLang = useCallback((next: Lang) => setState((prev) => ({ ...prev, lang: next })), [])
  const setTheme = useCallback((next: ThemeKey) => setState((prev) => ({ ...prev, theme: next })), [])
  const setMode = useCallback((next: Mode) => setState((prev) => ({ ...prev, mode: next })), [])
  const toggleMode = useCallback(() => setState((prev) => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' })), [])

  const value = useMemo<PrefsState>(
    () => ({
      ...state,
      dir,
      setLang,
      setTheme,
      setMode,
      toggleMode,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [state, dir, setLang, setTheme, setMode, toggleMode, lang],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs(): PrefsState {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs outside PrefsProvider')
  return ctx
}

/** Convenience for the many components that only need copy and direction. */
export function useI18n() {
  const { lang, t, dir } = usePrefs()
  return { lang, t, dir }
}
