import { useEffect, useMemo, useState } from 'react'
import { useActionData, useLoaderData, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import type { TRole } from '~/db/schema'
import createColumn from '~/features/admin/components/table/column/create-column'
import {
  DataTable,
  DeleteDialog,
  PageHeader,
  TablePagination,
} from '~/features/admin/components/table/table-list'
import { deleteManyRolesAction } from '~/features/roles/actions/delete-many-roles-action'
import { deleteRoleAction } from '~/features/roles/actions/delete-role-action'
import { getRolesLoader } from '~/features/roles/loaders/get-roles-loader'
import type { Route } from './+types/roles._index'

export function loader({ request }: Route.LoaderArgs) {
  return getRolesLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')
  if (intent === 'delete') {
    const id = formData.get('id')
    return typeof id === 'string'
      ? deleteRoleAction(id)
      : { success: false, message: 'Role ID is required' }
  }
  if (intent === 'deleteMany') {
    const rawIds = formData.get('ids')
    try {
      const ids: unknown = JSON.parse(typeof rawIds === 'string' ? rawIds : '[]')
      return Array.isArray(ids) && ids.every((id) => typeof id === 'string')
        ? deleteManyRolesAction(ids)
        : { success: false, message: 'Invalid role IDs' }
    } catch {
      return { success: false, message: 'Invalid role IDs' }
    }
  }
  return { success: false, message: 'Invalid action' }
}

export default function RolesPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()
  const [deleting, setDeleting] = useState<TRole[]>([])

  useEffect(() => {
    if (!actionData) return
    actionData.success ? toast.success(actionData.message) : toast.error(actionData.message)
  }, [actionData])

  const columns = useMemo(
    () =>
      createColumn<TRole>({
        tableName: 'roles',
        columnConfig: [
          { type: 'text', accessorKey: 'name', header: 'Name' },
          {
            type: 'text',
            accessorKey: 'description',
            header: 'Description',
            fallback: 'No description',
            isBold: false,
          },
          { type: 'date', accessorKey: 'createdAt', header: 'Created' },
          { type: 'date', accessorKey: 'updatedAt', header: 'Updated' },
        ],
        actionColumnConfig: {
          getItemId: (role) => role.id,
          onDelete: (role) => setDeleting([role]),
        },
      }),
    [],
  )

  const confirmDelete = () => {
    if (!deleting.length) return
    const formData = new FormData()
    formData.set('intent', deleting.length === 1 ? 'delete' : 'deleteMany')
    if (deleting.length === 1) formData.set('id', deleting[0].id)
    else formData.set('ids', JSON.stringify(deleting.map((role) => role.id)))
    submit(formData, { method: 'post' })
    setDeleting([])
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <PageHeader
          title="Roles"
          description="Create and manage user roles."
          addButtonText="Add role"
          addButtonLink="/admin/roles/new"
        />
        <DataTable
          data={data.docs}
          columns={columns}
          emptyMessage="No roles found."
          onDeleteSelected={setDeleting}
        />
        {data.totalPages > 1 && (
          <TablePagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => {
              const params = new URLSearchParams(searchParams)
              params.set('page', String(page))
              setSearchParams(params)
            }}
          />
        )}
      </div>
      <DeleteDialog
        open={deleting.length > 0}
        onOpenChange={(open) => !open && setDeleting([])}
        title={deleting.length === 1 ? 'Delete Role' : 'Delete Roles'}
        itemName={deleting.length === 1 ? deleting[0].name : `${deleting.length} roles`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting([])}
      />
    </div>
  )
}
