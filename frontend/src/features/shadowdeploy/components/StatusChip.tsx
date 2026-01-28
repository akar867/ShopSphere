import { Chip } from '@mui/material'
import type { RunStatus } from '../types'

const STATUS_COLOR: Record<RunStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  RUNNING: 'info',
  COMPLETED: 'success',
  FAILED: 'error',
}

export function StatusChip({ status }: { status: RunStatus }) {
  return <Chip label={status} color={STATUS_COLOR[status]} size="small" />
}
