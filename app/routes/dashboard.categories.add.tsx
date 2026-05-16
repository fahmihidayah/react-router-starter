import { useActionData, useSubmit } from 'react-router'
import { createCategoryAction } from '~/features/categories/actions/create-category-action'
import { AddCategoryForm } from '~/features/categories/components/admin/form/add-category-form'
import type { Route } from './+types/dashboard.categories.add'

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
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Category</h3>
      <AddCategoryForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}
