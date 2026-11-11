import { beforeEach, expect, it, vi } from 'vitest'
import { readPreference, resolveTheme, savePreference } from './theme'

function mockSystem(dark: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: dark, addEventListener() {}, removeEventListener() {} }))
}

beforeEach(() => localStorage.clear())

it('sem escolha, segue o sistema escuro', () => {
  mockSystem(true)
  expect(resolveTheme(readPreference())).toBe('dark')
})

it('sem escolha, segue o sistema claro', () => {
  mockSystem(false)
  expect(resolveTheme(readPreference())).toBe('light')
})

it('escolha manual prevalece sobre o sistema', () => {
  mockSystem(true)
  savePreference('light')
  expect(resolveTheme(readPreference())).toBe('light')
})
