import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, disabled, children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
