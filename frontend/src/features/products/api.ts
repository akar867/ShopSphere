import { http } from '../../shared/api/http'

export type Product = {
  id: number
  name: string
  description: string
  price: number
  stockQty: number
  imageUrl: string
  active: boolean
  createdAt: string
}

export type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  sort: string
}

export async function fetchProducts(params: {
  q?: string
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}) {
  const res = await http.get<PageResponse<Product>>('/api/products', { params })
  return res.data
}

