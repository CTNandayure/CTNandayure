import { Navigate, Route, Routes } from 'react-router-dom'
import AdminHome from './pages/admin/AdminHome'
import AdminLayout from './pages/admin/AdminLayout'
import InstitutionalInfoAdminPage from './pages/admin/InstitutionalInfoAdminPage'
import AffiliationPage from './modules/business/pages/AffiliationPage'
import LandingPage from './pages/LandingPage'
import NewsDetailPage from './pages/NewsDetailPage'
import NewsAdminPage from './modules/news/pages/NewsAdminPage'
import LoginPage from './modules/users/pages/LoginPage'
import ForgotPasswordPage from './modules/users/pages/ForgotPasswordPage'
import ResetPasswordPage from './modules/users/pages/ResetPasswordPage'
import ActivateAccountPage from './modules/users/pages/ActivateAccountPage'
import ActivationTokenPage from './modules/users/pages/ActivationTokenPage'
import ProfilePage from './modules/users/pages/ProfilePage'
import ChangePasswordPage from './modules/users/pages/ChangePasswordPage'
import UsersAdminPage from './modules/users/pages/UsersAdminPage'
import { ProtectedRoute } from './modules/users/components/ProtectedRoute/ProtectedRoute'
import BusinessAdminPage from './modules/business/pages/BusinessAdminPage'
import BusinessesPage from './modules/business/pages/BusinessesPage'
import BusinessDetailPage from './modules/business/pages/BusinessDetailPage'
import MapPage from './modules/business/pages/MapPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import ActivitiesPage from './modules/activities/pages/ActivitiesPage'
import ActivityDetailPage from './modules/activities/pages/ActivityDetailPage'
import ActivitiesAdminPage from './modules/activities/pages/ActivitiesAdminPage'
import { ScrollToHash } from './components/layout/ScrollToHash'

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/afiliacion" element={<AffiliationPage />} />
      <Route path="/mapa" element={<MapPage />} />
      <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />
      <Route path="/noticias/:slug" element={<NewsDetailPage />} />
      <Route path="/actividades" element={<ActivitiesPage />} />
      <Route path="/actividades/:slug" element={<ActivityDetailPage />} />
      <Route path="/negocios" element={<BusinessesPage />} />
      <Route path="/negocios/:slug" element={<BusinessDetailPage />} />
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
          <Route path="noticias" element={<NewsAdminPage />} />
          <Route path="noticias/nueva" element={<Navigate to="/admin/noticias" replace />} />
          <Route path="noticias/:id/editar" element={<Navigate to="/admin/noticias" replace />} />
          <Route path="negocios" element={<BusinessAdminPage />} />
          <Route path="actividades" element={<ActivitiesAdminPage />} />
          <Route path="actividades/nueva" element={<Navigate to="/admin/actividades" replace />} />
          <Route path="actividades/:id/editar" element={<Navigate to="/admin/actividades" replace />} />
          <Route path="usuarios" element={<UsersAdminPage />} />
        </Route>
      </Route>
    </Routes>
    </>
  )
}
