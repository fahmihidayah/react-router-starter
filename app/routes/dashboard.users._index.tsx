import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyUsersAction } from '~/features/users/actions/delete-many-user-action'
import { deleteUserAction } from '~/features/users/actions/delete-user-action'
import { getUsersLoader } from '~/features/users/loaders/get-users-loader'
import type { TUser } from '~/features/users/type'
import type { Route } from './+types/dashboard.users._index'

// Loader - Fetch users with pagination and search
export async function loader({ request }: Route.LoaderArgs) {
  const data = await getUsersLoader(request)
  return {
    tasks: data.users,
    totalCount: data.totalCount,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  }
}

// Action - Handle delete and delete-many operations
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const userId = formData.get('userId')?.toString()
      if (userId) {
        return deleteUserAction(userId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyUsersAction(ids)
      }
    }

    return { success: false, message: 'Invalid action' }
  } catch (error) {
    console.error('Action error:', error)
    return { success: false, message: 'An error occurred' }
  }
}

export function meta() {
  return [{ title: 'Users - Dashboard' }, { name: 'description', content: 'Manage your users' }]
}

export default function DashboardUsersPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const submit = useSubmit()

  // State
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingUser, setDeletingUser] = useState<TUser | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TUser[]>([])
  const _navigate = useNavigate()

  // Table columns
  const columns = createColumn<TUser>({
    tableName: 'users',

    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
        isBold: false,
      },
      {
        type: 'text',
        accessorKey: 'email',
        header: 'Email',
        fallback: 'No email',
        isBold: false,
      },
      {
        type: 'text',
        accessorKey: 'name',
        header: 'Name',
        fallback: 'No Name',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
      {
        type: 'date',
        accessorKey: 'updatedAt',
        header: 'Updated',
      },
    ],
    actionColumnConfig: {
      getItemId: (user) => user.id,
      onDelete: (user) => setDeletingUser(user),
    },
  })

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to first page
    setSearchParams(params)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  // Handle delete single user
  const handleDeleteUser = () => {
    if (!deletingUser) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('userId', deletingUser.id)

    submit(formData, { method: 'post' })
    setDeletingUser(null)
    toast.success('User deleted successfully')
  }

  // Handle delete multiple users
  const handleDeleteMultipleUsers = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((u) => u.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} user(s) deleted successfully`)
  }

  // Handle selected rows for bulk delete
  const handleDeleteSelected = (selectedUsers: TUser[]) => {
    setDeletingMultiple(selectedUsers)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        {/* Data Table */}
        <DataTable
          data={loaderData.tasks}
          columns={columns}
          searchPlaceholder="Search users..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No users found."
          enableRowSelection
          tableName="users"
          onDeleteSelected={handleDeleteSelected}
          totalPages={loaderData.totalPages}
          manualPagination
        />

        {/* Table Pagination */}
        {loaderData.totalPages > 1 && (
          <TablePagination
            currentPage={loaderData.page}
            totalPages={loaderData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Delete Single User Dialog */}
      <DeleteDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title="Delete User"
        itemName={deletingUser?.email || ''}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />

      {/* Delete Multiple Users Dialog */}
      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Users"
        itemName={`${deletingMultiple.length} user${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultipleUsers}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
