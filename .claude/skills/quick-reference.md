---
name: quick-reference
description: >
  Quick reference cheat sheet for common patterns, commands, conventions, and file structures
  in this React Router 7 starter project. Use this skill when you need a fast lookup of
  naming conventions, import aliases, type prefixes, common commands, or file organization.
  Also use when the user asks for a "cheat sheet", "quick reference", or wants to see
  patterns at a glance.
---

# Quick Reference Cheat Sheet

## Project Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Router | 7.11.0 | Framework, routing, SSR |
| TypeScript | 5.8 | Type safety |
| Vite | 7.1 | Build tool |
| Biome | 2.4 | Linting & formatting |
| Drizzle ORM | Latest | Database ORM |
| SQLite | better-sqlite3 | Database |
| Better Auth | 1.6.9 | Authentication |
| Radix UI | Latest | UI primitives |
| Tailwind CSS | 4 | Styling |
| TanStack React Query | Latest | Data fetching |
| React Hook Form | Latest | Forms (advanced) |
| Zod | Latest | Validation |
| Sonner | Latest | Toast notifications |
| Lucide | Latest | Icons |

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| All files | kebab-case | `user-repository.ts` |
| Components | kebab-case | `product-card.tsx` |
| Route files | kebab-case + special chars | `admin.users.$id.tsx` |
| Test files | `.test.ts(x)` suffix | `user-repository.test.ts` |
| Type files | `type.ts` | `features/users/type.ts` |
| Schema files | `[entity]-schema.ts` | `user-schema.ts` |

**Special route naming:**
- `_index.tsx` = index route (e.g., `/admin/`)
- `$id.tsx` = dynamic param (e.g., `/admin/users/:id`)
- `$.tsx` = catch-all/splat route
- `_public.tsx` = layout prefix (not in URL)

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Types | `T` prefix | `TUser`, `TProduct` |
| Interfaces | `I` prefix (rare) | `IUserService` |
| Components | PascalCase | `ProductCard` |
| Props types | `T[Name]Props` | `TProductCardProps` |
| Functions | camelCase | `getUserById` |
| Loaders | `get[Entity]Loader` | `getProductsLoader` |
| Actions | `[verb][Entity]Action` | `createUserAction` |
| Repositories | `[entity]Repository` | `userRepository` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS_PER_PAGE` |

---

## Import Aliases

```typescript
// Alias ~ maps to app/
import { Button } from '~/components/ui/button'
import { userRepository } from '~/features/users/repositories'
import { auth } from '~/lib/auth'
import { db } from '~/lib/database'
import { logger } from '~/utils/logger'
import type { TUser } from '~/db/schema'
```

---

## Directory Structure

```
app/
├── routes/              # Routes (pages)
│   ├── admin.tsx        # Admin layout
│   ├── admin/           # Admin routes → /admin/*
│   │   ├── _index.tsx   # /admin
│   │   ├── users._index.tsx  # /admin/users
│   │   └── users.$id.tsx     # /admin/users/:id
│   ├── api/             # API routes → /api/*
│   ├── _public.tsx      # Public layout
│   └── login.tsx        # /login
├── features/            # Feature modules
│   └── [name]/
│       ├── type.ts
│       ├── repositories/
│       ├── loaders/
│       ├── actions/
│       ├── schemas/
│       └── components/
├── components/
│   ├── ui/              # Base UI components
│   ├── admin/           # Admin-specific
│   └── layouts/         # Page layouts
├── db/
│   ├── schema/          # Drizzle schemas
│   └── seed.ts          # Seed script
├── lib/                 # Core services
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── database.ts
│   └── repository/
├── hooks/               # Custom React hooks
├── providers/           # React providers
├── utils/               # Utilities
└── types/               # Shared types
```

---

## Common Commands

```bash
# Development
pnpm dev                          # Start dev server
pnpm build                        # Production build
pnpm preview                      # Preview production build

