// A small, dependency-free QR Code encoder (byte mode, error correction M).
//
// Every product page offers a QR of its own URL. Pulling in a QR package for
// that would add ~30 kB to a store that otherwise ships almost no client code,
// and calling a third-party image API would leak the catalogue to someone
// else's server. So the maths lives here instead: encode, split into blocks,
// Reed-Solomon, place, mask, and pick the mask the spec prefers.
//
// Algorithm follows ISO/IEC 18004 as described by Project Nayuki's reference
// implementation; the tables below cover versions 1 to 20 (up to ~600 bytes),
// far more than any URL this store produces.

/** Error-correction level M: ~15% of the symbol can be damaged and recovered. */
const ECC_CODEWORDS_PER_BLOCK: Record<number, number> = {
  1: 10, 2: 16, 3: 26, 4: 18, 5: 24, 6: 16, 7: 18, 8: 22, 9: 22, 10: 26,
  11: 30, 12: 22, 13: 22, 14: 24, 15: 24, 16: 28, 17: 28, 18: 26, 19: 26, 20: 26,
}

/** [blockCount, dataCodewordsPerBlock] per group, for level M. */
const BLOCKS: Record<number, [number, number][]> = {
  1: [[1, 16]], 2: [[1, 28]], 3: [[1, 44]], 4: [[2, 32]], 5: [[2, 43]],
  6: [[4, 27]], 7: [[4, 31]], 8: [[2, 38], [2, 39]], 9: [[3, 36], [2, 37]],
  10: [[4, 43], [1, 44]], 11: [[1, 50], [4, 51]], 12: [[6, 36], [2, 37]],
  13: [[8, 37], [1, 38]], 14: [[4, 40], [5, 41]], 15: [[5, 41], [5, 42]],
  16: [[7, 45], [3, 46]], 17: [[10, 46], [1, 47]], 18: [[9, 43], [4, 44]],
  19: [[3, 44], [11, 45]], 20: [[3, 41], [13, 42]],
}

const ALIGNMENT: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
  7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
  11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62], 14: [6, 26, 46, 66],
  15: [6, 26, 48, 70], 16: [6, 26, 50, 74], 17: [6, 30, 54, 78],
  18: [6, 30, 56, 82], 19: [6, 30, 58, 86], 20: [6, 34, 62, 90],
}

const MAX_VERSION = 20
/** Level M format-info bits: (error level bits << 3) | mask, BCH protected. */
const ECC_FORMAT_BITS = 0

export interface QrMatrix {
  /** Modules per side, quiet zone excluded. */
  size: number
  version: number
  mask: number
  /** Row-major grid of booleans; true is a dark module. */
  modules: boolean[][]
}

/** UTF-8 encode without depending on TextEncoder (keeps this module portable). */
function utf8(text: string): number[] {
  const out: number[] = []
  for (const char of text) {
    let code = char.codePointAt(0)!
    if (code < 0x80) out.push(code)
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    else if (code < 0x10000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    else {
      out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    }
  }
  return out
}

function dataCodewordCount(version: number): number {
  return BLOCKS[version].reduce((sum, [count, data]) => sum + count * data, 0)
}

function pickVersion(byteLength: number): number {
  for (let version = 1; version <= MAX_VERSION; version++) {
    // Byte mode: 4 bit mode indicator + character count + payload.
    const countBits = version <= 9 ? 8 : 16
    const needed = 4 + countBits + byteLength * 8
    if (needed <= dataCodewordCount(version) * 8) return version
  }
  throw new Error('QR: text too long')
}

class BitBuffer {
  private bits: number[] = []
  push(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1)
  }
  get length() {
    return this.bits.length
  }
  toBytes(): number[] {
    const bytes: number[] = []
    for (let i = 0; i < this.bits.length; i += 8) {
      let byte = 0
      for (let j = 0; j < 8; j++) byte = (byte << 1) | (this.bits[i + j] ?? 0)
      bytes.push(byte)
    }
    return bytes
  }
}

