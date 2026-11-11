import { useRef, type KeyboardEvent, type MouseEvent, type ReactElement } from 'react'
import { MonitorIcon, MoonIcon, SunIcon } from '../components/icons'
import { useTheme } from './themeContext'
import type { ThemePreference } from './theme'
import styles from './ThemeToggle.module.css'

const options: { value: ThemePreference; label: string; icon: () => ReactElement }[] = [
  { value: 'system', label: 'Sistema', icon: MonitorIcon },
  { value: 'light', label: 'Claro', icon: SunIcon },
  { value: 'dark', label: 'Escuro', icon: MoonIcon },
]

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const choose = (value: ThemePreference, e: { clientX: number; clientY: number; currentTarget: Element }) => {
    const r = e.currentTarget.getBoundingClientRect()
    const origin = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    setPreference(value, origin)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + options.length) % options.length
    refs.current[next]?.focus()
    setPreference(options[next].value)
  }

  return (
    <div role="radiogroup" aria-label="Tema" className={styles.group}>
      {options.map(({ value, label, icon: Icon }, i) => (
        <button
          key={value}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={preference === value}
          aria-label={label}
          title={label}
          tabIndex={preference === value ? 0 : -1}
          className={styles.option}
          onClick={(e: MouseEvent<HTMLButtonElement>) => choose(value, e)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
