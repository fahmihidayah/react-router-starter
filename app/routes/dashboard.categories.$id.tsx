import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateCategoryAction } from '~/features/categories/actions/update-category-action'
import { EditCategoryForm } from '~/features/categories/components/admin/form/edit-category-form'
import { getCategoryByIdLoader } from '~/features/categories/loaders/get-category-by-id-loader'
import type { Route } from './+types/dashboard.categories.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getCategoryByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateCategoryAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Category - Dashboard' },
    { name: 'description', content: 'Edit category details' },
  ]
}

export default function EditCategoryPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!loaderData) {
    return (
      <div className="container w-full mx-auto p-5">
        <p>Category not found</p>
      </div>
    )
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Category</h3>
      <EditCategoryForm category={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}
