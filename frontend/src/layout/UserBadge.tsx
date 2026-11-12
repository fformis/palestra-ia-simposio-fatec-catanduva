import { NavLink } from 'react-router'
import { initialsOf } from '../components/helpers'
import type { AuthUser } from '../services/authTypes'
import styles from './Sidebar.module.css'

/** Usuário logado no topo do menu; leva ao perfil (spec 004, RF-01). */
export function UserBadge({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const fullName = `${user.firstName} ${user.lastName}`
  return (
    <NavLink to="/perfil" className={styles.user} title={fullName} aria-label={`Abrir perfil de ${fullName}`} onClick={onNavigate}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(fullName)}
      </span>
      <span className={styles.userName}>{fullName}</span>
    </NavLink>
  )
}