/** Reed-Solomon generator polynomial of the requested degree, as coefficients. */
function generator(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = multiply(result[j], root)
      if (j + 1 < degree) result[j] ^= result[j + 1]
    }
    root = multiply(root, 0x02)
  }
  return result
}

function multiply(a: number, b: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((b >>> i) & 1) * a
  }
  return z & 0xff
}

function remainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0)
  for (const byte of data) {
    const factor = byte ^ result.shift()!
    result.push(0)
    for (let i = 0; i < divisor.length; i++) result[i] ^= multiply(divisor[i], factor)
  }
  return result
}

/** Builds the final codeword sequence: interleaved data blocks, then EC blocks. */
function codewords(text: string, version: number): number[] {
  const bytes = utf8(text)
  const buffer = new BitBuffer()
  buffer.push(0b0100, 4) // byte mode
  buffer.push(bytes.length, version <= 9 ? 8 : 16)
  for (const byte of bytes) buffer.push(byte, 8)

  const capacity = dataCodewordCount(version) * 8
  buffer.push(0, Math.min(4, capacity - buffer.length)) // terminator
  while (buffer.length % 8 !== 0) buffer.push(0, 1)

  const data = buffer.toBytes()
  for (let pad = 0; data.length < capacity / 8; pad++) data.push(pad % 2 === 0 ? 0xec : 0x11)

  const ecLength = ECC_CODEWORDS_PER_BLOCK[version]
  const divisor = generator(ecLength)
  const dataBlocks: number[][] = []
  const ecBlocks: number[][] = []
  let offset = 0
  for (const [count, dataLength] of BLOCKS[version]) {
    for (let i = 0; i < count; i++) {
      const block = data.slice(offset, offset + dataLength)
      offset += dataLength
      dataBlocks.push(block)
      ecBlocks.push(remainder(block, divisor))
    }
  }

  const out: number[] = []
  const longest = Math.max(...dataBlocks.map((b) => b.length))
  for (let i = 0; i < longest; i++) for (const block of dataBlocks) if (i < block.length) out.push(block[i])
  for (let i = 0; i < ecLength; i++) for (const block of ecBlocks) out.push(block[i])
  return out
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

class Grid {
  size: number
  modules: boolean[][]
  reserved: boolean[][]

  constructor(version: number) {
    this.size = version * 4 + 17
    this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false))
    this.reserved = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false))
  }

  /** x is the column, y the row. */
  set(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark
    this.reserved[y][x] = true
  }

  drawFunctionPatterns(version: number) {
    const size = this.size
    // Timing patterns.
    for (let i = 0; i < size; i++) {
      this.set(6, i, i % 2 === 0)
      this.set(i, 6, i % 2 === 0)
    }
    // Finders and their separators, at three corners.
    this.drawFinder(3, 3)
    this.drawFinder(size - 4, 3)
    this.drawFinder(3, size - 4)
    // Alignment patterns, skipping the three that would sit on a finder.
    const centers = ALIGNMENT[version]
    for (let i = 0; i < centers.length; i++) {
      for (let j = 0; j < centers.length; j++) {
        const onFinder =
          (i === 0 && j === 0) || (i === 0 && j === centers.length - 1) || (i === centers.length - 1 && j === 0)
        if (!onFinder) this.drawAlignment(centers[i], centers[j])
      }
    }
    this.drawFormat(0) // reserve the area; real bits come after masking
    if (version >= 7) this.drawVersion(version)
  }

  private drawFinder(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= this.size || y >= this.size) continue
        const distance = Math.max(Math.abs(dx), Math.abs(dy))
        this.set(x, y, distance !== 2 && distance !== 4)
      }
    }
  }

  private drawAlignment(cx: number, cy: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    }
  }

  drawFormat(mask: number) {
    const data = (ECC_FORMAT_BITS << 3) | mask
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((data << 10) | rem) ^ 0x5412
    const bit = (i: number) => ((bits >>> i) & 1) !== 0
    const size = this.size

    for (let i = 0; i <= 5; i++) this.set(8, i, bit(i))
    this.set(8, 7, bit(6))
    this.set(8, 8, bit(7))
    this.set(7, 8, bit(8))
    for (let i = 9; i < 15; i++) this.set(14 - i, 8, bit(i))
    for (let i = 0; i < 8; i++) this.set(size - 1 - i, 8, bit(i))
    for (let i = 8; i < 15; i++) this.set(8, size - 15 + i, bit(i))
    this.set(8, size - 8, true) // always-dark module
  }

  private drawVersion(version: number) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) !== 0
      const a = this.size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      this.set(a, b, dark)
      this.set(b, a, dark)
    }
  }

  /** Zig-zag placement of the codeword bits into all free modules. */
  drawCodewords(data: number[]) {
    const size = this.size
    let i = 0
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j
          const upward = ((right + 1) & 2) === 0
          const y = upward ? size - 1 - vert : vert
          if (!this.reserved[y][x] && i < data.length * 8) {
            this.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0
            i++
          }
        }
      }
    }
  }

  applyMask(mask: number) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (!this.reserved[y][x] && maskBit(mask, x, y)) this.modules[y][x] = !this.modules[y][x]
      }
    }
  }
}

