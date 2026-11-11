import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AppLayout } from './AppLayout'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})

const setup = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<p>conteúdo</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
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
