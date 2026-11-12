import { ApiError } from '../../services/api'

export function loginErrorMessage(error: unknown): { title: string; text?: string } {
  if (error instanceof ApiError) {
    if (error.code === 'locked') {
      const minutes = Math.max(1, Math.ceil((error.retryAfterSeconds ?? 0) / 60))
      return {
        title: 'Acesso temporariamente bloqueado',
        text: `Muitas tentativas inválidas. Tente novamente em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`,
      }
    }
    if (error.code === 'account_pending') {
      return {
        title: 'Conta ainda sem senha',
        text: 'Use o link que enviamos ao seu e-mail para criar a senha. Se não o encontrar, refaça o cadastro para receber um novo.',
      }
    }
    if (error.code === 'invalid_credentials') return { title: 'E-mail ou senha inválidos' }
  }
  return { title: 'Não foi possível entrar', text: 'Tente novamente em instantes.' }
}

export const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())
