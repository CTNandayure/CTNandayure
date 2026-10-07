import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Input, Modal, Select, TableActionButton, useToast } from '../../../components/ui'
import { businessService } from '../services/businessService'
import { DISTRICT_LABELS, CATEGORY_LABELS, BUSINESS_STATUS_LABELS } from '../utils/constants'
import { AffiliationWizard } from '../components/AffiliationWizard/AffiliationWizard'
import { BusinessDetailModal } from '../components/RequestDetailModal/BusinessDetailModal'
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

  const [requests, setRequests] = useState<BusinessRequestRecord[]>([])
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<BusinessRecord | null>(null)
  const [detailRequest, setDetailRequest] = useState<BusinessRequestRecord | null>(null)
  const [detailBusiness, setDetailBusiness] = useState<BusinessRecord | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<BusinessRequestRecord | null>(null)
  const [confirmApprove, setConfirmApprove] = useState<BusinessRequestRecord | null>(null)
  const [confirmStatusBiz, setConfirmStatusBiz] = useState<BusinessRecord | null>(null)

  const [requestSorting, setRequestSorting] = useState<SortingState>([])
  const [businessSorting, setBusinessSorting] = useState<SortingState>([])

  const [reqPageSize, setReqPageSize] = useState(10)
  const [reqPageIndex] = useState(0)

  const [bizPageSize, setBizPageSize] = useState(10)
  const [bizPageIndex] = useState(0)

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

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter((r) => {
      const applicantFull = (r.applicantName + ' ' + r.applicantFirstLastname + ' ' + r.applicantSecondLastname).toLowerCase()
      return !q || r.businessName.toLowerCase().includes(q) || applicantFull.includes(q)
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

  const stats = useMemo(() => ({
    pendingRequests: requests.length,
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter((b) => b.businessStatus === 'ACTIVE').length,
    inactiveBusinesses: businesses.filter((b) => b.businessStatus === 'INACTIVE').length,
  }), [requests, businesses])

  const handleApprove = async (id: string) => {
    setConfirmApprove(null)
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
      cell: ({ row }: any) => row.original.applicantName + ' ' + row.original.applicantFirstLastname + ' ' + row.original.applicantSecondLastname,
    },
    {
      accessorKey: 'district',
      header: 'Distrito',
      cell: ({ row }: any) => DISTRICT_LABELS[row.original.district as keyof typeof DISTRICT_LABELS] ?? row.original.district,
    },
    {
      accessorKey: 'categories',
      header: 'Categorías',
      enableSorting: false,
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((c: any) => <Badge key={c} color="teal">{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}</Badge>)}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha solicitud',
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString('es-CR'),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: any) => (
        <div className="flex justify-end gap-1.5">
          <TableActionButton variant="view" onClick={() => setDetailRequest(row.original)}>Ver</TableActionButton>
          <TableActionButton variant="activate" onClick={() => setConfirmApprove(row.original)}>Aceptar</TableActionButton>
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

  const [reqPagination, setReqPagination] = useState({ pageIndex: reqPageIndex, pageSize: reqPageSize })

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

  const businessColumns = useMemo<any[]>(() => [
    {
      accessorKey: 'businessName',
      id: 'businessName',
      header: 'Negocio',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          {row.original.coverImageUrl ? (
            <img src={row.original.coverImageUrl} alt="" className="h-10 w-10 flex-none rounded-lg object-cover border" />
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
      cell: ({ row }: any) => DISTRICT_LABELS[row.original.district as keyof typeof DISTRICT_LABELS] ?? row.original.district,
    },
    {
      accessorKey: 'categories',
      header: 'Categorías',
      enableSorting: false,
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((c: any) => <Badge key={c} color="teal">{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c}</Badge>)}
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
        <div className="flex justify-end gap-1.5">
          <TableActionButton variant="view" onClick={() => setDetailBusiness(row.original)}>Ver</TableActionButton>
          <TableActionButton variant="edit" onClick={() => setEditingBusiness(row.original)}>Editar</TableActionButton>
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

  const [bizPagination, setBizPagination] = useState({ pageIndex: bizPageIndex, pageSize: bizPageSize })

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
  const currentPageSize = activeTab === 'requests' ? reqPageSize : bizPageSize
  const handlePageSizeChange = (nextSize: number) => {
    if (activeTab === 'requests') {
      setReqPageSize(nextSize)
      setReqPagination({ pageIndex: 0, pageSize: nextSize })
    } else {
      setBizPageSize(nextSize)
      setBizPagination({ pageIndex: 0, pageSize: nextSize })
    }
  }

  const pageCount = currentTable.getPageCount()

  const goToPreviousPage = () => {
    if (currentTable.getCanPreviousPage()) {
      currentTable.previousPage()
    }
  }

  const goToNextPage = () => {
    if (currentTable.getCanNextPage()) {
      currentTable.nextPage()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Negocios</h1>
          <p className="mt-1 text-brand-ink/60">Gestión de solicitudes y negocios afiliados</p>
        </div>
        <Button variant="primary" onClick={() => setWizardOpen(true)}>Registrar negocio</Button>
      </div>

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

      <div className="flex flex-wrap gap-2 border-b border-brand-navy/15 pb-1">
        {([['requests', 'Solicitudes'], ['businesses', 'Negocios afiliados']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActiveTab(key); setSearch(''); setStatusFilter('all') }}
            className={cn(
              '-mb-px border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors cursor-pointer',
              activeTab === key ? 'border-brand-green text-brand-navy' : 'border-transparent text-brand-ink/60 hover:text-brand-navy',
            )}
          >
            {label}
          </button>
        ))}
      </div>

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

      {isLoading ? (
        <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 text-brand-ink/60">Cargando registros...</div>
      ) : currentTable.getRowModel().rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-8 text-center text-brand-ink/60">
          {activeTab === 'requests' ? 'No se encontraron solicitudes pendientes' : 'No se encontraron negocios afiliados'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-sand text-brand-navy">
                {currentTable.getHeaderGroups().map((headerGroup: any) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header: any) => (
                      <th key={header.id} className="px-4 py-3 font-semibold">
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="flex items-center gap-2 text-left"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span aria-hidden="true">
                              {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '↕'}
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
                  <tr key={row.id} className="border-t border-brand-navy/10 align-top hover:bg-brand-paper/50 transition-colors">
                    {row.getAllCells().map((cell: any) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-navy/10 bg-brand-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-brand-ink/70">
              <span>Filas por página</span>
              <select
                value={currentPageSize}
                onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                className="rounded border border-brand-navy/15 bg-white px-2 py-1 text-sm"
                aria-label="Seleccionar filas por página"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-brand-ink/70">
              <span>
                Página {currentTable.state.pagination.pageIndex + 1} de {pageCount || 1}
              </span>
              <Button variant="outline" onClick={goToPreviousPage} className="px-3 py-1.5 text-xs" disabled={!currentTable.getCanPreviousPage()}>
                Anterior
              </Button>
              <Button variant="outline" onClick={goToNextPage} className="px-3 py-1.5 text-xs" disabled={!currentTable.getCanNextPage()}>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        size="xl"
        open={wizardOpen}
        onOpenChange={(open) => !open && setWizardOpen(false)}
        title="Registrar nuevo negocio"
        description="Complete la información para registrar un negocio directamente"
      >
        <AffiliationWizard
          isAdminMode
          onCancel={() => setWizardOpen(false)}
          onComplete={() => {
            setWizardOpen(false)
            loadBusinesses()
            showToast({ variant: 'success', title: 'Negocio registrado', description: 'Se creó el negocio y la cuenta del usuario exitosamente.' })
          }}
        />
      </Modal>

      <Modal
        size="xl"
        open={Boolean(editingBusiness)}
        onOpenChange={(open) => !open && setEditingBusiness(null)}
        title={'Editar negocio — ' + (editingBusiness?.businessName ?? '')}
        description="Actualice la información del negocio afiliado"
      >
        {editingBusiness && (
          <AffiliationWizard
            isAdminMode
            isEditMode
            initialData={editingBusiness}
            businessId={editingBusiness.id}
            onCancel={() => setEditingBusiness(null)}
            onComplete={() => {
              setEditingBusiness(null)
              loadBusinesses()
              showToast({ variant: 'success', title: 'Negocio actualizado', description: 'Los cambios fueron guardados exitosamente.' })
            }}
          />
        )}
      </Modal>

      {detailRequest && (
        <BusinessDetailModal
          open={Boolean(detailRequest)}
          onClose={() => setDetailRequest(null)}
          request={detailRequest}
        />
      )}

      {detailBusiness && (
        <BusinessDetailModal
          open={Boolean(detailBusiness)}
          onClose={() => setDetailBusiness(null)}
          business={detailBusiness}
        />
      )}

      {rejectingRequest && (
        <RejectRequestModal
          request={rejectingRequest}
          open={Boolean(rejectingRequest)}
          onClose={() => setRejectingRequest(null)}
          onConfirm={(reason) => handleReject(rejectingRequest.id, reason)}
        />
      )}

      <Modal
        open={Boolean(confirmApprove)}
        onOpenChange={(open) => { if (!open) setConfirmApprove(null) }}
        title="Aprobar solicitud"
        description="Al aprobar, se creará el negocio y la cuenta del propietario, y se le enviará un correo de activación."
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmApprove(null)}>Cancelar</Button>
            <Button variant="primary" onClick={() => confirmApprove && handleApprove(confirmApprove.id)}>Aprobar</Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {confirmApprove ? '¿Desea aprobar la solicitud de "' + confirmApprove.businessName + '"?' : ''}
        </p>
      </Modal>

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
          {confirmStatusBiz ? '¿Desea continuar con "' + confirmStatusBiz.businessName + '"?' : 'Confirmación requerida.'}
        </p>
      </Modal>
    </div>
  )
}
