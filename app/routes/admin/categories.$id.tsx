import { useActionData, useLoaderData } from 'react-router'
import { updateCategoryAction } from '~/features/categories/actions/update-category-action'
import { EditCategoryForm } from '~/features/categories/components/admin/form/edit-category-form'
import { getCategoryByIdLoader } from '~/features/categories/loaders/get-category-by-id-loader'
import type { Route } from './+types/categories.$id'

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw new Response('Category ID is required', { status: 400 })
  }

  const category = await getCategoryByIdLoader(params.id)
  if (!category) {
    throw new Response('Category not found', { status: 404 })
  }

  return category
}

export function action(args: Route.ActionArgs) {
  return updateCategoryAction(args)
}

export function meta() {
  return [
    { title: 'Edit Category - Dashboard' },
    { name: 'description', content: 'Update a post category' },
  ]
}

export default function EditCategoryPage() {
  const category = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="container mx-auto flex w-full flex-col gap-5 p-5">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Category</h1>
      <EditCategoryForm category={category} errors={actionData?.errors} />
    </div>
  )
}
