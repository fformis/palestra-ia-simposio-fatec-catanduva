import { api, BASE_URL } from './api'
import type { Candidate, CandidateProfile, Engagement, FeedScope, Job, JobFeedPage, JobInput } from './jobTypes'

const base = '/api/jobs'
const v = (version: string) => `?v=${encodeURIComponent(version)}`

export const jobService = {
  feed: (scope: FeedScope, cursor?: string) =>
    api<JobFeedPage>('GET', `${base}?scope=${scope}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`),
  ownerPhotoUrl: (id: string, version: string) => `${BASE_URL}${base}/${id}/owner/photo${v(version)}`,

  create: (input: JobInput) => api<Job>('POST', base, input),
  get: (id: string) => api<Job>('GET', `${base}/${id}`),
  update: (id: string, input: JobInput) => api<Job>('PUT', `${base}/${id}`, input),

  uploadImage: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api<{ imageVersion: string }>('PUT', `${base}/${id}/image`, form)
  },
  removeImage: (id: string) => api('DELETE', `${base}/${id}/image`),
  imageUrl: (id: string, version: string) => `${BASE_URL}${base}/${id}/image${v(version)}`,

  like: (id: string) => api<Engagement>('PUT', `${base}/${id}/like`),
  unlike: (id: string) => api<Engagement>('DELETE', `${base}/${id}/like`),
  apply: (id: string) => api<Engagement>('PUT', `${base}/${id}/application`),
  withdraw: (id: string) => api<Engagement>('DELETE', `${base}/${id}/application`),

  candidates: (id: string) => api<Candidate[]>('GET', `${base}/${id}/candidates`),
  candidateProfile: (id: string, userId: string) => api<CandidateProfile>('GET', `${base}/${id}/candidates/${userId}`),
  candidatePhotoUrl: (id: string, userId: string, version: string) => `${BASE_URL}${base}/${id}/candidates/${userId}/photo${v(version)}`,
}
