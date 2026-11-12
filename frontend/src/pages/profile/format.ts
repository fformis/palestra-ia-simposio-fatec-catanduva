import { ApiError } from '../../services/api'
import type { EducationLevel, YearMonth } from '../../services/profileTypes'

export const MAX_BIO = 500
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const LEVELS: Record<EducationLevel, string> = {
  fundamental: 'Fundamental',
  medio: 'Médio',
  tecnico: 'Técnico',
  superior: 'Superior',
  pos_mba: 'Pós/MBA',
  mestrado: 'Mestrado',
  doutorado: 'Doutorado',
}

/** "2021-03" → "03/2021". */
export const formatMonth = (value: YearMonth) => `${value.slice(5, 7)}/${value.slice(0, 4)}`

/** "03/2021 — 08/2023" ou "03/2021 — até o momento" (RF-08, RF-15). */
export const formatPeriod = (start: YearMonth, end: YearMonth | null) =>
  `${formatMonth(start)} — ${end ? formatMonth(end) : 'até o momento'}`

export const currentMonth = (now = new Date()): YearMonth =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

export type FieldErrors = Record<string, string>

const MESSAGES: Record<string, string> = {
  required: 'Campo obrigatório.',
  too_long: 'Texto longo demais.',
  invalid: 'Valor inválido.',
  future_start: 'O início não pode estar no futuro.',
  end_before_start: 'O término não pode ser anterior ao início.',
}

/** RF-16: início obrigatório e não futuro; término opcional e não anterior ao início. */
export function validatePeriod(start: YearMonth, end: YearMonth, errors: FieldErrors) {
  if (!start) errors.start = 'Informe o mês e o ano de início.'
  else if (start > currentMonth()) errors.start = MESSAGES.future_start
  if (start && end && end < start) errors.end = MESSAGES.end_before_start
}

/** Converte os erros por campo devolvidos pela API em mensagens. */
export function serverFieldErrors(error: unknown): FieldErrors | null {
  if (!(error instanceof ApiError) || error.code !== 'validation' || !error.fields) return null
  return Object.fromEntries(Object.entries(error.fields).map(([field, code]) => [field, MESSAGES[code] ?? MESSAGES.invalid]))
}
