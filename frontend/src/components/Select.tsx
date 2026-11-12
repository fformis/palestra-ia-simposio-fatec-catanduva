import { useId, type SelectHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  help?: string
  error?: string
}

export function Select({ label, help, error, id, children, ...rest }: SelectProps) {
  const auto = useId()
  const inputId = id ?? auto
  const noteId = `${inputId}-note`
  const note = error ?? help
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <select
        {...rest}
        id={inputId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
      >
        {children}
      </select>
      {note && (
        <span id={noteId} className={error ? styles.error : styles.help} role={error ? 'alert' : undefined}>
          {note}
        </span>
      )}
    </div>
  )
}
