import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api'
import { authStore } from '../authStore'

export function LoginPage() {
  const setToken = authStore((s) => s.setToken)
  const nav = useNavigate()
  const loc = useLocation()
  const from = useMemo(() => (loc.state as { from?: string } | null)?.from || '/', [loc.state])

  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('User@1234')

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setToken(data.accessToken)
      nav(from, { replace: true })
    },
  })

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Welcome back
              </Typography>
              <Typography color="text.secondary">
                Log in to continue to checkout and see your orders.
              </Typography>
            </Box>

            {mutation.isError ? (
              <Alert severity="error">
                {(mutation.error as Error).message || 'Login failed'}
              </Alert>
            ) : null}

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button
              variant="contained"
              size="large"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Logging in…' : 'Log in'}
            </Button>

            <Typography color="text.secondary" variant="body2">
              New here? <Link to="/register">Create an account</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

