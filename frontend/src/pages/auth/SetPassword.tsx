import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { PasswordField } from '../../components/PasswordField'
import { Spinner } from '../../components/Spinner'
import { ApiError } from '../../services/api'
import { authService } from '../../services/authService'
import type { LinkPurpose } from '../../services/authTypes'
import styles from './auth.module.css'

const MIN_LENGTH = 8

type LinkState = { kind: 'checking' } | { kind: 'invalid' } | { kind: 'valid'; purpose: LinkPurpose }

export function SetPassword() {
  const token = useSearchParams()[0].get('token') ?? ''
  const navigate = useNavigate()
  const [link, setLink] = useState<LinkState>({ kind: 'checking' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    authService
      .validateLink(token)
      .then((r) => active && setLink({ kind: 'valid', purpose: r.purpose }))
      .catch(() => active && setLink({ kind: 'invalid' }))
    return () => {
      active = false
    }
  }, [token])

  if (link.kind === 'checking') return <Card><Spinner label="Verificando link" /></Card>

  if (link.kind === 'invalid') {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>Link inválido ou expirado</h1>
          <Alert tone="warning" title="Este link já foi usado, expirou ou não existe">
            Se ainda não criou sua senha, refaça o cadastro para receber um novo link. Se já tem conta, use "Esqueci minha senha".
          </Alert>
          <div className={styles.links}>
            <Link to="/criar-conta">Criar conta</Link>
            <Link to="/esqueci-senha">Esqueci minha senha</Link>
          </div>
        </div>
      </Card>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (password.length < MIN_LENGTH) next.password = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`
    if (confirm !== password) next.confirm = 'A confirmação deve ser igual à senha.'
    setErrors(next)
    setFailed(false)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await authService.setPassword(token, password)
      navigate('/entrar', { replace: true, state: { notice: 'password-set' } })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'invalid_link') setLink({ kind: 'invalid' })
      else if (err instanceof ApiError && err.code === 'weak_password') setErrors({ password: `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.` })
      else setFailed(true)
      setLoading(false)
    }
  }

  const activation = link.purpose === 'activation'
  return (
    <Card>
      <form className={styles.form} onSubmit={submit} noValidate>
        <h1 className={styles.title}>{activation ? 'Crie sua senha' : 'Crie uma nova senha'}</h1>
        {failed && <Alert tone="danger" title="Não foi possível salvar a senha">Tente novamente em instantes.</Alert>}
        <PasswordField label="Senha" autoComplete="new-password" help={`Mínimo de ${MIN_LENGTH} caracteres.`} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <PasswordField label="Confirmar senha" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <Button type="submit" loading={loading}>
          {activation ? 'Criar senha' : 'Salvar nova senha'}
        </Button>
      </form>
    </Card>
  )
}
