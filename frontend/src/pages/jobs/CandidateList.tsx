import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/Alert'
import { Avatar } from '../../components/Avatar'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { jobService } from '../../services/jobService'
import type { Candidate } from '../../services/jobTypes'
import { formatDate } from './format'
import styles from './jobs.module.css'

/** RF-22/RF-23: lista de candidatos (só o anunciante a vê), já em ordem alfabética. */
export function CandidateList({ jobId }: { jobId: string }) {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    jobService
      .candidates(jobId)
      .then((c) => active && setCandidates(c))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [jobId])

  return (
    <Card className={styles.card}>
      <section aria-labelledby="candidatos">
        <div className={styles.sectionHead}>
          <h2 id="candidatos">Candidatos</h2>
        </div>
        {failed && <Alert tone="danger" title="Não foi possível carregar os candidatos" />}
        {!failed && !candidates && <Skeleton height="3rem" />}
        {candidates?.length === 0 && <p className={styles.empty}>Nenhum candidato ainda.</p>}
        {candidates && candidates.length > 0 && (
          <ul className={styles.candidates}>
            {candidates.map((c) => {
              const name = `${c.firstName} ${c.lastName}`
              return (
                <li key={c.userId}>
                  <Link className={styles.candidate} to={`/vagas/${jobId}/candidatos/${c.userId}`} aria-label={`Abrir perfil de ${name}`}>
                    <Avatar name={name} src={c.photoVersion ? jobService.candidatePhotoUrl(jobId, c.userId, c.photoVersion) : null} />
                    <span className={styles.candidateText}>
                      <strong>{name}</strong>
                      <span>{c.email}</span>
                      <span>Candidatou-se em {formatDate(c.appliedAt)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </Card>
  )
}