# Database
pnpm db:push                      # Push schema to DB (dev)
pnpm db:generate                  # Generate migrations (prod)
pnpm db:migrate                   # Apply migrations (prod)
pnpm db:seed                      # Seed database

# Code Quality
pnpm lint                         # Run Biome linter
pnpm lint:fix                     # Fix lint issues
pnpm typecheck                    # TypeScript check
pnpm format                       # Format code

# Testing
pnpm test                         # Run tests
pnpm test:watch                   # Watch mode
pnpm test:ui                      # Vitest UI

# Dependencies
pnpm add <package>                # Add dependency
pnpm add -D <package>             # Add dev dependency
pnpm outdated                     # Check for updates
pnpm update                       # Update dependencies
```

---

## Route Patterns

### Basic Route
```typescript
import type { Route } from './+types/[route-name]'

export async function loader({ request }: Route.LoaderArgs) {
  return { data: 'value' }
}

export async function action({ request }: Route.ActionArgs) {
  return { success: true }
}

export default function PageName({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.data}</div>
}
```

### Protected Route
```typescript
import { auth } from '~/lib/auth'
import { redirect } from 'react-router'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) throw redirect('/login')
  return { user: session.user }
}
```

### Layout Route
```typescript
import { Outlet } from 'react-router'

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <Header />
      <Outlet /> {/* Child routes render here */}
      <Footer />
    </div>
  )
}
```

---

## Database Patterns

### Schema Definition
```typescript
import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
})

export type TUser = typeof users.$inferSelect
export type TInsertUser = typeof users.$inferInsert
```

### Repository
```typescript
import { BaseRepository } from '~/lib/repository'
import { users } from '~/db/schema'

class UserRepository extends BaseRepository<typeof users> {}

export const userRepository = new UserRepository(users)
```

### Common Queries
```typescript
import { eq, like, and, or, inArray, gte, lte } from 'drizzle-orm'

// Find by ID
await userRepository.findById('user-id')

// Find one with condition
await userRepository.findOne(eq(users.email, email))

// Find many with filter
await userRepository.findMany(like(users.name, '%john%'))

// Paginated
await userRepository.findManyPaginated({ page: 1, limit: 20 })

// Delete many
await userRepository.deleteMany(inArray(users.id, ['id1', 'id2']))
```

---

## Form Patterns

### Native HTML Form
```typescript
interface FormProps {
  errors?: Record<string, string[] | undefined>
}

export function NewUserForm({ errors }: FormProps) {
  const nameError = errors?.name?.[0]

  return (
    <form method="post">
      <Label htmlFor="name">Name</Label>
      <Input id="name" name="name" aria-invalid={!!nameError} />
      {nameError && <p className="text-destructive text-sm">{nameError}</p>}
      <Button type="submit">Save</Button>
    </form>
  )
}
```

### React Hook Form
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<TFormData>({
  resolver: zodResolver(schema),
  defaultValues: { name: '' },
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Zod Schema
```typescript
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  age: z.coerce.number().int().min(18),
})

export type TUserFormData = z.infer<typeof userSchema>
```

### Action with Validation
```typescript
export async function createUserAction(request: Request) {
  const formData = await request.formData()
  const result = userSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  await userRepository.create({ id: randomUUID(), ...result.data })
  return redirect('/users')
}
```

---

## Authentication

### Server-Side (Loaders/Actions)
```typescript
import { auth } from '~/lib/auth'

const session = await auth.api.getSession({ headers: request.headers })
if (!session?.user) throw redirect('/login')
```

### Client-Side (Components)
```typescript
import { authClient } from '~/lib/auth-client'

const { data: session } = authClient.useSession()

await authClient.signIn.email({ email, password })
await authClient.signOut()
```

---

## UI Components

### Common Imports
```typescript
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem } from '~/components/ui/select'
import { Dialog, DialogTrigger, DialogContent } from '~/components/ui/dialog'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { toast } from 'sonner'
```

### cn() Utility
```typescript
import { cn } from '~/lib/utils'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

