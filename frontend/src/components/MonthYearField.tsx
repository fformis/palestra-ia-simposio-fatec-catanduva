import { useId, useState } from 'react'
import { THIS_YEAR } from './helpers'
import styles from './TextField.module.css'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MIN_YEAR = 1950

interface MonthYearFieldProps {
  label: string
  /** "AAAA-MM" ou vazio. */
  value: string
  onChange: (value: string) => void
  /** Último ano oferecido (padrão: ano atual). */
  maxYear?: number
  help?: string
  error?: string
}

/** Campo mês/ano com dois seletores; só emite valor quando mês e ano estão escolhidos (senão, vazio). */
export function MonthYearField({ label, value, onChange, maxYear = THIS_YEAR, help, error }: MonthYearFieldProps) {
  const id = useId()
  const [year, setYear] = useState(value.slice(0, 4))
  const [month, setMonth] = useState(value.slice(5, 7))
  const note = error ?? help
  const noteId = `${id}-note`

  const update = (nextMonth: string, nextYear: string) => {
    setMonth(nextMonth)
    setYear(nextYear)
    onChange(nextMonth && nextYear ? `${nextYear}-${nextMonth}` : '')
  }

  const years = Array.from({ length: maxYear - MIN_YEAR + 1 }, (_, i) => String(maxYear - i))
  const common = { className: styles.input, 'aria-invalid': error ? (true as const) : undefined, 'aria-describedby': note ? noteId : undefined }

  return (
    <fieldset className={`${styles.field} ${styles.group}`}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.pair}>
        <select {...common} aria-label={`${label}: mês`} value={month} onChange={(e) => update(e.target.value, year)}>
          <option value="">Mês</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, '0')}>
              {name}
            </option>
          ))}
        </select>
        <select {...common} aria-label={`${label}: ano`} value={year} onChange={(e) => update(month, e.target.value)}>
          <option value="">Ano</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {note && (
        <span id={noteId} className={error ? styles.error : styles.help} role={error ? 'alert' : undefined}>
          {note}
        </span>
      )}
    </fieldset>
  )
}
