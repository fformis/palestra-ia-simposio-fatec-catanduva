import { initialsOf } from './helpers'
import styles from './Avatar.module.css'

interface AvatarProps {
  /** Nome completo: gera as iniciais e o texto alternativo da foto. */
  name: string
  /** URL da foto; sem ela, mostram-se as iniciais. */
  src?: string | null
  size?: 'md' | 'lg'
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const cls = `${styles.avatar} ${styles[size]}`
  return src ? (
    <img className={cls} src={src} alt={`Foto de ${name}`} />
  ) : (
    <span className={cls} role="img" aria-label={`Iniciais de ${name}`}>
      {initialsOf(name)}
    </span>
  )
}
