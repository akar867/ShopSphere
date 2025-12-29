import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useMe } from '../useMe'
import { RequireAuth } from './RequireAuth'

export function RequireAdmin({ children }: PropsWithChildren) {
  return (
    <RequireAuth>
      <RequireAdminInner>{children}</RequireAdminInner>
    </RequireAuth>
  )
}

function RequireAdminInner({ children }: PropsWithChildren) {
  const me = useMe()

  if (me.isLoading) return null
  if (!me.data) return <Navigate to="/login" replace />

  if (me.data.role !== 'ADMIN') return <Navigate to="/" replace />

  return <>{children}</>
}

