import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/api'
import { jobService } from '../../services/jobService'
import type { CandidateProfile as Profile, Job } from '../../services/jobTypes'
import { CandidateList } from './CandidateList'
import { CandidateProfile } from './CandidateProfile'
import { DescriptionEditor } from './DescriptionEditor'
import { formatSalary } from './format'
import { JobCreate } from './JobCreate'
import { JobForm } from './JobForm'
import { JobPage } from './JobPage'
import { visibleLength } from './markdown'
import { ResumePrint } from './ResumePrint'
import { RichText } from './RichText'

vi.mock('../../services/jobService', () => ({
  jobService: {
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    uploadImage: vi.fn(),
    like: vi.fn(),
    apply: vi.fn(),
    candidates: vi.fn(),
    candidateProfile: vi.fn(),
    imageUrl: () => '/img',
    candidatePhotoUrl: () => '/foto',
  },
}))

const service = vi.mocked(jobService)

const job = (over: Partial<Job> = {}): Job => ({
  id: 'j1',
  title: 'Dev .NET',
  company: 'Acme',
  description: 'Vaga **remota**',
  benefits: ['medical', 'gympass'],
  contractType: 'clt',
  salary: 5000,
  status: 'active',
  createdAt: '2026-11-20T12:00:00Z',
  imageVersion: null,
  owner: { firstName: 'Olga', lastName: 'Dona' },
  isOwner: false,
  likes: 0,
  candidates: 0,
  likedByMe: false,
  appliedByMe: false,
  ...over,
})

const profile: Profile = {
  firstName: 'Ana',
  lastName: 'Silva',
  email: 'ana@x.com',
  bio: 'Dev backend',
  photoVersion: null,
  occupations: [{ id: 'o1', title: 'Dev', company: 'Acme', start: '2020-01', end: null, description: null }],
  educations: [],
  courses: [],
}

const at = (path: string, route: string, element: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={element} />
        <Route path="/vagas/:id" element={<p>página da vaga</p>} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => vi.clearAllMocks())

// RF-03 / RNF-07
it('formata o valor mensal e conta só os caracteres visíveis', () => {
  expect(formatSalary(5000)).toBe('R$ 5.000,00 / mês')
  expect(visibleLength('**abc** *d*\n- e')).toBe(6)
})

// RF-03 / RNF-03
it('renderiza a formatação como elementos e nunca interpreta HTML', () => {
  const { container } = render(<RichText text={'**forte** e *leve*\n- item\n<script>alert(1)</script>'} />)
  expect(screen.getByText('forte').tagName).toBe('STRONG')
  expect(screen.getByText('leve').tagName).toBe('EM')
  expect(screen.getByText('item').tagName).toBe('LI')
  expect(container.querySelector('script')).toBeNull()
  expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument()
})

// RF-03
it('editor mostra os caracteres visíveis restantes e o Negrito envolve o texto', async () => {
  const onChange = vi.fn()
  const { rerender } = render(<DescriptionEditor value="" onChange={onChange} />)
  await userEvent.click(screen.getByRole('button', { name: 'Negrito' }))
  expect(onChange).toHaveBeenLastCalledWith('**texto**')
  rerender(<DescriptionEditor value="**ab**" onChange={onChange} />)
  expect(screen.getByText('498 caracteres restantes')).toBeInTheDocument()
})

// RF-03
it('formulário oferece os 5 benefícios, os regimes CLT, PJ e Estágio e status Ativo', () => {
  render(<JobForm submitLabel="Criar vaga" onSaved={vi.fn()} />)
  expect(screen.getAllByRole('checkbox').map((c) => c.parentElement?.textContent?.trim())).toEqual([
    'Plano Médico',
    'Plano Odontológico',
    'Plano Saúde Pet',
    'Gympass',
    'Day off de aniversário',
  ])
  const regimes = screen.getByLabelText(/Regime de contratação/)
  expect([...regimes.querySelectorAll('option')].slice(1).map((o) => o.textContent)).toEqual(['CLT', 'PJ', 'Estágio'])
  expect(screen.getByLabelText('Status do anúncio')).toHaveValue('active')
})

// RF-05
it('cargo vazio e valor zero mostram erro e não chamam o serviço', async () => {
  render(<JobForm submitLabel="Criar vaga" onSaved={vi.fn()} />)
  await userEvent.type(screen.getByLabelText(/Valor mensal/), '0')
  await userEvent.click(screen.getByRole('button', { name: 'Criar vaga' }))
  expect(screen.getAllByText('Campo obrigatório.').length).toBeGreaterThan(0)
  expect(screen.getByText('Informe um valor maior que zero.')).toBeInTheDocument()
  expect(service.create).not.toHaveBeenCalled()
})

// RF-04
it('imagem acima de 2 MB mostra erro e não é usada', () => {
  render(<JobForm submitLabel="Criar vaga" onSaved={vi.fn()} />)
  const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' })
  fireEvent.change(screen.getByLabelText('Arquivo da imagem da vaga'), { target: { files: [big] } })
  expect(screen.getByText('A imagem deve ter no máximo 2 MB.')).toBeInTheDocument()
})

