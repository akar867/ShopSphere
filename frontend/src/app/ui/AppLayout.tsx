import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Outlet, useNavigate } from 'react-router-dom'
import { authStore } from '../../features/auth/authStore'
import { cartStore } from '../../features/cart/cartStore'

export function AppLayout() {
  const nav = useNavigate()
  const token = authStore((s) => s.token)
  const logout = authStore((s) => s.logout)
  const cartCount = cartStore((s) => s.items.reduce((sum, x) => sum + x.quantity, 0))

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
              ShopSphere
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <Button onClick={() => nav('/')}>Products</Button>
              <Button onClick={() => nav('/orders')} disabled={!token}>
                Orders
              </Button>

              {token ? (
                <Button color="inherit" onClick={() => { logout(); nav('/') }}>
                  Logout
                </Button>
              ) : (
                <Button variant="contained" onClick={() => nav('/login')}>
                  Login
                </Button>
              )}

              <IconButton onClick={() => nav('/cart')} aria-label="cart">
                <Badge color="primary" badgeContent={cartCount} showZero>
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
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
            Demo e-commerce app • Spring Boot microservices • React UI
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

