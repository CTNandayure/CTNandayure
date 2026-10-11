import { useMemo, useState } from 'react'
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
import { Badge, Button, TableActionButton } from '../../../../components/ui'
import type { ActivityRecord, ActivityStatus } from '../../types/activity.types'
import { categoryLabel, describeSchedule } from '../../utils/activityLabels'
import { ActivityStatusBadge } from '../ActivityStatusBadge'

interface ActivitiesTableProps {
  activities: ActivityRecord[]
  isLoading: boolean
  onEdit: (activity: ActivityRecord) => void
  onChangeStatus: (activity: ActivityRecord, next: ActivityStatus) => void
}

// Same table pattern as NewsTable / UsersTable. Status actions depend on the
// current status: BORRADOR→publish, PUBLICADA→unpublish or deactivate (moderation),
// INACTIVA→reactivate.
export function ActivitiesTable({ activities, isLoading, onEdit, onChangeStatus }: ActivitiesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const columns = useMemo<any[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row: ActivityRecord) => row.name,
        header: 'Actividad',
        cell: ({ row }: any) => {
          const activity: ActivityRecord = row.original
          return (
            <div className="flex items-center gap-3">
              {activity.imageUrl ? (
                <img src={activity.imageUrl} alt="" className="h-10 w-14 flex-none rounded-lg border object-cover" />
              ) : (
                <div className="h-10 w-14 flex-none rounded-lg bg-brand-sand" />
              )}
              <span className="font-medium text-brand-navy">{activity.name}</span>
            </div>
          )
        },
      },
      {
        id: 'business',
        accessorFn: (row: ActivityRecord) => row.business.businessName,
        header: 'Negocio',
        cell: ({ row }: any) => <span className="text-brand-ink/80">{row.original.business.businessName}</span>,
      },
      {
        id: 'category',
        accessorFn: (row: ActivityRecord) => categoryLabel(row),
        header: 'Categoría',
        cell: ({ row }: any) => <Badge color="teal">{categoryLabel(row.original)}</Badge>,
      },
      {
        id: 'schedule',
        accessorFn: (row: ActivityRecord) => row.nextOccurrence ?? '9999-12-31',
        header: 'Horario',
        cell: ({ row }: any) => <span className="text-brand-ink/70">{describeSchedule(row.original, true)}</span>,
      },
      {
        id: 'status',
        accessorFn: (row: ActivityRecord) => row.status,
        header: 'Estado',
        cell: ({ row }: any) => <ActivityStatusBadge activity={row.original} />,
      },
      {
        id: 'actions',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }: any) => {
          const activity: ActivityRecord = row.original
          return (
            <div className="flex flex-wrap justify-end gap-1.5">
              <TableActionButton variant="edit" onClick={() => onEdit(activity)}>
                Editar
              </TableActionButton>
              {activity.status === 'BORRADOR' && (
                <TableActionButton variant="publish" onClick={() => onChangeStatus(activity, 'PUBLICADA')}>
                  Publicar
                </TableActionButton>
              )}
              {activity.status === 'PUBLICADA' && (
                <>
                  <TableActionButton variant="unpublish" onClick={() => onChangeStatus(activity, 'BORRADOR')}>
                    Despublicar
                  </TableActionButton>
                  <TableActionButton variant="deactivate" onClick={() => onChangeStatus(activity, 'INACTIVA')}>
                    Desactivar
                  </TableActionButton>
                </>
              )}
              {activity.status === 'INACTIVA' && (
                <TableActionButton variant="activate" onClick={() => onChangeStatus(activity, 'PUBLICADA')}>
                  Reactivar
                </TableActionButton>
              )}
            </div>
          )
        },
      },
    ],
    [onEdit, onChangeStatus],
  )

  const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
  })

  const table = useTable({
    data: activities,
    columns,
    features,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  if (isLoading) {
    return <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 text-brand-ink/60">Cargando actividades...</div>
  }

  if (!activities.length) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-8 text-center text-brand-ink/60">
        No se encontraron actividades
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-sand text-brand-navy">
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th key={header.id} className="px-4 py-3 font-semibold">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button type="button" className="flex items-center gap-2 text-left" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span aria-hidden="true">
                          {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '↕'}
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row: any) => (
              <tr key={row.id} className="border-t border-brand-navy/10 align-top">
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
            value={pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
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
            Página {table.state.pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <Button variant="outline" onClick={() => table.previousPage()} className="px-3 py-1.5 text-xs" disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button variant="outline" onClick={() => table.nextPage()} className="px-3 py-1.5 text-xs" disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
