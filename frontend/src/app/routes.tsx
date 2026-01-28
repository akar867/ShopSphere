import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { ShadowDeployCreateRunPage } from '../features/shadowdeploy/pages/ShadowDeployCreateRunPage'
import { ShadowDeployDashboardPage } from '../features/shadowdeploy/pages/ShadowDeployDashboardPage'
import { ShadowDeployRunDetailsPage } from '../features/shadowdeploy/pages/ShadowDeployRunDetailsPage'
import { ShadowDeployRunsPage } from '../features/shadowdeploy/pages/ShadowDeployRunsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ShadowDeployDashboardPage />} />
        <Route path="/runs" element={<ShadowDeployRunsPage />} />
        <Route path="/runs/new" element={<ShadowDeployCreateRunPage />} />
        <Route path="/runs/:id" element={<ShadowDeployRunDetailsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

