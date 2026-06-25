import { ApiError } from './client'

const STATUS_MESSAGES: Record<number, string> = {
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Já existe um registro com esses dados.',
  422: 'Dados inválidos. Verifique os campos.',
  429: 'Muitas tentativas. Aguarde um momento.',
  500: 'Erro interno do servidor. Tente novamente.',
  503: 'Serviço temporariamente indisponível.',
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (STATUS_MESSAGES[err.status]) return STATUS_MESSAGES[err.status]
    const data = err.data as { message?: string | string[] } | undefined
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
    return err.message || fallback
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
