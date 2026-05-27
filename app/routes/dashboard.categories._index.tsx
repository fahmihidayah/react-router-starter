import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyCategoriesAction } from '~/features/categories/actions/delete-many-categories-action'
import { deleteCategoryAction } from '~/features/categories/actions/delete-category-action'
import { getCategoriesLoader } from '~/features/categories/loaders/get-categories-loader'
import type { TCategory } from '~/db/schema'
import type { Route } from './+types/dashboard.categories._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getCategoriesLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const categoryId = formData.get('categoryId')?.toString()
      if (categoryId) {
        return deleteCategoryAction(categoryId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyCategoriesAction(ids)
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
    { title: 'Categories - Dashboard' },
    { name: 'description', content: 'Manage your categories' },
  ]
}

export default function CategoriesPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingCategory, setDeletingCategory] = useState<TCategory | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TCategory[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TCategory>({
    tableName: 'categories',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },
      {
        type: 'text',
        accessorKey: 'title',
        header: 'Title',
        fallback: 'No title',
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
      onDelete: (category) => setDeletingCategory(category),
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

  const handleDeleteCategory = () => {
    if (!deletingCategory) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('categoryId', deletingCategory.id)

    submit(formData, { method: 'post' })
    setDeletingCategory(null)
    toast.success('Category deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((c) => c.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} categor${deletingMultiple.length !== 1 ? 'ies' : 'y'} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search categories..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No categories found."
          enableRowSelection
          tableName="categories"
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
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete Category"
        itemName={deletingCategory?.title || ''}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCategory(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Categories"
        itemName={`${deletingMultiple.length} categor${deletingMultiple.length !== 1 ? 'ies' : 'y'}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
