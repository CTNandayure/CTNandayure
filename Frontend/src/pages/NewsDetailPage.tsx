import DOMPurify from 'dompurify'
import { useParams } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { Alert, Button, Container } from '../components/ui'
import { useNewsDetail } from '../content/hooks/useNewsDetail'

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: news, status } = useNewsDetail(slug)

  return (
    <div className="min-h-screen bg-brand-paper">
      <Navbar />

      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <Button href="/#noticias" variant="text" className="mb-8">
            ← Volver a noticias
          </Button>

          {status === 'loading' && <p className="text-brand-ink/60">Cargando…</p>}

          {status === 'error' && (
            <Alert variant="error" title="Noticia no encontrada">
              Es posible que haya sido retirada o que el enlace esté incompleto.
            </Alert>
          )}

          {status === 'ready' && news && (
            <article>
              <span className="text-sm text-brand-ink/60">
                {news.publishedAt
                  ? new Date(news.publishedAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : ''}
              </span>
              <h1 className="mt-2 text-3xl font-bold text-brand-navy md:text-4xl">{news.title}</h1>

              {news.imageUrl && (
                <img src={news.imageUrl} alt="" className="mt-8 h-64 w-full rounded-2xl object-cover md:h-96" />
              )}

              <div
                className="mt-8 flex flex-col text-[15px] leading-relaxed text-brand-ink/80 [&_a]:text-brand-green [&_a]:underline [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
              />
            </article>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  )
}
