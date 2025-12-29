import { create } from 'zustand'

export type CartItem = {
  productId: number
  name: string
  price: number
  imageUrl: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (productId: number) => void
  setQty: (productId: number, qty: number) => void
  clear: () => void
}

const STORAGE_KEY = 'ecommerce.cart.v1'

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function persist(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const cartStore = create<CartState>((set, get) => ({
  items: loadInitial(),
  add: (item, qty = 1) => {
    const items = [...get().items]
    const idx = items.findIndex((x) => x.productId === item.productId)
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + qty }
    } else {
      items.push({ ...item, quantity: qty })
    }
    persist(items)
    set({ items })
  },
  remove: (productId) => {
    const items = get().items.filter((x) => x.productId !== productId)
    persist(items)
    set({ items })
  },
  setQty: (productId, qty) => {
    const safeQty = Math.max(1, Math.min(999, qty))
    const items = get().items.map((x) =>
      x.productId === productId ? { ...x, quantity: safeQty } : x,
    )
    persist(items)
    set({ items })
  },
  clear: () => {
    persist([])
    set({ items: [] })
  },
}))

