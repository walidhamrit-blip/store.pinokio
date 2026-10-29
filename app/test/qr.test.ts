import { expect, it } from 'vitest'

import { qrMatrix, qrPath } from '../src/app/lib/qr'
import { FIXTURES } from './qr.fixtures'

it('matches known-good matrices for short and URL-length payloads', () => {
  for (const fixture of FIXTURES) {
    const matrix = qrMatrix(fixture.text)
    expect({ version: matrix.version, mask: matrix.mask }).toEqual({ version: fixture.version, mask: fixture.mask })
    const rows = matrix.modules.map((row) => row.map((dark) => (dark ? '#' : '.')).join(''))
    expect(rows).toEqual([...fixture.rows])
  }
})

it('draws every dark module once and nothing else', () => {
  const matrix = qrMatrix('https://example.com/product/carafe-a-filtre')
  const path = qrPath(matrix)
  const dark = matrix.modules.flat().filter(Boolean).length
  expect(path.match(/M/g)?.length).toBe(dark)
  expect(path).not.toMatch(/NaN|undefined|Infinity/)
})

it('keeps the symbol square and version-sized', () => {
  for (const text of ['a', 'https://example.com/product/linen-throw', 'x'.repeat(400)]) {
    const matrix = qrMatrix(text)
    expect(matrix.size).toBe(matrix.version * 4 + 17)
    expect(matrix.modules.every((row) => row.length === matrix.size)).toBe(true)
  }
})
