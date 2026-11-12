import { Navigate, Outlet } from 'react-router'
import { Spinner } from '../components/Spinner'
import { useAuth } from './authContext'

export function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <Spinner />
  if (status === 'anonymous') return <Navigate to="/entrar" replace />
  return <Outlet />
}
