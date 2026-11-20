import type { Benefit, ContractType } from '../../services/jobTypes'

export const MAX_TITLE = 100
export const MAX_DESCRIPTION = 500
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const CONTRACTS: Record<ContractType, string> = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio' }

export const BENEFITS: Record<Benefit, string> = {
  medical: 'Plano Médico',
  dental: 'Plano Odontológico',
  pet: 'Plano Saúde Pet',
  gympass: 'Gympass',
  birthday_off: 'Day off de aniversário',
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 5000 → "R$ 5.000,00 / mês" (RNF-07). */
export const formatSalary = (value: number) => `${brl.format(value).replace(/ /g, ' ')} / mês`

/** ISO → "dd/mm/aaaa". */
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export const MESSAGES: Record<string, string> = {
  required: 'Campo obrigatório.',
  too_long: 'Texto longo demais.',
  invalid: 'Valor inválido.',
}
