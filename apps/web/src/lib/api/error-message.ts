import { ApiError } from './client'

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const data = err.data as { message?: string | string[] } | undefined
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
    return err.message || fallback
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
