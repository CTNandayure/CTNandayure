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
import type { NewsItem } from '../../../../content/types'

interface NewsTableProps {
  news: NewsItem[]
  isLoading: boolean
  onEdit: (item: NewsItem) => void
  onToggleStatus: (item: NewsItem) => void
}

export function NewsTable({ news, isLoading, onEdit, onToggleStatus }: NewsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  const columns = useMemo<any[]>(() => [
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }: any) => <span className="font-medium text-brand-navy">{row.original.title}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }: any) => {
        const status = row.original.status
        const isPublished = status === 'PUBLICADO'
        return <Badge color={isPublished ? 'green' : 'yellow'}>{isPublished ? 'Publicado' : 'Borrador'}</Badge>
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Creado',
      cell: ({ row }: any) => <span className="text-brand-ink/70">{new Date(row.original.createdAt).toLocaleDateString('es-CR')}</span>,
    },
    {
      accessorKey: 'publishedAt',
      header: 'Publicado',
      cell: ({ row }: any) => {
        const publishedAt = row.original.publishedAt
        return <span className="text-brand-ink/70">{publishedAt ? new Date(publishedAt).toLocaleDateString('es-CR') : '—'}</span>
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: any) => {
        const item = row.original
        const isPublished = item.status === 'PUBLICADO'
        return (
          <div className="flex justify-end gap-1.5">
            <TableActionButton variant="edit" onClick={() => onEdit(item)}>Editar</TableActionButton>
            <TableActionButton variant={isPublished ? 'unpublish' : 'publish'} onClick={() => onToggleStatus(item)}>
              {isPublished ? 'Despublicar' : 'Publicar'}
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
    data: news,
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
    return <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 text-brand-ink/60">Cargando noticias...</div>
  }

  if (!news.length) {
    return <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-white p-8 text-center text-brand-ink/60">No se encontraron noticias</div>
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
