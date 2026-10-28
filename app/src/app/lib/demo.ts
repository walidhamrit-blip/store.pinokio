// Two deployment switches, read at build time.
//
// The shop normally runs behind the Hono Worker (catalogue in D1, orders in
// D1, dashboard at /admin). The same code is also published as a static
// sample — a link you can send to a client — where there is no API at all.
//
//   VITE_DEMO=1     the sample: the bundled catalogue, no network calls, a
//                   checkout that confirms locally, and no dashboard.
//   SITE_BASE=/x/   the sub-path the site is served from (GitHub Pages
//                   project sites). Vite exposes it as BASE_URL.
export const DEMO = import.meta.env.VITE_DEMO === '1'

/** '' at the root, '/accessoires' on a Pages project site. */
export const BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '')

/**
 * Catalogue images are stored as site paths ("/images/tote.jpg"). On a Pages
 * project site the site is not at the root, so prefix the base path; full
 * URLs (an image added from the dashboard) are left untouched.
 */
export function asset(path: string): string {
  if (!path || /^(https?:|data:|blob:)/.test(path)) return path
  return `${BASENAME}${path.startsWith('/') ? path : `/${path}`}`
}
