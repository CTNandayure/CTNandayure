import { Route, Routes } from 'react-router-dom'
import AdminHome from './pages/admin/AdminHome'
import AdminLayout from './pages/admin/AdminLayout'
import InstitutionalInfoAdminPage from './pages/admin/InstitutionalInfoAdminPage'
import AffiliationPage from './pages/AffiliationPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/afiliacion" element={<AffiliationPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="informacion-institucional" element={<InstitutionalInfoAdminPage />} />
      </Route>
    </Routes>
  )
}
