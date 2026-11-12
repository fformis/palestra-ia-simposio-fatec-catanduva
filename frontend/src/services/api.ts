import type { ApiErrorCode } from './authTypes'

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number
  readonly code?: ApiErrorCode
  readonly retryAfterSeconds?: number
  readonly fields?: Record<string, string>

  constructor(status: number, body: { code?: ApiErrorCode; retryAfterSeconds?: number; fields?: Record<string, string> } = {}) {
    super(body.code ?? `http_${status}`)
    this.status = status
    this.code = body.code
    this.retryAfterSeconds = body.retryAfterSeconds
    this.fields = body.fields
  }
}

let onUnauthorized: (() => void) | undefined

/** Registra o que fazer quando a API responde 401 (sessão expirada/ausente). */
export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  onUnauthorized = handler
}

export async function api<T = void>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.()
    const data = await response.json().catch(() => ({}))
    throw new ApiError(response.status, data)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
