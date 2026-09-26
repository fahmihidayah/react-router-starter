import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type ActionFunctionArgs,
  data,
  Link,
  Form as ReactRouterForm,
  redirect,
  useActionData,
  useSubmit,
} from 'react-router'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { registerUserAction } from '~/features/users/actions/register-user-action'
import { countAdmin } from '~/features/users/queries'
import { registerUserSchema } from '~/features/users/schemas/form/user-schema'
import type { Route } from './+types/register'

const registerSchema = registerUserSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterSchema = z.infer<typeof registerSchema>

type ActionResponse = {
  success: false
  error: string
}

export async function action(args: ActionFunctionArgs) {
  const result = await registerUserAction(args)

  if (!result.success) {
    return data<ActionResponse>({ success: false, error: result.error }, { status: result.status })
  }

  if (result.setCookie) {
    return redirect('/admin', { headers: { 'Set-Cookie': result.setCookie } })
  }

  return redirect('/admin')
}

export async function loader(_route: Route.LoaderArgs) {
  const numberOfAdmin = await countAdmin()
  return {
    count: numberOfAdmin,
  }
}

export function meta() {
  return [
    { title: 'Register - Starter App' },
    { name: 'description', content: 'Create a new account' },
  ]
}

export default function Register() {
  const actionData = useActionData<ActionResponse>()

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submit = useSubmit()

  useEffect(() => {
    if (!actionData) return

    setIsLoading(false)
    toast.error(actionData.error)
  }, [actionData])

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)

    submit(formData, {
      method: 'post',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <ReactRouterForm
              method="post"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John Doe" disabled={isLoading} {...field} />
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
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        disabled={isLoading}
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </ReactRouterForm>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground w-full">
            <Link to="/" className="text-primary hover:underline font-medium">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
