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

## Standard Form Setup

Every form follows this pattern: Zod schema → RHF with zodResolver → Radix UI components.

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

// 1. Define Zod schema
const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.coerce.number().min(0, 'Price must be positive'),
  description: z.string().optional(),
})

// 2. Infer type from schema (T prefix)
type TProductFormData = z.infer<typeof productSchema>

// 3. Component with RHF
export function ProductForm({ onSubmit }: { onSubmit: (data: TProductFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" {...register('price')} />
        {errors.price && (
          <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

## Rules

- Zod schemas are the single source of truth for validation.
- Always use `zodResolver` — never manual validation in onSubmit.
- Type form data with `z.infer<typeof schema>` and prefix with `T`.
- Use `z.coerce.number()` for numeric inputs (HTML inputs return strings).
- Place the schema in the same file as the form, or in `lib/[feature].schema.ts` if shared.
- Use `defaultValues` in useForm to avoid uncontrolled → controlled warnings.

## Edit Form Pattern (Pre-filled)

```typescript
type TEditProductFormProps = {
  product: TProduct
  onSubmit: (data: TProductFormData) => void
}

export function EditProductForm({ product, onSubmit }: TEditProductFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      price: product.price,
      description: product.description || '',
    },
  })

  return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>
}
```

## Submitting to Server Actions

Forms in route pages submit via React Router's `useSubmit` or native form POST:

```typescript
// In the route component
const submit = useSubmit()

const handleFormSubmit = (data: TProductFormData) => {
  const formData = new FormData()
  formData.append('intent', 'create')
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  submit(formData, { method: 'post' })
}
```

Or for simpler cases, use native form action with hidden intent field:

```typescript
<form method="post">
  <input type="hidden" name="intent" value="delete" />
  <input type="hidden" name="id" value={item.id} />
  <Button type="submit" variant="destructive">Delete</Button>
</form>
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

## Error Display Convention

Always show field errors below the input with consistent styling:

```typescript
{errors.fieldName && (
  <p className="text-sm text-destructive mt-1">{errors.fieldName.message}</p>
)}
```

For server-side action errors (returned from action), use toast:

```typescript
import { toast } from 'sonner'

// After action returns
if (!result.success) {
  toast.error(result.message)
} else {
  toast.success(result.message)
}
```
