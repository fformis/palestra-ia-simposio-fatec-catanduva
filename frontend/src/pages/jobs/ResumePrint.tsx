import { useEffect } from 'react'
import { useParams } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { formatPeriod, LEVELS } from '../profile/format'
import { useCandidate } from './useCandidate'
import styles from './resume.module.css'

interface Entry {
  key: string
  title: string
  subtitle: string
  period: string
  description?: string | null
}

function Section({ title, entries }: { title: string; entries: Entry[] }) {
  if (entries.length === 0) return null
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <ol className={styles.entries}>
        {entries.map((e) => (
          <li key={e.key}>
            <div className={styles.entryHead}>
              <strong>{e.title}</strong>
              <span className={styles.period}>{e.period}</span>
            </div>
            <div className={styles.sub}>{e.subtitle}</div>
            {e.description && <p className={styles.desc}>{e.description}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * RF-26/RF-27: currículo do candidato para impressão (A4, tema claro, sem menu e sem citar a vaga).
 * Abre o diálogo de impressão ao carregar; o PDF é gerado por "Salvar como PDF".
 */
export function ResumePrint() {
  const { id = '', userId = '' } = useParams()
  const { profile, failed, photo } = useCandidate(id, userId)

  useEffect(() => {
    if (profile) window.print()
  }, [profile])

  if (failed) return <p className={styles.sheet}>Currículo não disponível.</p>
  if (!profile) return <p className={styles.sheet}>Carregando…</p>

  const name = `${profile.firstName} ${profile.lastName}`

  return (
    <main className={styles.sheet} data-theme="light">
      <button type="button" className={styles.printButton} onClick={() => window.print()}>
        Imprimir / salvar PDF
      </button>
      <header className={styles.head}>
        <Avatar name={name} size="lg" src={photo} />
        <div>
          <h1>{name}</h1>
          <p className={styles.email}>{profile.email}</p>
        </div>
      </header>
      {profile.bio && (
        <section className={styles.section}>
          <h2>Sobre</h2>
          <p className={styles.desc}>{profile.bio}</p>
        </section>
      )}
      <Section
        title="Ocupações"
        entries={profile.occupations.map((o) => ({ key: o.id, title: o.title, subtitle: o.company, period: formatPeriod(o.start, o.end), description: o.description }))}
      />
      <Section
        title="Formações"
        entries={profile.educations.map((e) => ({
          key: e.id,
          title: e.course,
          subtitle: `${LEVELS[e.level]} · ${e.institution}`,
          period: formatPeriod(e.start, e.end),
          description: e.description,
        }))}
      />
      <Section
        title="Cursos"
        entries={profile.courses.map((c) => ({
          key: c.id,
          title: c.name,
          subtitle: `${c.institution} · ${c.hours} ${c.hours === 1 ? 'hora' : 'horas'}`,
          period: formatPeriod(c.start, c.end),
        }))}
      />
    </main>
  )
}
