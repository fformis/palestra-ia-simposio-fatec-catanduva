import { Outlet } from 'react-router'
import { ThemeToggle } from '../theme/ThemeToggle'
import styles from './PublicLayout.module.css'

export function PublicLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">P</span>
          Palestra
        </span>
        <ThemeToggle />
      </header>
      <main className={`${styles.main} enter`}>
        <Outlet />
      </main>
    </div>
  )
}
