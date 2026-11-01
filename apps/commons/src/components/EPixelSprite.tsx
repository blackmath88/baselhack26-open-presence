/** Original, Adobe-adjacent but not trademark-derived 32px E character art. */
export type EPose = 'idle' | 'blink' | 'look-left' | 'look-right' | 'sleep' | 'surprised' | 'excited'
export const E_POSES: readonly EPose[] = ['idle', 'blink', 'look-left', 'look-right', 'sleep', 'surprised', 'excited']

export function EPixelSprite({ pose = 'idle', size = 64 }: { pose?: EPose; size?: number }) {
  const eyesClosed = pose === 'blink' || pose === 'sleep'
  const shift = pose === 'look-left' ? -1 : pose === 'look-right' ? 1 : 0
  return (
    <svg
      className="e-pixel-sprite"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {/* Keep the E silhouette invariant: do not flip the glyph to face left. */}
      <path d="M5 4H27V10H12V13H24V19H12V22H27V28H5Z" fill="#c32421" />
      <path d="M6 4H26V9H11V14H23V18H11V23H26V27H6Z" fill="#eb453c" />
      <path d="M7 4H25V7H9V25H7Z" fill="#ff7563" />
      {/* Two eyes side-by-side on the upper bar, not vertically stacked. */}
      {eyesClosed ? (
        <g fill="#41232d"><rect x="14" y="7" width="4" height="1" /><rect x="21" y="7" width="4" height="1" /></g>
      ) : (
        <g>
          <rect x="14" y="5" width="4" height="4" fill="#fff3e5" />
          <rect x="21" y="5" width="4" height="4" fill="#fff3e5" />
          <rect x={15 + shift} y="7" width="2" height="2" fill="#41232d" />
          <rect x={22 + shift} y="7" width="2" height="2" fill="#41232d" />
          {pose === 'idle' && <g fill="#9e211f"><rect x="14" y="5" width="4" height="1" /><rect x="21" y="5" width="4" height="1" /></g>}
        </g>
      )}
      {pose === 'surprised' ? <rect x="15" y="14" width="3" height="4" fill="#41232d" />
        : pose === 'excited' ? <path d="M14 15h6v2h-6z" fill="#fff3e5" />
        : pose === 'sleep' ? <path d="M15 16h5" stroke="#41232d" strokeWidth="1" />
        : <rect x="15" y="16" width="4" height="1" fill="#41232d" />}
      {pose === 'excited' && <g fill="#ffd280"><rect x="28" y="4" width="2" height="2" /><rect x="29" y="9" width="2" height="2" /></g>}
      <g fill="#41232d"><rect x="9" y="28" width="3" height="2" /><rect x="22" y="28" width="3" height="2" /></g>
    </svg>
  )
}
