import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import {
  Alert,
  Badge,
  Button,
  FormField,
  ImageUpload,
  Input,
  Modal,
  RichTextEditor,
  Select,
  Textarea,
  useToast,
} from '../../../components/ui'
import type { NewsItem } from '../../../content/types'
import { NewsTable } from '../components/NewsTable/NewsTable'
import { newsAdminService } from '../services/newsAdminService'

interface NewsFormState {
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
}

const emptyNewsForm: NewsFormState = {
  title: '',
  excerpt: '',
  content: '',
  imageUrl: null,
}

export default function NewsAdminPage() {
  const { showToast } = useToast()
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatusItem, setPendingStatusItem] = useState<NewsItem | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const [detailItem, setDetailItem] = useState<NewsItem | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<NewsFormState>(emptyNewsForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadNews = async () => {
    try {
      setIsLoading(true)
      const data = await newsAdminService.getNews()
      setNews(data)
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'No se pudieron cargar las noticias',
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      })
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
        description:
          nextStatus === 'PUBLICADO'
            ? 'La noticia ya está visible en el sitio público.'
            : 'La noticia ya no es visible en el sitio público.',
      })
      setConfirmOpen(false)
      setPendingStatusItem(null)
      await loadNews()
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'No se pudo cambiar el estado',
        description: error instanceof Error ? error.message : 'Error desconocido',
      })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const openDetailModal = async (item: NewsItem) => {
    setDetailItem(item)
    try {
      const full = await newsAdminService.getNewsById(item.id)
      if (full) {
        setDetailItem(full)
      }
    } catch {
      /* Conserva los datos de la fila */
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setForm(emptyNewsForm)
    setErrors({})
    setFormOpen(true)
  }

  const openEditModal = async (item: NewsItem) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      imageUrl: item.imageUrl,
    })
    setErrors({})
    setFormOpen(true)
    try {
      const full = await newsAdminService.getNewsById(item.id)
      if (full) {
        setEditingItem(full)
        setForm({
          title: full.title,
          excerpt: full.excerpt,
          content: full.content,
          imageUrl: full.imageUrl,
        })
      }
    } catch {
      /* Conserva los datos ya presentes en la fila */
    }
  }

  const closeFormModal = () => {
    setFormOpen(false)
    setConfirmSaveOpen(false)
    setEditingItem(null)
    setForm(emptyNewsForm)
    setErrors({})
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) {
      nextErrors.title = 'El título es requerido'
    } else if (form.title.trim().length < 3) {
      nextErrors.title = 'El título debe tener al menos 3 caracteres'
    } else if (form.title.trim().length > 150) {
      nextErrors.title = 'El título no puede exceder 150 caracteres'
    }

    if (!form.excerpt.trim()) {
      nextErrors.excerpt = 'El resumen es requerido'
    } else if (form.excerpt.trim().length < 10) {
      nextErrors.excerpt = 'El resumen debe tener al menos 10 caracteres'
    } else if (form.excerpt.trim().length > 500) {
      nextErrors.excerpt = 'El resumen no puede exceder 500 caracteres'
    }

    const plainContent = form.content.replace(/<[^>]*>/g, '').trim()
    if (!plainContent) {
      nextErrors.content = 'El contenido es requerido'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleOpenConfirm = () => {
    if (!validateForm()) return
    setConfirmSaveOpen(true)
  }

  const handleConfirmedSubmit = async () => {
    setConfirmSaveOpen(false)
    try {
      setIsSubmitting(true)
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        imageUrl: form.imageUrl,
      }

      if (editingItem) {
        await newsAdminService.updateNews(editingItem.id, payload)
        showToast({
          variant: 'success',
          title: 'Noticia actualizada',
          description: 'Los cambios se guardaron correctamente.',
        })
      } else {
        await newsAdminService.createNews(payload)
        showToast({
          variant: 'success',
          title: 'Noticia creada',
          description: 'Se guardó como borrador. Puedes publicarla desde el listado cuando esté lista.',
        })
      }
      closeFormModal()
      await loadNews()
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'No se pudo guardar la noticia',
        description: error instanceof Error ? error.message : 'Error desconocido',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Noticias</h1>
          <p className="mt-1 text-brand-ink/60">Gestión de noticias del sitio público</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          Nueva noticia
        </Button>
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
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="max-w-[180px]"
            aria-label="Filtrar por estado"
          >
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
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
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

      <Modal
        size="xl"
        open={formOpen}
        onOpenChange={(open) => !open && closeFormModal()}
        title={editingItem ? 'Editar noticia' : 'Nueva noticia'}
        description={
          editingItem
            ? 'Actualice la información de la noticia.'
            : 'La noticia se guardará como borrador y podrá publicarla desde el listado.'
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={closeFormModal}>
              Cancelar
            </Button>
            <Button
              variant={editingItem ? 'navy' : 'primary'}
              onClick={handleOpenConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Guardando...'
                : editingItem
                ? 'Guardar cambios'
                : 'Guardar'}
            </Button>
          </div>
        }
      >
        {formOpen && (
          <div className="flex flex-col gap-5">
            <FormField label="Título" htmlFor="news-title" error={errors.title}>
              <Input
                id="news-title"
                placeholder="Ejemplo: Nuevo festival cultural en Nandayure"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
                }}
              />
            </FormField>

            <FormField label="Resumen" htmlFor="news-excerpt" error={errors.excerpt}>
              <Textarea
                id="news-excerpt"
                rows={3}
                placeholder="Breve resumen o descripción introductoria..."
                value={form.excerpt}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                  if (errors.excerpt) setErrors((prev) => ({ ...prev, excerpt: '' }))
                }}
              />
            </FormField>

            <ImageUpload
              label="Foto de portada"
              value={form.imageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-navy">Contenido</label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => {
                  setForm((prev) => ({ ...prev, content: html }))
                  if (errors.content) setErrors((prev) => ({ ...prev, content: '' }))
                }}
              />
              {errors.content && <p className="text-xs text-red-600">{errors.content}</p>}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={confirmSaveOpen}
        onOpenChange={(open) => !open && setConfirmSaveOpen(false)}
        title={editingItem ? 'Confirmar cambios' : 'Confirmar nueva noticia'}
        description={
          editingItem
            ? '¿Está seguro de que desea guardar las modificaciones realizadas en esta noticia?'
            : '¿Está seguro de que desea registrar esta nueva noticia en el sistema?'
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmSaveOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={editingItem ? 'navy' : 'primary'}
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Guardando...'
                : editingItem
                ? 'Guardar cambios'
                : 'Confirmar'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {editingItem
            ? `Se aplicarán los cambios a la noticia "${form.title}".`
            : `La noticia "${form.title}" se guardará como borrador y podrá publicarse desde el listado.`}
        </p>
      </Modal>

      <Modal
        size="xl"
        open={Boolean(detailItem)}
        onOpenChange={(open) => !open && setDetailItem(null)}
        title={detailItem?.title ?? 'Detalle de la noticia'}
        description="Ficha informativa de la noticia."
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setDetailItem(null)}>
              Cerrar
            </Button>
            {detailItem && (
              <Button
                variant="navy"
                onClick={() => {
                  const target = detailItem
                  setDetailItem(null)
                  openEditModal(target)
                }}
              >
                Editar noticia
              </Button>
            )}
          </div>
        }
      >
        {detailItem && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-paper p-4 ring-1 ring-brand-navy/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Estado:</span>
                <Badge color={detailItem.status === 'PUBLICADO' ? 'green' : 'yellow'}>
                  {detailItem.status === 'PUBLICADO' ? 'Publicado' : 'Borrador'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-ink/60">
                <span>
                  <strong>Creado:</strong> {new Date(detailItem.createdAt).toLocaleDateString('es-CR')}
                </span>
                {detailItem.publishedAt && (
                  <span>
                    <strong>Publicado:</strong> {new Date(detailItem.publishedAt).toLocaleDateString('es-CR')}
                  </span>
                )}
                {detailItem.status === 'PUBLICADO' && (
                  <a
                    href={`/noticias/${detailItem.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand-green hover:underline"
                  >
                    Ver en el sitio público ↗
                  </a>
                )}
              </div>
            </div>

            {detailItem.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-brand-navy/10 bg-brand-sand">
                <img
                  src={detailItem.imageUrl}
                  alt={detailItem.title}
                  className="max-h-72 w-full object-cover"
                />
              </div>
            )}

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Resumen</p>
              <div className="rounded-xl border border-brand-navy/10 bg-brand-paper p-4 text-sm font-medium leading-relaxed text-brand-navy">
                {detailItem.excerpt}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Contenido</p>
              <div
                className="max-h-80 overflow-y-auto rounded-xl border border-brand-navy/10 bg-white p-5 text-sm leading-relaxed text-brand-ink/80 [&_a]:text-brand-green [&_a]:underline [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detailItem.content) }}
              />
            </div>
          </div>
        )}
      </Modal>

      <NewsTable
        news={filteredNews}
        isLoading={isLoading}
        onView={openDetailModal}
        onEdit={openEditModal}
        onToggleStatus={confirmStatusChange}
      />
    </div>
  )
}
