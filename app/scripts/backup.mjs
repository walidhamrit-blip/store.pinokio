// Snapshot the production D1 database into the repository.
//
//   npm run db:backup                  keep the 30 newest snapshots
//   npm run db:backup -- --keep=90     keep more
//
// Written as gzipped SQL so the dumps stay tiny in Git (a demo catalogue is a
// few kilobytes). The GitHub Actions workflow `.github/workflows/backup.yml`
// runs this daily and commits the result, so there is nothing to do by hand.
//
// Needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in the environment, and a
// `database_id` in wrangler.jsonc (already committed).
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const args = process.argv.slice(2)
// Accepts both `--out=dir` and `--out dir`: the first is what npm scripts show
// in their documentation, the second is what people type, and a silently
// ignored `--out` used to send the dump to the wrong directory.
const option = (name, fallback) => {
  const inline = args.find((arg) => arg.startsWith(`--${name}=`))
  if (inline) return inline.slice(name.length + 3)
  const index = args.indexOf(`--${name}`)
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) return args[index + 1]
  return fallback
}

const database = option('database', process.env.D1_DATABASE ?? 'store')
const keep = Math.max(1, Number(option('keep', process.env.BACKUP_KEEP ?? 30)))
const outDir = option('out', join(process.cwd(), 'backups'))

// Millisecond precision with a fixed width (2026-10-28T03-17-42-681Z), so names
// never collide and sorting the names is also sorting them in time.
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const tmpFile = join(tmpdir(), `d1-export-${process.pid}.sql`)
const target = join(outDir, `${database}-${stamp}.sql.gz`)

function run(command, argv, options = {}) {
  const result = spawnSync(command, argv, { stdio: 'inherit', shell: process.platform === 'win32', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

mkdirSync(outDir, { recursive: true })

console.log(`Exporting D1 database "${database}" to ${target}`)
run('npx', ['wrangler', 'd1', 'export', database, '--remote', '--output', tmpFile])

if (!existsSync(tmpFile)) {
  console.error('Wrangler did not produce a dump — check the credentials and the database name.')
  process.exit(1)
}

const sql = readFileSync(tmpFile)
rmSync(tmpFile, { force: true })

// An empty file means the export silently failed (wrong id, expired token).
// Better to fail here than to commit an empty backup and believe it is safe.
if (sql.length === 0) {
  console.error('Wrangler wrote an empty dump — check the token and the database id.')
  process.exit(1)
}

const text = sql.toString('utf8')
const tables = (text.match(/CREATE TABLE/gi) ?? []).length
const inserts = (text.match(/INSERT INTO/gi) ?? []).length

writeFileSync(target, gzipSync(sql, { level: 9 }))
const kb = (statSync(target).size / 1024).toFixed(1)
console.log(`Saved ${target} (${kb} kB, ${tables} table(s) created, ${inserts} INSERT statement(s))`)

// Retention: keep the newest N dumps, delete the rest.
const dumps = readdirSync(outDir)
  .filter((name) => name.startsWith(`${database}-`) && name.endsWith('.sql.gz'))
  // Newest first, by real modification time: robust even if someone copies an
  // old dump back into the folder.
  .map((name) => ({ name, time: statSync(join(outDir, name)).mtimeMs }))
  .sort((a, b) => b.time - a.time)
  .map((entry) => entry.name)
const removed = dumps.slice(keep)
for (const name of removed) {
  rmSync(join(outDir, name), { force: true })
  console.log(`Pruned ${name}`)
}
console.log(`${Math.min(dumps.length, keep)} snapshot(s) kept in ${outDir}${removed.length ? `, ${removed.length} pruned` : ''}`)
