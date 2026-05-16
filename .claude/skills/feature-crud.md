---
name: feature-crud
description: >
  How to scaffold a complete CRUD feature module in this project.
  Use this when creating a new feature (products, tasks, categories, etc),
  adding admin dashboard sections, or implementing list/create/edit workflows.
  Covers schema, repository, loaders, actions, forms, and routes.
---

# Feature CRUD Workflow

## Overview

Each feature follows a consistent pattern with clear separation of concerns:
- **Schema** (`app/db/schema.ts`): Database table definition
- **Type** (`app/features/[name]/type.ts`): TypeScript types (prefixed with `T`)
- **Repository** (`app/features/[name]/repositories/`): Data access layer
- **Loaders** (`app/features/[name]/loaders/`): Server-side data fetching
- **Actions** (`app/features/[name]/actions/`): Server-side mutations
- **Schemas** (`app/features/[name]/schemas/`): Zod validation schemas
- **Forms** (`app/features/[name]/components/admin/form/`): React Hook Form components
- **Routes** (`app/routes/dashboard.[name].*`): Page components

## Directory Structure

```
app/features/[plural-name]/
├── type.ts                          # T-prefixed types (TUser, TProduct)
├── repositories/
│   ├── [name]-repository.ts         # Extends BaseRepository
│   └── index.ts                     # Export repositories
├── schemas/
│   └── [name]-schema.ts             # Zod schemas (create, update)
├── loaders/
│   ├── get-[plural]-loader.ts       # List with pagination + search
│   └── get-[singular]-by-id-loader.ts # Single item
├── actions/
│   ├── create-[singular]-action.ts
│   ├── update-[singular]-action.ts
│   ├── delete-[singular]-action.ts
│   └── delete-many-[plural]-action.ts
└── components/admin/form/
    ├── add-[singular]-form.tsx      # Create form
    └── edit-[singular]-form.tsx     # Edit form

app/routes/
├── dashboard.[plural]._index.tsx    # List page
├── dashboard.[plural].add.tsx       # Create page
└── dashboard.[plural].$id.tsx       # Edit page
```

## Step-by-Step Implementation

### 1. Define Database Schema

Add table to `app/db/schema.ts`:

```typescript
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('product', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: int('price').notNull(), // Store as cents (integer)
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})
```

Run `pnpm db:push` to apply changes.

### 2. Create Type Definition

`app/features/products/type.ts`:

```typescript
export type TProduct = {
  id: string
  name: string
  description: string | null
  price: number
  createdAt: Date | null
  updatedAt: Date | null
}
```

### 3. Create Repository

`app/features/products/repositories/product-repository.ts`:

```typescript
import { BaseRepository } from '~/lib/repository'
import { products } from '~/db/schema'

class ProductRepository extends BaseRepository<typeof products> {
  // Add custom methods if needed
}

export const productRepository = new ProductRepository(products)
```

`app/features/products/repositories/index.ts`:

```typescript
export { productRepository } from './product-repository'
```

### 4. Create Zod Schemas

`app/features/products/schemas/product-schema.ts`:

```typescript
import z from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  price: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    message: 'Price must be a number',
  }),
})

export type TCreateProduct = z.infer<typeof createProductSchema>

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  price: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    message: 'Price must be a number',
  }),
})

export type TUpdateProduct = z.infer<typeof updateProductSchema>
```

### 5. Create Loaders

**List loader with pagination and search:**

`app/features/products/loaders/get-products-loader.ts`:

```typescript
import { like } from 'drizzle-orm/sql'
import { products } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import type { TProduct } from '../type'
import { productRepository } from '../repositories'

export async function getProductsLoader(
  request: Request,
): Promise<PaginateDocs<TProduct>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await productRepository.findManyPaginated({
    where: search ? like(products.name, `%${search}%`) : undefined,
    page,
    limit,
  })
}
```

**Single item loader:**

`app/features/products/loaders/get-product-by-id-loader.ts`:

```typescript
import { productRepository } from '../repositories'

export async function getProductByIdLoader(id: string) {
  return productRepository.findById(id)
}
```

### 6. Create Actions

**Create action:**

`app/features/products/actions/create-product-action.ts`:

```typescript
import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { productRepository } from '../repositories'
import { createProductSchema } from '../schemas/product-schema'

export async function createProductAction(request: Request) {
  const formData = await request.formData()
  const result = createProductSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, description, price } = result.data
    const now = new Date()

    await productRepository.create({
      id: randomUUID(),
      name,
      description: description || null,
      price: parseInt(price, 10),
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/products')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to create product. Please try again.'],
        description: [],
        price: [],
      },
    }
  }
}
```

**Update action:**

`app/features/products/actions/update-product-action.ts`:

```typescript
import { redirect } from 'react-router'
import { productRepository } from '../repositories'
import { updateProductSchema } from '../schemas/product-schema'

export async function updateProductAction(request: Request, id: string) {
  const formData = await request.formData()
  const result = updateProductSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, description, price } = result.data

    await productRepository.update(id, {
      name,
      description: description || null,
      price: parseInt(price, 10),
      updatedAt: new Date(),
    })

    return redirect('/dashboard/products')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to update product. Please try again.'],
        description: [],
        price: [],
      },
    }
  }
}
```

