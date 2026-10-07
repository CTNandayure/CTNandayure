import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserProfile } from '../components/UserProfile/UserProfile'
import { useAuth } from '../context/useAuth'
import { businessService } from '../../business/services/businessService'
import { AffiliationWizard } from '../../business/components/AffiliationWizard/AffiliationWizard'
import { Alert, useToast } from '../../../components/ui'
import type { BusinessRecord } from '../../business/types/business.types'
import { cn } from '../../../lib/cn'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'business'>('profile')
  const [myBusiness, setMyBusiness] = useState<BusinessRecord | null>(null)
  const [loadingBusiness, setLoadingBusiness] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)

  const isBusinessUser = user?.role === 'NEGOCIO'

  const loadMyBusiness = async () => {
    try {
      setLoadingBusiness(true)
      setBusinessError(null)
      const data = await businessService.getMyBusiness()
      setMyBusiness(data)
    } catch (err: any) {
      setBusinessError(err.message || 'No se pudo cargar la información de su negocio')
    } finally {
      setLoadingBusiness(false)
    }
  }

  useEffect(() => {
    if (isBusinessUser) {
      loadMyBusiness()
    }
  }, [isBusinessUser])

  return (
    <main className="min-h-screen bg-brand-sand/45 px-6 py-8 md:px-12 md:py-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-end">
          <Link to="/" className="text-sm font-semibold text-brand-green-strong hover:underline">
            ← Volver al inicio
          </Link>
        </div>

        <header className="mt-10 flex flex-wrap items-end justify-between gap-6 border-b border-brand-navy/10 pb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-strong">
              Cuenta personal
            </p>
            <h1 className="mt-3 text-5xl font-bold leading-tight text-brand-navy">Mi perfil</h1>
          </div>
          <p className="max-w-lg text-base leading-7 text-brand-ink/65">
            Administra la información asociada a tu cuenta y mantén tus credenciales bajo control.
          </p>
        </header>

        {isBusinessUser && (
          <div className="flex gap-2 border-b border-brand-navy/15 mt-8 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={cn(
                '-mb-px border-b-2 px-5 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
                activeTab === 'profile'
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
              )}
            >
              Información de la cuenta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={cn(
                '-mb-px border-b-2 px-5 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
                activeTab === 'business'
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
              )}
            >
              Mi Negocio
            </button>
          </div>
        )}

        <div className="mt-8">
          {activeTab === 'profile' && (
            <UserProfile
              business={myBusiness}
              loadingBusiness={loadingBusiness}
              onGoToBusinessTab={() => setActiveTab('business')}
            />
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              {loadingBusiness ? (
                <div className="rounded-2xl border border-brand-navy/10 bg-white p-8 text-center text-brand-ink/60">
                  Cargando información del negocio...
                </div>
              ) : businessError ? (
                <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-8 text-center">
                  <Alert variant="info" title="Información no disponible">
                    {businessError}
                  </Alert>
                </div>
              ) : myBusiness ? (
                <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 md:p-8 shadow-sm">
                  <div className="mb-6 border-b border-brand-navy/10 pb-4">
                    <h2 className="text-2xl font-bold text-brand-navy">Gestión de mi negocio</h2>
                    <p className="text-sm text-brand-ink/60 mt-1">
                      Edite y mantenga actualizada la información pública de su negocio, fotos, horarios y documentos.
                    </p>
                  </div>
                  <AffiliationWizard
                    isEditMode
                    isUserSelfManagement
                    initialData={myBusiness}
                    businessId={myBusiness.id}
                    onCancel={() => setActiveTab('profile')}
                    onComplete={() => {
                      loadMyBusiness()
                      refreshUser()
                      showToast({
                        variant: 'success',
                        title: 'Negocio actualizado',
                        description: 'Los cambios fueron guardados exitosamente.',
                      })
                    }}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

