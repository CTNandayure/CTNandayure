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
import type { UserAdminRecord } from '../../services/usersAdminService'

interface UsersTableProps {
  users: UserAdminRecord[]
  isLoading: boolean
  onView: (user: UserAdminRecord) => void
  onEdit: (user: UserAdminRecord) => void
  onToggleStatus: (user: UserAdminRecord) => void
}

export function UsersTable({ users, isLoading, onView, onEdit, onToggleStatus }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  const columns = useMemo<any[]>(() => [
    {
      accessorKey: 'person.name',
      id: 'name',
      header: 'Nombre',
      cell: ({ row }: any) => {
        const user = row.original
        const fullName = [user.person?.name, user.person?.first_lastname, user.person?.second_lastname].filter(Boolean).join(' ') || 'Sin nombre'
        return <span className="font-medium text-brand-navy">{fullName}</span>
      },
      sortingFn: (rowA: any, rowB: any) => {
        const a = [rowA.original.person?.name, rowA.original.person?.first_lastname, rowA.original.person?.second_lastname].filter(Boolean).join(' ').toLowerCase()
        const b = [rowB.original.person?.name, rowB.original.person?.first_lastname, rowB.original.person?.second_lastname].filter(Boolean).join(' ').toLowerCase()
        return a.localeCompare(b)
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: any) => <span className="text-brand-ink/75">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }: any) => {
        const role = row.original.role
        const color = role === 'ADMIN' ? 'navy' : 'teal'
        return <Badge color={color}>{role}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }: any) => {
        const status = row.original.status
        const isActive = status === 'ACTIVO'
        const color = isActive ? 'green' : 'red'
        return <Badge color={color}>{status}</Badge>
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Creado',
      cell: ({ row }: any) => <span className="text-brand-ink/70">{new Date(row.original.created_at).toLocaleDateString('es-CR')}</span>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: any) => {
        const user = row.original
        const isActive = user.status === 'ACTIVO'
        return (
          <div className="flex justify-end gap-1.5">
            <TableActionButton variant="view" onClick={() => onView(user)}>Ver</TableActionButton>
            <TableActionButton variant="edit" onClick={() => onEdit(user)}>Editar</TableActionButton>
            <TableActionButton variant={isActive ? 'deactivate' : 'activate'} onClick={() => onToggleStatus(user)}>
              {isActive ? 'Desactivar' : 'Activar'}
            </TableActionButton>
          </div>
        )
      },
    },
  ], [])

  const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
  })

  const [pagination, setPagination] = useState({ pageIndex, pageSize })

  const table = useTable({
    data: users,
    columns,
    features,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  const pageCount = table.getPageCount()

  const goToPreviousPage = () => {
    if (table.getCanPreviousPage()) {
      table.previousPage()
      setPageIndex((current) => Math.max(current - 1, 0))
    }
  }

  const goToNextPage = () => {
    if (table.getCanNextPage()) {
      table.nextPage()
      setPageIndex((current) => current + 1)
    }
  }

  if (isLoading) {
    return <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 text-brand-ink/60">Cargando usuarios...</div>
  }

  if (!users.length) {
    return <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-8 text-center text-brand-ink/60">No se encontraron usuarios</div>
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
            value={pageSize}
            onChange={(event) => {
              const nextSize = Number(event.target.value)
              setPageSize(nextSize)
              table.setPageSize(nextSize)
              setPageIndex(0)
            }}
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
            Página {table.state.pagination.pageIndex + 1} de {pageCount}
          </span>
          <Button variant="outline" onClick={goToPreviousPage} className="px-3 py-1.5 text-xs" disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button variant="outline" onClick={goToNextPage} className="px-3 py-1.5 text-xs" disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
