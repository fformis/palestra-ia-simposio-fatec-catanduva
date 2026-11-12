/** Ano atual, lido uma vez ao carregar o módulo (o render dos componentes precisa ser puro). */
export const THIS_YEAR = new Date().getFullYear()

/** Iniciais de um nome completo: primeira e última palavra ("Ana Maria Silva" → "AS"). */
export const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0]?.[0] ?? '']
  return letters.join('').toUpperCase()
}
