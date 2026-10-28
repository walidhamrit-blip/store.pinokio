// Restore the production D1 database from a snapshot produced by backup.mjs.
//
//   npm run db:restore -- backups/store-2026-10-28T03-17Z.sql.gz --yes
//
// `--yes` is required on purpose: this overwrites the catalogue and the orders
// shown in the dashboard. The GitHub workflow `.github/workflows/restore.yml`
// exposes the same operation from the Actions tab, behind a confirmation field.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const args = process.argv.slice(2)
const file = args.find((arg) => !arg.startsWith('--'))
const confirmed = args.includes('--yes')
const database = (args.find((arg) => arg.startsWith('--database=')) ?? '--database=store').split('=')[1]

if (!file) {
  console.error('Usage: npm run db:restore -- <backups/file.sql.gz> --yes')
  process.exit(1)
}
if (!confirmed) {
  console.error(`Refusing to overwrite "${database}" without --yes.`)
  process.exit(1)
}

const source = file.startsWith('/') ? file : join(process.cwd(), file)
if (!existsSync(source)) {
  console.error(`No such snapshot: ${source}`)
  process.exit(1)
}

const raw = readFileSync(source)
// A gzip file starts with 1f 8b; anything else is treated as plain SQL.
const sql = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const tmpFile = join(tmpdir(), `d1-restore-${process.pid}.sql`)
writeFileSync(tmpFile, sql)

console.log(`Restoring ${source} (${(sql.length / 1024).toFixed(1)} kB) into "${database}"`)
const result = spawnSync('npx', ['wrangler', 'd1', 'execute', database, '--remote', '--file', tmpFile], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
console.log('Restore finished. Open /admin to check the articles, or /api/health.')
