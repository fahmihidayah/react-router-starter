import { useActionData } from 'react-router'
import { createCategoryAction } from '~/features/categories/actions/create-category-action'
import { NewCategoryForm } from '~/features/categories/components/admin/form/new-category-form'
import type { Route } from './+types/dashboard.categories.new'

export async function action({ request }: Route.ActionArgs) {
  return createCategoryAction(request)
}

export function meta() {
  return [
    { title: 'Add Category - Dashboard' },
    { name: 'description', content: 'Add a new category' },
  ]
}

export default function AddCategoryPage() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Category</h3>
      <NewCategoryForm errors={actionData?.errors} />
    </div>
  )
}
