import { create } from 'zustand'

type AuthState = {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
}

const STORAGE_KEY = 'ecommerce.auth.token'

export const authStore = create<AuthState>((set) => ({
  token: localStorage.getItem(STORAGE_KEY),
  setToken: (token) => {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
    set({ token })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: null })
  },
}))

