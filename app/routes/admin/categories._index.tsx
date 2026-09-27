import { useMemo, useState } from 'react'
import { useLoaderData, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import type { TCategory } from '~/db/schema'
import createColumn from '~/features/admin/components/table/column/create-column'
import {
  DataTable,
  DeleteDialog,
  PageHeader,
  TablePagination,
} from '~/features/admin/components/table/table-list'
import { deleteCategoryAction } from '~/features/categories/actions/delete-category-action'
import { deleteManyCategoriesAction } from '~/features/categories/actions/delete-many-categories-action'
import { getCategoriesLoader } from '~/features/categories/loaders/get-categories-loader'
import type { Route } from './+types/categories._index'

export function loader({ request }: Route.LoaderArgs) {
  return getCategoriesLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const id = formData.get('id')
      return typeof id === 'string'
        ? deleteCategoryAction(id)
        : { success: false, message: 'Category ID is required' }
    }

    if (intent === 'deleteMany') {
      const value = formData.get('ids')
      const ids: unknown = JSON.parse(typeof value === 'string' ? value : '[]')

      return Array.isArray(ids) && ids.every((id) => typeof id === 'string')
        ? deleteManyCategoriesAction(ids)
        : { success: false, message: 'Invalid category IDs' }
    }

    return { success: false, message: 'Invalid action' }
  } catch (error) {
    console.error('Category action error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export function meta() {
  return [
    { title: 'Categories - Dashboard' },
    { name: 'description', content: 'Manage post categories' },
  ]
}

export default function CategoriesPage() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()
  const [deleting, setDeleting] = useState<TCategory[]>([])

  const columns = useMemo(
    () =>
      createColumn<TCategory>({
        tableName: 'categories',
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
            accessorKey: 'title',
            header: 'Title',
            fallback: 'Untitled',
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
          getItemId: (category) => category.id,
          onDelete: (category) => setDeleting([category]),
        },
      }),
    [],
  )

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
  }

  const handleConfirmDelete = () => {
    if (deleting.length === 0) return

    const formData = new FormData()
    formData.set('intent', deleting.length === 1 ? 'delete' : 'deleteMany')

    if (deleting.length === 1) {
      formData.set('id', deleting[0].id)
    } else {
      formData.set('ids', JSON.stringify(deleting.map((category) => category.id)))
    }

    submit(formData, { method: 'post' })
    toast.success(
      deleting.length === 1
        ? 'Category deleted successfully'
        : `${deleting.length} categories deleted successfully`,
    )
    setDeleting([])
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <PageHeader
          title="Categories"
          description="Create and manage categories for your posts."
          addButtonText="Add category"
          addButtonLink="/admin/categories/new"
        />

        <DataTable
          data={data.docs}
          columns={columns}
          emptyMessage="No categories found."
          onDeleteSelected={setDeleting}
        />

        {data.totalPages > 1 && (
          <TablePagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <DeleteDialog
        open={deleting.length > 0}
        onOpenChange={(open) => !open && setDeleting([])}
        title={deleting.length === 1 ? 'Delete Category' : 'Delete Categories'}
        itemName={
          deleting.length === 1
            ? deleting[0].title
            : `${deleting.length} categories`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting([])}
      />
    </div>
  )
}
