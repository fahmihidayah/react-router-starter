---
name: forms-and-validation
description: >
  Complete guide to building forms and validation in this project. Covers native HTML forms
  (primary approach), React Hook Form (advanced scenarios), Zod validation, server-side vs
  client-side validation, and error handling. Use this skill when creating any form (login,
  register, create/edit entity), adding validation schemas, handling form submissions, working
  with custom form controls (RichEditor, Select), or integrating forms with server actions.
  Also use when the user asks about form patterns, Zod schemas, validation approaches, or
  form error handling.
---

# Forms & Validation Patterns

## Philosophy

This project uses **server-side validation as the source of truth**. Forms can be built two ways:

1. **Native HTML Forms** (primary, recommended) — Progressive enhancement, minimal JS
2. **React Hook Form** (advanced) — Complex multi-step forms, real-time client validation

Both approaches use **Zod schemas** for validation and **consistent error handling**.

---

## When to Use Each Approach

### Use Native HTML Forms When:
- ✅ Simple CRUD forms (create, edit, delete)
- ✅ Server-validated data is sufficient
- ✅ Progressive enhancement is important
- ✅ Minimal JS overhead is preferred
- ✅ Forms work without JavaScript enabled

### Use React Hook Form When:
- ✅ Complex multi-step forms with client state
- ✅ Real-time validation feedback is critical
- ✅ Dependent fields that change based on other fields
- ✅ Advanced UX patterns (conditional sections, dynamic arrays)
- ✅ Client-side validation before server submission

**Default choice**: Start with native HTML forms. Upgrade to React Hook Form only when you hit limitations.

---

## Part 1: Native HTML Forms (Primary Approach)

### Zod Schema Organization

Schemas are centralized in `features/[name]/schemas/` directory:

```typescript
// app/features/categories/schemas/category-schema.ts
import z from 'zod'

export const createCategorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
})

export type TCreateCategory = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
})

export type TUpdateCategory = z.infer<typeof updateCategorySchema>
```

### Basic Form Component Pattern

Forms are extracted to `features/[name]/components/admin/form/` as simple components using native HTML:

```typescript
// app/features/categories/components/admin/form/new-category-form.tsx
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface NewCategoryFormProps {
  errors?: Record<string, string[] | undefined>
}

export function NewCategoryForm({ errors }: NewCategoryFormProps) {
  const titleError = errors?.title?.[0]

  return (
    <form method="post" className="space-y-4">
      <div className="flex flex-row justify-end">
        <Button type="submit">Save</Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title" className={titleError ? 'text-destructive' : ''}>
          Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Category title"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={titleError ? 'border-destructive' : ''}
        />
        {titleError && (
          <p id="title-error" className="text-destructive text-sm">
            {titleError}
          </p>
        )}
      </div>
    </form>
  )
}
```

### Route Integration

Routes connect loaders, actions, and form components:

```typescript
// app/routes/admin/categories.new.tsx
import { useActionData } from 'react-router'
import { createCategoryAction } from '~/features/categories/actions/create-category-action'
import { NewCategoryForm } from '~/features/categories/components/admin/form/new-category-form'
import type { Route } from './+types/admin.categories.new'

export async function action({ request }: Route.ActionArgs) {
  return createCategoryAction(request)
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
```

### Server-Side Action Validation

Actions use `schema.safeParse()` to validate FormData and return field errors:

```typescript
// app/features/categories/actions/create-category-action.ts
import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { categoryRepository } from '../repositories'
import { createCategorySchema } from '../schemas/category-schema'

export async function createCategoryAction(request: Request) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = createCategorySchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { title } = result.data
    const now = new Date()

    await categoryRepository.create({
      id: randomUUID(),
      title,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/admin/categories')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to create category. Please try again.'],
      },
    }
  }
}
```

### Edit Form Pattern (Pre-filled)

Edit forms pre-fill values using `defaultValue` prop:

