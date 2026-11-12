import type { AuthUser } from '../services/authTypes'
import styles from './Sidebar.module.css'

export function UserBadge({ user }: { user: AuthUser }) {
  const fullName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
  return (
    <div className={styles.user} title={fullName} aria-label={`Usuário: ${fullName}`} role="group">
      <span className={styles.avatar} aria-hidden="true">
        {initials}
      </span>
      <span className={styles.userName}>{fullName}</span>
    </div>
  )
}
