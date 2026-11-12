/** Mês/ano no formato "AAAA-MM". */
export type YearMonth = string

export type EducationLevel = 'fundamental' | 'medio' | 'tecnico' | 'superior' | 'pos_mba' | 'mestrado' | 'doutorado'

export interface OccupationInput {
  title: string
  company: string
  start: YearMonth
  end: YearMonth | null
  description: string | null
}
export interface EducationInput {
  institution: string
  course: string
  level: EducationLevel
  start: YearMonth
  end: YearMonth | null
  description: string | null
}
export interface CourseInput {
  name: string
  institution: string
  hours: number
  start: YearMonth
  end: YearMonth | null
}

export type Occupation = OccupationInput & { id: string }
export type Education = EducationInput & { id: string }
export type Course = CourseInput & { id: string }

export interface Profile {
  bio: string | null
  /** null = sem foto; muda a cada troca. */
  photoVersion: string | null
  /** Listas já ordenadas pelo servidor (mais recente primeiro). */
  occupations: Occupation[]
  educations: Education[]
  courses: Course[]
}
