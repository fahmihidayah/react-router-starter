import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form as ReactRouterForm, useSubmit } from 'react-router'
import z from 'zod'
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
import { createUserAction } from '~/features/users/actions/create-user-action'
import type { Route } from './+types/dashboard.users.add'

// Zod schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters'),
})

type UserFormData = z.infer<typeof userSchema>

export async function action({ request }: Route.ActionArgs) {
  return createUserAction(request)
}

export default function AddUserPage() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const submit = useSubmit()

  const onSubmit = (data: UserFormData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)

    // Sends to your `action()` on this route
    submit(formData, {
      method: 'post',
    })
  }
  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New User</h3>
      <Form {...form}>
        <ReactRouterForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={field.disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button>Submit</Button>
        </ReactRouterForm>
      </Form>
    </div>
  )
}
