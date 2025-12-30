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
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StripeCheckoutSection } from '../components/StripeCheckoutSection'
import { getApiErrorMessage } from '../../../shared/api/error'
import { STRIPE_PUBLISHABLE_KEY } from '../../../shared/stripe/stripe'
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
    'review' | 'order-created' | 'payment-intent' | 'stripe-payment' | 'paid'
  >('review')

  const [provider, setProvider] = useState<'DUMMY' | 'STRIPE'>(
    STRIPE_PUBLISHABLE_KEY ? 'STRIPE' : 'DUMMY',
  )
  const [orderId, setOrderId] = useState<number | null>(null)
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)

  const startCheckout = useMutation({
    mutationFn: async () => {
      const order = await createOrder(
        items.map((x) => ({ productId: x.productId, quantity: x.quantity })),
      )
      setOrderId(order.id)
      setStep('order-created')

      const payment = await createPaymentIntent(order.id, provider)
      setPaymentId(payment.id)
      setStep('payment-intent')

      if (provider === 'DUMMY') {
        const confirmed = await confirmPayment(payment.id, true)
        if (confirmed.status !== 'SUCCEEDED') throw new Error('Payment failed')
        await markOrderPaid(order.id)
        setStep('paid')
        clear()
        return
      }

      // STRIPE: render PaymentElement using clientSecret. User confirms payment in UI.
      setStripeClientSecret(payment.clientSecret)
      setStep('stripe-payment')
    },
  })

  const finalizeStripe = useMutation({
    mutationFn: async () => {
      if (!orderId || !paymentId) throw new Error('Missing order/payment state')

      const confirmed = await confirmPayment(paymentId, true)
      if (confirmed.status !== 'SUCCEEDED') {
        throw new Error('Stripe payment not completed yet')
      }

      await markOrderPaid(orderId)
      setStep('paid')
      clear()
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
              Flow: create order → create payment intent → pay (DUMMY or Stripe) → mark order paid.
            </Typography>
          </Box>

          {startCheckout.isError ? (
            <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
              {getApiErrorMessage(startCheckout.error)}
            </Alert>
          ) : null}
          {finalizeStripe.isError ? (
            <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
              {getApiErrorMessage(finalizeStripe.error)}
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

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography fontWeight={900}>Payment method</Typography>
                <FormControl>
                  <RadioGroup
                    row
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as 'DUMMY' | 'STRIPE')}
                  >
                    <FormControlLabel value="DUMMY" control={<Radio />} label="Demo (DUMMY)" />
                    <FormControlLabel
                      value="STRIPE"
                      control={<Radio />}
                      label="Stripe"
                      disabled={!STRIPE_PUBLISHABLE_KEY}
                    />
                  </RadioGroup>
                </FormControl>
                {!STRIPE_PUBLISHABLE_KEY ? (
                  <Typography variant="body2" color="text.secondary">
                    Stripe is disabled because <b>VITE_STRIPE_PUBLISHABLE_KEY</b> is not set in the frontend env.
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <Button onClick={() => nav('/cart')} disabled={startCheckout.isPending || finalizeStripe.isPending}>
              Back to cart
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              size="large"
              startIcon={<PaymentsOutlinedIcon />}
              disabled={startCheckout.isPending || finalizeStripe.isPending || step === 'stripe-payment'}
              onClick={() => startCheckout.mutate()}
            >
              {startCheckout.isPending ? 'Preparing…' : provider === 'STRIPE' ? 'Continue to Stripe' : 'Pay now (Demo)'}
            </Button>
          </Stack>

          {step === 'stripe-payment' && stripeClientSecret ? (
            <StripeCheckoutSection
              clientSecret={stripeClientSecret}
              onPaid={async () => finalizeStripe.mutateAsync()}
            />
          ) : null}

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

