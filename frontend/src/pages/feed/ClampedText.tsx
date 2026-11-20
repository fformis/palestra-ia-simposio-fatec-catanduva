import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './feed.module.css'

/** RF-15: mostra até 3 linhas; se o conteúdo for cortado, oferece "ver mais"/"ver menos". */
export function ClampedText({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [clipped, setClipped] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const measure = () => setClipped(el.scrollHeight > el.clientHeight + 1)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, children])

  return (
    <div>
      <div ref={ref} className={expanded ? undefined : styles.clamp}>
        {children}
      </div>
      {(clipped || expanded) && (
        <button type="button" className={styles.toggle} aria-expanded={expanded} onClick={() => setExpanded((x) => !x)}>
          {expanded ? 'ver menos' : 'ver mais'}
        </button>
      )}
    </div>
  )
}
