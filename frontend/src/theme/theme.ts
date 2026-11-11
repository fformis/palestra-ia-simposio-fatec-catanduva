export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const KEY = 'theme'

export function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function savePreference(p: ThemePreference): void {
  try {
    if (p === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, p)
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
}

export const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function resolveTheme(p: ThemePreference): ResolvedTheme {
  if (p === 'system') return systemQuery().matches ? 'dark' : 'light'
  return p
}

export function applyTheme(t: ResolvedTheme): void {
  document.documentElement.dataset.theme = t
}
