import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { TextField } from '../../components/TextField'
import { authService } from '../../services/authService'
import { isEmail } from './errors'
import styles from './auth.module.css'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) {
      setError('Informe um e-mail válido.')
      return
    }
    setError(undefined)
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Não foi possível enviar agora. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      {sent ? (
        <div className={styles.stack}>
          <h1 className={styles.title}>Verifique seu e-mail</h1>
          <Alert tone="success" title="Pedido recebido">
            Se o e-mail estiver cadastrado, você receberá as instruções para criar uma nova senha.
          </Alert>
          <Link to="/entrar">Voltar ao login</Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <h1 className={styles.title}>Esqueci minha senha</h1>
          <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>
            Enviar
          </Button>
          <div className={styles.links}>
            <Link to="/entrar">Voltar ao login</Link>
          </div>
        </form>
      )}
    </Card>
  )
}
