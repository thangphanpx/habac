import type { SessionUser } from './types'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function request(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(path, { credentials: 'same-origin', ...init })
  if (response.ok) return response
  const body: { error?: string } = await response.json().catch(() => ({}))
  throw new ApiError(body.error ?? `Lỗi ${response.status}`, response.status)
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

// Kiểu dữ liệu trả về do từng nơi gọi khai báo; server đã kiểm tra trước khi trả.
export const apiGet = async <T>(path: string): Promise<T> => (await request(path, {})).json()
export const apiSend = async <T = { ok: true }>(method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> =>
  (await request(path, body === undefined ? { method } : jsonInit(method, body))).json()

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.set('file', file)
  const { url }: { url: string } = await (await request('/api/admin/upload', { method: 'POST', body: form })).json()
  return url
}

export async function fetchMe(): Promise<SessionUser | null> {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' })
  return response.ok ? response.json() : null
}
