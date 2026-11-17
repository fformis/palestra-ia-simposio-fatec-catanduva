import styles from './pages.module.css'

export function Home() {
  return (
    <div className={styles.page}>
      <h1 className="enter">Palestra IA — Simpósio FATEC Catanduva</h1>
      <p className={`${styles.lead} enter`} style={{ '--i': 1 } as React.CSSProperties}>
        Bem-vindo! Esta é a base visual do app: temas claro e escuro, menu lateral e componentes padronizados.
      </p>
    </div>
  )
}
