import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Input, Modal, Select, useToast } from '../../../components/ui'
import type { NewsItem } from '../../../content/types'
import { NewsTable } from '../components/NewsTable/NewsTable'
import { newsAdminService } from '../services/newsAdminService'

export default function NewsAdminPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatusItem, setPendingStatusItem] = useState<NewsItem | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const loadNews = async () => {
    try {
      setIsLoading(true)
      const data = await newsAdminService.getNews()
      setNews(data)
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudieron cargar las noticias', description: error instanceof Error ? error.message : 'Intenta nuevamente' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  const filteredNews = useMemo(() => {
    const q = search.trim().toLowerCase()
    return news.filter((item) => {
      const matchesSearch = !q || item.title.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [news, search, statusFilter])

  const stats = useMemo(
    () => ({
      total: news.length,
      published: news.filter((n) => n.status === 'PUBLICADO').length,
      drafts: news.filter((n) => n.status === 'BORRADOR').length,
    }),
    [news],
  )

  const confirmStatusChange = (item: NewsItem) => {
    setPendingStatusItem(item)
    setConfirmOpen(true)
  }

  const toggleStatus = async () => {
    if (!pendingStatusItem) return
    const nextStatus = pendingStatusItem.status === 'PUBLICADO' ? 'BORRADOR' : 'PUBLICADO'
    try {
      setIsTogglingStatus(true)
      await newsAdminService.updateNewsStatus(pendingStatusItem.id, nextStatus)
      showToast({
        variant: 'success',
        title: 'Estado actualizado',
        description: nextStatus === 'PUBLICADO' ? 'La noticia ya está visible en el sitio público.' : 'La noticia ya no es visible en el sitio público.',
      })
      setConfirmOpen(false)
      setPendingStatusItem(null)
      await loadNews()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo cambiar el estado', description: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Noticias</h1>
          <p className="mt-1 text-brand-ink/60">Gestión de noticias del sitio público</p>
        </div>
        <Button variant="primary" href="/admin/noticias/nueva">Nueva noticia</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Total</p>
          <p className="mt-2 text-3xl font-bold text-brand-navy">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Publicadas</p>
          <p className="mt-2 text-3xl font-bold text-brand-green">{stats.published}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Borradores</p>
          <p className="mt-2 text-3xl font-bold text-brand-yellow">{stats.drafts}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-navy/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título"
            aria-label="Buscar noticias"
            className="max-w-md"
          />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="max-w-[180px]" aria-label="Filtrar por estado">
            <option value="all">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="PUBLICADO">Publicado</option>
          </Select>
        </div>
      </div>

      {!isLoading && news.length === 0 && (
        <Alert variant="info" title="Sin noticias">
          <span>Todavía no hay noticias creadas.</span>
        </Alert>
      )}

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open)
          if (!open) setPendingStatusItem(null)
        }}
        title={pendingStatusItem?.status === 'PUBLICADO' ? 'Despublicar noticia' : 'Publicar noticia'}
        description={
          pendingStatusItem?.status === 'PUBLICADO'
            ? 'La noticia dejará de ser visible en el sitio público, pero se conserva como borrador.'
            : 'La noticia será visible de inmediato en el sitio público.'
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={toggleStatus} disabled={isTogglingStatus}>
              {isTogglingStatus ? 'Guardando...' : 'Confirmar'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {pendingStatusItem ? `¿Deseás continuar con "${pendingStatusItem.title}"?` : 'Confirmación requerida.'}
        </p>
      </Modal>

      <NewsTable
        news={filteredNews}
        isLoading={isLoading}
        onEdit={(item) => navigate(`/admin/noticias/${item.id}/editar`)}
        onToggleStatus={confirmStatusChange}
      />
    </div>
  )
}
