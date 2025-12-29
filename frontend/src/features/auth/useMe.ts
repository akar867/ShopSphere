import { useQuery } from '@tanstack/react-query'
import { authStore } from './authStore'
import { fetchMe } from './me'

export function useMe() {
  const token = authStore((s) => s.token)
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: Boolean(token),
    staleTime: 60_000,
  })
}

