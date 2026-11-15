import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { PasswordField } from '../components/PasswordField'
import { ForgotPassword } from '../pages/auth/ForgotPassword'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { SetPassword } from '../pages/auth/SetPassword'
import { ApiError } from '../services/api'
import { authService } from '../services/authService'
import { AuthContext, type AuthContextValue } from './authContext'
import { RequireAuth } from './RequireAuth'

vi.mock('../services/authService', () => ({
  authService: {
    register: vi.fn(),
    validateLink: vi.fn(),
    setPassword: vi.fn(),
    forgotPassword: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

const anon = (login = vi.fn()): AuthContextValue => ({
  user: null,
  photoVersion: null,
  setPhotoVersion: vi.fn(),
  status: 'anonymous',
  login,
  logout: vi.fn(),
})

const renderAt = (ui: React.ReactNode, path = '/', ctx = anon()) =>
  render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={ui} />
          <Route path="/entrar" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )

beforeEach(() => vi.clearAllMocks())

// RF-01 / RF-02
it('Login mostra campos e links, e o olho alterna a visibilidade da senha', async () => {
  renderAt(<Login />)
  expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Criar conta' })).toBeInTheDocument()
  const field = screen.getByLabelText('Senha')
  expect(field).toHaveAttribute('type', 'password')
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
  expect(field).toHaveAttribute('type', 'text')
  await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }))
  expect(field).toHaveAttribute('type', 'password')
})

// RF-04 / RF-05 / RF-23
it.each([
  ['invalid_credentials', 'E-mail ou senha inválidos', undefined],
  ['account_pending', 'Conta ainda sem senha', undefined],
  ['locked', 'Acesso temporariamente bloqueado', 600],
] as const)('Login exibe a mensagem para %s', async (code, text, retry) => {
  const login = vi.fn().mockRejectedValue(new ApiError(401, { code, retryAfterSeconds: retry }))
  renderAt(<Login />, '/', anon(login))
  await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'x')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
  expect(await screen.findByText(text)).toBeInTheDocument()
  if (code === 'locked') expect(screen.getByText(/10 minutos/)).toBeInTheDocument()
})

// RF-06
it('RequireAuth anônimo redireciona para /entrar', () => {
  render(
    <AuthContext.Provider value={anon()}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route index element={<p>home</p>} />
          </Route>
          <Route path="/entrar" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
  expect(screen.getByText('tela de login')).toBeInTheDocument()
})

// RF-07
it('Register com campo vazio e e-mail inválido mostra erro e não chama o serviço', async () => {
  renderAt(<Register />)
  await userEvent.type(screen.getByLabelText('E-mail'), 'invalido')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
  expect(screen.getByText('Informe o nome.')).toBeInTheDocument()
  expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
  expect(authService.register).not.toHaveBeenCalled()
})

// RF-09 / RF-12
it('Register válido mostra a confirmação de envio', async () => {
  vi.mocked(authService.register).mockResolvedValue(undefined)
  renderAt(<Register />)
  await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
  await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
  await userEvent.type(screen.getByLabelText('E-mail'), 'ana@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
  expect(await screen.findByText('Enviamos um e-mail para ana@x.com')).toBeInTheDocument()
})

// RF-13 / RF-14
it('ForgotPassword mostra a mensagem genérica após enviar', async () => {
  vi.mocked(authService.forgotPassword).mockResolvedValue(undefined)
  renderAt(<ForgotPassword />)
  await userEvent.type(screen.getByLabelText('E-mail'), 'ana@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
  expect(await screen.findByText(/Se o e-mail estiver cadastrado/)).toBeInTheDocument()
})

// RF-17 / RF-18
it('SetPassword bloqueia confirmação diferente e senha curta', async () => {
  vi.mocked(authService.validateLink).mockResolvedValue({ purpose: 'activation' })
  renderAt(<SetPassword />, '/definir-senha?token=abc')
  await userEvent.type(await screen.findByLabelText('Senha'), '1234567')
  await userEvent.type(screen.getByLabelText('Confirmar senha'), 'diferente')
  await userEvent.click(screen.getByRole('button', { name: 'Criar senha' }))
  expect(screen.getByText(/mínimo 8 caracteres|no mínimo 8 caracteres/)).toBeInTheDocument()
  expect(screen.getByText('A confirmação deve ser igual à senha.')).toBeInTheDocument()
  expect(authService.setPassword).not.toHaveBeenCalled()
})

// RF-10
it('SetPassword válido salva e volta ao login', async () => {
  vi.mocked(authService.validateLink).mockResolvedValue({ purpose: 'reset' })
  vi.mocked(authService.setPassword).mockResolvedValue(undefined)
  renderAt(<SetPassword />, '/definir-senha?token=abc')
  await userEvent.type(await screen.findByLabelText('Senha'), 'senha1234')
  await userEvent.type(screen.getByLabelText('Confirmar senha'), 'senha1234')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar nova senha' }))
  await waitFor(() => expect(screen.getByText('tela de login')).toBeInTheDocument())
  expect(authService.setPassword).toHaveBeenCalledWith('abc', 'senha1234')
})

// RF-11
it('SetPassword com link inválido explica e oferece novo link', async () => {
  vi.mocked(authService.validateLink).mockRejectedValue(new ApiError(410, { code: 'invalid_link' }))
  renderAt(<SetPassword />, '/definir-senha?token=velho')
  expect(await screen.findByText('Link inválido ou expirado')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Criar conta' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toBeInTheDocument()
})

it('PasswordField expõe o estado do botão para leitores de tela', async () => {
  render(<PasswordField label="Senha" />)
  const btn = screen.getByRole('button', { name: 'Mostrar senha' })
  expect(btn).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(btn)
  expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute('aria-pressed', 'true')
})
