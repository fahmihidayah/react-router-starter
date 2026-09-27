import { useActionData } from 'react-router'
import { createCategoryAction } from '~/features/categories/actions/create-category-action'
import { NewCategoryForm } from '~/features/categories/components/admin/form/new-category-form'
import type { Route } from './+types/categories.new'

export function action(args: Route.ActionArgs) {
  return createCategoryAction(args)
}

export function meta() {
  return [
    { title: 'Add Category - Dashboard' },
    { name: 'description', content: 'Create a new post category' },
  ]
}

export default function NewCategoryPage() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="container mx-auto flex w-full flex-col gap-5 p-5">
      <h1 className="text-2xl font-semibold tracking-tight">Add New Category</h1>
      <NewCategoryForm errors={actionData?.errors} />
    </div>
  )
}
