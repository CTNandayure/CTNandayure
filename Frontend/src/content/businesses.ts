import { useMockContent } from './hooks/useMockContent'
import type { Business } from './types'

// Contenido de ejemplo — reemplazar cuando el módulo de negocios tenga su propia API.
const BUSINESSES: Business[] = [
  { id: 'soda-la-cabecera', name: 'Soda La Cabecera', category: 'Alimentación', district: 'Carmona', description: 'Comida típica guanacasteca en el centro de Carmona.', imageUrl: null },
  { id: 'transportes-nandayure', name: 'Transportes Nandayure', category: 'Transporte', district: 'Carmona', description: 'Servicio de taxi y traslado hacia las playas del cantón.', imageUrl: null },
  { id: 'finca-los-cerros', name: 'Finca Los Cerros', category: 'Agroturismo', district: 'Santa Rita', description: 'Recorridos a caballo por fincas ganaderas de las lomas.', imageUrl: null },
  { id: 'cabinas-santa-rita', name: 'Cabinas Santa Rita', category: 'Hospedaje', district: 'Santa Rita', description: 'Hospedaje sencillo para quienes exploran el interior del cantón.', imageUrl: null },
  { id: 'rancho-zapotal', name: 'Rancho Zapotal', category: 'Alimentación', district: 'Zapotal', description: 'Cocina de leña con productos de la zona.', imageUrl: null },
  { id: 'camaronal-tours', name: 'Camaronal Tours', category: 'Tours', district: 'Zapotal', description: 'Caminatas nocturnas guiadas para observar la anidación de tortugas.', imageUrl: null },
  { id: 'artesanias-san-pablo', name: 'Artesanías San Pablo', category: 'Artesanías', district: 'San Pablo', description: 'Piezas talladas en madera y trabajos en cuero hechos a mano.', imageUrl: null },
  { id: 'pulperia-san-pablo-viejo', name: 'Pulpería San Pablo Viejo', category: 'Comercio', district: 'San Pablo', description: 'Provisiones para quienes viajan hacia la costa.', imageUrl: null },
  { id: 'mirador-el-porvenir', name: 'Mirador El Porvenir', category: 'Alimentación', district: 'Porvenir', description: 'Comida casera con vista hacia el valle.', imageUrl: null },
  { id: 'establo-el-porvenir', name: 'Establo El Porvenir', category: 'Agroturismo', district: 'Porvenir', description: 'Paseos a caballo y actividades de finca para visitantes.', imageUrl: null },
  { id: 'cabinas-playa-coyote', name: 'Cabinas Playa Coyote', category: 'Hospedaje', district: 'Bejuco', description: 'Hospedaje frente al mar en Playa Coyote.', imageUrl: null },
  { id: 'islita-arte-cafe', name: 'Islita Arte y Café', category: 'Alimentación', district: 'Bejuco', description: 'Café y galería en el pueblo de artistas de Islita.', imageUrl: null },
  { id: 'kayak-corozalito', name: 'Kayak Corozalito', category: 'Tours', district: 'Bejuco', description: 'Recorridos en kayak por el estero de Corozalito.', imageUrl: null },
]

export function useBusinesses() {
  return useMockContent(BUSINESSES)
}
