---
name: form-and-validation
description: >
  How to build forms with React Hook Form and Zod validation in this project.
  Use this skill when creating any form (login, register, create/edit entity),
  adding validation schemas, handling form submissions, or integrating forms with
  server actions. Also use when the user asks about form patterns, Zod schemas,
  or form error handling.
---

# Form & Validation Patterns

## Zod Schema Organization

Schemas are centralized in `features/[name]/schemas/` directory and exported as reusable types:

```typescript
// app/features/users/schemas/user-schema.ts
import z from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type TCreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
})

export type TUpdateUser = z.infer<typeof updateUserSchema>
```

## Standard Form Component Pattern

Forms are extracted to `features/[name]/components/admin/form/` as pure presentational components that accept errors and callbacks as props:

```typescript
// app/features/users/components/admin/form/add-user-form.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { createUserSchema, type TCreateUser } from '~/features/users/schemas/user-schema'

interface AddUserFormProps {
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

type UserFormData = TCreateUser

export function AddUserForm({ errors, onSubmit }: AddUserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: UserFormData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <div className="flex flex-row justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    disabled={field.disabled || form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* more fields... */}
        </form>
      </Form>
    </>
  )
}
```

## Rules

- Zod schemas are centralized in `features/[name]/schemas/[name]-schema.ts`.
- Export both the schema and inferred types (with `T` prefix) from schema files.
- Use `zodResolver` in forms — never manual validation in onSubmit.
- Use `z.coerce.number()` for numeric inputs (HTML inputs return strings).
- Use `defaultValues` in useForm to avoid uncontrolled → controlled warnings.
- Form components are pure presentational: accept `errors` and `onSubmit` as props.
- No React Router hooks in form components (`useActionData`, `useSubmit`).
- Route components orchestrate: handle hooks, pass props to form components.
- Always show loading state with `form.formState.isSubmitting` to disable inputs during submission.

## Edit Form Pattern (Pre-filled)

```typescript
interface EditUserFormProps {
  user: TUser
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

type UserFormData = TUpdateUser

export function EditUserForm({ user, errors, onSubmit }: EditUserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
  })

  const handleSubmit = async (data: UserFormData) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <Form {...form}>
        <form method="post" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <div className="flex flex-row justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {/* form fields */}
        </form>
      </Form>
    </>
  )
}
```

## Server-Side Action Validation

Actions use `Zod.safeParse()` to validate form data and return field errors:

```typescript
// app/features/users/actions/update-user-action.ts
import { updateUserSchema } from '../schemas/user-schema'
import { userRepository } from '../repositories'

export async function updateUserAction(request: Request, id: string) {
  const formData = await request.formData()
  const result = updateUserSchema.safeParse(Object.fromEntries(formData))

  // Return validation errors if invalid
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, email } = result.data
    await userRepository.update(id, { name, email, updatedAt: new Date() })
    return redirect('/dashboard/users')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to update user. Please try again.'],
        email: [],
      },
    }
  }
}
```

The form component receives validation errors via `useActionData()` and displays them with `<ErrorDisplay />`.

## ErrorDisplay Component

Display server-side validation errors consistently:

```typescript
// app/components/ui/error-display.tsx
import { AlertCircle } from 'lucide-react'

interface ErrorDisplayProps {
  errors: Record<string, string[] | undefined>
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
  const errorMessages = Object.entries(errors)
    .filter(([, messages]) => messages && messages.length > 0)
    .flatMap(([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) || [])

  if (errorMessages.length === 0) return null

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Validation errors</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

## Common Zod Patterns

```typescript
// Required string
z.string().min(1, 'Required')

// Email
z.string().email('Invalid email')

// Number from input
z.coerce.number().min(0).max(999999)

// Optional with default
z.string().optional().default('')

// Enum
z.enum(['active', 'inactive', 'draft'])

// Conditional validation
z.object({
  type: z.enum(['individual', 'company']),
  companyName: z.string().optional(),
}).refine(
  (data) => data.type !== 'company' || (data.companyName && data.companyName.length > 0),
  { message: 'Company name required', path: ['companyName'] }
)
```

## Client-Side Error Display

React Hook Form automatically displays field errors via `<FormMessage />`:

```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" {...field} />
      </FormControl>
      <FormMessage /> {/* Automatically shows RHF validation errors */}
    </FormItem>
  )}
/>
```

## Server-Side Error Display

Server validation errors from actions are displayed at the top of the form using `<ErrorDisplay />`:

```typescript
const actionData = useActionData()

return (
  <>
    {actionData?.errors && <ErrorDisplay errors={actionData.errors} />}
    <Form {...form}>{/* form fields */}</Form>
  </>
)
```

This separates concerns: client validates (RHF), server validates (Zod), both show errors clearly.
