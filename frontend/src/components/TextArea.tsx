import { useId, type ComponentPropsWithRef } from 'react'
import styles from './TextField.module.css'

interface TextAreaProps extends ComponentPropsWithRef<'textarea'> {
  label: string
  help?: string
  error?: string
}

export function TextArea({ label, help, error, id, rows = 4, ...rest }: TextAreaProps) {
  const auto = useId()
  const inputId = id ?? auto
  const noteId = `${inputId}-note`
  const note = error ?? help
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <textarea
        {...rest}
        id={inputId}
        rows={rows}
        className={`${styles.input} ${styles.textarea}`}
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
