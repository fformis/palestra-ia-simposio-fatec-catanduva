import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/authContext'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { profileService } from '../../services/profileService'
import type { Profile as ProfileData } from '../../services/profileTypes'
import { BioSection } from './BioSection'
import { LEVELS } from './format'
import { CourseForm, EducationForm, OccupationForm } from './forms'
import { PhotoSection } from './PhotoSection'
import { TimelineSection } from './TimelineSection'
import styles from './profile.module.css'

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [failed, setFailed] = useState(false)

  const reload = useCallback(
    () =>
      profileService
        .getProfile()
        .then((p) => {
          setProfile(p)
          setFailed(false)
        })
        .catch(() => setFailed(true)),
    [],
  )

  useEffect(() => {
    let active = true
    profileService
      .getProfile()
      .then((p) => active && setProfile(p))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [])

  if (!user) return null

  if (!profile) {
    return (
      <div className={styles.page}>
        {failed ? (
          <Alert tone="danger" title="Não foi possível carregar o perfil">
            <Button variant="secondary" onClick={reload}>
              Tentar novamente
            </Button>
          </Alert>
        ) : (
          <Card className={styles.card} aria-busy="true" aria-label="Carregando perfil">
            <div className={styles.form}>
              <Skeleton width="7rem" height="7rem" />
              <Skeleton width="60%" height="1.5rem" />
              <Skeleton />
              <Skeleton width="80%" />
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PhotoSection
        name={`${user.firstName} ${user.lastName}`}
        email={user.email}
        photoVersion={profile.photoVersion}
        onChanged={reload}
      />
      <BioSection bio={profile.bio} onChanged={reload} />
      <TimelineSection
        title="Ocupações"
        itemName="ocupação"
        emptyText="Nenhuma ocupação ainda. Adicione a primeira para começar sua linha do tempo."
        items={profile.occupations}
        view={(o) => ({ title: o.title, subtitle: o.company, description: o.description })}
        form={(p) => <OccupationForm {...p} />}
        remove={profileService.removeOccupation}
        onChanged={reload}
      />
      <TimelineSection
        title="Formações"
        itemName="formação"
        emptyText="Nenhuma formação ainda. Adicione sua trajetória acadêmica."
        items={profile.educations}
        view={(e) => ({ title: e.course, subtitle: `${LEVELS[e.level]} · ${e.institution}`, description: e.description })}
        form={(p) => <EducationForm {...p} />}
        remove={profileService.removeEducation}
        onChanged={reload}
      />
      <TimelineSection
        title="Cursos"
        itemName="curso"
        emptyText="Nenhum curso ainda. Adicione suas capacitações complementares."
        items={profile.courses}
        view={(c) => ({ title: c.name, subtitle: `${c.institution} · ${c.hours} ${c.hours === 1 ? 'hora' : 'horas'}` })}
        form={(p) => <CourseForm {...p} />}
        remove={profileService.removeCourse}
        onChanged={reload}
      />
    </div>
  )
}
