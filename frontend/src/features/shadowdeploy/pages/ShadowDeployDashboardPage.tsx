import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RiskScoreBadge } from '../components/RiskScoreBadge'
import { SeverityChip } from '../components/SeverityChip'
import { StatusChip } from '../components/StatusChip'
import { useShadowRuns, useShadowSummary } from '../hooks'

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export function ShadowDeployDashboardPage() {
  const nav = useNavigate()
  const summary = useShadowSummary()
  const recentRuns = useShadowRuns({ limit: 4 })

  return (
    <Box sx={{ bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }} mb={4}>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              ShadowDeploy
            </Typography>
            <Typography color="text.secondary">
              Compare shadow traffic against production before you ship. Spot response diffs, latency
              regressions, and risky edge cases with AI-ready summaries.
            </Typography>
          </Box>
          <Button variant="contained" size="large" onClick={() => nav('/runs/new')}>
            Create shadow run
          </Button>
        </Stack>

        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={3}>
            <SummaryCard label="Total runs" value={summary.data ? `${summary.data.totalRuns}` : '--'} />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard label="Active runs" value={summary.data ? `${summary.data.activeRuns}` : '--'} />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard label="High risk runs" value={summary.data ? `${summary.data.highRiskRuns}` : '--'} />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard
              label="Avg risk score"
              value={summary.data ? summary.data.averageRiskScore.toFixed(1) : '--'}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={700}>
                    Recent runs
                  </Typography>
                  <Button size="small" onClick={() => nav('/runs')}>
                    View all
                  </Button>
                </Stack>
                <Stack spacing={2} divider={<Divider flexItem />}>
                  {recentRuns.isLoading ? (
                    <Typography color="text.secondary">Loading runs...</Typography>
                  ) : (
                    recentRuns.data?.map((run) => (
                      <Stack key={run.id} direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <Box flex={1}>
                          <Typography fontWeight={700}>{run.serviceName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {run.environment} · {run.versionSha} vs {run.baseVersionSha || 'baseline'}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StatusChip status={run.status} />
                          <RiskScoreBadge score={run.riskScore} />
                          <Button size="small" onClick={() => nav(`/runs/${run.id}`)}>
                            Details
                          </Button>
                        </Stack>
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Top findings
                </Typography>
                <Stack spacing={2}>
                  {summary.isLoading ? (
                    <Typography color="text.secondary">Loading findings...</Typography>
                  ) : summary.data?.topFindings.length ? (
                    summary.data.topFindings.map((finding, index) => (
                      <Stack key={`${finding.runId}-${index}`} spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <SeverityChip severity={finding.severity} />
                          <Typography variant="body2" color="text.secondary">
                            {finding.serviceName}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2">{finding.summary}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Impact: {finding.impactPercent.toFixed(1)}% · {finding.type}
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary">No findings detected yet.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Risky services
                </Typography>
                <Stack spacing={1}>
                  {summary.isLoading ? (
                    <Typography color="text.secondary">Loading services...</Typography>
                  ) : summary.data?.topServices.length ? (
                    summary.data.topServices.map((service) => (
                      <Stack key={service.serviceName} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{service.serviceName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.averageRiskScore} avg risk · {service.runCount} runs
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary">No service data yet.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
