import { useRef, type KeyboardEvent } from 'react'
import styles from './SegmentedSwitch.module.css'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedSwitchProps<T extends string> {
  /** Nome acessível do grupo. */
  label: string
  /** Duas (ou mais) opções, da esquerda para a direita. */
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** Seletor de opções exclusivas (radiogroup): clique ou setas trocam a opção (spec 010, RF-03, RNF-05). */
export function SegmentedSwitch<T extends string>({ label, options, value, onChange }: SegmentedSwitchProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className={styles.switch} role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const checked = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={`${styles.option} ${checked ? styles.checked : ''}`}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
