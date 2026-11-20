import { Link } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { jobService } from '../../services/jobService'
import type { Engagement, Job } from '../../services/jobTypes'
import { JobActions } from '../jobs/JobActions'
import { RichText } from '../jobs/RichText'
import { CONTRACTS, formatDate, formatSalary } from '../jobs/format'
import { ClampedText } from './ClampedText'
import styles from './feed.module.css'

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

interface JobCardProps {
  job: Job
  onChange: (id: string, engagement: Engagement) => void
}

/** RF-11 a RF-21: card da vaga no feed — cabeçalho, imagem opcional, descrição resumida e ações. */
export function JobCard({ job, onChange }: JobCardProps) {
  const owner = `${job.owner.firstName} ${job.owner.lastName}`.trim()

  return (
    <Card className={styles.card}>
      <article aria-labelledby={`vaga-${job.id}`} className={styles.article}>
        <header className={styles.head}>
          <Avatar name={owner} src={job.owner.photoVersion ? jobService.ownerPhotoUrl(job.id, job.owner.photoVersion) : null} />
          <div className={styles.who}>
            <span className={styles.owner}>{owner}</span>
            <span className={styles.date}>{formatDate(job.createdAt)}</span>
          </div>
          {job.status === 'inactive' && <Badge tone="warning">Inativa</Badge>}
        </header>

        <div className={styles.title}>
          <h2 id={`vaga-${job.id}`}>
            <Link to={`/vagas/${job.id}`}>{job.title}</Link>
          </h2>
          {job.company && <p className={styles.company}>{job.company}</p>}
        </div>

        {job.imageVersion && (
          <img className={styles.image} src={jobService.imageUrl(job.id, job.imageVersion)} alt={`Imagem da vaga ${job.title}`} loading="lazy" />
        )}

        <ClampedText>
          <RichText text={job.description} />
        </ClampedText>

        <p className={styles.facts}>
          <Badge tone="info">{CONTRACTS[job.contractType]}</Badge>
          <span className={styles.salary}>{formatSalary(job.salary)}</span>
        </p>

        <p className={styles.stats}>
          <span>{plural(job.likes, 'curtida', 'curtidas')}</span>
          <span>{plural(job.candidates, 'candidato', 'candidatos')}</span>
        </p>

        {!job.isOwner && <JobActions job={job} onChange={(e) => onChange(job.id, e)} />}
      </article>
    </Card>
  )
}
