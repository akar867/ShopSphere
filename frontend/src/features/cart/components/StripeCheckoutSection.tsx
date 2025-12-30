import { Elements } from '@stripe/react-stripe-js'
import { Alert, Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { StripePaymentElement } from '../../payments/stripe/StripePaymentElement'
import { stripePromise, STRIPE_PUBLISHABLE_KEY } from '../../../shared/stripe/stripe'

export function StripeCheckoutSection({
  clientSecret,
  onPaid,
}: {
  clientSecret: string
  onPaid: () => Promise<void>
}) {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <Alert severity="warning">
        Stripe publishable key is missing. Set <b>VITE_STRIPE_PUBLISHABLE_KEY</b> in the frontend env.
      </Alert>
    )
  }

  if (!stripePromise) {
    return <Alert severity="warning">Stripe is not initialized.</Alert>
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography fontWeight={900}>Pay securely with Stripe</Typography>
            <Typography color="text.secondary" variant="body2">
              Enter card details below. Test cards work in Stripe test mode.
            </Typography>
          </Box>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <StripePaymentElement onSuccess={onPaid} />
          </Elements>
        </Stack>
      </CardContent>
    </Card>
  )
}

