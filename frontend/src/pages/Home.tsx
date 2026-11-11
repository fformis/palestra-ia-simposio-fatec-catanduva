import { Link } from 'react-router'
import { Card } from '../components/Card'
import styles from './pages.module.css'

export function Home() {
  return (
    <div className={styles.page}>
      <h1 className="enter">Palestra IA — Simpósio FATEC Catanduva</h1>
      <p className={`${styles.lead} enter`} style={{ '--i': 1 } as React.CSSProperties}>
        Bem-vindo! Esta é a base visual do app: temas claro e escuro, menu lateral e componentes padronizados.
      </p>
      <div className="enter" style={{ '--i': 2 } as React.CSSProperties}>
        <Card>
          <h2>Design System</h2>
          <p className={styles.muted}>Paleta, tipografia, componentes e animações nos dois temas.</p>
          <Link to="/design-system" className={styles.cardLink}>
            Abrir catálogo →
          </Link>
        </Card>
      </div>
    </div>
  )
}
