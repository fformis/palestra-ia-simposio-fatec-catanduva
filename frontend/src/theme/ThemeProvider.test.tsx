import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

let listener: () => void = () => {}
let systemDark = true

beforeEach(() => {
  localStorage.clear()
  systemDark = true
  vi.stubGlobal('matchMedia', (q: string) => ({
    get matches() {
      return q.includes('prefers-color-scheme') ? systemDark : false
    },
    addEventListener: (_: string, fn: () => void) => (listener = fn),
    removeEventListener() {},
  }))
})

const setup = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )

it('escolha "Claro" é lembrada após recarregar com sistema escuro', async () => {
  const first = setup()
  await userEvent.click(screen.getByRole('radio', { name: 'Claro' }))
  first.unmount()
  setup()
  expect(document.documentElement.dataset.theme).toBe('light')
})

it('em "Sistema", acompanha a mudança do sistema sem recarregar', () => {
  setup()
  expect(document.documentElement.dataset.theme).toBe('dark')
  systemDark = false
  act(() => listener())
  expect(document.documentElement.dataset.theme).toBe('light')
})
