// The two-poem mapping writer, ported from sideprojects/pdf-lab/poems.js bend(). The legacy file is a
// classic script shared by index.html and test-poems.js, so it is left untouched; test/writer.test.ts
// runs both writers on the same inputs and requires byte-identical output. Same guards, same limits:
// four printable-ASCII lines of 1–32 characters, the authored uncompressed fixture only.

export class WriterRejected extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WriterRejected'
  }
}

export const LINE_LIMIT = 32
export const lineProblem = (s: string): string | null =>
  !s.length ? 'empty' : s.length > LINE_LIMIT ? `over ${LINE_LIMIT} characters` : !/^[ -~]+$/.test(s) ? 'only printable ASCII (no accents, emoji or tabs)' : null

export function bend(source: Uint8Array, lines: readonly string[]): Uint8Array {
  if (lines.length !== 4 || lines.some((s) => lineProblem(s) !== null)) throw new WriterRejected('Use four printable ASCII lines of 1–32 characters.')
  if (source.length > 16384) throw new WriterRejected('Expected the small authored poem fixture.')
  const original = Array.from(source, (b) => String.fromCharCode(b)).join('')
  if (!original.includes('/CMapName /TwoPoems') || !original.startsWith('%PDF-1.4')) throw new WriterRejected('Not the authored two-poem fixture.')
  const target = Number((original.match(/\/ToUnicode (\d+) 0 R/) ?? [])[1])
  const objects = [...original.matchAll(/^(\d+) 0 obj\n([\s\S]*?)\nendobj\n/gm)]
  if (objects.length !== 11 || objects.some((o, i) => Number(o[1]) !== i + 1) || !target) throw new WriterRejected('Unexpected fixture structure.')
  const pairs = lines.map((line, i) => `<${(65 + i).toString(16).toUpperCase()}> <${Array.from(line, (c) => c.charCodeAt(0).toString(16).padStart(4, '0')).join('').toUpperCase()}>`).join('\n')
  let result = original.slice(0, objects[0]!.index)
  const offsets = [0]
  for (const obj of objects) {
    let body = obj[2]!
    if (Number(obj[1]) === target) {
      const match = body.match(/^<< \/Length \d+  >>\nstream\n([\s\S]*)\nendstream$/)
      if (!match) throw new WriterRejected('Unexpected mapping stream.')
      const stream = match[1]!.replace(/4 beginbfchar\n[\s\S]*?\nendbfchar/, `4 beginbfchar\n${pairs}\nendbfchar`)
      body = `<< /Length ${stream.length}  >>\nstream\n${stream}\nendstream`
    }
    offsets.push(result.length)
    result += `${obj[1]} 0 obj\n${body}\nendobj\n`
  }
  const xref = result.length
  result += `xref\n0 ${offsets.length}\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  result += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Uint8Array.from(result, (c) => c.charCodeAt(0))
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const latin1 = (bytes: Uint8Array) => Array.from(bytes, (b) => String.fromCharCode(b)).join('')
