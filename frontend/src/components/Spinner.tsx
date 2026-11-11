import styles from './Spinner.module.css'

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return <span role="status" aria-label={label} className={styles.spinner} />
}
