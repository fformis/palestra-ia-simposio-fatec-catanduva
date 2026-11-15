import { NavLink, useLocation } from 'react-router'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/authContext'
import { ChevronIcon, CloseIcon, LogoutIcon } from '../components/icons'
import { navItems } from './navItems'
import { UserBadge } from './UserBadge'
import styles from './Sidebar.module.css'

interface SidebarProps {
  id: string
  open: boolean
  collapsed: boolean
  onToggleCollapsed: () => void
  onClose: () => void
}

export function Sidebar({ id, open, collapsed, onToggleCollapsed, onClose }: SidebarProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = async () => {
    await logout()
    navigate('/entrar', { replace: true })
  }
  const activeIndex = navItems.findIndex((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)))
  const cls = [styles.sidebar, open && styles.open, collapsed && styles.collapsed].filter(Boolean).join(' ')

  return (
    <aside id={id} className={cls}>
      <div className={styles.top}>
        <div className={styles.brand}>
          {/* Placeholder de logotipo: substituir por marca definitiva. */}
          <span className={styles.logo} aria-hidden="true">P</span>
          <span className={styles.brandName}>Palestra IA</span>
        </div>
        <button type="button" className={styles.closeBtn} aria-label="Fechar menu" onClick={onClose}>
          <CloseIcon />
        </button>
        <button
          type="button"
          className={styles.collapseBtn}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-pressed={collapsed}
          onClick={onToggleCollapsed}
        >
          <span className={styles.chevron}>
            <ChevronIcon />
          </span>
        </button>
      </div>

      {user && <UserBadge user={user} onNavigate={onClose} />}

      <nav aria-label="Principal" className={styles.nav}>
        <ul className={styles.list} style={{ '--active-index': Math.max(activeIndex, 0) } as React.CSSProperties}>
          {activeIndex >= 0 && <li aria-hidden="true" className={styles.indicator} />}
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={styles.link} onClick={onClose} title={collapsed ? label : undefined}>
                <Icon />
                <span className={styles.label}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className={styles.logoutBtn} onClick={signOut} title={collapsed ? 'Sair' : undefined}>
        <LogoutIcon />
        <span className={styles.label}>Sair</span>
      </button>
    </aside>
  )
}
