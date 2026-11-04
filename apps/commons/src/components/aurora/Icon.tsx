export type IconName =
  | 'home'
  | 'grid'
  | 'search'
  | 'doc'
  | 'compare'
  | 'eye'
  | 'voices'
  | 'pin'
  | 'help'
  | 'bell'
  | 'user'
  | 'spark'
  | 'canvas'
  | 'bolt'
  | 'menu'
  | 'edit'
  | 'plus'
  | 'up'
  | 'down'
  | 'expand'
  | 'dots'
  | 'star'
  | 'graph'
  | 'x'

export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: 'absolute' }}
    >
      <symbol id="i-home" viewBox="0 0 24 24">
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 7a5 5 0 1 0 5 5" />
      </symbol>
      <symbol id="i-grid" viewBox="0 0 24 24">
        <circle cx="5" cy="5" r="1.4" />
        <circle cx="12" cy="5" r="1.4" />
        <circle cx="19" cy="5" r="1.4" />
        <circle cx="5" cy="12" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="19" cy="12" r="1.4" />
        <circle cx="5" cy="19" r="1.4" />
        <circle cx="12" cy="19" r="1.4" />
        <circle cx="19" cy="19" r="1.4" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </symbol>
      <symbol id="i-doc" viewBox="0 0 24 24">
        <path d="M14 3H6v18h12V7z" />
        <path d="M14 3v4h4M9 13h6M9 17h4" />
      </symbol>
      <symbol id="i-compare" viewBox="0 0 24 24">
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
      </symbol>
      <symbol id="i-eye" viewBox="0 0 24 24">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </symbol>
      <symbol id="i-voices" viewBox="0 0 24 24">
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="10" r="2.4" />
        <path d="M3 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5M14 18.5c.4-2 1.6-3 3-3s2.6 1 3 3" />
      </symbol>
      <symbol id="i-pin" viewBox="0 0 24 24">
        <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3zM12 14v7" />
      </symbol>
      <symbol id="i-help" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
      </symbol>
      <symbol id="i-bell" viewBox="0 0 24 24">
        <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 21h4" />
      </symbol>
      <symbol id="i-user" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-4.5 4.2-6.5 8-6.5s7 2 8 6.5" />
      </symbol>
      <symbol id="i-spark" viewBox="0 0 24 24">
        <path d="M12 3a9 9 0 1 0 9 9" />
        <circle cx="12" cy="12" r="3" />
      </symbol>
      <symbol id="i-canvas" viewBox="0 0 24 24">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="5" rx="1" />
        <rect x="13" y="10" width="8" height="11" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
      </symbol>
      <symbol id="i-bolt" viewBox="0 0 24 24">
        <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
      </symbol>
      <symbol id="i-menu" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </symbol>
      <symbol id="i-edit" viewBox="0 0 24 24">
        <path d="M4 20h4L19 9l-4-4L4 16z" />
        <path d="M14 4h-9v0" />
      </symbol>
      <symbol id="i-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </symbol>
      <symbol id="i-up" viewBox="0 0 24 24">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </symbol>
      <symbol id="i-down" viewBox="0 0 24 24">
        <path d="m6 9 6 6 6-6" />
      </symbol>
      <symbol id="i-expand" viewBox="0 0 24 24">
        <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
      </symbol>
      <symbol id="i-dots" viewBox="0 0 24 24">
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="19" cy="12" r="1.2" />
      </symbol>
      <symbol id="i-star" viewBox="0 0 24 24">
        <path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" />
      </symbol>
      <symbol id="i-graph" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M11 7 6 17M13 7l5 10M7 19h10" />
      </symbol>
      <symbol id="i-x" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6 6 18" />
      </symbol>
    </svg>
  )
}

export function Icon({
  name,
  size = 16,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={`i ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <use href={`#i-${name}`} />
    </svg>
  )
}
