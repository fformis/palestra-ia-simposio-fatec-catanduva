import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { authService } from './services/authService'

vi.mock('./services/authService', () => ({ authService: { me: vi.fn(), logout: vi.fn() } }))

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

it('Home leva ao catálogo com paleta, tipografia, componentes e animações', async () => {
  render(<App />)
  await userEvent.click(await screen.findByRole('link', { name: /Abrir catálogo/ }))
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
