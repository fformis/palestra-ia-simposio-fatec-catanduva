import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { TextField } from '../../components/TextField'
import { authService } from '../../services/authService'
import { isEmail } from './errors'
import styles from './auth.module.css'

export function Register() {
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({})
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!values.firstName.trim()) next.firstName = 'Informe o nome.'
    if (!values.lastName.trim()) next.lastName = 'Informe o sobrenome.'
    if (!values.email.trim()) next.email = 'Informe o e-mail.'
    else if (!isEmail(values.email)) next.email = 'Informe um e-mail válido.'
    setErrors(next)
    setFailed(false)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      await authService.register(values.firstName, values.lastName, values.email)
      setSentTo(values.email.trim())
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (sentTo) {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>Verifique seu e-mail</h1>
          <Alert tone="success" title={`Enviamos um e-mail para ${sentTo}`}>
            Se o endereço puder ser cadastrado, você receberá um link para criar sua senha. O link vale por 1 dia.
          </Alert>
          <Link to="/entrar">Voltar ao login</Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={submit} noValidate>
        <h1 className={styles.title}>Criar conta</h1>
        {failed && <Alert tone="danger" title="Não foi possível concluir o cadastro">Tente novamente em instantes.</Alert>}
        <TextField label="Nome" autoComplete="given-name" value={values.firstName} onChange={set('firstName')} error={errors.firstName} />
        <TextField label="Sobrenome" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} error={errors.lastName} />
        <TextField label="E-mail" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <Button type="submit" loading={loading}>
          Criar conta
        </Button>
        <div className={styles.links}>
          <Link to="/entrar">Já tenho conta</Link>
        </div>
      </form>
    </Card>
  )
}
