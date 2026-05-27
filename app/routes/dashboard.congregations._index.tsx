import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyCongregationsAction } from '~/features/congregations/actions/delete-many-congregations-action'
import { deleteCongregationAction } from '~/features/congregations/actions/delete-congregation-action'
import { getCongregationsLoader } from '~/features/congregations/loaders/get-congregations-loader'
import type { TCogregation } from '~/db/schema'
import type { Route } from './+types/dashboard.congregations._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getCongregationsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const congregationId = formData.get('congregationId')?.toString()
      if (congregationId) {
        return deleteCongregationAction(congregationId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyCongregationsAction(ids)
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
    { title: 'Congregations - Dashboard' },
    { name: 'description', content: 'Manage your congregations' },
  ]
}

export default function CongregationsPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingCongregation, setDeletingCongregation] = useState<TCogregation | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TCogregation[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TCogregation>({
    tableName: 'congregations',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },
      {
        type: 'text',
        accessorKey: 'name',
        header: 'Name',
        fallback: 'No name',
      },
      {
        type: 'text',
        accessorKey: 'gender',
        header: 'Gender',
        fallback: 'No gender',
        format: (value: string) => (value === 'm' ? 'Male' : 'Female'),
      },
      {
        type: 'text',
        accessorKey: 'phone',
        header: 'Phone',
        fallback: 'No phone',
      },
      {
        type: 'text',
        accessorKey: 'address',
        header: 'Address',
        fallback: 'No address',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
    ],
    actionColumnConfig: {
      getItemId: (congregation) => congregation.id,
      onDelete: (congregation) => setDeletingCongregation(congregation),
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

  const handleDeleteCongregation = () => {
    if (!deletingCongregation) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('congregationId', deletingCongregation.id)

    submit(formData, { method: 'post' })
    setDeletingCongregation(null)
    toast.success('Congregation deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((c) => c.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} congregation${deletingMultiple.length !== 1 ? 's' : ''} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search congregations..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No congregations found."
          enableRowSelection
          tableName="congregations"
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
        open={!!deletingCongregation}
        onOpenChange={(open) => !open && setDeletingCongregation(null)}
        title="Delete Congregation"
        itemName={deletingCongregation?.name || ''}
        onConfirm={handleDeleteCongregation}
        onCancel={() => setDeletingCongregation(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Congregations"
        itemName={`${deletingMultiple.length} congregation${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
