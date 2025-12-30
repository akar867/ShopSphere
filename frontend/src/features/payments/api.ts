import { http } from '../../shared/api/http'

export type Payment = {
  id: number
  orderId: number
  userId: number
  provider: string
  status: string
  amount: number
  currency: string
  providerPaymentId: string
  clientSecret: string
  createdAt: string
  updatedAt: string
}

export async function createPaymentIntent(orderId: number, provider: 'DUMMY' | 'STRIPE' = 'DUMMY') {
  const res = await http.post<Payment>('/api/payments/intent', {
    orderId,
    provider,
  })
  return res.data
}

export async function confirmPayment(paymentId: number, success = true) {
  const res = await http.post<Payment>(`/api/payments/${paymentId}/confirm`, {
    success,
  })
  return res.data
}

