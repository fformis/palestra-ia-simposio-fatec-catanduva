import { useRef, useState, type ChangeEvent } from 'react'
import { Alert } from '../../components/Alert'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { CameraIcon, TrashIcon } from '../../components/icons'
import { ApiError } from '../../services/api'
import { profileService } from '../../services/profileService'
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from './format'
import styles from './profile.module.css'

const INVALID = 'Envie uma imagem JPG, PNG ou WebP.'
const TOO_LARGE = 'A imagem deve ter no máximo 2 MB.'

interface PhotoSectionProps {
  name: string
  email: string
  photoVersion: string | null
  onChanged: () => Promise<unknown> | void
}

export function PhotoSection({ name, email, photoVersion, onChanged }: PhotoSectionProps) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const run = async (kind: 'upload' | 'remove', action: () => Promise<unknown>, message: string) => {
    setBusy(kind)
    setError(null)
    setNotice(null)
    try {
      await action()
      setNotice(message)
      await onChanged()
    } catch (e) {
      const code = e instanceof ApiError ? e.code : undefined
      setError(code === 'image_too_large' ? TOO_LARGE : code === 'invalid_image' ? INVALID : 'Não foi possível concluir. Tente novamente em instantes.')
    } finally {
      setBusy(null)
    }
  }

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return
    setNotice(null)
    // RF-05: recusa antes de enviar; a foto atual é mantida.
    if (!PHOTO_TYPES.includes(file.type)) return setError(INVALID)
    if (file.size > MAX_PHOTO_BYTES) return setError(TOO_LARGE)
    void run('upload', () => profileService.uploadPhoto(file), 'Foto atualizada.')
  }

  return (
    <Card className={styles.card}>
      <div className={styles.photo}>
        <Avatar name={name} size="lg" src={photoVersion ? profileService.photoUrl(photoVersion) : null} />
        <div className={styles.photoInfo}>
          <div>
            <h1>{name}</h1>
            <p className={styles.hint}>{email}</p>
          </div>
          <div className={styles.actions}>
            <input
              ref={input}
              type="file"
              className={styles.hidden}
              accept={PHOTO_TYPES.join(',')}
              aria-label="Arquivo da foto de perfil"
              tabIndex={-1}
              onChange={pick}
            />
            <Button variant="secondary" loading={busy === 'upload'} onClick={() => input.current?.click()}>
              <CameraIcon /> {photoVersion ? 'Trocar foto' : 'Enviar foto'}
            </Button>
            {photoVersion && (
              <Button variant="ghost" loading={busy === 'remove'} onClick={() => run('remove', profileService.removePhoto, 'Foto removida.')}>
                <TrashIcon /> Remover foto
              </Button>
            )}
          </div>
          <p className={styles.hint}>JPG, PNG ou WebP, até 2 MB.</p>
          {notice && (
            <p className={styles.notice} role="status" style={{ margin: 0 }}>
              {notice}
            </p>
          )}
          {error && <Alert tone="danger" title={error} />}
        </div>
      </div>
    </Card>
  )
}
