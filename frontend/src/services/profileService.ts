import { api, BASE_URL } from './api'
import type { Course, CourseInput, Education, EducationInput, Occupation, OccupationInput, Profile } from './profileTypes'

const base = '/api/profile'

/** Cria (sem id) ou edita (com id) um item de uma das listas do perfil. */
const save =
  <TInput, TItem>(list: string) =>
  (input: TInput, id?: string) =>
    id ? api<TItem>('PUT', `${base}/${list}/${id}`, input) : api<TItem>('POST', `${base}/${list}`, input)

const remove = (list: string) => (id: string) => api('DELETE', `${base}/${list}/${id}`)

export const profileService = {
  getProfile: () => api<Profile>('GET', base),
  updateBio: (bio: string) => api('PUT', `${base}/bio`, { bio }),

  uploadPhoto: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api<{ photoVersion: string }>('PUT', `${base}/photo`, form)
  },
  removePhoto: () => api('DELETE', `${base}/photo`),
  photoUrl: (version: string) => `${BASE_URL}${base}/photo?v=${encodeURIComponent(version)}`,

  saveOccupation: save<OccupationInput, Occupation>('occupations'),
  removeOccupation: remove('occupations'),
  saveEducation: save<EducationInput, Education>('educations'),
  removeEducation: remove('educations'),
  saveCourse: save<CourseInput, Course>('courses'),
  removeCourse: remove('courses'),
}