// RF-06
it('ao criar a vaga, chama o serviço e leva à página da vaga', async () => {
  service.create.mockResolvedValue(job())
  at('/criar', '/criar', <JobCreate />)
  await userEvent.type(screen.getByLabelText(/Cargo/), 'Dev .NET')
  await userEvent.type(screen.getByLabelText(/^Descrição/), 'Vaga remota')
  await userEvent.selectOptions(screen.getByLabelText(/Regime de contratação/), 'clt')
  await userEvent.type(screen.getByLabelText(/Valor mensal/), '5000')
  await userEvent.click(screen.getByRole('button', { name: 'Criar vaga' }))
  expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Dev .NET', contractType: 'clt', salary: 5000, status: 'active' }))
  expect(await screen.findByText('página da vaga')).toBeInTheDocument()
})

// RF-11 / RF-13 / RF-20
it('página da vaga exibe valor, benefícios e contagens', async () => {
  service.get.mockResolvedValue(job({ likes: 3, candidates: 1 }))
  at('/vagas/j1', '/vagas/:id', <JobPage />)
  expect(await screen.findByText('R$ 5.000,00 / mês')).toBeInTheDocument()
  expect(screen.getByText('Plano Médico')).toBeInTheDocument()
  expect(screen.getByText('3 curtidas')).toBeInTheDocument()
  expect(screen.getByText('1 candidato')).toBeInTheDocument()
})

// RF-12
it('curtir atualiza o total sem recarregar', async () => {
  service.get.mockResolvedValue(job())
  service.like.mockResolvedValue({ likes: 1, candidates: 0, likedByMe: true, appliedByMe: false })
  at('/vagas/j1', '/vagas/:id', <JobPage />)
  await userEvent.click(await screen.findByRole('button', { name: 'Curtir' }))
  expect(await screen.findByText('1 curtida')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Descurtir' })).toHaveAttribute('aria-pressed', 'true')
})

// RF-14 / RF-19 / RF-08 / RF-09
it('dono não curte nem se candidata e pode inativar a vaga', async () => {
  service.get.mockResolvedValue(job({ isOwner: true }))
  service.update.mockResolvedValue(job({ isOwner: true, status: 'inactive' }))
  service.candidates.mockResolvedValue([])
  at('/vagas/j1', '/vagas/:id', <JobPage />)
  await userEvent.click(await screen.findByRole('button', { name: 'Inativar' }))
  expect(screen.queryByRole('button', { name: 'Curtir' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Candidatar-se' })).toBeNull()
  expect(service.update).toHaveBeenCalledWith('j1', expect.objectContaining({ status: 'inactive' }))
  expect(await screen.findByText('Inativa')).toBeInTheDocument()
})

// RF-16 / RF-21 / RNF-01
it('candidatar-se pede confirmação e depois mostra Desistir', async () => {
  service.get.mockResolvedValue(job())
  service.apply.mockResolvedValue({ likes: 0, candidates: 1, likedByMe: false, appliedByMe: true })
  at('/vagas/j1', '/vagas/:id', <JobPage />)
  await userEvent.click(await screen.findByRole('button', { name: 'Candidatar-se' }))
  expect(service.apply).not.toHaveBeenCalled()
  expect(screen.getByText(/seu perfil e seu e-mail ficarão visíveis/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura' }))
  expect(await screen.findByRole('button', { name: 'Desistir' })).toBeInTheDocument()
  expect(screen.getByText('1 candidato')).toBeInTheDocument()
})

// RF-15
it('perfil incompleto mostra a mensagem com link para o perfil', async () => {
  service.get.mockResolvedValue(job())
  service.apply.mockRejectedValue(new ApiError(400, { code: 'profile_incomplete' }))
  at('/vagas/j1', '/vagas/:id', <JobPage />)
  await userEvent.click(await screen.findByRole('button', { name: 'Candidatar-se' }))
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura' }))
  expect(await screen.findByText('Complete seu perfil para se candidatar')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'seu perfil' })).toHaveAttribute('href', '/perfil')
})

// RF-22
it('lista de candidatos mostra nome e e-mail, ou o estado vazio', async () => {
  service.candidates.mockResolvedValueOnce([
    { userId: 'u1', firstName: 'Ana', lastName: 'Silva', email: 'ana@x.com', photoVersion: null, appliedAt: '2026-11-20T12:00:00Z' },
  ])
  const { unmount } = at('/', '/', <CandidateList jobId="j1" />)
  expect(await screen.findByText('ana@x.com')).toBeInTheDocument()
  unmount()
  service.candidates.mockResolvedValueOnce([])
  at('/', '/', <CandidateList jobId="j1" />)
  expect(await screen.findByText('Nenhum candidato ainda.')).toBeInTheDocument()
})

// RF-24
it('perfil do candidato é somente leitura', async () => {
  service.candidateProfile.mockResolvedValue(profile)
  at('/vagas/j1/candidatos/u1', '/vagas/:id/candidatos/:userId', <CandidateProfile />)
  expect(await screen.findByText('ana@x.com')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Adicionar|Editar|Remover/ })).toBeNull()
  expect(screen.getByRole('button', { name: 'Imprimir currículo' })).toBeInTheDocument()
})

// RF-26
it('currículo exibe os dados do candidato, não cita a vaga e abre a impressão', async () => {
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  service.candidateProfile.mockResolvedValue(profile)
  at('/vagas/j1/candidatos/u1/curriculo', '/vagas/:id/candidatos/:userId/curriculo', <ResumePrint />)
  expect(await screen.findByText('Ana Silva')).toBeInTheDocument()
  expect(screen.getByText('ana@x.com')).toBeInTheDocument()
  expect(screen.getByText('Ocupações')).toBeInTheDocument()
  expect(screen.queryByText(/Dev \.NET/)).toBeNull()
  expect(print).toHaveBeenCalled()
})
