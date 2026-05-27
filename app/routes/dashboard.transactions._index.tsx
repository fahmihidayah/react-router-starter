import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyTransactionsAction } from '~/features/transactions/actions/delete-many-transactions-action'
import { deleteTransactionAction } from '~/features/transactions/actions/delete-transaction-action'
import { getTransactionsLoader } from '~/features/transactions/loaders/get-transactions-loader'
import type { TTransaction } from '~/db/schema'
import type { Route } from './+types/dashboard.transactions._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getTransactionsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const transactionId = formData.get('transactionId')?.toString()
      if (transactionId) {
        return deleteTransactionAction(transactionId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyTransactionsAction(ids)
      }
    }

    return { success: false }
  } catch (error) {
    console.error('Action error:', error)
    return { success: false }
  }
}

export function meta() {
  return [
    { title: 'Transactions - Dashboard' },
    { name: 'description', content: 'Manage your transactions' },
  ]
}

export default function TransactionsPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingTransaction, setDeletingTransaction] = useState<TTransaction | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TTransaction[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TTransaction>({
    tableName: 'transactions',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },
      {
        type: 'text',
        accessorKey: 'congregationId',
        header: 'Congregation ID',
        fallback: 'No congregation',
      },
      {
        type: 'text',
        accessorKey: 'amount',
        header: 'Amount',
        fallback: 'No amount',
      },
      {
        type: 'text',
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        fallback: 'No payment method',
      },
      {
        type: 'text',
        accessorKey: 'status',
        header: 'Status',
        fallback: 'No status',
      },
      {
        type: 'date',
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
    ],
    actionColumnConfig: {
      getItemId: (transaction) => transaction.id,
      onDelete: (transaction) => setDeletingTransaction(transaction),
    },
  })

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  const handleDeleteTransaction = () => {
    if (!deletingTransaction) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('transactionId', deletingTransaction.id)

    submit(formData, { method: 'post' })
    setDeletingTransaction(null)
    toast.success('Transaction deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((t) => t.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} transaction${deletingMultiple.length !== 1 ? 's' : ''} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search transactions..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No transactions found."
          enableRowSelection
          tableName="transactions"
          onDeleteSelected={setDeletingMultiple}
          totalPages={loaderData.totalPages}
          manualPagination
        />

        {loaderData.totalPages > 1 && (
          <TablePagination
            currentPage={loaderData.page}
            totalPages={loaderData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <DeleteDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        title="Delete Transaction"
        itemName={deletingTransaction?.id || ''}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeletingTransaction(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Transactions"
        itemName={`${deletingMultiple.length} transaction${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