```typescript
// app/features/categories/components/admin/form/edit-category-form.tsx
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { TCategory } from '~/db/schema'

interface EditCategoryFormProps {
  category: TCategory
  errors?: Record<string, string[] | undefined>
}

export function EditCategoryForm({ category, errors }: EditCategoryFormProps) {
  const titleError = errors?.title?.[0]

  return (
    <form method="post" className="space-y-4">
      <div className="flex flex-row justify-end">
        <Button type="submit">Save</Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title" className={titleError ? 'text-destructive' : ''}>
          Title
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={category.title}
          placeholder="Category title"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={titleError ? 'border-destructive' : ''}
        />
        {titleError && (
          <p id="title-error" className="text-destructive text-sm">
            {titleError}
          </p>
        )}
      </div>
    </form>
  )
}
```

### Working with Custom Components

#### RichEditor (Lexical)

RichEditor doesn't integrate with native FormData, so use a ref to capture its content:

```typescript
import { useRef } from 'react'
import { useSubmit } from 'react-router'
import type { RichEditorHandle } from '~/components/ui/rich-editor'
import { RichEditor } from '~/components/ui/rich-editor'

export function NewPostForm({ errors }: NewPostFormProps) {
  const submit = useSubmit()
  const editorRef = useRef<RichEditorHandle>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const content = editorRef.current?.getJSON()
    formData.set('content', content || '{}')
    submit(formData, { method: 'post' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Content</Label>
        <RichEditor
          ref={editorRef}
          placeholder="Write your content here..."
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}
```

#### Select (Radix UI)

Radix Select doesn't work with native FormData binding. Use a hidden input ref to sync values:

```typescript
import { useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

export function NewPostForm({ categories, errors }: NewPostFormProps) {
  const categoryRef = useRef<HTMLInputElement>(null)

  return (
    <form method="post" className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          name="categoryId"
          onValueChange={(value) => {
            if (categoryRef.current) categoryRef.current.value = value
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input ref={categoryRef} name="categoryId" type="hidden" />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}
```

For edit forms with Select, add `defaultValue`:

```typescript
<Select
  name="categoryId"
  defaultValue={post.categoryId || ''}
  onValueChange={(value) => {
    if (categoryRef.current) categoryRef.current.value = value
  }}
>
  {/* SelectTrigger and SelectContent */}
</Select>
<input
  ref={categoryRef}
  name="categoryId"
  type="hidden"
  defaultValue={post.categoryId || ''}
/>
```

---

## Part 2: React Hook Form (Advanced Approach)

### When React Hook Form is Needed

Use React Hook Form when:
- You need real-time validation feedback as user types
- Complex conditional logic (show/hide fields based on other fields)
- Multi-step forms with client-side state management
- Dynamic field arrays (add/remove items)
- Advanced UX that requires immediate client feedback

### Form Component with React Hook Form

```typescript
// app/features/products/components/admin/form/add-product-form.tsx
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
import { createProductSchema, type TCreateProduct } from '../schemas/product-schema'

interface AddProductFormProps {
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function AddProductForm({ errors, onSubmit }: AddProductFormProps) {
  const form = useForm<TCreateProduct>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
    },
  })

  const handleSubmit = async (data: TCreateProduct) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('price', data.price)

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
                  <Input disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  )
}
```

### Edit Form with React Hook Form

```typescript
interface EditProductFormProps {
  product: TProduct
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function EditProductForm({ product, errors, onSubmit }: EditProductFormProps) {
  const form = useForm<TUpdateProduct>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
    },
  })

  const handleSubmit = async (data: TUpdateProduct) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('price', data.price)

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          {/* Same field structure as add form */}
        </form>
      </Form>
    </>
  )
}
```

### Route Integration with React Hook Form

```typescript
// app/routes/admin/products.add.tsx
import { useActionData, useSubmit } from 'react-router'
import { createProductAction } from '~/features/products/actions/create-product-action'
import { AddProductForm } from '~/features/products/components/admin/form/add-product-form'
import type { Route } from './+types/admin.products.add'

export async function action({ request }: Route.ActionArgs) {
  return createProductAction(request)
}

export default function AddProductPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Product</h3>
      <AddProductForm
        errors={actionData?.errors}
        onSubmit={(fd) => submit(fd, { method: 'post' })}
      />
    </div>
  )
}
```

---

## Common Zod Patterns

