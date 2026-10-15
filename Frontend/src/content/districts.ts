import { useMockContent } from './hooks/useMockContent'
import type { District } from './types'

// Contenido de ejemplo — reemplazar cuando el módulo de distritos tenga su propia API.
const DISTRICTS: District[] = [
  {
    slug: 'bejuco',
    name: 'Bejuco',
    tag: 'Playas y costa',
    tagColor: 'teal',
    description:
      'Litoral Pacífico con playas, surf y pesca artesanal — incluye Islita, San Francisco de Coyote, Zapote y Corozalito.',
    imageUrl: null,
  },
  {
    slug: 'carmona',
    name: 'Carmona',
    tag: 'Cabecera cultural',
    tagColor: 'green',
    description: 'Centro administrativo e histórico del cantón, cuna de ferias y tradiciones locales.',
    imageUrl: null,
  },
  {
    slug: 'santa-rita',
    name: 'Santa Rita',
    tag: 'Montaña y fincas',
    tagColor: 'green',
    description: 'Paisajes de montaña, fincas ganaderas y aire fresco en las alturas del cantón.',
    imageUrl: null,
  },
  {
    slug: 'porvenir',
    name: 'Porvenir',
    tag: 'Ríos y senderos',
    tagColor: 'teal',
    description: 'Ríos, senderos rurales y turismo comunitario en crecimiento.',
    imageUrl: null,
  },
  {
    slug: 'zapotal',
    name: 'Zapotal',
    tag: 'Tradición ganadera',
    tagColor: 'green',
    description: 'Paisajes rurales y tradición ganadera en el corazón de Nandayure.',
    imageUrl: null,
  },
  {
    slug: 'san-pablo',
    name: 'San Pablo',
    tag: 'Vida rural',
    tagColor: 'green',
    description: 'Comunidad agrícola con caminos verdes y vida de pueblo auténtica.',
    imageUrl: null,
  },
]

export function useDistricts() {
  return useMockContent(DISTRICTS)
}
