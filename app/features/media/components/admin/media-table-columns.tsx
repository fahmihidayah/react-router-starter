import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import type { TMedia } from '~/db/schema'
import { createActionColumn } from '~/features/admin/components/table/column/action-column'

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export function createMediaTableColumns(onDelete: (item: TMedia) => void): ColumnDef<TMedia>[] {
  return [
    {
      id: 'preview',
      header: 'Preview',
      cell: ({ row }) => (
        <Link to={`/admin/media/${row.original.id}`} aria-label={`Edit ${row.original.filename}`}>
          <img
            src={row.original.url}
            alt={row.original.alt || ''}
            className="size-14 rounded-md border bg-muted object-cover"
            loading="lazy"
          />
        </Link>
      ),
    },
    {
      accessorKey: 'filename',
      header: 'File',
      cell: ({ row }) => (
        <div className="max-w-64 space-y-1">
          <Link
            to={`/admin/media/${row.original.id}`}
            className="block truncate font-medium hover:underline"
          >
            {row.original.originalFilename || row.original.filename}
          </Link>
          <a
            href={row.original.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
          >
            {row.original.filename}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>
      ),
    },
    {
      id: 'details',
      header: 'Details',
      cell: ({ row }) => {
        const item = row.original
        const dimensions = item.width && item.height ? `${item.width} × ${item.height}` : '—'
        return (
          <div className="text-sm">
            <div>{dimensions}</div>
            <div className="text-muted-foreground">{formatBytes(item.size)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'storageProvider',
      header: 'Storage',
      cell: ({ row }) => (
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium uppercase">
          {row.original.storageProvider || 'external'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Uploaded',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    createActionColumn({
      getItemId: (item) => item.id,
      onEdit: (item) => {
        window.location.assign(`/admin/media/${item.id}`)
      },
      onDelete,
      onCopyId: (item) => item.id,
    }),
  ]
}
