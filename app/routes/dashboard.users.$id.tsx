import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form as ReactRouterForm, redirect, useLoaderData, useSubmit } from 'react-router'
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
import { userRepository } from '~/features/users/user-repository'
import type { Route } from './+types/dashboard.users.$id'

// Zod schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
})

type UserFormData = z.infer<typeof userSchema>

export async function loader({ params }: Route.LoaderArgs) {
  const user = await userRepository.findById(params.id)

  if (!user) {
    throw new Response('User not found', { status: 404 })
  }

  return user
}

// Server action - Update user using UserRepository
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()

  try {
    const name = formData.get('name')?.toString()
    const email = formData.get('email')?.toString()

    await userRepository.update(params.id, {
      name,
      email,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/users')
  } catch (_error) {
    return {
      error: 'Failed to update user. Please try again.',
    }
  }
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
