import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const css = readFileSync('src/styles/tokens.css', 'utf8')

// Extrai o valor de --token dentro do bloco do seletor dado.
function token(selector: string, name: string): string {
  const block = css.split(selector)[1].split('}')[0]
  return block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))![1]
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

it('movimento reduzido zera as durações (RF-09)', () => {
  const reduce = css.split('prefers-reduced-motion: reduce')[1]
  expect(reduce).toMatch(/--dur-base:\s*0ms/)
})

const themes = [
  ['light', ":root[data-theme='light']"],
  ['dark', ":root[data-theme='dark']"],
] as const

it.each(themes)('texto e interface atingem contraste AA no tema %s (RNF-01)', (_, sel) => {
  const t = (n: string) => token(sel, n)
  const bg = t('--color-bg')
  const surface = t('--color-surface')
  const textPairs = [
    [t('--color-text'), bg],
    [t('--color-text'), surface],
    [t('--color-text-muted'), bg],
    [t('--color-text-muted'), surface],
    [t('--color-primary'), bg],
    [t('--color-primary'), surface],
    [t('--color-on-primary'), t('--color-primary')],
  ]
  for (const [fg, back] of textPairs) expect(contrast(fg, back)).toBeGreaterThanOrEqual(4.5)
  const uiColors = ['--color-secondary', '--color-success', '--color-warning', '--color-danger', '--color-info']
  for (const c of uiColors) expect(contrast(t(c), surface)).toBeGreaterThanOrEqual(3)
})
