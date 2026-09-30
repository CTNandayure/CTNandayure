import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Input, Modal, Select, TableActionButton, useToast } from '../../../components/ui'
import { businessService } from '../services/businessService'
import { DISTRICT_LABELS, CATEGORY_LABELS, BUSINESS_STATUS_LABELS } from '../utils/constants'
import { AffiliationWizard } from '../components/AffiliationWizard/AffiliationWizard'
import { RequestDetailModal } from '../components/RequestDetailModal/RequestDetailModal'
import { RejectRequestModal } from '../components/RejectRequestModal/RejectRequestModal'
import type { BusinessRequestRecord, BusinessRecord, BusinessStatus } from '../types/business.types'
import {
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  type SortingState,
  useTable,
} from '@tanstack/react-table'
import { cn } from '../../../lib/cn'

type AdminTab = 'requests' | 'businesses'

const BUSINESS_STATUS_COLORS = { ACTIVE: 'green', INACTIVE: 'yellow' } as const

export default function BusinessAdminPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<AdminTab>('requests')

  // Data
  const [requests, setRequests] = useState<BusinessRequestRecord[]>([])
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [wizardOpen, setWizardOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState<BusinessRequestRecord | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<BusinessRequestRecord | null>(null)
  const [detailBusiness, setDetailBusiness] = useState<BusinessRecord | null>(null)
  const [confirmStatusBiz, setConfirmStatusBiz] = useState<BusinessRecord | null>(null)

  // Sorting
  const [requestSorting, setRequestSorting] = useState<SortingState>([])
  const [businessSorting, setBusinessSorting] = useState<SortingState>([])

  // --- Data loading ---
  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const data = await businessService.getRequests()
      setRequests(data)
    } catch (error) {
      showToast({ variant: 'error', title: 'Error cargando solicitudes', description: error instanceof Error ? error.message : 'Intenta nuevamente' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadBusinesses = async () => {
    try {
      setIsLoading(true)
      const data = await businessService.getBusinesses()
      setBusinesses(data)
    } catch (error) {
      showToast({ variant: 'error', title: 'Error cargando negocios', description: error instanceof Error ? error.message : 'Intenta nuevamente' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'requests') loadRequests()
    else loadBusinesses()
  }, [activeTab])

  // --- Filtered data ---
  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter((r) => {
      return !q || r.businessName.toLowerCase().includes(q) || `${r.applicantName} ${r.applicantFirstLastname} ${r.applicantSecondLastname}`.toLowerCase().includes(q)
    })
  }, [requests, search])

  const filteredBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return businesses.filter((b) => {
      const matchesSearch = !q || b.businessName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || b.businessStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [businesses, search, statusFilter])

  // --- Stats ---
  const stats = useMemo(() => ({
    pendingRequests: requests.length,
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter((b) => b.businessStatus === 'ACTIVE').length,
    inactiveBusinesses: businesses.filter((b) => b.businessStatus === 'INACTIVE').length,
  }), [requests, businesses])

  // --- Actions ---
  const handleApprove = async (id: string) => {
    try {
      await businessService.approveRequest(id)
      showToast({ variant: 'success', title: 'Solicitud aprobada', description: 'Se creó el negocio y la cuenta del usuario. Se enviará un correo de activación.' })
      await loadRequests()
      await loadBusinesses()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo aprobar', description: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      await businessService.rejectRequest(id, reason)
      showToast({ variant: 'success', title: 'Solicitud rechazada', description: 'Se notificó al solicitante por correo y se eliminó la solicitud.' })
      setRejectingRequest(null)
      await loadRequests()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo rechazar', description: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  const handleToggleBusinessStatus = async () => {
    if (!confirmStatusBiz) return
    const nextStatus: BusinessStatus = confirmStatusBiz.businessStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await businessService.updateBusinessStatus(confirmStatusBiz.id, nextStatus)
      showToast({
        variant: 'success',
        title: 'Estado actualizado',
        description: nextStatus === 'ACTIVE' ? 'El negocio es visible en el sitio público.' : 'El negocio ya no es visible en el sitio público.',
      })
      setConfirmStatusBiz(null)
      await loadBusinesses()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo cambiar el estado', description: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  // --- Requests table ---
  const requestColumns = useMemo<any[]>(() => [
    {
      accessorKey: 'businessName',
      id: 'businessName',
      header: 'Negocio',
      cell: ({ row }: any) => <span className="font-medium text-brand-navy">{row.original.businessName}</span>,
    },
    {
      id: 'applicant',
      header: 'Solicitante',
      cell: ({ row }: any) => `${row.original.applicantName} ${row.original.applicantFirstLastname} ${row.original.applicantSecondLastname}`,
    },
    {
      accessorKey: 'district',
      header: 'Distrito',
      cell: ({ row }: any) => DISTRICT_LABELS[row.original.district as keyof typeof DISTRICT_LABELS],
    },
    {
      accessorKey: 'categories',
      header: 'Categorías',
      enableSorting: false,
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((c: any) => <Badge key={c} color="teal">{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]}</Badge>)}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de solicitud',
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString('es-CR'),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          <TableActionButton variant="view" onClick={() => setDetailRequest(row.original)}>Ver</TableActionButton>
          <TableActionButton variant="activate" onClick={() => handleApprove(row.original.id)}>Aceptar</TableActionButton>
          <TableActionButton variant="deactivate" onClick={() => setRejectingRequest(row.original)}>Rechazar</TableActionButton>
        </div>
      ),
    },
  ], [])

  const reqFeatures = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
  })

  const [reqPagination, setReqPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const reqTable = useTable({
    data: filteredRequests,
    columns: requestColumns,
    features: reqFeatures,
    state: {
      sorting: requestSorting,
      pagination: reqPagination,
    },
    onSortingChange: setRequestSorting,
    onPaginationChange: setReqPagination,
  })

  // --- Businesses table ---
  const businessColumns = useMemo<any[]>(() => [
    {
      accessorKey: 'businessName',
      id: 'businessName',
      header: 'Negocio',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          {row.original.coverImageUrl ? (
            <img src={row.original.coverImageUrl} alt="" className="h-10 w-10 flex-none rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 flex-none rounded-lg bg-brand-sand" />
          )}
          <span className="font-medium text-brand-navy">{row.original.businessName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'district',
      header: 'Distrito',
      cell: ({ row }: any) => DISTRICT_LABELS[row.original.district as keyof typeof DISTRICT_LABELS],
    },
    {
      accessorKey: 'categories',
      header: 'Categorías',
      enableSorting: false,
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((c: any) => <Badge key={c} color="teal">{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]}</Badge>)}
        </div>
      ),
    },
    {
      accessorKey: 'businessStatus',
      header: 'Estado',
      cell: ({ row }: any) => <Badge color={BUSINESS_STATUS_COLORS[row.original.businessStatus as keyof typeof BUSINESS_STATUS_COLORS]}>{BUSINESS_STATUS_LABELS[row.original.businessStatus as keyof typeof BUSINESS_STATUS_LABELS]}</Badge>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Afiliación',
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString('es-CR'),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          <TableActionButton variant="view" onClick={() => setDetailBusiness(row.original)}>Ver</TableActionButton>
          <TableActionButton
            variant={row.original.businessStatus === 'ACTIVE' ? 'deactivate' : 'activate'}
            onClick={() => setConfirmStatusBiz(row.original)}
          >
            {row.original.businessStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
          </TableActionButton>
        </div>
      ),
    },
  ], [])

  const bizFeatures = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
  })

  const [bizPagination, setBizPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const bizTable = useTable({
    data: filteredBusinesses,
    columns: businessColumns,
    features: bizFeatures,
    state: {
      sorting: businessSorting,
      pagination: bizPagination,
    },
    onSortingChange: setBusinessSorting,
    onPaginationChange: setBizPagination,
  })

  const currentTable = activeTab === 'requests' ? reqTable : bizTable

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Negocios</h1>
          <p className="mt-1 text-brand-ink/60">Gestión de solicitudes y negocios afiliados</p>
        </div>
        <Button variant="primary" onClick={() => setWizardOpen(true)}>Registrar negocio</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Solicitudes pendientes</p>
          <p className="mt-2 text-3xl font-bold text-brand-yellow">{stats.pendingRequests}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Total negocios</p>
          <p className="mt-2 text-3xl font-bold text-brand-navy">{stats.totalBusinesses}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Activos</p>
          <p className="mt-2 text-3xl font-bold text-brand-green">{stats.activeBusinesses}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Inactivos</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.inactiveBusinesses}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-navy/15 pb-1">
        {([['requests', 'Solicitudes'], ['businesses', 'Negocios afiliados']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActiveTab(key); setSearch(''); setStatusFilter('all') }}
            className={cn(
              '-mb-px border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors',
              activeTab === key ? 'border-brand-green text-brand-navy' : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-navy/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'requests' ? 'Buscar solicitud por negocio o solicitante' : 'Buscar negocio por nombre'}
            aria-label="Buscar"
            className="max-w-md"
          />
          {activeTab === 'businesses' && (
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[180px]" aria-label="Filtrar por estado">
              <option value="all">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-brand-ink/50">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-brand-navy/10">
          <table className="w-full text-left text-sm">
            <thead>
              {currentTable.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id} className="border-b border-brand-navy/10 bg-brand-sand/50">
                  {headerGroup.headers.map((header: any) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-ink/60"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="flex items-center gap-1 font-semibold uppercase hover:text-brand-navy text-left"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span>
                            {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                          </span>
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {currentTable.getRowModel().rows.map((row: any) => (
                <tr key={row.id} className="border-b border-brand-navy/5 transition-colors hover:bg-brand-paper/60">
                  {row.getAllCells().map((cell: any) => (
                    <td key={cell.id} className="px-4 py-3 text-brand-ink/80">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {currentTable.getRowModel().rows.length === 0 && (
            <div className="py-12 text-center text-brand-ink/50">No hay registros</div>
          )}

          {/* Pagination */}
          {currentTable.getPageCount() > 1 && (
            <div className="flex items-center justify-between border-t border-brand-navy/10 px-4 py-3">
              <span className="text-xs text-brand-ink/50">
                Página {currentTable.state.pagination.pageIndex + 1} de {currentTable.getPageCount()}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => currentTable.previousPage()} disabled={!currentTable.getCanPreviousPage()}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => currentTable.nextPage()} disabled={!currentTable.getCanNextPage()}>Siguiente</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wizard modal for admin direct creation */}
      <Modal
        size="xl"
        open={wizardOpen}
        onOpenChange={(open) => !open && setWizardOpen(false)}
        title="Registrar nuevo negocio"
        description="Complete la información para registrar un negocio directamente"
      >
        <AffiliationWizard
          isAdminMode
          onComplete={() => {
            setWizardOpen(false)
            loadBusinesses()
            showToast({ variant: 'success', title: 'Negocio registrado', description: 'Se creó el negocio y la cuenta del usuario exitosamente.' })
          }}
        />
      </Modal>

      {/* Request detail modal */}
      {detailRequest && (
        <RequestDetailModal
          request={detailRequest}
          open={Boolean(detailRequest)}
          onClose={() => setDetailRequest(null)}
        />
      )}

      {/* Reject request modal */}
      {rejectingRequest && (
        <RejectRequestModal
          request={rejectingRequest}
          open={Boolean(rejectingRequest)}
          onClose={() => setRejectingRequest(null)}
          onConfirm={(reason) => handleReject(rejectingRequest.id, reason)}
        />
      )}

      {/* Business detail modal */}
      {detailBusiness && (
        <Modal
          size="lg"
          open={Boolean(detailBusiness)}
          onOpenChange={(open) => !open && setDetailBusiness(null)}
          title={detailBusiness.businessName}
          description="Detalle del negocio afiliado"
          footer={
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setDetailBusiness(null)}>Cerrar</Button>
            </div>
          }
        >
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Distrito</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">{DISTRICT_LABELS[detailBusiness.district]}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Categorías</dt>
              <dd className="mt-1 flex flex-wrap gap-1">{detailBusiness.categories.map((c) => <Badge key={c} color="teal">{CATEGORY_LABELS[c]}</Badge>)}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Descripción</dt>
              <dd className="mt-1 text-sm text-brand-ink/80">{detailBusiness.description}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Teléfono</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">{detailBusiness.phone}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Correo</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy break-all">{detailBusiness.email}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Dirección</dt>
              <dd className="mt-1 text-sm text-brand-ink/80">{detailBusiness.address}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Estado</dt>
              <dd className="mt-1"><Badge color={BUSINESS_STATUS_COLORS[detailBusiness.businessStatus]}>{BUSINESS_STATUS_LABELS[detailBusiness.businessStatus]}</Badge></dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Fecha de afiliación</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">{new Date(detailBusiness.createdAt).toLocaleString('es-CR')}</dd>
            </div>
          </dl>
          {detailBusiness.coverImageUrl && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Portada</p>
              <img src={detailBusiness.coverImageUrl} alt="" className="h-40 w-auto rounded-lg object-cover" />
            </div>
          )}
          {detailBusiness.galleryUrls.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Galería</p>
              <div className="flex flex-wrap gap-2">
                {detailBusiness.galleryUrls.map((url, i) => <img key={i} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />)}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Confirm status change modal */}
      <Modal
        open={Boolean(confirmStatusBiz)}
        onOpenChange={(open) => { if (!open) setConfirmStatusBiz(null) }}
        title={confirmStatusBiz?.businessStatus === 'ACTIVE' ? 'Desactivar negocio' : 'Activar negocio'}
        description={confirmStatusBiz?.businessStatus === 'ACTIVE'
          ? 'El negocio dejará de ser visible en el sitio público.'
          : 'El negocio será visible en el sitio público.'}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmStatusBiz(null)}>Cancelar</Button>
            <Button variant="primary" onClick={handleToggleBusinessStatus}>Confirmar</Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {confirmStatusBiz ? `¿Desea continuar con "${confirmStatusBiz.businessName}"?` : 'Confirmación requerida.'}
        </p>
      </Modal>
    </div>
  )
}
