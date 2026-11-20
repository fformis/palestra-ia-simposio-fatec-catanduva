import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Alert } from '../../components/Alert'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { PencilIcon } from '../../components/icons'
import { Skeleton } from '../../components/Skeleton'
import { jobService } from '../../services/jobService'
import type { Job, JobInput } from '../../services/jobTypes'
import { CandidateList } from './CandidateList'
import { JobActions } from './JobActions'
import { BENEFITS, CONTRACTS, formatDate, formatSalary } from './format'
import { RichText } from './RichText'
import styles from './jobs.module.css'

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** RF-11: página da vaga, com curtir/candidatar-se (RF-12 a RF-21, em JobActions) e a gestão do anunciante (RF-08 a RF-10, RF-22). */
export function JobPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [missing, setMissing] = useState(false)
  const [notice, setNotice] = useState<string | null>((location.state as { notice?: string } | null)?.notice ?? null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    jobService
      .get(id)
      .then((j) => active && setJob(j))
      .catch(() => active && setMissing(true))
    return () => {
      active = false
    }
  }, [id])

  if (missing) return <Alert tone="danger" title="Vaga não encontrada" />
  if (!job) return <Skeleton height="24rem" />

  /** Executa uma ação e mescla a resposta na vaga exibida, sem recarregar a página. */
  /** Ações do anunciante (ativar/inativar); curtir e candidatar-se ficam em JobActions. */
  const act = async (name: string, action: () => Promise<Job>, message: string) => {
    setBusy(name)
    setError(false)
    setNotice(null)
    try {
      setJob(await action())
      setNotice(message)
    } catch {
      setError(true)
    } finally {
      setBusy(null)
    }
  }

  const input = (j: Job): JobInput => ({
    title: j.title,
    company: j.company,
    description: j.description,
    benefits: j.benefits,
    contractType: j.contractType,
    salary: j.salary,
    status: j.status,
  })

  const toggleStatus = () => {
    const status = job.status === 'active' ? 'inactive' : 'active'
    void act('status', () => jobService.update(job.id, { ...input(job), status }), status === 'active' ? 'Vaga ativada.' : 'Vaga inativada.')
  }

  return (
    <div className={styles.page}>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <Card className={styles.card}>
        <article className={styles.header}>
          <img
            className={styles.cover}
            src={job.imageVersion ? jobService.imageUrl(job.id, job.imageVersion) : '/vaga-padrao.svg'}
            alt={job.imageVersion ? `Imagem da vaga ${job.title}` : ''}
          />
          <div className={styles.badges}>
            <Badge tone="info">{CONTRACTS[job.contractType]}</Badge>
            {job.status === 'inactive' && <Badge tone="warning">Inativa</Badge>}
          </div>
          <h1>{job.title}</h1>
          <p className={styles.meta}>
            {job.company && <span>{job.company}</span>}
            <span>
              Anunciada por {job.owner.firstName} {job.owner.lastName}
            </span>
            <span>Criada em {formatDate(job.createdAt)}</span>
          </p>
          <p className={styles.salary}>{formatSalary(job.salary)}</p>

          {job.benefits.length > 0 && (
            <ul className={styles.badges} aria-label="Benefícios" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {job.benefits.map((b) => (
                <li key={b}>
                  <Badge tone="success">{BENEFITS[b]}</Badge>
                </li>
              ))}
            </ul>
          )}

          <RichText text={job.description} />

          <p className={styles.stats}>
            <span>{plural(job.likes, 'curtida', 'curtidas')}</span>
            <span>{plural(job.candidates, 'candidato', 'candidatos')}</span>
          </p>

          {job.isOwner ? (
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => navigate(`/vagas/${job.id}/editar`)}>
                <PencilIcon /> Editar
              </Button>
              <Button variant="ghost" loading={busy === 'status'} onClick={toggleStatus}>
                {job.status === 'active' ? 'Inativar' : 'Ativar'}
              </Button>
            </div>
          ) : (
            <JobActions job={job} onChange={(e) => setJob((j) => (j ? { ...j, ...e } : j))} />
          )}

          {error && (
            <Alert tone="danger" title="Não foi possível concluir">
              Tente novamente em instantes.
            </Alert>
          )}
        </article>
      </Card>

      {job.isOwner && (
        <CandidateList jobId={job.id} />
      )}
    </div>
  )
}
