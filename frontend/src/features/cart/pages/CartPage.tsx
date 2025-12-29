import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatMoney } from '../../../shared/utils/money'
import { cartStore } from '../cartStore'

export function CartPage() {
  const nav = useNavigate()
  const items = cartStore((s) => s.items)
  const setQty = cartStore((s) => s.setQty)
  const remove = cartStore((s) => s.remove)

  const total = useMemo(
    () => items.reduce((sum, x) => sum + x.price * x.quantity, 0),
    [items],
  )

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Your cart
            </Typography>
            <Typography color="text.secondary">
              Review items before checkout.
            </Typography>
          </Box>

          {items.length === 0 ? (
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography>Your cart is empty.</Typography>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => nav('/')}>
                  Browse products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Stack spacing={2}>
                {items.map((item) => (
                  <Card key={item.productId} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <CardMedia
                        component="img"
                        image={item.imageUrl}
                        sx={{ width: 92, height: 72, borderRadius: 2, objectFit: 'cover' }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={800}>{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatMoney(item.price)}
                        </Typography>
                      </Box>
                      <TextField
                        label="Qty"
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => setQty(item.productId, Number(e.target.value))}
                        sx={{ width: 92 }}
                        inputProps={{ min: 1 }}
                      />
                      <Typography fontWeight={900} sx={{ width: 120, textAlign: 'right' }}>
                        {formatMoney(item.price * item.quantity)}
                      </Typography>
                      <IconButton onClick={() => remove(item.productId)} aria-label="remove">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={900}>
                  Total: {formatMoney(total)}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button onClick={() => nav('/')}>Continue shopping</Button>
                  <Button variant="contained" onClick={() => nav('/checkout')}>
                    Checkout
                  </Button>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

