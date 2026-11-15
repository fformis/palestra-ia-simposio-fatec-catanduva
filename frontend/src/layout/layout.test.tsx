import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AppLayout } from './AppLayout'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})

const logout = vi.fn().mockResolvedValue(undefined)
const user = { id: '1', firstName: 'Ana', lastName: 'Silva', email: 'ana@x.com' }

const setup = () =>
  render(
    <AuthContext.Provider value={{ user, status: 'authenticated', login: vi.fn(), logout }}>
    <ThemeProvider>
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<p>conteúdo</p>} />
          </Route>
          <Route path="/entrar" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
    </AuthContext.Provider>,
  )

it('item ativo do menu é indicado e o seletor de tema está no cabeçalho', () => {
  setup()
  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('banner')).toContainElement(screen.getByRole('radiogroup', { name: 'Tema' }))
})

it('menu abre pelo botão e fecha ao navegar, ao tocar fora e com Esc', async () => {
  setup()
  const button = screen.getByRole('button', { name: 'Abrir menu' })
  await userEvent.click(button)
  expect(button).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(screen.getByTestId('backdrop'))
  expect(button).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(button)
  await userEvent.keyboard('{Escape}')
  expect(button).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(button)
  await userEvent.click(screen.getByRole('link', { name: 'Home' }))
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it('recolher o menu é lembrado após recarregar', async () => {
  const first = setup()
  await userEvent.click(screen.getByRole('button', { name: 'Recolher menu' }))
  first.unmount()
  setup()
  expect(screen.getByRole('button', { name: 'Expandir menu' })).toHaveAttribute('aria-pressed', 'true')
})

// RF-01 / RF-02 (spec 005)
it('botão de recolher fica no topo, ao lado da marca, e só tem ícone', () => {
  setup()
  const button = screen.getByRole('button', { name: 'Recolher menu' })
  expect(button.parentElement).toContainElement(screen.getByText('Palestra IA'))
  expect(button).toHaveTextContent('')
})

// RF-19 / RF-22
it('menu mostra nome e sobrenome no topo e Sair encerra a sessão', async () => {
  setup()
  expect(screen.getByRole('link', { name: 'Abrir perfil de Ana Silva' })).toHaveTextContent('Ana Silva')
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
  expect(logout).toHaveBeenCalled()
  expect(await screen.findByText('tela de login')).toBeInTheDocument()
})

// Spec 004, RF-01
it('nome do usuário no menu leva ao perfil', () => {
  setup()
  expect(screen.getByRole('link', { name: 'Abrir perfil de Ana Silva' })).toHaveAttribute('href', '/perfil')
})
