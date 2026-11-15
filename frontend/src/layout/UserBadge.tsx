import { useState } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../auth/authContext'
import { initialsOf } from '../components/helpers'
import { profileService } from '../services/profileService'
import type { AuthUser } from '../services/authTypes'
import styles from './Sidebar.module.css'

/** Usuário logado no topo do menu; leva ao perfil (spec 004, RF-01). */
export function UserBadge({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const fullName = `${user.firstName} ${user.lastName}`
  const { photoVersion } = useAuth()
  // Versão cuja imagem falhou: uma nova versão volta a tentar carregar a foto.
  const [failedVersion, setFailedVersion] = useState<string | null>(null)
  return (
    <NavLink to="/perfil" className={styles.user} title={fullName} aria-label={`Abrir perfil de ${fullName}`} onClick={onNavigate}>
      {photoVersion && failedVersion !== photoVersion ? (
        <img className={styles.avatar} src={profileService.photoUrl(photoVersion)} alt="" onError={() => setFailedVersion(photoVersion)} />
      ) : (
        <span className={styles.avatar} aria-hidden="true">
          {initialsOf(fullName)}
        </span>
      )}
      <span className={styles.userName}>{fullName}</span>
    </NavLink>
  )
}
