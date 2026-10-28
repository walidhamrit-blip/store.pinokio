// Strips files the Sites uploader refuses (hidden files and source maps)
// from the build output, so `deploy.json` can point straight at dist/.
//
// Deleting a .map is not enough for `wrangler deploy`: the bundle still ends
// with a `//# sourceMappingURL=index.js.map` comment, and Wrangler refuses a
// source map path that does not exist. So we strip the reference too, which
// keeps the same dist/ deployable both to Sites and to Cloudflare Workers.
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const SOURCE_MAP_COMMENT = /^\s*\/\/[#@]\s*sourceMappingURL=.*$/gm
const CSS_SOURCE_MAP_COMMENT = /\/\*[#@]\s*sourceMappingURL=[^*]*\*\/\s*$/gm

function clean(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name.startsWith('.') || name.endsWith('.map')) {
      rmSync(path, { recursive: true, force: true })
      continue
    }
    if (statSync(path).isDirectory()) {
      clean(path)
      continue
    }
    if (['.js', '.mjs', '.css'].includes(extname(path))) {
      const source = readFileSync(path, 'utf8')
      const stripped = source.replace(SOURCE_MAP_COMMENT, '').replace(CSS_SOURCE_MAP_COMMENT, '')
      if (stripped !== source) writeFileSync(path, stripped)
    }
  }
}

clean(new URL('../dist', import.meta.url).pathname)
