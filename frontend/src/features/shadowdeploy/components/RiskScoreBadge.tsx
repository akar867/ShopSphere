import { Chip } from '@mui/material'

function riskColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'error'
  if (score >= 50) return 'warning'
  return 'success'
}

export function RiskScoreBadge({ score }: { score: number }) {
  return <Chip label={`Risk ${score}`} color={riskColor(score)} size="small" />
}
