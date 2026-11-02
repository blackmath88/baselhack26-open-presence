export type Point = { x: number; y: number }
export type Viewport = { width: number; height: number }
export type Anchor = { left: number; right: number; top: number; bottom: number }
export const BODY_SIZE = 100
export const MARGIN = 12
export function clampPosition(point: Point, viewport: Viewport): Point {
  const maxX = Math.max(0, viewport.width - BODY_SIZE - MARGIN)
  const maxY = Math.max(0, viewport.height - BODY_SIZE - MARGIN)
  return { x: Math.max(Math.min(MARGIN, maxX), Math.min(maxX, Number.isFinite(point.x) ? point.x : maxX)), y: Math.max(Math.min(MARGIN, maxY), Math.min(maxY, Number.isFinite(point.y) ? point.y : maxY)) }
}
export function authoredPosition(viewport: Viewport, anchor?: Anchor, side: 'left' | 'right' = 'right'): Point {
  if (anchor && viewport.width >= 700) {
    for (const x of (side === 'right' ? [anchor.right + 16, anchor.left - BODY_SIZE - 16] : [anchor.left - BODY_SIZE - 16, anchor.right + 16])) {
      if (x >= MARGIN && x + BODY_SIZE + MARGIN <= viewport.width) return clampPosition({ x, y: anchor.top + 12 }, viewport)
    }
  }
  return clampPosition({ x: side === 'left' ? 24 : viewport.width - BODY_SIZE - 24, y: viewport.height - BODY_SIZE - 24 }, viewport)
}
export function restorePosition(value: unknown, viewport: Viewport): Point | null {
  if (!value || typeof value !== 'object') return null
  const p = value as Partial<Point>
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null
  // Stored as fractions so a phone never inherits a desktop's off-screen coordinates.
  return clampPosition({ x: Math.max(0, Math.min(1, p.x!)) * viewport.width, y: Math.max(0, Math.min(1, p.y!)) * viewport.height }, viewport)
}
export type PageContext = { id: string; title: string; explanation: string; anchors: string[]; side?: 'left' | 'right' }
export function pageContext(path: string, hash: string): PageContext {
  if (/\/e\/?$/.test(path)) return { id: 'character', title: 'a dope e', explanation: 'The wordmark becomes a dope e. Each phrase gets a beat, then the other letters fold into me. The smoke takes its time.', anchors: ['.wordmark-film', '#poses'] }
  if (/pdf-lab|workbench/.test(path)) return { id: 'pdf', side: 'left', title: 'PDF Lab', explanation: 'A PDF can keep its picture while different readers recover different text. Reveal the second reading, then inspect the file and the recorded evidence.', anchors: ['#two-poems', 'main', 'h1'] }
  if (/pdf-history/.test(path)) return { id: 'history', title: 'PDF history', explanation: 'This is the optional story of information travelling between people and software. The question is what survives the journey—and what you can inspect.', anchors: ['main', 'h1'] }
  if (/story/.test(path)) return { id: 'story', side: hash.includes('past') ? 'left' : 'right', title: '.phf story', explanation: 'Follow the story from documents that travel to human context that travels with an answer. PDF Lab is the experiment; Commons is the shared experience.', anchors: ['#past', '#future', '#present'] }
  if (/^#\/(search|problems|repo|compare|threads|contributions)/.test(hash) || /commons/.test(path)) return { id: 'commons', title: 'Commons', explanation: hash.includes('/compare') ? 'Compare the conditions and evidence in both accounts. A shared symptom does not establish a shared cause.' : 'Find an experience, inspect the original words and their conditions, then contribute what happened in your situation. Source words and agent interpretation stay distinct.', anchors: ['.commons-record', '.commons-finder', '.phf-journey'] }
  return { id: 'observatory', title: 'Project Observatory', explanation: 'This is the project map: evidence, decisions and activity around the build. Open the .phf story for the experience, or PDF Lab for the experiment.', anchors: ['main', 'h1'] }
}
export function replyTo(question: string, context: PageContext): string {
  if (/smok|joint|word|adobe|dope|\be\b/i.test(question)) return 'Adobe → A dobe e → A dope e → a dope e. The letters fold into me so one little e carries the whole joke. You can move me; Pause stops my motion.'
  if (/move|drag|place|position/i.test(question)) return 'Drag me, or focus me and use the arrow keys. Return to e’s place resumes the authored position for this page.'
  if (/explain|what|page|help|this|pdf|source|evidence/i.test(question)) return context.explanation
  return 'I can explain this page, point you to its main experience or offer a side quest. These are authored guide responses; an AI conversation is not connected yet.'
}
