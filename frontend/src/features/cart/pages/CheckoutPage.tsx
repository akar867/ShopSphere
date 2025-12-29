import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatMoney } from '../../../shared/utils/money'
import { createOrder, markOrderPaid } from '../../orders/api'
import { confirmPayment, createPaymentIntent } from '../../payments/api'
import { cartStore } from '../cartStore'

export function CheckoutPage() {
  const nav = useNavigate()
  const items = cartStore((s) => s.items)
  const clear = cartStore((s) => s.clear)

  const total = useMemo(
    () => items.reduce((sum, x) => sum + x.price * x.quantity, 0),
    [items],
  )

  const [step, setStep] = useState<
    'review' | 'order-created' | 'payment-intent' | 'paid'
  >('review')

  const flow = useMutation({
    mutationFn: async () => {
      const order = await createOrder(
        items.map((x) => ({ productId: x.productId, quantity: x.quantity })),
      )
      setStep('order-created')

      const payment = await createPaymentIntent(order.id)
      setStep('payment-intent')

      const confirmed = await confirmPayment(payment.id, true)
      if (confirmed.status !== 'SUCCEEDED') {
        throw new Error('Payment failed')
      }

      await markOrderPaid(order.id)
      setStep('paid')
      clear()
      return { orderId: order.id, paymentId: payment.id }
    },
  })

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Container maxWidth="sm">
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography>Your cart is empty.</Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={() => nav('/')}>
                Browse products
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Checkout
            </Typography>
            <Typography color="text.secondary">
              Demo flow: create order → create payment intent → confirm payment → mark order paid.
            </Typography>
          </Box>

          {flow.isError ? (
            <Alert severity="error">
              {(flow.error as Error).message || 'Checkout failed'}
            </Alert>
          ) : null}

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography fontWeight={900}>Order summary</Typography>
                {items.map((x) => (
                  <Stack key={x.productId} direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      {x.name} × {x.quantity}
                    </Typography>
                    <Typography fontWeight={700}>{formatMoney(x.price * x.quantity)}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={900}>Total</Typography>
                  <Typography fontWeight={900}>{formatMoney(total)}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <Button onClick={() => nav('/cart')} disabled={flow.isPending}>
              Back to cart
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              size="large"
              startIcon={<PaymentsOutlinedIcon />}
              disabled={flow.isPending}
              onClick={() => flow.mutate()}
            >
              {flow.isPending ? 'Processing…' : 'Pay now (Demo)'}
            </Button>
          </Stack>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography fontWeight={900}>Status</Typography>
                <Typography color="text.secondary">
                  Current step: <b>{step}</b>
                </Typography>
                {step === 'paid' ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleOutlineIcon color="success" />
                    <Typography fontWeight={800}>Payment complete. Order marked as PAID.</Typography>
                    <Button onClick={() => nav('/orders')}>View orders</Button>
                  </Stack>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