### Icons
```typescript
import { Plus, Trash2, Pencil, Search } from 'lucide-react'

<Button><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
```

---

## React Query

### Query
```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 1000 * 60, // 1 minute
})
```

### Mutation
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (data) => createUser(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

---

## TypeScript Patterns

### Route Types
```typescript
import type { Route } from './+types/route-name'

// Loader return type
export async function loader(): Promise<TLoaderData> {
  return { data }
}

// Component props
export default function Page({ loaderData }: Route.ComponentProps) {}
```

### No `any`
```typescript
// ❌ Bad
function process(data: any) {}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowed to string
  }
}
```

---

## Error Handling

### Action Error Return
```typescript
try {
  await repository.create(data)
  return { success: true }
} catch (error) {
  return { success: false, message: 'Failed to create' }
}
```

### Toast Notifications
```typescript
import { toast } from 'sonner'

toast.success('Item created')
toast.error('Failed to delete')
toast.info('Processing...')
```

### ErrorBoundary
```typescript
import { isRouteErrorResponse } from 'react-router'

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return <div>{error.status} {error.statusText}</div>
  }
  return <div>Something went wrong</div>
}
```

---

## Environment Variables

```bash
# .env
DATABASE_URL="./app/data.db"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:5173"

# Client-exposed (must prefix with VITE_)
VITE_APP_NAME="My App"
```

Access in code:
```typescript
// Server-side
process.env.BETTER_AUTH_SECRET

// Client-side (only VITE_ prefixed)
import.meta.env.VITE_APP_NAME
```

---

## Testing

### Component Test
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('renders and handles click', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()

  render(<Button onClick={onClick}>Click me</Button>)

  await user.click(screen.getByRole('button'))

  expect(onClick).toHaveBeenCalled()
})
```

### Repository Test
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('UserRepository', () => {
  beforeEach(async () => {
    await db.insert(users).values([/* seed data */])
  })

  afterEach(async () => {
    await db.delete(users)
  })

  it('finds user by id', async () => {
    const user = await userRepository.findById('user-1')
    expect(user).toMatchObject({ id: 'user-1' })
  })
})
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/add-user-management

# Stage changes
git add .

# Commit (conventional commits)
git commit -m "feat: add user CRUD functionality"

# Push to remote
git push -u origin feat/add-user-management

# Common commit prefixes
# feat: new feature
# fix: bug fix
# refactor: code restructuring
# docs: documentation
# test: add tests
# chore: maintenance tasks
```

---

## Common Drizzle Operations

```typescript
// Insert
await db.insert(users).values({ id, name, email })

// Update
await db.update(users).set({ name: 'New Name' }).where(eq(users.id, id))

// Delete
await db.delete(users).where(eq(users.id, id))

// Select
await db.select().from(users).where(eq(users.email, email))

// With relations
await db.query.posts.findMany({
  with: { author: true }
})
```

---

## Performance Quick Wins

- [ ] Add `loading="lazy"` to images below fold
- [ ] Use pagination for large lists (limit 20-50 per page)
- [ ] Add database indexes to frequently queried columns
- [ ] Use `React.memo()` for components in large lists
- [ ] Lazy load heavy components (editors, charts)
- [ ] Fetch independent data in parallel with `Promise.all()`
- [ ] Set appropriate `staleTime` for React Query queries
- [ ] Replace heavy libraries (moment.js → date-fns)

---

## Security Checklist

- [ ] Never commit `.env` files (check `.gitignore`)
- [ ] Use parameterized queries (Drizzle handles this)
- [ ] Validate all user input with Zod
- [ ] Check auth in protected loaders
- [ ] Don't expose secrets to client (no `VITE_` prefix for secrets)
- [ ] Sanitize user-generated content before rendering
- [ ] Use HTTPS in production
- [ ] Set strong `BETTER_AUTH_SECRET` (32+ chars)
- [ ] Rotate secrets periodically
- [ ] Log errors server-side, never expose stack traces to users
