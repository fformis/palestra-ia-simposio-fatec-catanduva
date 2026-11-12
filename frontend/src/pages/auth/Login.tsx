import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../../auth/authContext'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { PasswordField } from '../../components/PasswordField'
import { TextField } from '../../components/TextField'
import { loginErrorMessage } from './errors'
import styles from './auth.module.css'

export function Login() {
  const { status, login } = useAuth()
  const location = useLocation()
  const notice = (location.state as { notice?: string } | null)?.notice
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ title: string; text?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  if (status === 'authenticated') return <Navigate to="/" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(loginErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={submit} noValidate>
        <h1 className={styles.title}>Entrar</h1>
        {notice === 'password-set' && <Alert tone="success" title="Senha definida com sucesso" >Entre com sua nova senha.</Alert>}
        {error && (
          <Alert tone="danger" title={error.title}>
            {error.text}
          </Alert>
        )}
        <TextField label="E-mail" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Senha" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" loading={loading}>
          Entrar
        </Button>
        <div className={styles.links}>
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
          <Link to="/criar-conta">Criar conta</Link>
        </div>
      </form>
    </Card>
  )
}
