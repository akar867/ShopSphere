import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Outlet, useNavigate } from 'react-router-dom'

export function AppLayout() {
  const nav = useNavigate()

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{ cursor: 'pointer' }}
              onClick={() => nav('/')}
            >
              ShadowDeploy
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <Button onClick={() => nav('/')}>Dashboard</Button>
              <Button onClick={() => nav('/runs')}>Runs</Button>
              <Button variant="contained" onClick={() => nav('/runs/new')}>
                New run
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box sx={{ py: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            ShadowDeploy MVP • Spring Boot backend • React UI
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

