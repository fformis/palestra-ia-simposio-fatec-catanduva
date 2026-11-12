import { useState, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { TextArea } from '../../components/TextArea'
import { profileService } from '../../services/profileService'
import { MAX_BIO } from './format'
import styles from './profile.module.css'

export function BioSection({ bio, onChanged }: { bio: string | null; onChanged: () => Promise<unknown> | void }) {
  const [value, setValue] = useState(bio ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [failed, setFailed] = useState(false)
  const remaining = MAX_BIO - value.length

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (remaining < 0) return
    setLoading(true)
    setFailed(false)
    try {
      await profileService.updateBio(value)
      setSaved(true)
      await onChanged()
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={styles.card}>
      <form className={styles.form} onSubmit={submit} aria-labelledby="bio-title">
        <h2 id="bio-title" style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
          Bio
        </h2>
        {failed && (
          <Alert tone="danger" title="Não foi possível salvar a bio">
            Tente novamente em instantes.
          </Alert>
        )}
        <TextArea
          label="Apresente-se em poucas palavras"
          value={value}
          rows={5}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          error={remaining < 0 ? `A bio tem no máximo ${MAX_BIO} caracteres.` : undefined}
        />
        <div className={styles.actions}>
          <Button type="submit" loading={loading} disabled={remaining < 0}>
            Salvar bio
          </Button>
          <span className={styles.counter} aria-live="polite">
            {remaining} caracteres restantes
          </span>
          {saved && (
            <span className={styles.notice} role="status" style={{ margin: 0 }}>
              Bio salva.
            </span>
          )}
        </div>
      </form>
    </Card>
  )
}
