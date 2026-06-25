const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
export const BASE_URL = `${API_ROOT.replace(/\/$/, '')}/api/v1`

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  token?: string
  params?: Record<string, string | number | boolean | undefined>
  headers?: HeadersInit
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { method = 'GET', body, token, params, headers: extraHeaders } = options

  let url = `${BASE_URL}${path}`
  if (params) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) search.set(k, String(v))
    })
    const qs = search.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {}
  if (extraHeaders) {
    if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(extraHeaders)) {
      for (const [key, value] of extraHeaders) headers[key] = value
    } else {
      Object.assign(headers, extraHeaders)
    }
  }
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    let errorData: unknown
    try {
      errorData = await res.json()
    } catch {
      /* empty */
    }
    throw new ApiError(
      res.status,
      (errorData as { message?: string })?.message ?? `HTTP ${res.status}`,
      errorData,
    )
  }

  if (res.status === 204) return undefined as TResponse

  return res.json() as Promise<TResponse>
}

export function createApiClient(token?: string) {
  const opts = { token }

  return {
    get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(path, { ...opts, method: 'GET', params }),

    post: <T>(path: string, body?: unknown) => request<T>(path, { ...opts, method: 'POST', body }),

    put: <T>(path: string, body?: unknown) => request<T>(path, { ...opts, method: 'PUT', body }),

    patch: <T>(path: string, body?: unknown) => request<T>(path, { ...opts, method: 'PATCH', body }),

    delete: <T>(path: string) => request<T>(path, { ...opts, method: 'DELETE' }),

    upload: <T>(path: string, formData: FormData) =>
      request<T>(path, { ...opts, method: 'POST', body: formData }),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
