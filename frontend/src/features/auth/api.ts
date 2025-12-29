import { http } from '../../shared/api/http'

export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
}

export async function login(email: string, password: string) {
  const res = await http.post<AuthResponse>('/api/auth/login', { email, password })
  return res.data
}

export async function register(email: string, password: string) {
  await http.post('/api/auth/register', { email, password })
}

