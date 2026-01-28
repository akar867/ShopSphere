import { Chip } from '@mui/material'
import type { FindingSeverity } from '../types'

const SEVERITY_COLOR: Record<FindingSeverity, 'default' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
}

export function SeverityChip({ severity }: { severity: FindingSeverity }) {
  return <Chip label={severity} color={SEVERITY_COLOR[severity]} size="small" />
}
