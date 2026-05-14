import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  emptyMessage?: string
  totalPages?: number
  manualPagination?: boolean
  enableRowSelection?: boolean
  onDeleteSelected?: (selectedRows: TData[]) => void
  tableName?: string
  pageTitle?: string
  addButtonText?: string
  addButtonLink?: string
}

export function DataTable<TData>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  emptyMessage = 'No results found.',
  totalPages,
  manualPagination = false,
  enableRowSelection = false,
  onDeleteSelected,
  tableName,
  pageTitle,
  addButtonText = 'Create',
  addButtonLink,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection: enableRowSelection ? rowSelection : {},
    },
    manualPagination,
    pageCount: totalPages,
    enableRowSelection: enableRowSelection,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)

  const columnCount = enableRowSelection ? columns.length + 1 : columns.length

  // Compute default page title if tableName is provided
  const computedPageTitle =
    pageTitle || (tableName ? tableName.charAt(0).toUpperCase() + tableName.slice(1) : undefined)

  // Compute default add button link if tableName is provided
  const computedAddButtonLink =
    addButtonLink || (tableName ? `/dashboard/${tableName}/add` : undefined)

  return (
    <div className="flex flex-col gap-4">
      {computedPageTitle && (
        <h2 className="text-2xl font-semibold tracking-tight">{computedPageTitle}</h2>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full">
          {searchable && (
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
        </div>
        <div className="flex w-full gap-2 flex-row-reverse items-center sm:gap-2">
          {computedAddButtonLink && (
            <Button asChild size="sm" className="gap-2">
              <Link to={computedAddButtonLink}>
                <Plus className="size-4" />
                {addButtonText}
              </Link>
            </Button>
          )}
          {enableRowSelection && selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteSelected?.(selectedRows)}
              className="gap-2"
            >
              <Trash2 className="size-4" />
              Delete ({selectedRows.length})
            </Button>
          )}
        </div>
      </div>
      <div className="border rounded-lg overflow-clip">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {enableRowSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {enableRowSelection && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
