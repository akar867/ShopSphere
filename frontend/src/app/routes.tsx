import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { ProductListPage } from '../features/products/pages/ProductListPage'
import { CartPage } from '../features/cart/pages/CartPage'
import { CheckoutPage } from '../features/cart/pages/CheckoutPage'
import { OrdersPage } from '../features/orders/pages/OrdersPage'
import { RequireAuth } from '../features/auth/components/RequireAuth'
import { RequireAdmin } from '../features/auth/components/RequireAdmin'
import { AdminProductsPage } from '../features/admin/products/pages/AdminProductsPage'
import { AdminProductFormPage } from '../features/admin/products/pages/AdminProductFormPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ProductListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />

        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/products"
          element={
            <RequireAdmin>
              <AdminProductsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <RequireAdmin>
              <AdminProductFormPage mode="create" />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <RequireAdmin>
              <AdminProductFormPage mode="edit" />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

