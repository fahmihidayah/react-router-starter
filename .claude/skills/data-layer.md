---
name: data-layer
description: >
  How to work with the data layer in this project: Drizzle ORM schema, BaseRepository pattern,
  database queries, and type conventions. Use this skill when defining new database tables,
  creating repositories, writing custom queries, working with Drizzle ORM operators (like, eq,
  inArray), or debugging database-related issues. Also use when the user asks about pagination,
  filtering, or the repository API.
---

# Data Layer Patterns

## Drizzle Schema Organization

### Option 1: Single File (`app/db/schema.ts`)

For small projects, all tables can be defined in a single schema file:

```typescript
import { sqliteTable, text, integer, timestamp } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('product', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ALWAYS export inferred types with T prefix
export type TProduct = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
```

### Option 2: Multi-File Schema (`app/db/schema/`)

For larger projects, organize schemas into separate files by domain:

```
app/db/schema/
├── index.ts                  # Barrel export
├── users.ts                  # User and account tables
├── posts.ts                  # Posts table
├── categories.ts             # Categories table
├── tags.ts                   # Tags table
├── congregation-tags.ts      # Junction table for many-to-many
└── congregations.ts          # Congregations table
```

**Index file** (`app/db/schema/index.ts`):
```typescript
// Re-export all schemas and types
export * from './users'
export * from './categories'
export * from './posts'
export * from './tags'
export * from './congregations'
export * from './congregation-tags'
```

**Individual schema file** (`app/db/schema/congregations.ts`):
```typescript
import { relations } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { congregationTags } from './congregation-tags'

export const congregations = sqliteTable('congregations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

// Define relations for query builder
export const congregationsRelations = relations(congregations, ({ many }) => ({
  congregationTags: many(congregationTags)
}))

export type TCongregation = typeof congregations.$inferSelect
export type TInsertCongregation = typeof congregations.$inferInsert
```

**Benefits of multi-file schema:**
- Better organization for large projects
- Easier to navigate and maintain
- Clear separation of concerns
- Reduced merge conflicts in teams

### Schema Rules
- Primary keys: always `text('id')` (UUIDs as strings).
- Timestamps: use `int('createdAt', { mode: 'timestamp' })` for SQLite.
- Foreign keys: use `.references(() => otherTable.id)`.
- Relations: define using `relations()` for Drizzle query builder.
- Types: always export `T` prefix for select, `TInsert` prefix for insert.
- After schema changes: run `pnpm db:push`.

## BaseRepository (`app/lib/repository/index.ts`)

All repositories extend `BaseRepository<T>`. It provides typed CRUD methods.

### Available Methods

```
findById(id: string)                    → single record or null
findOne(where: SQL)                     → single record matching condition
findMany(where?: SQL)                   → array of records
findAll()                               → all records
findManyPaginated({ where?, page, limit }) → PaginateDocs<T>
create(data: NewRecord)                 → created record
createMany(data: NewRecord[])           → created records
update(id: string, data: Partial<Record>) → updated record
delete(id: string)                      → void
deleteMany(where: SQL)                  → void (use inArray for bulk)
exists(where: SQL)                      → boolean
count(where?: SQL)                      → number
```

### Pagination Response

The `findManyPaginated()` method returns a `PaginateDocs<T>` object:

```typescript
interface PaginateDocs<T> {
  docs: T[]              // Array of records
  page: number           // Current page number (1-indexed)
  limit: number          // Items per page
  totalDocs: number      // Total count of items
  totalPages: number     // Total number of pages
  hasNextPage: boolean   // Whether there is a next page
  hasPrevPage: boolean   // Whether there is a previous page
}
```

### Repository Directory Organization

For features with multiple repositories, organize them in a dedicated `repositories/` folder:

```
app/features/users/
├── repositories/
│   ├── index.ts                  # Barrel export
│   ├── user-repository.ts
│   ├── account-repository.ts
│   ├── user-repository.test.ts
│   └── account-repository.test.ts
├── actions/
├── loaders/
├── components/
└── type.ts
```

### Creating a Repository

```typescript
// app/features/users/repositories/user-repository.ts
import { BaseRepository } from '~/lib/repository'
import { user } from '~/db/schema'

class UserRepository extends BaseRepository<typeof user> {
  // Add custom methods only when BaseRepository doesn't cover the use case
  async findByEmail(email: string) {
    return this.findOne(eq(user.email, email))
  }
}

export const userRepository = new UserRepository(user)
```

Barrel export for clean imports:

```typescript
// app/features/users/repositories/index.ts
export { userRepository } from './user-repository'
export { accountRepository } from './account-repository'
```

Then import repositories in actions/loaders:

```typescript
// app/features/users/actions/create-user-action.ts
import { userRepository, accountRepository } from '../repositories'
```

Rules:
- One repository per entity in the feature.
- When a feature has 2+ repositories, create a `repositories/` folder.
- Use barrel export (`index.ts`) for cleaner imports throughout the feature.
- Export a singleton instance, not the class.
- Only add custom methods when BaseRepository methods aren't sufficient.
- Name file: `[entity]-repository.ts` (kebab-case).

## Common Query Patterns

### Filtering with Drizzle Operators

```typescript
import { eq, like, and, or, inArray, gte, lte } from 'drizzle-orm'

// Exact match
const user = await userRepository.findOne(eq(users.email, email))

// Search (LIKE)
const results = await productRepository.findMany(
  like(products.name, `%${search}%`)
)

// Multiple conditions
const filtered = await orderRepository.findMany(
  and(
    eq(orders.status, 'pending'),
    gte(orders.createdAt, startDate)
  )
)

// Bulk operations — ALWAYS use inArray for multiple IDs
await productRepository.deleteMany(inArray(products.id, selectedIds))
```

### Paginated Queries in Loaders

```typescript
import type { PaginateDocs } from '~/types/pagination'

export async function getItemsLoader(request: Request) {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  const result = await itemRepository.findManyPaginated({
    where: search ? like(items.name, `%${search}%`) : undefined,
    page,
    limit,
  })

  // Return paginated response
  return result
}
```

The `PaginateDocs<T>` type is defined in `app/types/pagination.ts` and provides a consistent pagination response format across all endpoints.

## Database Client (`app/lib/database.ts`)

The Drizzle client is initialized once and imported where needed:

```typescript
import { db } from '~/lib/database'
```

For raw queries outside the repository pattern (rare, avoid when possible):

```typescript
import { db } from '~/lib/database'
import { sql } from 'drizzle-orm'

const result = await db.run(sql`SELECT COUNT(*) FROM products WHERE price > ${100}`)
```

## Type Conventions

- Select types (read): `TProduct`, `TUser`, `TTask` — use `$inferSelect`
- Insert types (write): `NewProduct`, `NewUser`, `NewTask` — use `$inferInsert`
- Always define both in `app/db/schema.ts` next to the table definition.
- Feature-specific types that don't map to DB go in `app/features/[name]/type.ts`.

## Logging

Use the project logger for database operations:

```typescript
import { logger } from '~/utils/logger'
const log = logger.create('UserRepository')

log.error('Failed to create user', error)
```
