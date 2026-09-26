import type { ColumnDef } from '@tanstack/react-table'

export interface ImageColumnConfig<T> {
  type: 'image'
  accessorKey: keyof T
  header: string
  alt?: string
  width?: number
  height?: number
  className?: string
  fallback?: string
}

export function createImageColumn<T>(config: ImageColumnConfig<T>): ColumnDef<T> {
  return {
    accessorKey: config.accessorKey as string,
    header: config.header,
    cell: ({ row }) => {
      const imageUrl = row.getValue(config.accessorKey as string) as string | null

      if (!imageUrl) {
        return <div>{config.fallback || '-'}</div>
      }

      return (
        <img
          src={imageUrl}
          alt={config.alt || config.header}
          width={config.width || 50}
          height={config.height || 50}
          className={config.className || 'rounded object-cover'}
        />
      )
    },
  }
}
