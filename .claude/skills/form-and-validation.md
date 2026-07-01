---
name: form-and-validation
description: >
  How to build forms with server-side validation using Zod in this project.
  Use this skill when creating any form (login, register, create/edit entity),
  adding validation schemas, handling form submissions, or integrating forms with
  server actions. This project uses NATIVE HTML FORMS with server-side validation,
  NOT React Hook Form. Also use when the user asks about form patterns, Zod schemas,
  or form error handling.
---
# Form & Validation Patterns

**CRITICAL: This project uses native HTML forms with server-side validation. DO NOT use React Hook Form or client-side validation unless explicitly requested.**

## Zod Schema Organization

Schemas are centralized in `features/[name]/schemas/` directory and exported as reusable types:

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

## Standard Form Component Pattern (Native HTML)

Forms are extracted to `features/[name]/components/admin/form/` as simple components that use native HTML form elements with server-side validation:

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

## Route Integration

Routes connect loaders, actions, and form components:

```typescript
// app/routes/dashboard.categories.new.tsx
import { useActionData } from 'react-router'
import { createCategoryAction } from '~/features/categories/actions/create-category-action'
import { NewCategoryForm } from '~/features/categories/components/admin/form/new-category-form'
import type { Route } from './+types/dashboard.categories.new'

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

## Server-Side Action Validation

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

    return redirect('/dashboard/categories')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to create category. Please try again.'],
      },
    }
  }
}
```

## Edit Form Pattern (Pre-filled)

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

## Rules

- **ALWAYS use native HTML forms with `method="post"` and `name` attributes on inputs.**
- **DO NOT use React Hook Form or zodResolver unless explicitly requested.**
- Zod schemas are centralized in `features/[name]/schemas/[name]-schema.ts`.
- Export both the schema and inferred types (with `T` prefix) from schema files.
- Use `z.string().trim()` for string inputs to handle whitespace automatically.
- Use `z.coerce.number()` for numeric inputs (HTML inputs return strings).
- Form components accept only `errors` prop (and data for edit forms) — no callbacks needed.
- Route components use `useActionData()` to get server validation errors.
- Display inline errors directly in the form component for each field.
- Use accessibility attributes: `aria-invalid`, `aria-describedby` for error messages.
- Apply error styling conditionally: `text-destructive` for labels, `border-destructive` for inputs.

## Complex Form Pattern (with Select and Rich Editor)

For forms with custom controls, manually handle submission:

```typescript
// app/features/posts/components/admin/form/new-post-form.tsx
import { useRef } from 'react'
import { useSubmit } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { RichEditorHandle } from '~/components/ui/rich-editor'
import { RichEditor } from '~/components/ui/rich-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import type { TCategory } from '~/db/schema'

interface NewPostFormProps {
  categories: TCategory[]
  errors?: Record<string, string[] | undefined>
}

export function NewPostForm({ categories, errors }: NewPostFormProps) {
  const submit = useSubmit()
  const editorRef = useRef<RichEditorHandle>(null)
  const categoryRef = useRef<HTMLInputElement>(null)

  const titleError = errors?.title?.[0]
  const categoryIdError = errors?.categoryId?.[0]
  const contentError = errors?.content?.[0]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const content = editorRef.current?.getJSON()
    formData.set('content', content || '{}')
    submit(formData, { method: 'post' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Post title"
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoryId" className={categoryIdError ? 'text-destructive' : ''}>
          Category
        </Label>
        <Select
          name="categoryId"
          onValueChange={(value) => {
            if (categoryRef.current) categoryRef.current.value = value
          }}
        >
          <SelectTrigger
            className={categoryIdError ? 'border-destructive w-full' : 'w-full'}
            aria-invalid={!!categoryIdError}
            aria-describedby={categoryIdError ? 'categoryId-error' : undefined}
          >
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
        {categoryIdError && (
          <p id="categoryId-error" className="text-destructive text-sm">
            {categoryIdError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content" className={contentError ? 'text-destructive' : ''}>
          Content
        </Label>
        <RichEditor
          ref={editorRef}
          placeholder="Write your post content here..."
        />
        {contentError && (
          <p id="content-error" className="text-destructive text-sm">
            {contentError}
          </p>
        )}
      </div>
    </form>
  )
}
```

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

// Number from string input
z.coerce.number().int().positive().default(1)

// Email
z.string().email('Invalid email')

// Enum
z.enum(['active', 'inactive', 'draft'])
```

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

    return redirect('/dashboard/posts')
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

## Error Response Structure

Always return errors in this format for consistency:

```typescript
// Validation errors
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
