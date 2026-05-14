import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form as ReactRouterForm, useLoaderData, useSubmit } from 'react-router'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { updateUserAction } from '~/features/users/actions/update-user-action'
import { getUserByIdLoader } from '~/features/users/loaders/get-user-by-id-loader'
import type { Route } from './+types/dashboard.users.$id'

// Zod schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email(),
})

type UserFormData = z.infer<typeof userSchema>

export async function loader({ params }: Route.LoaderArgs) {
  return getUserByIdLoader(params.id)
}

// Server action - Update user using UserRepository
export async function action({ request, params }: Route.ActionArgs) {
  return updateUserAction(request, params.id)
}

export default function EditUserPage() {
  const loaderData = useLoaderData<typeof loader>()
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: loaderData.name || '',
      email: loaderData.email || '',
    },
  })

  const submit = useSubmit()

  const onSubmit = (data: UserFormData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)

    submit(formData, {
      method: 'post',
    })
  }
  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit User</h3>
      <Form {...form}>
        <ReactRouterForm method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" disabled={field.disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" disabled={field.disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update User</Button>
        </ReactRouterForm>
      </Form>
    </div>
  )
}