**Delete action:**

`app/features/products/actions/delete-product-action.ts`:

```typescript
import { productRepository } from '../repositories'

export async function deleteProductAction(id: string) {
  try {
    await productRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}
```

**Bulk delete action:**

`app/features/products/actions/delete-many-products-action.ts`:

```typescript
import { inArray } from 'drizzle-orm'
import { products } from '~/db/schema'
import { productRepository } from '../repositories'

export async function deleteManyProductsAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await productRepository.deleteMany(inArray(products.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}
```

### 7. Create Forms

**Create form:**

`app/features/products/components/admin/form/add-product-form.tsx`:

```typescript
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
import { createProductSchema, type TCreateProduct } from '~/features/products/schemas/product-schema'

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

**Edit form:** Similar to add form but pass initial values from loader data.

### 8. Create Routes

**List page (`app/routes/dashboard.products._index.tsx`):**

```typescript
import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteProductAction } from '~/features/products/actions/delete-product-action'
import { deleteManyProductsAction } from '~/features/products/actions/delete-many-products-action'
import { getProductsLoader } from '~/features/products/loaders/get-products-loader'
import type { TProduct } from '~/features/products/type'
import type { Route } from './+types/dashboard.products._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getProductsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const productId = formData.get('productId')?.toString()
      if (productId) {
        return deleteProductAction(productId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyProductsAction(ids)
      }
    }

    return { success: false }
  } catch (error) {
    console.error('Action error:', error)
    return { success: false }
  }
}

export default function ProductsPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingProduct, setDeletingProduct] = useState<TProduct | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TProduct[]>([])
  const navigate = useNavigate()

  const columns = createColumn<TProduct>({
    tableName: 'products',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },
      {
        type: 'text',
        accessorKey: 'name',
        header: 'Name',
        fallback: 'No name',
      },
      {
        type: 'text',
        accessorKey: 'description',
        header: 'Description',
        fallback: 'No description',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
    ],
    actionColumnConfig: {
      getItemId: (product) => product.id,
      onDelete: (product) => setDeletingProduct(product),
    },
  })

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  const handleDeleteProduct = () => {
    if (!deletingProduct) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('productId', deletingProduct.id)

    submit(formData, { method: 'post' })
    setDeletingProduct(null)
    toast.success('Product deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((p) => p.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} product(s) deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search products..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No products found."
          enableRowSelection
          tableName="products"
          onDeleteSelected={setDeletingMultiple}
          totalPages={loaderData.totalPages}
          manualPagination
        />

        {loaderData.totalPages > 1 && (
          <TablePagination
            currentPage={loaderData.page}
            totalPages={loaderData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <DeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Delete Product"
        itemName={deletingProduct?.name || ''}
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeletingProduct(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Products"
        itemName={`${deletingMultiple.length} product${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
```

**Create page (`app/routes/dashboard.products.add.tsx`):**

```typescript
import { useActionData, useSubmit } from 'react-router'
import { createProductAction } from '~/features/products/actions/create-product-action'
import { AddProductForm } from '~/features/products/components/admin/form/add-product-form'
import type { Route } from './+types/dashboard.products.add'

export async function action({ request }: Route.ActionArgs) {
  return createProductAction(request)
}

export default function AddProductPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Product</h3>
      <AddProductForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}
```

**Edit page (`app/routes/dashboard.products.$id.tsx`):**

```typescript
import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateProductAction } from '~/features/products/actions/update-product-action'
import { EditProductForm } from '~/features/products/components/admin/form/edit-product-form'
import { getProductByIdLoader } from '~/features/products/loaders/get-product-by-id-loader'
import type { Route } from './+types/dashboard.products.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getProductByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateProductAction(request, params.id)
}

export default function EditProductPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Product</h3>
      <EditProductForm product={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}
```

## Implementation Checklist

- [ ] Schema added to `app/db/schema.ts` with correct Drizzle field types
- [ ] `pnpm db:push` executed successfully
- [ ] Type file created in `app/features/[name]/type.ts` with `T` prefix
- [ ] Repository class extends `BaseRepository` in `repositories/[name]-repository.ts`
- [ ] Repositories exported from `repositories/index.ts`
- [ ] Zod schemas created for create and update operations
- [ ] List loader with pagination (page, limit) and search
- [ ] Single item loader by ID
- [ ] Create action validates with Zod and handles errors
- [ ] Update action validates with Zod and handles errors
- [ ] Delete action for single item
- [ ] Bulk delete action using `inArray()` for safety
- [ ] Create form component with React Hook Form + Zod resolver
- [ ] Edit form component with initial data from loader
- [ ] List route with DataTable, search, pagination, row selection
- [ ] List route action handles delete, deleteMany, and bulk operations
- [ ] Create route with form
- [ ] Edit route with form
- [ ] Routes follow naming: `dashboard.[plural]._index`, `.add`, `.$id`
- [ ] Toast notifications on success/error
- [ ] DeleteDialog for single and bulk operations
