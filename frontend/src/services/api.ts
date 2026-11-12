import type { ApiErrorCode } from './authTypes'

export const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

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

/** `body` comum vai como JSON; `FormData` (ex.: envio de foto) vai como multipart, com o cabeçalho definido pelo navegador. */
export async function api<T = void>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined || isForm ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.()
    const data = await response.json().catch(() => ({}))
    throw new ApiError(response.status, data)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
