import { Route, Routes } from 'react-router-dom'
import AdminHome from './pages/admin/AdminHome'
import AdminLayout from './pages/admin/AdminLayout'
import InstitutionalInfoAdminPage from './pages/admin/InstitutionalInfoAdminPage'
import AffiliationPage from './pages/AffiliationPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './modules/usuarios/pages/LoginPage'
import ForgotPasswordPage from './modules/usuarios/pages/ForgotPasswordPage'
import ResetPasswordPage from './modules/usuarios/pages/ResetPasswordPage'
import ActivateAccountPage from './modules/usuarios/pages/ActivateAccountPage'
import ActivationTokenPage from './modules/usuarios/pages/ActivationTokenPage'
import ProfilePage from './modules/usuarios/pages/ProfilePage'
import ChangePasswordPage from './modules/usuarios/pages/ChangePasswordPage'
import { ProtectedRoute } from './modules/usuarios/components/ProtectedRoute/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/afiliacion" element={<AffiliationPage />} />
      <Route path="/usuarios/login" element={<LoginPage />} />
      <Route path="/usuarios/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/usuarios/restablecer" element={<ResetPasswordPage />} />
      <Route path="/usuarios/activar" element={<ActivateAccountPage />} />
      <Route path="/usuarios/activar-token" element={<ActivationTokenPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/usuarios/perfil" element={<ProfilePage />} />
        <Route path="/usuarios/cambiar-contrasena" element={<ChangePasswordPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="informacion-institucional" element={<InstitutionalInfoAdminPage />} />
      </Route>
    </Routes>
  )
}
