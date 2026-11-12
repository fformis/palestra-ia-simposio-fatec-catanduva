import { useState } from 'react'
import { Alert } from '../components/Alert'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { MonthYearField } from '../components/MonthYearField'
import { Select } from '../components/Select'
import { Skeleton } from '../components/Skeleton'
import { Spinner } from '../components/Spinner'
import { TextArea } from '../components/TextArea'
import { TextField } from '../components/TextField'
import { useTheme } from '../theme/themeContext'
import styles from './pages.module.css'

const colors = [
  ['Primária', '--color-primary'],
  ['Secundária', '--color-secondary'],
  ['Fundo', '--color-bg'],
  ['Superfície', '--color-surface'],
  ['Texto', '--color-text'],
  ['Texto secundário', '--color-text-muted'],
  ['Borda', '--color-border'],
  ['Sucesso', '--color-success'],
  ['Alerta', '--color-warning'],
  ['Erro', '--color-danger'],
  ['Informação', '--color-info'],
]
const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']
const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12]
const radii = ['sm', 'md', 'lg', 'full']
const shadows = ['sm', 'md', 'lg']
const durations = [
  ['Rápida', '--dur-fast', '150 ms'],
  ['Média', '--dur-base', '300 ms'],
  ['Lenta', '--dur-slow', '600 ms'],
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `sec-${title.toLowerCase().replace(/\W+/g, '-')}`
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

export function DesignSystem() {
  const { resolved } = useTheme()
  const [replay, setReplay] = useState(0)
  const [month, setMonth] = useState('')
  return (
    <div className={styles.page}>
      <div>
        <h1 className="enter">Design System</h1>
        <p className={styles.muted}>
          Referência viva. Tema atual: <Badge tone="info">{resolved === 'dark' ? 'Escuro' : 'Claro'}</Badge>
        </p>
      </div>

      <Section title="Paleta">
        <div className={styles.grid}>
          {colors.map(([name, v]) => (
            <div key={v} className={styles.swatch}>
              <div className={styles.chip} style={{ background: `var(${v})` }} />
              <span className={styles.swatchName}>{name}</span>
              <span className={styles.swatchVar}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        {sizes.map((s) => (
          <p key={s} style={{ fontSize: `var(--text-${s})` }}>
            <code>--text-{s}</code> — Aa Bb Cc Português
          </p>
        ))}
      </Section>

      <Section title="Espaçamento, raios e sombras">
        <div className={styles.stack}>
          {spaces.map((n) => (
            <div key={n} className={styles.row}>
              <code style={{ width: '5rem' }}>--space-{n}</code>
              <div className={styles.bar} style={{ width: `var(--space-${n})` }} />
            </div>
          ))}
        </div>
        <div className={styles.grid}>
          {radii.map((r) => (
            <div key={r} className={styles.box} style={{ borderRadius: `var(--radius-${r})` }}>
              radius-{r}
            </div>
          ))}
          {shadows.map((s) => (
            <div key={s} className={styles.box} style={{ boxShadow: `var(--shadow-${s})`, borderRadius: 'var(--radius-md)' }}>
              shadow-{s}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Componentes">
        <div className={styles.row}>
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Desabilitado</Button>
          <Button loading>Carregando</Button>
        </div>
        <div className={styles.row}>
          <Badge>Neutro</Badge>
          <Badge tone="success">Sucesso</Badge>
          <Badge tone="warning">Alerta</Badge>
          <Badge tone="danger">Erro</Badge>
          <Badge tone="info">Info</Badge>
        </div>
        <div className={styles.stack}>
          <TextField label="Nome" placeholder="Seu nome" help="Como devemos chamar você." />
          <TextField label="E-mail" defaultValue="invalido" error="Informe um e-mail válido." />
          <TextArea label="Bio" placeholder="Fale sobre você" help="Texto livre, com várias linhas." />
          <Select label="Nível" defaultValue="">
            <option value="">Selecione</option>
            <option value="superior">Superior</option>
            <option value="mestrado">Mestrado</option>
          </Select>
          <MonthYearField label="Início" value={month} onChange={setMonth} help={month ? `Valor: ${month}` : 'Escolha mês e ano.'} />
          <div className={styles.row}>
            <Avatar name="Ana Silva" />
            <Avatar name="Ana Silva" size="lg" />
          </div>
          <Alert tone="success" title="Tudo certo">Alteração salva.</Alert>
          <Alert tone="warning" title="Atenção">Revise os dados antes de continuar.</Alert>
          <Alert tone="danger" title="Erro">Não foi possível concluir.</Alert>
          <Alert tone="info" title="Informação">Novidades em breve.</Alert>
        </div>
        <Card>
          <h3>Cartão</h3>
          <p className={styles.muted}>Passe o mouse para ver elevação e brilho.</p>
        </Card>
      </Section>

      <Section title="Animações">
        <div className={styles.grid}>
          {durations.map(([name, v, ms]) => (
            <div key={v} className={styles.demo} style={{ transition: `transform var(${v}) var(--ease-out)` }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}>
              {name} ({ms})
            </div>
          ))}
        </div>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setReplay((n) => n + 1)}>Repetir entrada em cascata</Button>
        </div>
        <div key={replay} className={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${styles.demo} enter`} style={{ '--i': i } as React.CSSProperties}>
              Item {i + 1}
            </div>
          ))}
        </div>
        <div className={styles.grid}>
          <div className={`${styles.demo} ${styles.gradient}`}>Brilho / gradiente</div>
          <div className={styles.demo}>
            <span className={styles.spin}><Spinner /> Indicador giratório</span>
          </div>
          <div className={styles.demo}>
            <div style={{ width: '100%', display: 'grid', gap: 'var(--space-2)' }}>
              <Skeleton height="0.9rem" />
              <Skeleton width="60%" height="0.9rem" />
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
