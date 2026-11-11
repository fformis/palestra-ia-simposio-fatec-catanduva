import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { Header, MENU_BUTTON_ID } from './Header'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

const KEY = 'sidebar-collapsed'
const MENU_ID = 'sidebar'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const close = useCallback(() => {
    setOpen((was) => {
      if (was) document.getElementById(MENU_BUTTON_ID)?.focus()
      return false
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(KEY, String(!c))
      } catch {
        /* sem persistência */
      }
      return !c
    })

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      <Sidebar id={MENU_ID} open={open} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} onClose={close} />
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} data-testid="backdrop" onClick={close} />
      <div className={styles.main}>
        <Header menuId={MENU_ID} menuOpen={open} onOpenMenu={() => setOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
