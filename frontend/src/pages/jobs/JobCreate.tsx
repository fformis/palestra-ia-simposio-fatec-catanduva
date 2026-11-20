import { useNavigate } from 'react-router'
import { Card } from '../../components/Card'
import { JobForm } from './JobForm'
import styles from './jobs.module.css'

/** RF-01/RF-06: criação da vaga; ao salvar, leva à página da vaga com aviso de sucesso. */
export function JobCreate() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <div>
        <h1>Criar vaga</h1>
        <p className={styles.lead}>Anuncie uma oportunidade com as informações que importam ao candidato.</p>
      </div>
      <Card className={styles.card}>
        <JobForm
          submitLabel="Criar vaga"
          onSaved={(job, warning) => navigate(`/vagas/${job.id}`, { state: { notice: warning ?? 'Vaga criada com sucesso.' } })}
        />
      </Card>
    </div>
  )
}
