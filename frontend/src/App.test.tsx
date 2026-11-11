import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  history.pushState({}, '', '/')
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})

it('exibe o título da aplicação na Home', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Palestra IA')
})

it('Home leva ao catálogo com paleta, tipografia, componentes e animações', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('link', { name: /Abrir catálogo/ }))
  for (const name of ['Paleta', 'Tipografia', 'Componentes', 'Animações']) {
    expect(screen.getByRole('heading', { name })).toBeInTheDocument()
  }
})
