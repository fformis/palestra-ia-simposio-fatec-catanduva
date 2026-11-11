import type { HTMLAttributes } from 'react'
import type { Tone } from './Badge'
import styles from './Alert.module.css'

export function Alert({
  tone = 'info',
  title,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: Exclude<Tone, 'neutral'>; title: string }) {
  return (
    <div {...rest} role={tone === 'danger' ? 'alert' : 'status'} className={`${styles.alert} ${styles[tone]}`}>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}
