import { http } from '../../../shared/api/http'

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

export type UpsertProductRequest = {
  name: string
  description: string
  price: number
  stockQty: number
  imageUrl: string
  active: boolean
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

export async function adminListProducts(params: {
  q?: string
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}) {
  // Uses public list endpoint; admin endpoints are for write operations.
  const res = await http.get<PageResponse<Product>>('/api/products', { params })
  return res.data
}

export async function getProduct(id: number) {
  const res = await http.get<Product>(`/api/products/${id}`)
  return res.data
}

export async function createProduct(payload: UpsertProductRequest) {
  const res = await http.post<Product>('/api/products', payload)
  return res.data
}

export async function updateProduct(id: number, payload: UpsertProductRequest) {
  const res = await http.put<Product>(`/api/products/${id}`, payload)
  return res.data
}

