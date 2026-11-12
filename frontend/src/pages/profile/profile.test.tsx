import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { MonthYearField } from '../../components/MonthYearField'
import { profileService } from '../../services/profileService'
import type { Occupation } from '../../services/profileTypes'
import { BioSection } from './BioSection'
import { formatPeriod } from './format'
import { CourseForm, EducationForm, OccupationForm } from './forms'
import { PhotoSection } from './PhotoSection'
import { TimelineSection } from './TimelineSection'

vi.mock('../../services/profileService', () => ({
  profileService: {
    saveOccupation: vi.fn().mockResolvedValue({}),
    saveCourse: vi.fn().mockResolvedValue({}),
    uploadPhoto: vi.fn().mockResolvedValue({ photoVersion: '1' }),
    photoUrl: (v: string) => `/foto?v=${v}`,
  },
}))

beforeEach(() => vi.clearAllMocks())

const jobs: Occupation[] = [
  { id: '2', title: 'Líder', company: 'Acme', start: '2023-05', end: null, description: null },
  { id: '1', title: 'Dev', company: 'Acme', start: '2019-01', end: '2020-12', description: null },
]

const timeline = (items: Occupation[], remove = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <TimelineSection
      title="Ocupações"
      itemName="ocupação"
      emptyText="Nenhuma ocupação ainda."
      items={items}
      view={(o) => ({ title: o.title, subtitle: o.company })}
      form={(p) => <OccupationForm {...p} />}
      remove={remove}
      onChanged={vi.fn()}
    />,
  )
  return remove
}

const choose = (label: string, month: string, year: string) =>
  Promise.all([
    userEvent.selectOptions(screen.getByLabelText(`${label}: mês`), month),
    userEvent.selectOptions(screen.getByLabelText(`${label}: ano`), year),
  ])

// RF-15
it('campo mês/ano emite "AAAA-MM" e o período é exibido como mês/ano', async () => {
  const onChange = vi.fn()
  render(<MonthYearField label="Início" value="" onChange={onChange} />)
  await choose('Início', 'Março', '2021')
  expect(onChange).toHaveBeenLastCalledWith('2021-03')
  expect(formatPeriod('2021-03', '2023-08')).toBe('03/2021 — 08/2023')
})

// RF-17 / RF-08
it('linha do tempo mostra os itens na ordem recebida e "até o momento" sem término', () => {
  timeline(jobs)
  const items = screen.getAllByRole('listitem')
  expect(items.map((li) => within(li).getByRole('heading').textContent)).toEqual(['Líder', 'Dev'])
  expect(items[0]).toHaveTextContent('05/2023 — até o momento')
})

// RF-19
it('seção sem itens mostra o estado vazio com a ação de adicionar', () => {
  timeline([])
  expect(screen.getByText('Nenhuma ocupação ainda.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Adicionar ocupação' })).toBeInTheDocument()
})

// RF-09
it('remover só acontece após confirmar', async () => {
  const remove = timeline(jobs)
  await userEvent.click(screen.getByRole('button', { name: 'Remover Dev' }))
  expect(remove).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  expect(remove).toHaveBeenCalledWith('1')
})

// RF-22 / RF-16
it('ocupação com campo vazio ou término anterior ao início mostra erro e não salva', async () => {
  render(<OccupationForm onSaved={vi.fn()} onCancel={vi.fn()} />)
  await userEvent.type(screen.getByLabelText('Empresa'), 'Acme')
  await choose('Início', 'Março', '2021')
  await choose('Término', 'Janeiro', '2020')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByLabelText('Cargo')).toHaveAccessibleDescription('Informe o cargo.')
  expect(screen.getByText('O término não pode ser anterior ao início.')).toBeInTheDocument()
  expect(profileService.saveOccupation).not.toHaveBeenCalled()
})

// RF-07 / RF-08
it('ocupação válida sem término é salva como atual', async () => {
  const onSaved = vi.fn()
  render(<OccupationForm onSaved={onSaved} onCancel={vi.fn()} />)
  await userEvent.type(screen.getByLabelText('Cargo'), 'Dev')
  await userEvent.type(screen.getByLabelText('Empresa'), 'Acme')
  await choose('Início', 'Março', '2021')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(profileService.saveOccupation).toHaveBeenCalledWith(
    { title: 'Dev', company: 'Acme', start: '2021-03', end: null, description: null },
    undefined,
  )
  expect(onSaved).toHaveBeenCalled()
})

// RF-10
it('formação oferece exatamente os 7 níveis', () => {
  render(<EducationForm onSaved={vi.fn()} onCancel={vi.fn()} />)
  const options = within(screen.getByLabelText('Nível de formação')).getAllByRole('option').slice(1)
  expect(options.map((o) => o.textContent)).toEqual(['Fundamental', 'Médio', 'Técnico', 'Superior', 'Pós/MBA', 'Mestrado', 'Doutorado'])
})

// RF-13
it('curso com horas zero ou não numéricas mostra erro e não salva', async () => {
  render(<CourseForm onSaved={vi.fn()} onCancel={vi.fn()} />)
  await userEvent.type(screen.getByLabelText('Quantidade de horas'), '0')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByLabelText('Quantidade de horas')).toBeInvalid()
  expect(profileService.saveCourse).not.toHaveBeenCalled()
})

// RF-06
it('bio mostra os caracteres restantes', async () => {
  render(<BioSection bio={null} onChanged={vi.fn()} />)
  await userEvent.type(screen.getByLabelText('Apresente-se em poucas palavras'), 'Olá')
  expect(screen.getByText('497 caracteres restantes')).toBeInTheDocument()
})

// RF-04 / RF-05
it('sem foto mostra as iniciais; arquivo acima de 2 MB mostra erro e não é enviado', async () => {
  render(<PhotoSection name="Ana Silva" email="ana@x.com" photoVersion={null} onChanged={vi.fn()} />)
  expect(screen.getByRole('img', { name: 'Iniciais de Ana Silva' })).toHaveTextContent('AS')
  const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })
  await userEvent.upload(screen.getByLabelText('Arquivo da foto de perfil'), big)
  expect(screen.getByRole('alert')).toHaveTextContent('A imagem deve ter no máximo 2 MB.')
  expect(profileService.uploadPhoto).not.toHaveBeenCalled()
})
