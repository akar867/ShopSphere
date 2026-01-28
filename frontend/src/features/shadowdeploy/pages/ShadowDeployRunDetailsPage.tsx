import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RiskScoreBadge } from '../components/RiskScoreBadge'
import { SeverityChip } from '../components/SeverityChip'
import { StatusChip } from '../components/StatusChip'
import { useShadowRun, useShadowRunDiffs } from '../hooks'

function formatDate(value?: string | null) {
  if (!value) return '--'
  return new Date(value).toLocaleString()
}

export function ShadowDeployRunDetailsPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const runId = useMemo(() => Number(id), [id])

  const runQuery = useShadowRun(runId)
  const diffsQuery = useShadowRunDiffs(runId)

  if (!Number.isFinite(runId)) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography>Invalid run id.</Typography>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Button onClick={() => nav('/runs')}>Back</Button>
          <Typography variant="h4" fontWeight={800}>
            Shadow run details
          </Typography>
        </Stack>

        {runQuery.isLoading ? (
          <Typography color="text.secondary">Loading run...</Typography>
        ) : runQuery.data ? (
          <>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {runQuery.data.serviceName}
                    </Typography>
                    <Typography color="text.secondary">
                      {runQuery.data.environment} · {runQuery.data.versionSha} vs{' '}
                      {runQuery.data.baseVersionSha || 'baseline'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StatusChip status={runQuery.data.status} />
                    <RiskScoreBadge score={runQuery.data.riskScore} />
                  </Stack>
                </Stack>

                <Grid container spacing={2} mt={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Requests mirrored
                    </Typography>
                    <Typography fontWeight={700}>
                      {runQuery.data.requestCount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Error rate
                    </Typography>
                    <Typography fontWeight={700}>{(runQuery.data.errorRate * 100).toFixed(2)}%</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      p95 latency delta
                    </Typography>
                    <Typography fontWeight={700}>{runQuery.data.latencyP95DeltaMs.toFixed(1)} ms</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Traffic sample
                    </Typography>
                    <Typography fontWeight={700}>{runQuery.data.trafficSamplePercent}%</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Started
                    </Typography>
                    <Typography>{formatDate(runQuery.data.startedAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography>{formatDate(runQuery.data.completedAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Writes
                    </Typography>
                    <Chip
                      label={runQuery.data.mockWrites ? 'Mocked' : 'Live'}
                      color={runQuery.data.mockWrites ? 'success' : 'warning'}
                      size="small"
                    />
                  </Grid>
                </Grid>

                {runQuery.data.aiSummary ? (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      AI summary
                    </Typography>
                    <Typography>{runQuery.data.aiSummary}</Typography>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={700}>
                    Diff findings
                  </Typography>
                </Stack>

                {diffsQuery.isLoading ? (
                  <Typography color="text.secondary">Loading findings...</Typography>
                ) : diffsQuery.data?.length ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Severity</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Impact</TableCell>
                        <TableCell>Latency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {diffsQuery.data.map((finding) => (
                        <TableRow key={finding.id} hover>
                          <TableCell>
                            <SeverityChip severity={finding.severity} />
                          </TableCell>
                          <TableCell>{finding.type}</TableCell>
                          <TableCell>{finding.endpoint}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {finding.summary}
                            </Typography>
                            {finding.aiExplanation ? (
                              <Typography variant="caption" color="text.secondary">
                                {finding.aiExplanation}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>{finding.impactPercent.toFixed(1)}%</TableCell>
                          <TableCell>{finding.latencyDeltaMs.toFixed(1)} ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography color="text.secondary">No findings yet.</Typography>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Typography color="text.secondary">Run not found.</Typography>
        )}
      </Container>
    </Box>
  )
}
