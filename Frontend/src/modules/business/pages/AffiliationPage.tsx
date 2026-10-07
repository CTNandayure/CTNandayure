import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AffiliationWizard } from '../components/AffiliationWizard/AffiliationWizard'
import { Button } from '../../../components/ui'

export default function AffiliationPage() {
  const [isComplete, setIsComplete] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-brand-paper py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">Afiliar mi negocio</h1>
            <p className="mt-2 text-gray-600">Únase a la plataforma turística de Nandayure</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/" className="text-brand-green hover:text-brand-green-strong font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>

        {isComplete ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">¡Solicitud enviada!</h2>
            <p className="text-gray-600 mb-8">
              Su solicitud de afiliación fue recibida exitosamente. Revisaremos su información y le enviaremos una respuesta al correo proporcionado.
            </p>
            <Link to="/">
              <Button variant="primary">Volver al inicio</Button>
            </Link>
          </div>
        ) : (
          <AffiliationWizard onCancel={() => navigate('/')} onComplete={() => setIsComplete(true)} />
        )}
      </div>
    </div>
  )
}
