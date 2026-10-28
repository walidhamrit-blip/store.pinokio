import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

// These tests drive the real scripts with a stubbed `npx`, so the nightly
// backup workflow cannot silently regress into committing empty dumps or
// ignoring the retention limit.

const made: string[] = []

function workspace() {
  const dir = mkdtempSync(join(tmpdir(), 'store-backup-'))
  made.push(dir)
  const bin = join(dir, 'bin')
  const out = join(dir, 'backups')
  mkdirSync(bin)
  return { dir, bin, out }
}

function stubNpx(bin: string, body: string) {
  const path = join(bin, 'npx')
  writeFileSync(path, `#!/usr/bin/env bash\n${body}\n`)
  chmodSync(path, 0o755)
}

const DUMP = 'out=""; prev=""\nfor a in "$@"; do if [ "$prev" = "--output" ]; then out="$a"; fi; prev="$a"; done\n'
const GOOD_DUMP = `${DUMP}printf 'CREATE TABLE products (slug TEXT);\\nINSERT INTO products VALUES ("demo");\\n' > "$out"`
const EMPTY_DUMP = `${DUMP}: > "$out"`

function run(script: string, args: string[], env: Record<string, string>) {
  return spawnSync(process.execPath, [script, ...args], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  })
}

afterEach(() => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('db:backup', () => {
  it('writes a gzipped snapshot and honours the retention limit', () => {
    const { dir, bin, out } = workspace()
    stubNpx(bin, GOOD_DUMP)
    const env = { PATH: `${bin}:${process.env.PATH}` }

    for (let i = 0; i < 4; i++) {
      const result = run('scripts/backup.mjs', [`--out=${out}`, '--keep=2'], env)
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toContain('INSERT statement')
    }

    const files = readdirSync(out)
    expect(files).toHaveLength(2)
    for (const file of files) {
      expect(file).toMatch(/^store-\d{4}-\d{2}-\d{2}T\S+Z\.sql\.gz$/)
      expect(existsSync(join(out, file))).toBe(true)
    }
    expect(join(dir, 'backups')).toBe(out)
  })

  it('understands --out dir as well as --out=dir', () => {
    // The nightly workflow passes `--out ../backups`; a parser that only knew
    // the `=` form silently wrote the dump next to the script instead.
    const { dir, bin } = workspace()
    const spaced = join(dir, 'spaced')
    stubNpx(bin, GOOD_DUMP)
    const result = run('scripts/backup.mjs', ['--out', spaced, '--keep', '1'], {
      PATH: `${bin}:${process.env.PATH}`,
    })
    expect(result.status, result.stderr).toBe(0)
    expect(readdirSync(spaced)).toHaveLength(1)
  })

  it('fails instead of committing an empty dump', () => {
    const { bin, out } = workspace()
    stubNpx(bin, EMPTY_DUMP)
    const result = run('scripts/backup.mjs', [`--out=${out}`], { PATH: `${bin}:${process.env.PATH}` })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('empty dump')
    expect(existsSync(out) ? readdirSync(out) : []).toHaveLength(0)
  })
})

describe('db:restore', () => {
  it('refuses to overwrite without --yes', () => {
    const { bin } = workspace()
    stubNpx(bin, GOOD_DUMP)
    const result = run('scripts/restore.mjs', ['backups/whatever.sql.gz'], { PATH: `${bin}:${process.env.PATH}` })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('--yes')
  })

  it('rejects a missing snapshot', () => {
    const { bin } = workspace()
    stubNpx(bin, GOOD_DUMP)
    const result = run('scripts/restore.mjs', ['backups/nope.sql.gz', '--yes'], { PATH: `${bin}:${process.env.PATH}` })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('No such snapshot')
  })
})
