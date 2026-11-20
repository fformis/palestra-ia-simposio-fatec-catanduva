import { useState } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { ApiError } from '../../services/api'
import { jobService } from '../../services/jobService'
import type { Engagement, Job } from '../../services/jobTypes'
import styles from './jobs.module.css'

interface JobActionsProps {
  job: Job
  /** Recebe as contagens e o estado atualizados após curtir, candidatar-se ou desistir. */
  onChange: (engagement: Engagement) => void
}

/**
 * Curtir/descurtir (spec 009, RF-12 a RF-14) e candidatar-se/desistir com confirmação (RF-15 a RF-21).
 * Usado na página da vaga e no card do feed (spec 010, RF-17 a RF-19). Não é exibido ao anunciante.
 */
export function JobActions({ job, onChange }: JobActionsProps) {
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<'profile_incomplete' | 'generic' | null>(null)
  const [confirming, setConfirming] = useState<'apply' | 'withdraw' | null>(null)
  const [busy, setBusy] = useState<'like' | 'apply' | null>(null)

  const act = async (name: 'like' | 'apply', action: () => Promise<Engagement>, message?: string) => {
    setBusy(name)
    setError(null)
    setNotice(null)
    try {
      onChange(await action())
      if (message) setNotice(message)
    } catch (e) {
      setError(e instanceof ApiError && e.code === 'profile_incomplete' ? 'profile_incomplete' : 'generic')
    } finally {
      setConfirming(null)
      setBusy(null)
    }
  }

  return (
    <>
      <div className={styles.actions}>
        <Button
          variant={job.likedByMe ? 'primary' : 'secondary'}
          aria-pressed={job.likedByMe}
          aria-label={job.likedByMe ? 'Descurtir' : 'Curtir'}
          loading={busy === 'like'}
          onClick={() => act('like', () => (job.likedByMe ? jobService.unlike(job.id) : jobService.like(job.id)))}
        >
          {job.likedByMe ? '♥ Curtida' : '♡ Curtir'}
        </Button>
        {!confirming && (
          <Button
            variant={job.appliedByMe ? 'ghost' : 'primary'}
            onClick={() => {
              setError(null)
              setNotice(null)
              setConfirming(job.appliedByMe ? 'withdraw' : 'apply')
            }}
          >
            {job.appliedByMe ? 'Desistir' : 'Candidatar-se'}
          </Button>
        )}
      </div>

      {confirming && (
        <div className={styles.confirm} role="group" aria-label={confirming === 'apply' ? 'Confirmar candidatura' : 'Confirmar desistência'}>
          <p>
            {confirming === 'apply'
              ? 'Ao se candidatar, seu perfil e seu e-mail ficarão visíveis ao anunciante desta vaga.'
              : 'Desistir da candidatura? Você sai da lista de candidatos e o anunciante deixa de ver seu perfil.'}
          </p>
          <div className={styles.actions}>
            <Button
              loading={busy === 'apply'}
              onClick={() =>
                act(
                  'apply',
                  () => (confirming === 'apply' ? jobService.apply(job.id) : jobService.withdraw(job.id)),
                  confirming === 'apply' ? 'Candidatura enviada.' : 'Você desistiu da candidatura.',
                )
              }
            >
              {confirming === 'apply' ? 'Confirmar candidatura' : 'Confirmar desistência'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      {error === 'profile_incomplete' && (
        <Alert tone="warning" title="Complete seu perfil para se candidatar">
          Adicione ao menos uma ocupação ou uma formação no <Link to="/perfil">seu perfil</Link>.
        </Alert>
      )}
      {error === 'generic' && (
        <Alert tone="danger" title="Não foi possível concluir">
          Tente novamente em instantes.
        </Alert>
      )}
    </>
  )
}
