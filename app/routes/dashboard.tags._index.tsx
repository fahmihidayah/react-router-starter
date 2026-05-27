import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyTagsAction } from '~/features/tags/actions/delete-many-tags-action'
import { deleteTagAction } from '~/features/tags/actions/delete-tag-action'
import { getTagsLoader } from '~/features/tags/loaders/get-tags-loader'
import type { TTag } from '~/db/schema'
import type { Route } from './+types/dashboard.tags._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getTagsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const tagId = formData.get('tagId')?.toString()
      if (tagId) {
        return deleteTagAction(tagId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyTagsAction(ids)
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
    { title: 'Tags - Dashboard' },
    { name: 'description', content: 'Manage your tags' },
  ]
}

export default function TagsPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingTag, setDeletingTag] = useState<TTag | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TTag[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TTag>({
    tableName: 'tags',
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
        accessorKey: 'color',
        header: 'Color',
        fallback: 'No color',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
    ],
    actionColumnConfig: {
      getItemId: (tag) => tag.id,
      onDelete: (tag) => setDeletingTag(tag),
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

  const handleDeleteTag = () => {
    if (!deletingTag) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('tagId', deletingTag.id)

    submit(formData, { method: 'post' })
    setDeletingTag(null)
    toast.success('Tag deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((t) => t.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} tag${deletingMultiple.length !== 1 ? 's' : ''} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search tags..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No tags found."
          enableRowSelection
          tableName="tags"
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
        open={!!deletingTag}
        onOpenChange={(open) => !open && setDeletingTag(null)}
        title="Delete Tag"
        itemName={deletingTag?.name || ''}
        onConfirm={handleDeleteTag}
        onCancel={() => setDeletingTag(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Tags"
        itemName={`${deletingMultiple.length} tag${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
