import type { HTMLAttributes } from 'react'
import styles from './Badge.module.css'

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export function Badge({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span {...rest} className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')} />
}
