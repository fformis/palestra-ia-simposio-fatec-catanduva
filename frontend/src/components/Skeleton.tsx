import styles from './Skeleton.module.css'

export function Skeleton({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <span aria-hidden="true" className={styles.skeleton} style={{ width, height }} />
}
