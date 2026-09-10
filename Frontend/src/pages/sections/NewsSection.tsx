import { Link } from 'react-router-dom'
import { Container, SectionHeading } from '../../components/ui'
import { useNews } from '../../content/news'

export function NewsSection() {
  const { data: news } = useNews()

  if (!news.length) return null

  return (
    <section id="noticias" className="bg-white py-16 md:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeading eyebrow="Actualidad" eyebrowColor="green" title="Noticias de la Cámara" />
        <div className="flex flex-col">
          {news.map((n) => (
            <Link
              key={n.id}
              to={`/noticias/${n.slug}`}
              className="grid gap-2 border-t border-brand-navy/10 py-7 last:border-b hover:bg-brand-paper md:grid-cols-[200px_1fr] md:gap-8"
            >
              <span className="text-sm text-brand-ink/60">
                {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </span>
              <div>
                <h3 className="mb-2 text-lg font-bold text-brand-navy">{n.title}</h3>
                <p className="text-sm leading-relaxed text-brand-ink/70">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
