import { http } from '../../shared/api/http'

export type CreateOrderItem = { productId: number; quantity: number }

export type OrderItem = {
  id: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type Order = {
  id: number
  userId: number
  status: string
  totalAmount: number
  currency: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export async function createOrder(items: CreateOrderItem[]) {
  const res = await http.post<Order>('/api/orders', { items })
  return res.data
}

export async function listMyOrders(page = 0, size = 10) {
  const res = await http.get<PageResponse<Order>>('/api/orders/my', { params: { page, size } })
  return res.data
}

export async function markOrderPaid(orderId: number) {
  const res = await http.post<Order>(`/api/orders/${orderId}/mark-paid`)
  return res.data
}

