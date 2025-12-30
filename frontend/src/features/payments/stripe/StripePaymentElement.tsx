import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Alert, Button, Stack } from '@mui/material'
import { useState } from 'react'

export function StripePaymentElement({
  onSuccess,
}: {
  onSuccess: () => Promise<void> | void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handlePay() {
    if (!stripe || !elements) return
    setPending(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed')
      setPending(false)
      return
    }

    // If confirmPayment succeeds without error, PaymentIntent is either succeeded
    // or requires additional steps (handled by redirect if required).
    await onSuccess()
    setPending(false)
  }

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <PaymentElement />
      <Button
        variant="contained"
        size="large"
        disabled={!stripe || !elements || pending}
        onClick={handlePay}
      >
        {pending ? 'Processing…' : 'Pay with Stripe'}
      </Button>
    </Stack>
  )
}

