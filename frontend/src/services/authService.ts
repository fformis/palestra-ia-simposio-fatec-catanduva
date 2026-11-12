import { api } from './api'
import type { AuthUser, LinkPurpose } from './authTypes'

export const authService = {
  register: (firstName: string, lastName: string, email: string) =>
    api('POST', '/api/auth/register', { firstName, lastName, email }),
  validateLink: (token: string) => api<{ purpose: LinkPurpose }>('POST', '/api/auth/password-links/validate', { token }),
  setPassword: (token: string, password: string) => api('POST', '/api/auth/set-password', { token, password }),
  forgotPassword: (email: string) => api('POST', '/api/auth/forgot-password', { email }),
  login: (email: string, password: string) => api<AuthUser>('POST', '/api/auth/login', { email, password }),
  logout: () => api('POST', '/api/auth/logout'),
  me: () => api<AuthUser>('GET', '/api/auth/me'),
}
