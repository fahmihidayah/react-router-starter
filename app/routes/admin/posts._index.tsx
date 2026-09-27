import { useEffect, useMemo, useState } from 'react'
import { Form, useFetcher, useLoaderData, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { TPost } from '~/db/schema'
import createColumn from '~/features/admin/components/table/column/create-column'
import {
  DataTable,
  DeleteDialog,
  PageHeader,
  TablePagination,
} from '~/features/admin/components/table/table-list'
import { deleteManyPostsAction } from '~/features/posts/actions/delete-many-posts-action'
import { deletePostAction } from '~/features/posts/actions/delete-post-action'
import { getPostsLoader } from '~/features/posts/loaders/get-posts-loader'
import type { Route } from './+types/posts._index'

export function loader({ request }: Route.LoaderArgs) {
  return getPostsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const id = formData.get('id')
      return typeof id === 'string' && id.length > 0
        ? await deletePostAction(id)
        : { success: false, message: 'Post ID is required' }
    }

    if (intent === 'deleteMany') {
      const value = formData.get('ids')
      const ids: unknown = JSON.parse(typeof value === 'string' ? value : '[]')

      return Array.isArray(ids) && ids.every((id) => typeof id === 'string' && id.length > 0)
        ? await deleteManyPostsAction(ids)
        : { success: false, message: 'Invalid post IDs' }
    }

    return { success: false, message: 'Invalid action' }
  } catch (error) {
    console.error('Post action error:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export function meta() {
  return [{ title: 'Posts - Dashboard' }, { name: 'description', content: 'Manage blog posts' }]
}

export default function PostsPage() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const fetcher = useFetcher<typeof action>()
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.success) {
      toast.success('Posts deleted successfully')
      setDeleting([])
    } else {
      toast.error(
        'message' in fetcher.data && typeof fetcher.data.message === 'string'
          ? fetcher.data.message
          : 'Unable to delete posts',
      )
    }
  }, [fetcher.state, fetcher.data])
  const [deleting, setDeleting] = useState<TPost[]>([])

  const columns = useMemo(
    () =>
      createColumn<TPost>({
        tableName: 'posts',
        columnConfig: [
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
          getItemId: (post) => post.id,
          onEdit: (post) => navigate(`/admin/posts/${post.id}`),
          onDelete: (post) => setDeleting([post]),
        },
      }),
    [navigate],
  )

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
  }

  const handleConfirmDelete = () => {
    if (deleting.length === 0 || fetcher.state !== 'idle') return

    const formData = new FormData()
    formData.set('intent', deleting.length === 1 ? 'delete' : 'deleteMany')

    if (deleting.length === 1) {
      formData.set('id', deleting[0].id)
    } else {
      formData.set('ids', JSON.stringify(deleting.map((post) => post.id)))
    }

    fetcher.submit(formData, { method: 'post' })
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <PageHeader
          title="Posts"
          description="Create and manage your blog posts."
          addButtonText="Add post"
          addButtonLink="/admin/posts/new"
        />

        <Form method="get" className="flex gap-2">
          <Input
            name="search"
            aria-label="Search posts"
            placeholder="Search posts..."
            defaultValue={searchParams.get('search') ?? ''}
          />
          <Button type="submit">Search</Button>
        </Form>

        <DataTable
          key={JSON.stringify(data.docs.map((post) => post.id))}
          data={data.docs}
          columns={columns}
          emptyMessage="No posts found."
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
        title={deleting.length === 1 ? 'Delete Post' : 'Delete Posts'}
        itemName={deleting.length === 1 ? deleting[0].title : `${deleting.length} posts`}
        onConfirm={handleConfirmDelete}
        confirmButtonText={fetcher.state !== 'idle' ? 'Deleting...' : 'Delete'}
        onCancel={() => setDeleting([])}
      />
    </div>
  )
}
