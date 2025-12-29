import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authStore } from '../authStore'

export function RequireAuth({ children }: PropsWithChildren) {
  const token = authStore((s) => s.token)
  const loc = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return <>{children}</>
}

