import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './Primitives.css'
import './Buttons.css'
export type Tone = 'ok' | 'warn' | 'crit' | 'violet' | 'acc'
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge b-${tone}`}>{children}</span>
}
export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>
}
export function Severity({ level = 'crit' }: { level?: 'crit' | 'warn' }) {
  return (
    <span aria-hidden="true" className={`sev ${level === 'warn' ? 'w' : ''}`}>
      !
    </span>
  )
}
export function Button({
  variant = 'default',
  icon,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost-accent'
  icon?: IconName
}) {
  return (
    <button
      type="button"
      className={`btn ${variant === 'primary' ? 'btn-acc' : variant === 'ghost-accent' ? 'btn-ghost-acc gb' : ''} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}
export function IconButton({
  name,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  name: IconName
  label: string
}) {
  return (
    <button type="button" aria-label={label} title={label} {...props}>
      <Icon name={name} />
    </button>
  )
}
