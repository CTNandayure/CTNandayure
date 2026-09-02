import { useMockContent } from './hooks/useMockContent'
import type { Activity } from './types'

// Contenido de ejemplo — reemplazar cuando el módulo de actividades tenga su propia API.
const ACTIVITIES: Activity[] = [
  {
    id: 'playas-vida-silvestre',
    title: 'Playas y vida silvestre',
    description:
      'El Refugio Nacional de Vida Silvestre Camaronal recibe la anidación de tortugas lora y verde entre julio y diciembre, junto a las playas de Coyote, Bejuco, San Miguel y Corozalito.',
    districts: ['Bejuco', 'Zapotal'],
    category: 'Playa',
    imageUrl: null,
  },
  {
    id: 'senderismo',
    title: 'Senderismo y observación',
    description: 'Senderos entre bosque seco, manglares y el Río Ora, con posibilidad de avistar aves y fauna del Pacífico seco.',
    districts: ['Bejuco'],
    category: 'Montaña',
    imageUrl: null,
  },
  {
    id: 'arte-cultura',
    title: 'Arte y cultura',
    description: 'Islita es conocida por su comunidad artística y su museo comunitario, sostenido por artistas locales e internacionales.',
    districts: ['Bejuco'],
    category: 'Cultura',
    imageUrl: null,
  },
  {
    id: 'pesca',
    title: 'Pesca y actividades náuticas',
    description: 'Salidas de pesca deportiva y recorridos en kayak o bote por los esteros y manglares de la costa del cantón.',
    districts: ['Bejuco', 'Zapotal'],
    category: 'Playa',
    imageUrl: null,
  },
  {
    id: 'campina-rural',
    title: 'Campiña y vida rural',
    description: 'Fincas ganaderas y paisajes de "las lomas" hacia el interior, herencia de las familias que poblaron el cantón.',
    districts: ['Carmona', 'Santa Rita', 'San Pablo', 'Porvenir'],
    category: 'Montaña',
    imageUrl: null,
  },
]

export function useActivities() {
  return useMockContent(ACTIVITIES)
}
