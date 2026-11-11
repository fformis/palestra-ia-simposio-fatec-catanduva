import { MenuIcon } from '../components/icons'
import { ThemeToggle } from '../theme/ThemeToggle'
import styles from './Header.module.css'

interface HeaderProps {
  menuId: string
  menuOpen: boolean
  onOpenMenu: () => void
}

export const MENU_BUTTON_ID = 'menu-button'

export function Header({ menuId, menuOpen, onOpenMenu }: HeaderProps) {
  return (
    <header className={styles.header}>
      <button
        id={MENU_BUTTON_ID}
        type="button"
        className={styles.menuBtn}
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={onOpenMenu}
      >
        <MenuIcon />
      </button>
      <div className={styles.right}>
        <ThemeToggle />
      </div>
    </header>
  )
}
