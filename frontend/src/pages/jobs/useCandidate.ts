import { useEffect, useState } from 'react'
import { jobService } from '../../services/jobService'
import type { CandidateProfile } from '../../services/jobTypes'

/** Carrega o perfil somente leitura do candidato (RF-24); `failed` cobre o acesso negado (RF-25). */
export function useCandidate(jobId: string, userId: string) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    jobService
      .candidateProfile(jobId, userId)
      .then((p) => active && setProfile(p))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [jobId, userId])

  const photo = profile?.photoVersion ? jobService.candidatePhotoUrl(jobId, userId, profile.photoVersion) : null
  return { profile, failed, photo }
}