/** Penalty score from the four rules in the spec; lower is better. */
function penalty(modules: boolean[][]): number {
  const size = modules.length
  const rows = modules
  const columns = Array.from({ length: size }, (_, x) => modules.map((row) => row[x]))
  let score = 0

  // Rule 1 (runs of five or more) and rule 3 (finder-lookalikes).
  for (const line of [...rows, ...columns]) {
    let run = 1
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) {
        run++
      } else {
        if (run >= 5) score += run - 2
        run = 1
      }
    }
    score += finderLookalikes(line)
  }

  // Rule 2: every 2×2 block of one colour.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x]
      if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) score += 3
    }
  }

  // Rule 4: distance from an even split of dark and light modules.
  let dark = 0
  for (const row of modules) for (const module of row) if (module) dark++
  score += 10 * Math.trunc(Math.abs((dark / (size * size)) * 100 - 50) / 5)

  return score
}

/**
 * The dark:light:dark:light:dark 1:1:3:1:1 pattern with four light modules
 * on one side. Modules beyond the edge count as light — the quiet zone does
 * the same job as a white run inside the symbol.
 */
function finderLookalikes(line: boolean[]): number {
  const size = line.length
  const light = (from: number, to: number) => {
    for (let i = Math.max(from, 0); i < Math.min(to, size); i++) if (line[i]) return false
    return true
  }
  let count = 0
  let i = 0
  while (i + 7 <= size) {
    const isPattern =
      line[i] && !line[i + 1] && line[i + 2] && line[i + 3] && line[i + 4] && !line[i + 5] && line[i + 6]
    if (isPattern) {
      const after = i + 7
      if (i === 0 || after === size || light(i - 4, i) || light(after, after + 4)) {
        count += 40
        i = after
        continue
      }
      // Not a real finder lookalike: the next match can only start past the
      // three dark modules in the middle of the pattern.
      i = i + 4
      continue
    }
    i++
  }
  return count
}

/**
 * Encodes `text` as a QR code at error-correction level M.
 * Returns a row-major module grid without the quiet zone.
 */
export function qrMatrix(text: string, forcedMask?: number): QrMatrix {
  const version = pickVersion(utf8(text).length)
  const data = codewords(text, version)

  let best: QrMatrix | null = null
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    if (forcedMask !== undefined && mask !== forcedMask) continue
    const grid = new Grid(version)
    grid.drawFunctionPatterns(version)
    grid.drawCodewords(data)
    grid.applyMask(mask)
    grid.drawFormat(mask)
    const score = penalty(grid.modules)
    if (score < bestScore) {
      bestScore = score
      best = { size: grid.size, version, mask, modules: grid.modules.map((row) => [...row]) }
    }
  }
  return best!
}

/** An SVG path for the dark modules, in module units (one unit per module). */
export function qrPath(matrix: QrMatrix): string {
  let path = ''
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (matrix.modules[y][x]) path += `M${x} ${y}h1v1h-1z`
    }
  }
  return path
}
