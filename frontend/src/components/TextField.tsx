import { useId, type InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  help?: string
  error?: string
}

export function TextField({ label, help, error, id, ...rest }: TextFieldProps) {
  const auto = useId()
  const inputId = id ?? auto
  const noteId = `${inputId}-note`
  const note = error ?? help
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
      />
      {note && (
        <span id={noteId} className={error ? styles.error : styles.help} role={error ? 'alert' : undefined}>
          {note}
        </span>
      )}
    </div>
  )
}
