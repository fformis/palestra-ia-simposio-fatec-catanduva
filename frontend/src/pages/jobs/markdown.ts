/**
 * Markdown restrito da descrição da vaga (spec 009, RF-03): **negrito**, *itálico*,
 * linhas "- item" e "1. item". Mesma regra de contagem do backend (JobDescription).
 */

const LIST_PREFIX = /^\s*(- |\d+\. )/

/** Caracteres visíveis: sem marcadores e sem quebras de linha. */
export const visibleLength = (text: string) =>
  text
    .replace(/\r/g, '')
    .split('\n')
    .reduce((sum, line) => sum + line.replace(LIST_PREFIX, '').replace(/\*/g, '').length, 0)

export type Inline = { text: string; bold?: boolean; italic?: boolean }
export type Block = { kind: 'p'; lines: Inline[][] } | { kind: 'ul' | 'ol'; items: Inline[][] }

/** "**a** e *b*" → trechos com estilo; marcador sem par fica como texto. */
export function parseInline(line: string): Inline[] {
  const parts: Inline[] = []
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  for (const m of line.matchAll(pattern)) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index) })
    parts.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], italic: true })
    last = m.index + m[0].length
  }
  if (last < line.length) parts.push({ text: line.slice(last) })
  return parts
}

/** Agrupa linhas em parágrafos e listas. */
export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = []
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const kind = /^\s*- /.test(raw) ? 'ul' : /^\s*\d+\. /.test(raw) ? 'ol' : 'p'
    const content = parseInline(raw.replace(LIST_PREFIX, ''))
    const prev = blocks.at(-1)
    if (kind === 'p') {
      if (!raw.trim()) blocks.push({ kind: 'p', lines: [] })
      else if (prev?.kind === 'p' && prev.lines.length > 0) prev.lines.push(content)
      else blocks.push({ kind: 'p', lines: [content] })
    } else if (prev?.kind === kind) prev.items.push(content)
    else blocks.push({ kind, items: [content] })
  }
  return blocks.filter((b) => (b.kind === 'p' ? b.lines.length > 0 : true))
}
