import { Route, Routes } from 'react-router-dom'
import AdminHome from './pages/admin/AdminHome'
import AdminLayout from './pages/admin/AdminLayout'
import InstitutionalInfoAdminPage from './pages/admin/InstitutionalInfoAdminPage'
import AffiliationPage from './pages/AffiliationPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './modules/users/pages/LoginPage'
import ForgotPasswordPage from './modules/users/pages/ForgotPasswordPage'
import ResetPasswordPage from './modules/users/pages/ResetPasswordPage'
import ActivateAccountPage from './modules/users/pages/ActivateAccountPage'
import ActivationTokenPage from './modules/users/pages/ActivationTokenPage'
import ProfilePage from './modules/users/pages/ProfilePage'
import ChangePasswordPage from './modules/users/pages/ChangePasswordPage'
import UsersAdminPage from './modules/users/pages/UsersAdminPage'
import { ProtectedRoute } from './modules/users/components/ProtectedRoute/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/afiliacion" element={<AffiliationPage />} />
<Route path="/users/login" element={<LoginPage />} />
      <Route path="/users/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/users/restablecer" element={<ResetPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/users/activar" element={<ActivateAccountPage />} />
        <Route path="/users/activar-token" element={<ActivationTokenPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/users/perfil" element={<ProfilePage />} />
        <Route path="/users/cambiar-contrasena" element={<ChangePasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="informacion-institucional" element={<InstitutionalInfoAdminPage />} />
          <Route path="usuarios" element={<UsersAdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
