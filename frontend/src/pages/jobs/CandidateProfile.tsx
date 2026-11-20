import { useNavigate, useParams } from 'react-router'
import { Alert } from '../../components/Alert'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { LEVELS } from '../profile/format'
import { TimelineSection } from '../profile/TimelineSection'
import { useCandidate } from './useCandidate'
import styles from './jobs.module.css'

/** RF-24: perfil do candidato em modo somente leitura, com e-mail e impressão do currículo (RF-26). */
export function CandidateProfile() {
  const { id = '', userId = '' } = useParams()
  const navigate = useNavigate()
  const { profile, failed, photo } = useCandidate(id, userId)

  if (failed) return <Alert tone="danger" title="Perfil não disponível" />
  if (!profile) return <Skeleton height="20rem" />

  const name = `${profile.firstName} ${profile.lastName}`
  const empty = 'Nada informado.'

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.person}>
          <Avatar name={name} size="lg" src={photo} />
          <div className={styles.personText}>
            <h1>{name}</h1>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          </div>
        </div>
        <div className={styles.actions} style={{ marginTop: 'var(--space-5)' }}>
          <Button onClick={() => window.open(`/vagas/${id}/candidatos/${userId}/curriculo`, '_blank', 'noopener')}>Imprimir currículo</Button>
          <Button variant="ghost" onClick={() => navigate(`/vagas/${id}`)}>
            Voltar à vaga
          </Button>
        </div>
      </Card>

      <TimelineSection
        readOnly
        title="Ocupações"
        itemName="ocupação"
        emptyText={empty}
        items={profile.occupations}
        view={(o) => ({ title: o.title, subtitle: o.company, description: o.description })}
      />
      <TimelineSection
        readOnly
        title="Formações"
        itemName="formação"
        emptyText={empty}
        items={profile.educations}
        view={(e) => ({ title: e.course, subtitle: `${LEVELS[e.level]} · ${e.institution}`, description: e.description })}
      />
      <TimelineSection
        readOnly
        title="Cursos"
        itemName="curso"
        emptyText={empty}
        items={profile.courses}
        view={(c) => ({ title: c.name, subtitle: `${c.institution} · ${c.hours} ${c.hours === 1 ? 'hora' : 'horas'}` })}
      />
    </div>
  )
}
