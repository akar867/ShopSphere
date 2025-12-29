import { http } from '../../shared/api/http'

export type Me = {
  id: number
  email: string
  role: string
}

export async function fetchMe() {
  const res = await http.get<Me>('/api/auth/me')
  return res.data
}

