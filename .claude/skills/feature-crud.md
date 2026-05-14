---
name: feature-crud
description: >
  How to scaffold a complete feature module with CRUD operations in this project.
  Use this skill when creating a new feature (e.g. users, products, tasks, orders),
  adding a new admin panel section, building list/create/edit pages, or when the user
  asks how to organize loaders, actions, repositories, and components for a feature.
  Also use when adding bulk delete, pagination, search, or DataTable to any feature.
---

# Feature CRUD Workflow

## Feature Directory Structure

Every feature lives in `app/features/[feature-name]/`:

```
app/features/users/
├── user-repository.ts          # Data access (extends BaseRepository)
├── type.ts                     # Feature types (TUser, NewUser)
├── components/                 # Feature-specific UI components
│   └── user-form.tsx
├── loaders/                    # Server-side data fetching
│   ├── get-users-loader.ts          # List with pagination + search
│   └── get-user-by-id-loader.ts     # Single item by ID
└── actions/                    # Server-side mutations
    ├── create-user-action.ts
    ├── update-user-action.ts
    ├── delete-user-action.ts
    └── delete-many-user-action.ts
```

## Step-by-Step: Adding a New Feature

### 1. Define Schema (`app/db/schema.ts`)

```typescript
export const products = sqliteTable('product', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type TProduct = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
```

Then run `pnpm db:push`.

### 2. Create Repository (`app/features/products/product-repository.ts`)

```typescript
import { BaseRepository } from '~/lib/repository'
import { products } from '~/db/schema'

class ProductRepository extends BaseRepository<typeof products> {}
export const productRepository = new ProductRepository(products)
```

### 3. Create Loaders (`app/features/products/loaders/`)

**List loader with pagination + search:**

```typescript
// get-products-loader.ts
import { like } from 'drizzle-orm/sql'
import { products } from '~/db/schema'
import { productRepository } from '../product-repository'

export async function getProductsLoader(request: Request) {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '10', 10)
  const search = url.searchParams.get('search') || ''

  const result = await productRepository.findManyPaginated({
    where: search ? like(products.name, `%${search}%`) : undefined,
    page,
    pageSize,
  })

  return {
    items: result.data,
    totalCount: result.pagination.totalItems,
    page: result.pagination.currentPage,
    pageSize: result.pagination.pageSize,
    totalPages: result.pagination.totalPages,
  }
}
```

**Single item loader:**

```typescript
// get-product-by-id-loader.ts
import { productRepository } from '../product-repository'

export async function getProductByIdLoader(id: string) {
  return productRepository.findById(id)
}
```

### 4. Create Actions (`app/features/products/actions/`)

**Create action** — accepts Request, parses formData:

```typescript
// create-product-action.ts
import { productRepository } from '../product-repository'

export async function createProductAction(request: Request) {
  try {
    const formData = await request.formData()
    const data = {
      id: crypto.randomUUID(),
      name: formData.get('name')?.toString() || '',
      price: Number(formData.get('price')),
    }
    await productRepository.create(data)
    return { success: true, message: 'Product created' }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, message: 'Failed to create product' }
  }
}
```

**Delete action** — accepts id string:

```typescript
// delete-product-action.ts
import { productRepository } from '../product-repository'

export async function deleteProductAction(id: string) {
  try {
    await productRepository.delete(id)
    return { success: true, message: 'Product deleted' }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, message: 'Failed to delete product' }
  }
}
```

**Bulk delete action** — ALWAYS use `inArray()` for safe bulk deletes:

```typescript
// delete-many-product-action.ts
import { inArray } from 'drizzle-orm'
import { products } from '~/db/schema'
import { productRepository } from '../product-repository'

export async function deleteManyProductsAction(ids: string[]) {
  try {
    if (ids.length === 0) {
      return { success: false, message: 'No items selected' }
    }
    await productRepository.deleteMany(inArray(products.id, ids))
    return { success: true, message: 'Products deleted' }
  } catch (error) {
    console.error('Bulk delete error:', error)
    return { success: false, message: 'Failed to delete products' }
  }
}
```

### 5. Create Route Files (`app/routes/`)

Three route files per feature:

- `dashboard.products._index.tsx` — List page with DataTable + bulk delete
- `dashboard.products.add.tsx` — Create form
- `dashboard.products.$id.tsx` — Edit form

### 6. Wire Up the List Page

```typescript
// dashboard.products._index.tsx
import { useState } from 'react'
import { useSubmit } from 'react-router'
import { toast } from 'sonner'
import { DataTable, DeleteDialog } from '~/components/admin/table/table-list'
import { getProductsLoader } from '~/features/products/loaders/get-products-loader'
import { deleteProductAction } from '~/features/products/actions/delete-product-action'
import { deleteManyProductsAction } from '~/features/products/actions/delete-many-product-action'
import type { Route } from './+types/dashboard.products._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getProductsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'delete') {
    return deleteProductAction(formData.get('id')?.toString() || '')
  }
  if (intent === 'deleteMany') {
    const ids = JSON.parse(formData.get('ids')?.toString() || '[]') as string[]
    return deleteManyProductsAction(ids)
  }
  return { success: false }
}

export default function ProductsPage({ loaderData }: Route.ComponentProps) {
  const [deletingItem, setDeletingItem] = useState<TProduct | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TProduct[]>([])
  const submit = useSubmit()

  // ... DataTable with columns, DeleteDialog for single + bulk
}
```

## Checklist

When creating a new feature, verify:
- [ ] Schema added to `app/db/schema.ts` with `T` prefixed types
- [ ] `pnpm db:push` run after schema changes
- [ ] Repository created extending BaseRepository
- [ ] Loaders in `loaders/` directory (list with pagination, single by ID)
- [ ] Actions in `actions/` directory (create, update, delete, delete-many)
- [ ] Bulk delete uses `inArray()` — never raw SQL
- [ ] Three route files: `_index`, `.add`, `.$id`
- [ ] DataTable with `enableRowSelection` for bulk operations
- [ ] DeleteDialog for both single and bulk delete confirmations
- [ ] Toast notifications via Sonner on success/failure
