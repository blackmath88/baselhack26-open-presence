/** Lowercase logo-derived e. Kept under the existing export for integration compatibility. */
export type EPose = 'idle' | 'blink' | 'look-left' | 'look-right' | 'sleep' | 'surprised' | 'excited'
export const E_POSES: readonly EPose[] = ['idle', 'blink', 'look-left', 'look-right', 'sleep', 'surprised', 'excited']

export function EPixelSprite({ pose = 'idle', size = 64, progress = 1, smoking = false, smoke = false }: {
  pose?: EPose; size?: number; progress?: number; smoking?: boolean; smoke?: boolean
}) {
  const t = Math.max(0, Math.min(1, progress))
  const closed = pose === 'blink' || pose === 'sleep'
  const shift = pose === 'look-left' ? -2 : pose === 'look-right' ? 2 : 0
  const red = Math.round(238 - t * 57)
  return <svg className="e-pixel-sprite" viewBox="-4 -26 124 130" width={size} height={size} aria-hidden="true" focusable="false">
    <ellipse cx="48" cy="91" rx="31" ry="3" fill="#231323" opacity=".09" />
    <g transform={`translate(${t * 3} ${t * 6}) rotate(${t * 8} 46 78) skewX(${-t * 7}) scale(1 ${1 - t * .08})`}>
      {/* Broad bowl, closed counter, horizontal crossbar and open right mouth: lowercase e. */}
      <path fillRule="evenodd" d="M83 49H30C33 66 56 68 78 57V76C68 82 57 85 45 85C20 85 7 68 7 45C7 21 22 7 45 7C70 7 83 24 83 45ZM30 34H60C58 25 54 22 46 22C38 22 32 26 30 34Z" fill={`rgb(${red},${Math.round(13+t*29)},${Math.round(t*67)})`} />
      <path d="M16 57C21 72 31 77 44 78" stroke="#ff8b6b" strokeWidth="2.3" opacity={t * .5} fill="none" strokeLinecap="round" />
      {/* Eyes gradually emerge, redden and disagree about how awake they are. */}
      <g opacity={Math.min(1, t * 3)}>
        {closed ? <g stroke="#421c33" strokeWidth="2.5" strokeLinecap="round"><path d="M28 19l12 1M50 20l13-2" /></g> : <>
          <ellipse cx="34" cy="17" rx="9" ry="7" fill="#ffd2cb" />
          <ellipse cx="57" cy="18" rx="9" ry="7" fill="#ffb5ad" />
          <g stroke="#d94a53" strokeWidth=".7" fill="none"><path d="M26 16l5 2-4 2M62 16l-4 3 6 2" /></g>
          <ellipse cx={35+shift} cy="19" rx="2.4" ry="3" fill="#342032" />
          <ellipse cx={55+shift} cy="20" rx="2.2" ry="2.7" fill="#342032" />
          <path d="M24 10Q34 5 44 12L44 17Q34 13 24 16Z" fill="#a72c40" />
          <path d="M47 13Q56 8 67 13L66 20Q57 15 48 20Z" fill="#a72c40" />
        </>}
        <path d={pose === 'surprised' ? 'M59 51q8-5 8 2q0 7-7 2Z' : pose === 'excited' ? 'M51 53q9 9 18-1' : 'M53 54q9 4 15-2'} stroke="#472033" strokeWidth="2.5" fill={pose === 'surprised' ? '#472033' : 'none'} strokeLinecap="round" />
      </g>
      {smoking && <g className="e-joint" transform="rotate(-11 65 54)">
        <path d="M65 52L96 57L95 62L65 56Z" fill="#f8f0df" stroke="#bba58e" strokeWidth=".8" />
        <path d="M88 56L96 57L95 62L87 60Z" fill="#8f6a57" />
        <path d="M95 57L99 58L98 62L95 62Z" fill="#ed6a35" />
        <path d="M98 58l2 1-1 3-2-1" fill="#ffc581" />
      </g>}
    </g>
    {smoke && <g className="e-smoke" stroke="#9d91a6" fill="none" strokeLinecap="round">
      <path className="e-smoke-wisp wisp-one" d="M98 52C83 43 116 35 96 23S96 3 103-9" strokeWidth="3" />
      <path className="e-smoke-wisp wisp-two" d="M87 48C69 35 101 29 87 16S81-1 89-15" strokeWidth="5" />
      <path className="e-smoke-wisp wisp-three" d="M101 43C117 30 88 18 105 7S111-9 108-20" strokeWidth="2" />
    </g>}
  </svg>
}
