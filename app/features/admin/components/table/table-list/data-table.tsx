import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
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
  emptyMessage?: string
  onDeleteSelected?: (selectedRows: TData[]) => void
}

export function DataTable<TData>({
  data,
  columns,
  emptyMessage = 'No results found.',
  onDeleteSelected,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enableRowSelection: true,
  })

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)

  const columnCount = columns.length + 1

  return (
    <div className="flex flex-col gap-4">
      {onDeleteSelected && selectedRows.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteSelected?.(selectedRows)}
          className="self-end gap-2"
        >
          <Trash2 className="size-4" />
          Delete ({selectedRows.length})
        </Button>
      )}
      <div className="border rounded-lg overflow-clip">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-12">
                  <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                    aria-label="Select all rows"
                  />
                </TableHead>
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
                  <TableCell className="w-12">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select row"
                    />
                  </TableCell>
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
