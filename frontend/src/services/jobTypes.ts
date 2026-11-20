import type { Course, Education, Occupation } from './profileTypes'

export type ContractType = 'clt' | 'pj' | 'estagio'
export type Benefit = 'medical' | 'dental' | 'pet' | 'gympass' | 'birthday_off'
export type JobStatus = 'active' | 'inactive'

export interface JobInput {
  title: string
  company: string | null
  /** Markdown restrito: **negrito**, *itálico*, listas "- " e "1. ". */
  description: string
  benefits: Benefit[]
  contractType: ContractType
  /** Reais, valor mensal. */
  salary: number
  status: JobStatus
}

export interface Engagement {
  likes: number
  candidates: number
  likedByMe: boolean
  appliedByMe: boolean
}

export interface Job extends JobInput, Engagement {
  id: string
  /** ISO 8601. */
  createdAt: string
  /** null = ilustração padrão. */
  imageVersion: string | null
  owner: { firstName: string; lastName: string; photoVersion: string | null }
  isOwner: boolean
}

/** Visões do feed (spec 010): todas as vagas ativas ou só as minhas. */
export type FeedScope = 'all' | 'mine'

export interface JobFeedPage {
  /** Até 10 vagas, da mais recente para a mais antiga. */
  items: Job[]
  /** null = não há mais vagas. */
  nextCursor: string | null
}

export interface Candidate {
  userId: string
  firstName: string
  lastName: string
  email: string
  photoVersion: string | null
  appliedAt: string
}

export interface CandidateProfile {
  firstName: string
  lastName: string
  email: string
  bio: string | null
  photoVersion: string | null
  occupations: Occupation[]
  educations: Education[]
  courses: Course[]
}
