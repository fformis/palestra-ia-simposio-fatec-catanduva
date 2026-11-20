import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Alert } from '../../components/Alert'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { jobService } from '../../services/jobService'
import type { Job } from '../../services/jobTypes'
import { JobForm } from './JobForm'
import styles from './jobs.module.css'

/** RF-08: edição da vaga pelo anunciante. */
export function JobEdit() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    jobService
      .get(id)
      .then((j) => active && setJob(j))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [id])

  if (failed || (job && !job.isOwner)) return <Alert tone="danger" title="Vaga não encontrada" />
  if (!job) return <Skeleton height="20rem" />

  return (
    <div className={styles.page}>
      <h1>Editar vaga</h1>
      <Card className={styles.card}>
        <JobForm
          job={job}
          submitLabel="Salvar alterações"
          onSaved={(saved, warning) => navigate(`/vagas/${saved.id}`, { state: { notice: warning ?? 'Vaga atualizada.' } })}
          onCancel={() => navigate(`/vagas/${job.id}`)}
        />
      </Card>
    </div>
  )
}
