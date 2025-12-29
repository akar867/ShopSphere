import axios from 'axios'

type ApiError = {
  message?: string
  fieldViolations?: Array<{ field: string; message: string }>
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined
    if (data?.fieldViolations?.length) {
      return data.fieldViolations
        .map((v) => `${v.field}: ${v.message}`)
        .join('\n')
    }
    if (data?.message) return data.message
    if (typeof err.response?.data === 'string' && err.response.data.trim()) {
      return err.response.data
    }
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return 'Request failed'
}

