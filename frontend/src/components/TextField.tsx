import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  help?: string
  error?: string
  /** Elemento posicionado à direita, dentro do campo (ex.: botão exibir/ocultar). */
  adornment?: ReactNode
}

export function TextField({ label, help, error, adornment, id, ...rest }: TextFieldProps) {
  const auto = useId()
  const inputId = id ?? auto
  const noteId = `${inputId}-note`
  const note = error ?? help
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          {...rest}
          id={inputId}
          className={adornment ? `${styles.input} ${styles.withAdornment}` : styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
        />
        {adornment && <span className={styles.adornment}>{adornment}</span>}
      </div>
      {note && (
        <span id={noteId} className={error ? styles.error : styles.help} role={error ? 'alert' : undefined}>
          {note}
        </span>
      )}
    </div>
  )
}
