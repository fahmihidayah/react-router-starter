import { useEffect, useMemo, useState } from 'react'
import { useActionData, useLoaderData, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import type { TUser } from '~/db/schema'
import createColumn from '~/features/admin/components/table/column/create-column'
import {
  DataTable,
  DeleteDialog,
  PageHeader,
  TablePagination,
} from '~/features/admin/components/table/table-list'
import { deleteManyUsersAction } from '~/features/users/actions/delete-many-user-action'
import { deleteUserAction } from '~/features/users/actions/delete-user-action'
import { getUsersLoader } from '~/features/users/loaders/get-users-loader'
import type { Route } from './+types/users._index'

// Loader - Fetch users with pagination and search
export async function loader(args: Route.LoaderArgs) {
  return await getUsersLoader(args)
}

// Action - Handle delete and delete-many operations
export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const userId = formData.get('userId')?.toString()
      if (userId) {
        return deleteUserAction({ ...args, params: { id: userId } })
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        return deleteManyUsersAction(args)
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
  const response = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const loaderData = response.data
  const [searchParams, setSearchParams] = useSearchParams()

  const submit = useSubmit()

  // State
  const [deletingUser, setDeletingUser] = useState<TUser | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TUser[]>([])

  useEffect(() => {
    if (!actionData) return

    if (actionData.success) {
      toast.success(actionData.message)
    } else {
      toast.error(actionData.message)
    }
  }, [actionData])

  // Table columns
  const columns = useMemo(
    () =>
      createColumn<TUser>({
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
      }),
    [],
  )

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
  }

  // Handle delete multiple users
  const handleDeleteMultipleUsers = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((u) => u.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
  }

  // Handle selected rows for bulk delete
  const handleDeleteSelected = (selectedUsers: TUser[]) => {
    setDeletingMultiple(selectedUsers)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Create and manage user accounts."
          addButtonText="Add user"
          addButtonLink="/admin/users/new"
        />

        {/* Data Table */}
        <DataTable
          data={loaderData?.docs || []}
          columns={columns}
          emptyMessage="No users found."
          onDeleteSelected={handleDeleteSelected}
        />

        {/* Table Pagination */}
        {(loaderData?.totalPages || 0) > 1 && (
          <TablePagination
            currentPage={loaderData?.page || 1}
            totalPages={loaderData?.totalPages || 1}
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
