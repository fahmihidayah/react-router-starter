# React Router 7 - Standard Form & Server Validation

## Overview

This guide covers building simple, server-validated forms in React Router 7 without client-side validation libraries. Forms use native HTML form submission with FormData, server-side Zod validation, and error display.

## Key Principles

- **No client validation** - All validation happens on the server
- **Native FormData** - Use standard HTML form submission, not React Hook Form
- **Server errors** - Display validation errors from server via `ErrorDisplay` component
- **Simple & lean** - Minimal JS overhead, progressive enhancement friendly

## Basic Form Pattern

### Create Form

```tsx
import { useRef } from 'react'
import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface AddPostFormProps {
  categories: TCategory[]
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function AddPostForm({ categories, errors, onSubmit }: AddPostFormProps) {
  const editorRef = useRef<RichEditorHandle>(null)
  const categoryRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // For custom components like RichEditor that don't work with native FormData
    formData.set('content', editorRef.current?.getJSON() ?? '')

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Post title" />
        </div>

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
      </form>
    </>
  )
}
```

### Edit Form

Key differences:
- Use `defaultValue` on Input fields to populate existing data
- Use `defaultValue` on Select component
- Use `initialContent` on RichEditor for existing content
- Still collect all form data via FormData on submit

```tsx
import { useRef } from 'react'
import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { RichEditor } from '~/components/ui/rich-editor'
import type { RichEditorHandle } from '~/components/ui/rich-editor'

interface EditPostFormProps {
  post: TPost
  categories: TCategory[]
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function EditPostForm({ post, categories, errors, onSubmit }: EditPostFormProps) {
  const editorRef = useRef<RichEditorHandle>(null)
  const categoryRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('content', editorRef.current?.getJSON() ?? '')

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Post title"
            defaultValue={post.title || ''}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            name="categoryId"
            defaultValue={post.categoryId || ''}
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
          <input
            ref={categoryRef}
            name="categoryId"
            type="hidden"
            defaultValue={post.categoryId || ''}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="content">Content</Label>
          <RichEditor
            ref={editorRef}
            placeholder="Write your post content here..."
            initialContent={post.content || ''}
          />
        </div>
      </form>
    </>
  )
}
```

## Working with Custom Components

### RichEditor (Lexical)

RichEditor doesn't integrate with native FormData, so use a ref to capture its content:

```tsx
const editorRef = useRef<RichEditorHandle>(null)

const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  formData.set('content', editorRef.current?.getJSON() ?? '')
  // submit formData
}

<RichEditor
  ref={editorRef}
  initialContent={post.content || ''}
  placeholder="Write content..."
/>
```

### Select (Radix UI)

Radix Select doesn't work with native FormData binding. Use a hidden input ref to sync values:

```tsx
const categoryRef = useRef<HTMLInputElement>(null)

<Select
  name="categoryId"
  defaultValue={post.categoryId || ''}
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
<input
  ref={categoryRef}
  name="categoryId"
  type="hidden"
  defaultValue={post.categoryId || ''}
/>
```

## Server-Side Setup

### Zod Schema

Define your validation schema in a dedicated file:

```tsx
import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().min(1, 'Category is required'),
})

export type TCreatePost = z.infer<typeof createPostSchema>

export const updatePostSchema = createPostSchema.partial()
export type TUpdatePost = z.infer<typeof updatePostSchema>
```

### Server Action / Route Handler

```tsx
import { json, type ActionFunction } from 'react-router'
import { createPostSchema } from './schemas/post-schema'

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const result = createPostSchema.safeParse(data)

  if (!result.success) {
    return json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Save to database
  const post = await createPost(result.data)

  return redirect(`/dashboard/posts/${post.id}`)
}
```

### Error Display Component

The form expects an `errors` prop in this format from the server:

```tsx
Record<string, string[] | undefined>
```

Which comes from Zod's `flatten().fieldErrors` method.

The `<ErrorDisplay />` component renders field-level errors:

```tsx
{errors && <ErrorDisplay errors={errors} />}
```

## When to Use This Pattern

✅ Use this pattern for:
- Simple CRUD forms (create, edit)
- Server-validated data
- Progressive enhancement
- Minimal JS overhead
- Forms with custom components (RichEditor, etc.)

❌ Don't use for:
- Complex multi-step forms with client-side state
- Real-time validation feedback
- Forms that require immediate client-side validation
- Highly interactive forms with dependent fields

## Type Safety

Always infer types from your Zod schema:

```tsx
import { type TCreatePost } from '~/features/posts/schemas/post-schema'

// Your form data is now typed
const result = createPostSchema.safeParse(data)
if (result.success) {
  const validData: TCreatePost = result.data
}
```

## Best Practices

1. **Separate form and page components** - Keep forms reusable and independent
2. **Use ErrorDisplay for errors** - Consistent error presentation across your app
3. **Leverage HTML attributes** - Use `defaultValue`, `disabled`, `required` on inputs
4. **Type form props carefully** - Document what a form needs (data, callbacks, errors)
5. **Keep forms simple** - One responsibility per form, avoid nested forms
6. **Handle loading states** - Disable submit button during submission in the parent
7. **Validate on server** - Never trust client-side validation alone
