import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiskScoreBadge } from '../components/RiskScoreBadge'
import { StatusChip } from '../components/StatusChip'
import { useShadowRuns } from '../hooks'

const STATUS_OPTIONS = ['all', 'pending', 'running', 'completed', 'failed']

export function ShadowDeployRunsPage() {
  const nav = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')

  const params = useMemo(() => {
    if (statusFilter === 'all') return undefined
    return { status: statusFilter }
  }, [statusFilter])

  const runsQuery = useShadowRuns(params)

  return (
    <Box sx={{ bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Shadow runs
            </Typography>
            <Typography color="text.secondary">
              Track parallel traffic runs and detect risky behavior before shipping.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => nav('/runs/new')}>
            New shadow run
          </Button>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{ minWidth: 160 }}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {runsQuery.isLoading ? (
              <Typography color="text.secondary">Loading runs...</Typography>
            ) : runsQuery.data?.length ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Environment</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Requests</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runsQuery.data.map((run) => (
                    <TableRow key={run.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{run.serviceName}</Typography>
                      </TableCell>
                      <TableCell>{run.environment}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{run.versionSha}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          vs {run.baseVersionSha || 'baseline'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={run.status} />
                      </TableCell>
                      <TableCell>
                        <RiskScoreBadge score={run.riskScore} />
                      </TableCell>
                      <TableCell>{run.requestCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => nav(`/runs/${run.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">No shadow runs found.</Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
