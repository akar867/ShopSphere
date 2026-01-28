import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateShadowRun } from '../hooks'

export function ShadowDeployCreateRunPage() {
  const nav = useNavigate()
  const createRun = useCreateShadowRun()

  const [serviceName, setServiceName] = useState('')
  const [environment, setEnvironment] = useState('production')
  const [versionSha, setVersionSha] = useState('')
  const [baseVersionSha, setBaseVersionSha] = useState('')
  const [trafficSamplePercent, setTrafficSamplePercent] = useState(100)
  const [mockWrites, setMockWrites] = useState(true)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createRun.mutate(
      {
        serviceName,
        environment,
        versionSha,
        baseVersionSha: baseVersionSha || undefined,
        trafficSamplePercent,
        mockWrites,
      },
      {
        onSuccess: (data) => nav(`/runs/${data.id}`),
      },
    )
  }

  return (
    <Box sx={{ bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
        <Stack spacing={1} mb={3}>
          <Typography variant="h4" fontWeight={800}>
            Create shadow run
          </Typography>
          <Typography color="text.secondary">
            Define which service build to compare against production traffic.
          </Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Service name"
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Environment"
                    value={environment}
                    onChange={(event) => setEnvironment(event.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Shadow version SHA"
                    value={versionSha}
                    onChange={(event) => setVersionSha(event.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Baseline version SHA"
                    value={baseVersionSha}
                    onChange={(event) => setBaseVersionSha(event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Traffic sample percent"
                    type="number"
                    value={trafficSamplePercent}
                    onChange={(event) => setTrafficSamplePercent(Number(event.target.value))}
                    inputProps={{ min: 1, max: 100 }}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={<Switch checked={mockWrites} onChange={(event) => setMockWrites(event.target.checked)} />}
                    label="Mock writes (safe mode)"
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
                <Button onClick={() => nav('/runs')}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={createRun.isPending}>
                  {createRun.isPending ? 'Creating...' : 'Start shadow run'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
