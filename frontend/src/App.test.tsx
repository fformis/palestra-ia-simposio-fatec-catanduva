import { render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { authService } from './services/authService'

vi.mock('./services/authService', () => ({ authService: { me: vi.fn(), logout: vi.fn() } }))
vi.mock('./services/profileService', () => ({
  profileService: { getProfile: vi.fn().mockResolvedValue({ photoVersion: null }), photoUrl: vi.fn() },
}))

beforeEach(() => {
  vi.mocked(authService.me).mockResolvedValue({ id: '1', firstName: 'Ana', lastName: 'Silva', email: 'ana@x.com' })
  localStorage.clear()
  history.pushState({}, '', '/')
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})

it('exibe o título da aplicação na Home', async () => {
  render(<App />)
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Palestra IA')
})

it('Home não exibe cartão nem link do Design System', async () => {
  render(<App />)
  await screen.findByRole('heading', { level: 1 })
  expect(screen.queryByRole('heading', { name: 'Design System' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /catálogo/i })).not.toBeInTheDocument()
})

it('URL direta /design-system exibe paleta, tipografia, componentes e animações', async () => {
  history.pushState({}, '', '/design-system')
  render(<App />)
  await screen.findByRole('heading', { name: 'Paleta' })
  for (const name of ['Paleta', 'Tipografia', 'Componentes', 'Animações']) {
    expect(screen.getByRole('heading', { name })).toBeInTheDocument()
  }
})

// RF-06
it('visitante sem sessão que acessa a Home é levado ao login', async () => {
  vi.mocked(authService.me).mockRejectedValue(new Error('401'))
  render(<App />)
  expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  expect(location.pathname).toBe('/entrar')
})
