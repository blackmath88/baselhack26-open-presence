// Static parse of the two-poem fixtures' bytes (uncompressed ASCII PDFs written by build.py).
// It reads exactly the structure poems.py writes: a Type 3 font whose CharProcs draw lines with
// Helvetica, a ToUnicode CMap, and a page content stream placing the glyphs; or, for the direct
// control, ordinary Helvetica text. Anything else is rejected: this is not a general PDF parser.

export class UnsupportedStructure extends Error {
  constructor(message: string) {
    super(`Unsupported fixture structure: ${message}`)
    this.name = 'UnsupportedStructure'
  }
}

export interface PdfObject { number: number; dict: string; stream: string | null }

export interface MappedLine {
  index: number
  /** Character code as two hex digits, e.g. "41". */
  code: string
  glyphName: string
  charProcObject: number
  charProcStream: string
  /** Words the glyph procedure paints. */
  drawn: string
  /** Unicode the ToUnicode CMap assigns to the code. */
  mapped: string
  /** Placement from the page content stream, in points. */
  x: number
  y: number
}

export type TwoPoemFixture =
  | { kind: 'type3-mapped'; fontObject: number; fontBBox: [number, number, number, number]; toUnicodeObject: number; toUnicodeStream: string; contentObject: number; lines: MappedLine[] }
  | { kind: 'direct-text'; contentObject: number; lines: Array<{ index: number; drawn: string; x: number; y: number; size: number; operator: string }> }

const unescapeLiteral = (s: string) => s.replace(/\\([()\\])/g, '$1')

export function readObjects(pdf: string): PdfObject[] {
  const out: PdfObject[] = []
  for (const m of pdf.matchAll(/(\d+) 0 obj\n([\s\S]*?)\nendobj\n/g)) {
    const body = m[2]!
    const s = body.match(/^([\s\S]*?)\nstream\n([\s\S]*?)\nendstream$/)
    out.push({ number: Number(m[1]), dict: s ? s[1]! : body, stream: s ? s[2]! : null })
  }
  if (!pdf.startsWith('%PDF-') || out.length === 0) throw new UnsupportedStructure('no PDF objects found')
  return out
}

function decodeUtf16be(hex: string): string {
  if (hex.length % 4 !== 0) throw new UnsupportedStructure('ToUnicode value is not whole UTF-16 units')
  let s = ''
  for (let i = 0; i < hex.length; i += 4) s += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16))
  return s
}

export function parseTwoPoemFixture(pdf: string): TwoPoemFixture {
  const objects = readObjects(pdf)
  const byNumber = new Map(objects.map((o) => [o.number, o]))
  const page = objects.find((o) => /\/Type \/Page\b/.test(o.dict))
  const contentRef = page?.dict.match(/\/Contents (\d+) 0 R/)
  const content = contentRef ? byNumber.get(Number(contentRef[1])) : undefined
  if (!content?.stream) throw new UnsupportedStructure('page content stream not found')
  const font = objects.find((o) => /\/Subtype \/Type3/.test(o.dict))
  // The direct control still declares the Type 3 font but its content never paints with it.
  if (!font || !/\/G 1 Tf/.test(content.stream)) {
    const lines = [...content.stream.matchAll(/BT \/H (\d+) Tf 1 0 0 1 (\d+) (\d+) Tm \(((?:[^()\\]|\\.)*)\) Tj ET/g)]
      .filter((m) => m[1] === '22')
      .map((m, index) => ({ index, size: 22, x: Number(m[2]), y: Number(m[3]), drawn: unescapeLiteral(m[4]!), operator: m[0] }))
    if (lines.length !== 4) throw new UnsupportedStructure(`expected four 22 pt text lines in the direct control, found ${lines.length}`)
    return { kind: 'direct-text', contentObject: content.number, lines }
  }
  const bbox = font.dict.match(/\/FontBBox \[(-?\d+) (-?\d+) (-?\d+) (-?\d+)\]/)
  const tuRef = font.dict.match(/\/ToUnicode (\d+) 0 R/)
  const differences = font.dict.match(/\/Differences \[(\d+) ((?:\/\w+ ?)+)\]/)
  const procs = font.dict.match(/\/CharProcs << ([^>]*) >>/)
  if (!bbox || !tuRef || !differences || !procs) throw new UnsupportedStructure('Type 3 font lacks FontBBox, ToUnicode, Differences or CharProcs')
  const toUnicode = byNumber.get(Number(tuRef[1]))
  if (!toUnicode?.stream) throw new UnsupportedStructure('ToUnicode stream missing')
  const bfchar = toUnicode.stream.match(/\d+ beginbfchar\n([\s\S]*?)\nendbfchar/)
  if (!bfchar) throw new UnsupportedStructure('ToUnicode has no bfchar section')
  const mapped = new Map([...bfchar[1]!.matchAll(/^<([0-9A-F]{2})> <([0-9A-F]+)>$/gm)].map((m) => [m[1]!, decodeUtf16be(m[2]!)]))
  const procObjects = new Map([...procs[1]!.matchAll(/\/(\w+) (\d+) 0 R/g)].map((m) => [m[1]!, Number(m[2])]))
  const first = Number(differences[1])
  const names = differences[2]!.trim().split(/\s+/).map((n) => n.slice(1))
  const placements = new Map([...content.stream.matchAll(/BT \/G 1 Tf 1 0 0 1 (\d+) (\d+) Tm <([0-9A-F]{2})> Tj ET/g)].map((m) => [m[3]!, { x: Number(m[1]), y: Number(m[2]) }]))
  const lines: MappedLine[] = names.map((glyphName, index) => {
    const code = (first + index).toString(16).toUpperCase().padStart(2, '0')
    const objNumber = procObjects.get(glyphName)
    const proc = objNumber === undefined ? undefined : byNumber.get(objNumber)
    const drawn = proc?.stream?.match(/\(((?:[^()\\]|\\.)*)\) Tj/)
    const place = placements.get(code)
    const text = mapped.get(code)
    if (!proc?.stream || !drawn || !place || text === undefined) throw new UnsupportedStructure(`glyph ${glyphName} (code ${code}) is not drawn, placed and mapped`)
    return { index, code, glyphName, charProcObject: objNumber!, charProcStream: proc.stream, drawn: unescapeLiteral(drawn[1]!), mapped: text, x: place.x, y: place.y }
  })
  if (lines.length !== 4) throw new UnsupportedStructure(`expected four line glyphs, found ${lines.length}`)
  return {
    kind: 'type3-mapped', fontObject: font.number,
    fontBBox: [Number(bbox[1]), Number(bbox[2]), Number(bbox[3]), Number(bbox[4])],
    toUnicodeObject: toUnicode.number, toUnicodeStream: toUnicode.stream, contentObject: content.number, lines,
  }
}
