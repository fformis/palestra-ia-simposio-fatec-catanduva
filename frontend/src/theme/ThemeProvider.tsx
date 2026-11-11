import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyTheme,
  readPreference,
  resolveTheme,
  savePreference,
  systemQuery,
  type ResolvedTheme,
  type ThemePreference,
} from './theme'
import { ThemeContext } from './themeContext'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPref] = useState<ThemePreference>(readPreference)
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readPreference()))

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Em "Sistema", acompanha mudanças do SO sem recarregar (RF-02).
  useEffect(() => {
    if (preference !== 'system') return
    const mq = systemQuery()
    const onChange = () => setResolved(resolveTheme('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((p: ThemePreference, origin?: { x: number; y: number }) => {
    const next = resolveTheme(p)
    const commit = () => {
      savePreference(p)
      setPref(p)
      setResolved(next)
      applyTheme(next)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    if (!document.startViewTransition || reduce || !origin || next === root.dataset.theme) {
      commit()
      return
    }
    // Revelação circular a partir do seletor, quando suportado.
    const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y))
    const transition = document.startViewTransition(commit)
    transition.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0 at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        ),
      )
      .catch(() => {})
  }, [])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
