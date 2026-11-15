import { createContext, useContext } from 'react'
import type { AuthUser } from '../services/authTypes'

export interface AuthContextValue {
  user: AuthUser | null
  /** Versão da foto do perfil (null = sem foto); usada no avatar do menu (spec 007). */
  photoVersion: string | null
  setPhotoVersion: (version: string | null) => void
  status: 'loading' | 'authenticated' | 'anonymous'
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
