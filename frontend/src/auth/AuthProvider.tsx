import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '../services/api'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import type { AuthUser } from '../services/authTypes'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [photoVersion, setPhotoVersion] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setPhotoVersion(null)
      setStatus('anonymous')
    })
    let active = true
    authService
      .me()
      .then((u) => {
        if (!active) return
        setUser(u)
        setStatus('authenticated')
      })
      .catch(() => active && setStatus('anonymous'))
    return () => {
      active = false
      setUnauthorizedHandler(undefined)
    }
  }, [])

  // Spec 007: o avatar do menu precisa da versão da foto; falha é silenciosa (cai nas iniciais).
  useEffect(() => {
    if (status !== 'authenticated') return
    let active = true
    profileService
      .getProfile()
      .then((p) => active && setPhotoVersion(p.photoVersion))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [status, user?.id])

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password)
    setUser(u)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setPhotoVersion(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(
    () => ({ user, photoVersion, setPhotoVersion, status, login, logout }),
    [user, photoVersion, status, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
