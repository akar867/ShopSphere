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
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api'

export function RegisterPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => register(email, password),
    onSuccess: () => nav('/login', { replace: true }),
  })

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Create account
              </Typography>
              <Typography color="text.secondary">
                Register to place orders and track payments.
              </Typography>
            </Box>

            {mutation.isError ? (
              <Alert severity="error">
                {(mutation.error as Error).message || 'Registration failed'}
              </Alert>
            ) : null}

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Password (min 8 chars)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Button
              variant="contained"
              size="large"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creating…' : 'Create account'}
            </Button>

            <Typography color="text.secondary" variant="body2">
              Already have an account? <Link to="/login">Log in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

