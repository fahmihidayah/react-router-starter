import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deletePostAction } from '~/features/posts/actions/delete-post-action'
import { deleteManyPostsAction } from '~/features/posts/actions/delete-many-posts-action'
import { getPostsLoader } from '~/features/posts/loaders/get-posts-loader'
import type { TPost } from '~/db/schema'
import type { Route } from './+types/dashboard.posts._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getPostsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const postId = formData.get('postId')?.toString()
      if (postId) {
        return deletePostAction(postId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyPostsAction(ids)
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
    { title: 'Posts - Dashboard' },
    { name: 'description', content: 'Manage your posts' },
  ]
}

export default function PostsPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()
  const navigate = useNavigate()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingPost, setDeletingPost] = useState<TPost | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TPost[]>([])

  const columns = createColumn<TPost>({
    tableName: 'posts',
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
        type: 'text',
        accessorKey: 'slug',
        header: 'Slug',
        fallback: 'No slug',
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
      getItemId: (post) => post.id,
      onEdit: (post) => navigate(`/dashboard/posts/${post.id}`),
      onDelete: (post) => setDeletingPost(post),
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

  const handleDeletePost = () => {
    if (!deletingPost) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('postId', deletingPost.id)

    submit(formData, { method: 'post' })
    setDeletingPost(null)
    toast.success('Post deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((p) => p.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} post${deletingMultiple.length !== 1 ? 's' : ''} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search posts..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No posts found."
          enableRowSelection
          tableName="posts"
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
        open={!!deletingPost}
        onOpenChange={(open) => !open && setDeletingPost(null)}
        title="Delete Post"
        itemName={deletingPost?.title || ''}
        onConfirm={handleDeletePost}
        onCancel={() => setDeletingPost(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Posts"
        itemName={`${deletingMultiple.length} post${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
