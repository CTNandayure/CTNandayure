import { useMockContent } from './hooks/useMockContent'
import type { NewsItem } from './types'

// Contenido de ejemplo — reemplazar cuando el módulo de noticias tenga su propia API.
const NEWS: NewsItem[] = [
  {
    id: 'convocatoria-2026',
    date: '20 de agosto, 2026',
    title: 'Convocatoria abierta para nuevos negocios afiliados 2026',
    excerpt: 'La Cámara abre el proceso de afiliación para negocios de los seis distritos interesados en unirse al directorio oficial del cantón.',
    imageUrl: null,
  },
  {
    id: 'temporada-anidacion',
    date: '3 de agosto, 2026',
    title: 'Inicia la temporada de anidación en Camaronal',
    excerpt: 'Entre julio y diciembre, tortugas lora y verde llegan a desovar al Refugio Nacional de Vida Silvestre Camaronal.',
    imageUrl: null,
  },
  {
    id: 'feria-islita',
    date: '15 de julio, 2026',
    title: 'Islita se prepara para su feria de arte comunitario',
    excerpt: 'La comunidad artística de Islita, en el distrito de Bejuco, organiza actividades culturales abiertas a visitantes y vecinos.',
    imageUrl: null,
  },
]

export function useNews() {
  return useMockContent(NEWS)
}
