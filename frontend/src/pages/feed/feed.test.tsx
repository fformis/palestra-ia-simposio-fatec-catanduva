import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { jobService } from '../../services/jobService'
import type { Job } from '../../services/jobTypes'
import { ClampedText } from './ClampedText'
import { Feed } from './Feed'
import { JobCard } from './JobCard'

vi.mock('../../services/jobService', () => ({
  jobService: {
    feed: vi.fn(),
    like: vi.fn(),
    apply: vi.fn(),
    imageUrl: () => '/img',
    ownerPhotoUrl: () => '/foto',
  },
}))

const service = vi.mocked(jobService)

const job = (over: Partial<Job> = {}): Job => ({
  id: 'j1',
  title: 'Dev .NET',
  company: 'Acme',
  description: 'Vaga **remota**',
  benefits: [],
  contractType: 'clt',
  salary: 5000,
  status: 'active',
  createdAt: '2026-11-20T12:00:00Z',
  imageVersion: null,
  owner: { firstName: 'Olga', lastName: 'Dona', photoVersion: null },
  isOwner: false,
  likes: 2,
  candidates: 1,
  likedByMe: false,
  appliedByMe: false,
  ...over,
})

/** IntersectionObserver falso: `reach()` simula a sentinela entrando na tela. */
let reach = () => {}
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      cb: IntersectionObserverCallback
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb
      }
      observe() {
        reach = () => this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }
      disconnect() {}
    },
  )
})

const renderFeed = () => render(<MemoryRouter><Feed /></MemoryRouter>)
const renderCard = (j: Job) => render(<MemoryRouter><JobCard job={j} onChange={() => {}} /></MemoryRouter>)

it('RF-03/RF-06: trocar para "Minhas vagas" busca só as vagas do usuário', async () => {
  service.feed.mockImplementation(async (scope) => ({ items: [job({ id: scope, title: `Vaga ${scope}` })], nextCursor: null }))
  renderFeed()
  await screen.findByText('Vaga all')
  await userEvent.click(screen.getByRole('radio', { name: 'Minhas vagas' }))
  expect(await screen.findByText('Vaga mine')).toBeInTheDocument()
  expect(screen.queryByText('Vaga all')).not.toBeInTheDocument()
})

it('RF-08: ao chegar ao fim da lista, carrega a próxima página até não haver mais', async () => {
  service.feed
    .mockResolvedValueOnce({ items: [job({ id: 'a', title: 'Primeira' })], nextCursor: 'c1' })
    .mockResolvedValueOnce({ items: [job({ id: 'b', title: 'Segunda' })], nextCursor: null })
  renderFeed()
  await screen.findByText('Primeira')
  act(() => reach())
  expect(await screen.findByText('Segunda')).toBeInTheDocument()
  expect(service.feed).toHaveBeenLastCalledWith('all', 'c1')
  expect(screen.getByText('Não há mais vagas.')).toBeInTheDocument()
})

it('RF-10: "Minhas vagas" vazia convida a criar uma vaga', async () => {
  service.feed.mockResolvedValue({ items: [], nextCursor: null })
  renderFeed()
  await userEvent.click(await screen.findByRole('radio', { name: 'Minhas vagas' }))
  expect(await screen.findByRole('link', { name: 'Criar uma vaga' })).toHaveAttribute('href', '/criar')
})

it('RF-17/RF-21: curtir no card atualiza o botão sem recarregar o feed', async () => {
  service.feed.mockResolvedValue({ items: [job()], nextCursor: null })
  service.like.mockResolvedValue({ likes: 3, candidates: 1, likedByMe: true, appliedByMe: false })
  renderFeed()
  await userEvent.click(await screen.findByRole('button', { name: 'Curtir' }))
  expect(await screen.findByRole('button', { name: 'Descurtir' })).toBeInTheDocument()
  expect(screen.getByText('3 curtidas')).toBeInTheDocument()
  expect(service.feed).toHaveBeenCalledTimes(1)
})

it('RF-18/RF-19: candidatar-se no card pede confirmação e depois mostra "Desistir"', async () => {
  service.feed.mockResolvedValue({ items: [job()], nextCursor: null })
  service.apply.mockResolvedValue({ likes: 2, candidates: 2, likedByMe: false, appliedByMe: true })
  renderFeed()
  await userEvent.click(await screen.findByRole('button', { name: 'Candidatar-se' }))
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar candidatura' }))
  expect(await screen.findByRole('button', { name: 'Desistir' })).toBeInTheDocument()
  expect(screen.getByText('2 candidatos')).toBeInTheDocument()
})

it('RF-12/RF-13/RF-16: card exibe anunciante, data, cargo com link, empresa, regime, valor e contagens', () => {
  renderCard(job())
  expect(screen.getByRole('link', { name: 'Dev .NET' })).toHaveAttribute('href', '/vagas/j1')
  for (const text of ['Olga Dona', '20/11/2026', 'Acme', 'CLT', 'R$ 5.000,00 / mês', '2 curtidas', '1 candidato'])
    expect(screen.getByText(text)).toBeInTheDocument()
})

it('RF-06/RF-14/RF-17: vaga própria inativa e sem imagem: selo, sem <img> e sem ações', () => {
  renderCard(job({ isOwner: true, status: 'inactive' }))
  expect(screen.getByText('Inativa')).toBeInTheDocument()
  expect(screen.queryByRole('img', { name: /Imagem da vaga/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Curtir|Candidatar-se/ })).not.toBeInTheDocument()
})

it('RF-15: texto cortado mostra "ver mais", que alterna para "ver menos"; texto curto não', async () => {
  const height = (scroll: number) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => scroll })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 60 })
  }
  height(60)
  const { unmount } = render(<ClampedText>curto</ClampedText>)
  expect(screen.queryByRole('button', { name: 'ver mais' })).not.toBeInTheDocument()
  unmount()

  height(200)
  render(<ClampedText>longo</ClampedText>)
  await userEvent.click(screen.getByRole('button', { name: 'ver mais' }))
  expect(screen.getByRole('button', { name: 'ver menos' })).toHaveAttribute('aria-expanded', 'true')
})
