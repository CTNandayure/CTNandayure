import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Container, Button } from '../components/ui'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-paper flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <Container className="max-w-4xl">
          {/* Navegación y encabezado */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-green transition-colors mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>

            <div className="border-b border-brand-navy/15 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
                Marco Legal y Transparencia
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
                Política de Privacidad y Tratamiento de Datos Personales
              </h1>
              <p className="mt-3 text-sm md:text-base text-brand-ink/75 leading-relaxed">
                Cámara de Turismo de Nandayure (Guanacaste, Costa Rica). Conforme a la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley N° 8968) y su normativa conexa.
              </p>
              <p className="mt-2 text-xs font-medium text-brand-ink/50">
                Última actualización y entrada en vigencia: Octubre de 2026.
              </p>
            </div>
          </div>

          {/* Contenido legal */}
          <div className="prose prose-slate max-w-none space-y-8 text-brand-ink/90 text-sm md:text-base leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-brand-navy/10 shadow-sm">
            {/* 1 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                1. Identidad y Datos del Responsable del Tratamiento
              </h2>
              <p>
                La <strong>Cámara de Turismo de Nandayure</strong> (en adelante, «la Cámara»), con sede y operación en el cantón de Nandayure, provincia de Guanacaste, Costa Rica, es la entidad responsable de la administración del sitio web oficial y del tratamiento de las bases de datos generadas a partir de las solicitudes de afiliación, registros comerciales y consultas ciudadanas.
              </p>
              <p>
                Para cualquier gestión, consulta o ejercicio de derechos relacionados con la privacidad de sus datos, puede ponerse en contacto con nosotros a través de la sección de contacto de este portal web o mediante nuestros canales institucionales autorizados.
              </p>
            </section>

            {/* 2 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                2. Marco Normativo Aplicable
              </h2>
              <p>
                Esta Política se rige en estricto cumplimiento con la legislación de la República de Costa Rica, particularmente por la <strong>Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley N° 8968)</strong>, su respectivo Reglamento Ejecutivo (Decreto Ejecutivo N° 37554-JP) y los lineamientos emitidos por la <strong>Agencia de Protección de Datos de los Habitantes (PRODHAB)</strong>.
              </p>
            </section>

            {/* 3 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                3. Datos Recopilados en el Proceso de Afiliación
              </h2>
              <p>
                Al utilizar el formulario de afiliación o interactuar con nuestra plataforma, se solicitan y procesan las siguientes categorías de datos:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-brand-ink/80">
                <li>
                  <strong>Datos del solicitante o representante:</strong> Nombre completo, apellidos, número telefónico personal y dirección de correo electrónico personal.
                </li>
                <li>
                  <strong>Datos identificativos y comerciales del negocio:</strong> Nombre comercial o razón social, distrito de ubicación dentro del cantón de Nandayure, categorías de actividad turística o comercial, descripción de servicios, teléfonos y correos electrónicos de atención comercial, dirección descriptiva física y coordenadas de geolocalización geográfica (latitud y longitud).
                </li>
                <li>
                  <strong>Enlaces y redes sociales:</strong> Perfiles de redes sociales (Facebook, Instagram) y enlaces a plataformas de atención directa (WhatsApp, Google Maps, Waze).
                </li>
                <li>
                  <strong>Material multimedia y probatorio:</strong> Imagen de portada / logotipo, galería fotográfica representativa del establecimiento y documentos probatorios de respaldo legal que certifiquen la operación legítima de la actividad comercial.
                </li>
              </ul>
            </section>

            {/* 4 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                4. Finalidad del Tratamiento de los Datos
              </h2>
              <p>
                La recopilación y el almacenamiento de los datos tienen finalidades específicas, legítimas y directamente vinculadas con el objeto de la Cámara:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-brand-ink/80">
                <li>
                  <strong>Evaluación y trámite de la solicitud de afiliación:</strong> Revisar la idoneidad y el cumplimiento de requisitos para incorporar al negocio dentro de la membresía formal de la Cámara de Turismo.
                </li>
                <li>
                  <strong>Creación de cuenta y gestión de usuario:</strong> En caso de aprobación, generar de manera automatizada las credenciales seguras para que el afiliado pueda acceder y autogestionar su perfil comercial.
                </li>
                <li>
                  <strong>Promoción y difusión turística pública:</strong> Exponer la oferta comercial del negocio en el directorio público digital, la ficha de detalle institucional y el mapa interactivo cantonal, permitiendo a turistas locales e internacionales conocer su ubicación y servicios.
                </li>
                <li>
                  <strong>Notificaciones de la solicitud:</strong> Remitir avisos y comunicaciones oficiales relacionadas exclusivamente con el estado de recepción, revisión, aprobación o resolución de la solicitud de afiliación.
                </li>
              </ol>
            </section>

            {/* 5 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                5. Distinción entre Información Pública y Confidencial
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="rounded-xl bg-brand-paper p-4 border border-brand-navy/10">
                  <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green"></span>
                    Información Pública de Promoción
                  </h3>
                  <p className="text-xs text-brand-ink/75 leading-relaxed">
                    Corresponde a los datos destinados a visibilidad pública para beneficio del comercio: nombre del negocio, categorías turísticas, distrito, dirección descriptiva, coordenadas en el mapa, fotografías de portada/galería, horarios y contactos comerciales (teléfono y correo del negocio).
                  </p>
                </div>
                <div className="rounded-xl bg-brand-paper p-4 border border-brand-navy/10">
                  <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-navy"></span>
                    Información Estrictamente Confidencial
                  </h3>
                  <p className="text-xs text-brand-ink/75 leading-relaxed">
                    Los documentos legales adjuntos, comprobantes internos y los datos personales no comerciales del solicitante (teléfono personal, correo de gestión) son de uso estrictamente interno. <strong>Bajo ninguna circunstancia se venderán, cederán ni transferirán a terceros</strong> con fines lucrativos o publicitarios ajenos.
                  </p>
                </div>
              </div>
            </section>

            {/* 6 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                6. Consentimiento Informado del Titular
              </h2>
              <p>
                Al marcar la casilla obligatoria de aceptación en el formulario de afiliación y proceder al envío de la solicitud, el usuario declara bajo fe de juramento que:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-brand-ink/80">
                <li>Es el legítimo propietario o cuenta con la personería y facultades suficientes para representar al negocio que postula.</li>
                <li>Toda la información y documentación aportada es auténtica, verídica y comprobable.</li>
                <li>Brinda su <strong>consentimiento previo, expreso, libre e informado</strong> para que la Cámara almacene y procese sus datos con las finalidades expuestas en este instrumento legal.</li>
              </ul>
            </section>

            {/* 7 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                7. Derechos del Titular (Derechos ARCO)
              </h2>
              <p>
                De conformidad con la Ley N° 8968, usted como titular de los datos personales puede ejercer en todo momento sus derechos de:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-brand-ink/80">
                <li><strong>Acceso:</strong> Solicitar conocer qué información personal suya y de su negocio se encuentra registrada en nuestras bases de datos.</li>
                <li><strong>Rectificación:</strong> Actualizar, corregir o complementar datos que resulten inexactos o desactualizados.</li>
                <li><strong>Cancelación / Supresión:</strong> Solicitar la eliminación de sus datos y la baja de su comercio del directorio público cuando finalice su vínculo de afiliación.</li>
                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para determinados fines específicos que no sean estrictamente contractuales o requeridos por ley.</li>
              </ul>
              <p className="text-xs text-brand-ink/70">
                Para ejercer cualquiera de estos derechos, bastará con una solicitud formal dirigida por escrito a los canales oficiales de la Cámara, acreditando su identidad.
              </p>
            </section>

            {/* 8 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                8. Medidas de Seguridad y Confidencialidad
              </h2>
              <p>
                La Cámara adopta medidas técnicas, lógicas y organizativas acordes a las buenas prácticas de la industria para salvaguardar la confidencialidad e integridad de la información almacenada, incluyendo mecanismos de cifrado seguro de contraseñas, mecanismos de autenticación segura, control de accesos restringido por roles administrativos y políticas de almacenamiento seguro para documentos adjuntos.
              </p>
            </section>

            {/* 9 */}
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                9. Modificaciones a la Política de Privacidad
              </h2>
              <p>
                La Cámara de Turismo de Nandayure se reserva la facultad de actualizar o modificar la presente política cuando sea necesario para adaptarla a reformas legales o mejoras operativas del sistema. Cualquier ajuste sustancial será notificado oportunamente a través de este portal digital.
              </p>
            </section>
          </div>

          {/* Botón de acción al pie */}
          <div className="mt-8 flex justify-end">
            <Link to="/">
              <Button variant="navy">
                Ir a la página principal
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
