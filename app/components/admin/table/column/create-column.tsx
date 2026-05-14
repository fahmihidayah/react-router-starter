import type { ColumnDef } from '@tanstack/react-table'
import { type ActionColumnConfig, createActionColumn } from './action-column'
import { createDateColumn, type DateColumnConfig } from './date-column'
import { createTextColumn, type TextColumnConfig } from './text-column'

interface CreateColumnProps<T> {
  columnConfig: (string | TextColumnConfig<T> | DateColumnConfig<T>)[]
  actionColumnConfig: ActionColumnConfig<T>
  tableName?: string
  idKey?: keyof T
}

export default function createColumn<T>(props: CreateColumnProps<T>): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = []
  const idKey = props.idKey || ('id' as keyof T)

  props.columnConfig.forEach((e, index) => {
    if (typeof e === 'string') {
      // Capitalize first letter for header
      const header = e.charAt(0).toUpperCase() + e.slice(1)
      columns.push(
        createTextColumn<T>({
          accessorKey: e as any,
          header: header,
          type: 'text',
          tableName: props.tableName,
          isFirstColumn: index === 0,
          idKey,
        }),
      )
    } else if (e.type === 'text') {
      columns.push(
        createTextColumn({
          ...e,
          tableName: props.tableName,
          isFirstColumn: index === 0,
          idKey,
        }),
      )
    } else if (e.type === 'date') {
      columns.push(createDateColumn(e))
    }
  })

  return [...columns, createActionColumn(props.actionColumnConfig)]
}