```typescript
// Required string with trim
z.string().trim().min(1, 'Title is required')

// String with length constraint
z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less')

// Optional string with fallback to empty string
z.string().optional().or(z.literal(''))

// Hex color validation
z.string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)')
  .optional()
  .or(z.literal(''))

// Number from string input (HTML inputs return strings)
z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
  message: 'Price must be a number',
})

// Or coerce to number directly
z.coerce.number().int().positive().default(1)

// Email
z.string().email('Invalid email')

// Enum
z.enum(['active', 'inactive', 'draft'])

// Password with requirements
z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
```

---

## Error Response Structure

Always return errors in this format for consistency:

```typescript
// Validation errors from Zod
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors }
}

// Business logic errors
return {
  errors: {
    fieldName: ['Error message'],
    otherField: [], // Include empty arrays for other fields
  },
}

// Generic catch errors
return {
  errors: {
    primaryField: ['Failed to perform action. Please try again.'],
    otherFields: [],
  },
}
```

---

## Rules & Best Practices

### General Rules
- **Server-side validation is the source of truth** — always validate on the server
- Zod schemas are centralized in `features/[name]/schemas/[name]-schema.ts`
- Export both the schema and inferred types (with `T` prefix) from schema files
- Use `z.string().trim()` for string inputs to handle whitespace automatically
- Use `z.coerce.number()` or string refinement for numeric inputs (HTML inputs return strings)

### Native HTML Forms
- Use native HTML forms with `method="post"` and `name` attributes on inputs
- Form components accept only `errors` prop (and data for edit forms) — no callbacks needed
- Route components use `useActionData()` to get server validation errors
- Display inline errors directly in the form component for each field
- Use accessibility attributes: `aria-invalid`, `aria-describedby` for error messages
- Apply error styling conditionally: `text-destructive` for labels, `border-destructive` for inputs

### React Hook Form
- Use `zodResolver` to integrate Zod schemas with React Hook Form
- Form components accept `errors` prop (server errors) and `onSubmit` callback
- Convert form data to FormData before calling `onSubmit` for consistent API
- Show loading state with `form.formState.isSubmitting`
- Disable inputs during submission with `disabled={form.formState.isSubmitting}`
- Display server errors with `<ErrorDisplay errors={errors} />` at the top of the form

### Error Display
- Use `<ErrorDisplay />` component for server-side validation errors (shown at top of form)
- Use inline `<FormMessage />` for field-level client validation (React Hook Form)
- Use Sonner toast for action success/failure notifications (e.g., "Product created")
- Never expose internal error details to the client (DB errors, stack traces)

---

## Update Action Pattern

Update actions follow the same pattern with additional business logic:

```typescript
// app/features/posts/actions/update-post-action.ts
import { redirect } from 'react-router'
import { createSlugFrom } from '~/utils/slug'
import { postRepository } from '../repositories'
import { updatePostSchema } from '../schemas/post-schema'

export async function updatePostAction(request: Request, id: string) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = updatePostSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { title, content, categoryId } = result.data
    const slug = createSlugFrom(title)

    // Get the current post to check slug changes
    const currentPost = await postRepository.findById(id)
    if (!currentPost) {
      return {
        errors: {
          title: ['Post not found'],
          content: [],
          categoryId: [],
        },
      }
    }

    // Check if new slug is different and already exists
    if (slug !== currentPost.slug) {
      const exists = await postRepository.slugExists(slug)
      if (exists) {
        return {
          errors: {
            title: ['A post with this title already exists'],
            content: [],
            categoryId: [],
          },
        }
      }
    }

    await postRepository.update(id, {
      slug,
      title,
      content,
      categoryId,
      updatedAt: new Date(),
    })

    return redirect('/admin/posts')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to update post. Please try again.'],
        content: [],
        categoryId: [],
      },
    }
  }
}
```

---

## Decision Flowchart

```
Need to build a form?
│
├─ Simple CRUD (create/edit)?
│  └─ YES → Use Native HTML Forms
│
├─ Need real-time validation?
│  └─ YES → Use React Hook Form
│
├─ Multi-step form with client state?
│  └─ YES → Use React Hook Form
│
├─ Complex conditional logic?
│  └─ YES → Use React Hook Form
│
└─ Default → Use Native HTML Forms
```
