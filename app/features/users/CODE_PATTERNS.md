# Users Feature - Code Patterns Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Patterns](#core-patterns)
5. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
6. [Authentication & Authorization](#authentication--authorization)
7. [Testing Patterns](#testing-patterns)
8. [Best Practices](#best-practices)
9. [Examples](#examples)

---

## Overview

The Users feature implements a complete user management system with authentication, authorization, role-based access control (RBAC), and CRUD operations. It follows a strict layered architecture pattern with clear separation of concerns.

### Key Features
- **User CRUD operations** - Create, Read, Update, Delete users
- **Authentication** - Session-based auth with Better Auth
- **Authorization** - Role-based access control (RBAC)
- **Pagination & filtering** - Advanced query capabilities
- **Type safety** - Full TypeScript with Zod validation
- **Comprehensive testing** - Unit tests for all layers
- **Custom error handling** - Domain-specific error types

---

## Architecture

### Layered Architecture Diagram

```
┌────────────────────────────────────────────────────┐
│                   Routes Layer                     │
│  /admin/users._index.tsx, /admin/users.$id.tsx    │
└─────────────────┬──────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────┐
│              Actions & Loaders                     │
│  - createUserAction                                │
│  - updateUserAction                                │
│  - deleteUserAction                                │
│  - getUsersLoader                                  │
│  - getUserByIdLoader                               │
└─────────────────┬──────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────┐
│              Middlewares                           │
│  - requireAuth (authentication)                    │
│  - requireRole (authorization)                     │
│  - withAuth (optional auth)                        │
└─────────────────┬──────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────┐
│              Service Layer                         │
│  - userService.create()                            │
│  - userService.update()                            │
│  - userService.delete()                            │
│  - userService.findPaginated()                     │
│  - Business logic & validation                     │
└─────────────────┬──────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────┐
│              Query Layer                           │
│  - userQueries.create()                            │
│  - userQueries.update()                            │
│  - userQueries.findById()                          │
│  - userQueries.findPaginated()                     │
│  - Database operations (Drizzle ORM)               │
└────────────────────────────────────────────────────┘
```

### Key Principles
1. **Unidirectional flow** - Data flows top to bottom
2. **Single responsibility** - Each layer has one job
3. **Dependency injection** - Layers don't know about upper layers
4. **Type safety** - Types flow through all layers
5. **Testability** - Each layer can be tested independently

---

## File Structure

```
app/features/users/
├── actions/                          # Server actions (route handlers)
│   ├── create-user-action.ts
│   ├── create-user-action.test.ts
│   ├── update-user-action.ts
│   ├── update-user-action.test.ts
│   ├── delete-user-action.ts
│   ├── delete-user-action.test.ts
│   ├── delete-many-user-action.ts
│   ├── register-user-action.ts
│   └── register-user-action.test.ts
│
├── loaders/                          # Data loaders
│   ├── get-users-loader.ts
│   ├── get-users-loader.test.ts
│   ├── get-user-by-id-loader.ts
│   ├── get-user-by-id-loader.test.ts
│   └── get-current-user-loader.ts
│
├── services/                         # Business logic layer
│   ├── user.service.ts
│   ├── user.service.test.ts
│   └── index.ts
│
├── queries/                          # Database access layer
│   ├── index.ts                      # Export all queries
│   ├── utils.ts                      # Query helpers
│   ├── find-paginated.ts
│   ├── find-paginated.test.ts
│   ├── find-by-id.ts
│   ├── find-by-email.ts
│   ├── find-by-email.test.ts
│   ├── find-all.ts
│   ├── create.ts
│   ├── create.test.ts
│   ├── update.ts
│   ├── update.test.ts
│   ├── delete.ts
│   ├── delete.test.ts
│   ├── delete-many.ts
│   ├── count-admin.ts
│   └── assign-role-by-name.ts
│
├── middlewares/                      # Auth & authorization
│   ├── index.ts
│   ├── auth.middleware.ts
│   └── role.middleware.ts
│
├── contexts/                         # React Router contexts
│   ├── index.ts
│   └── user-context.ts
│
├── components/                       # UI components
│   └── admin/
│       └── form/
│           ├── edit-user-form.tsx
│           └── new-user-form.tsx
│
├── schemas/                          # Schema definitions
│   ├── form/                         # Form validation schemas
│   │   └── user-schema.ts
│   └── db/                           # Database schemas
│       ├── index.ts
│       ├── users.ts
│       ├── user-roles.ts
│       └── relations.ts
│
├── types/                            # TypeScript types
│   ├── index.ts
│   └── errors/
│       ├── index.ts
│       └── user-errors.ts
│
└── admin/                            # Admin configuration
    └── user-admin-collection.ts
```

### Naming Conventions

1. **Actions**: `{verb}-{resource}-action.ts`
   - `create-user-action.ts`
   - `update-user-action.ts`
   - `delete-user-action.ts`

2. **Loaders**: `get-{resource(s)}-loader.ts`
   - `get-users-loader.ts` (plural for lists)
   - `get-user-by-id-loader.ts` (singular for detail)

3. **Queries**: `{verb}.ts` or `{verb}-{descriptor}.ts`
   - `create.ts`
   - `find-by-id.ts`
   - `find-paginated.ts`

4. **Tests**: `{filename}.test.ts`
   - Co-located with source files
   - Same name with `.test.ts` suffix

---

## Core Patterns

### 1. Schema-Driven Validation

All user inputs are validated using Zod schemas before processing.

**Location:** `app/features/users/schemas/form/user-schema.ts`

```typescript
import z from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
})

export type TCreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email'),
})

export type TUpdateUser = z.infer<typeof updateUserSchema>
```

**Benefits:**
- Type inference from schemas
- Consistent validation rules
- Field-level error messages
- Reusable across actions

---

### 2. Custom Error Types

Domain-specific error classes for better error handling.

**Location:** `app/features/users/types/errors/user-errors.ts`

```typescript
export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(message = 'An account with this email already exists') {
    super(message)
    this.name = 'EmailAlreadyExistsError'
  }
}

export class UserCreationFailedError extends Error {
  constructor(message = 'Failed to create user') {
    super(message)
    this.name = 'UserCreationFailedError'
  }
}

export class InvalidUserDataError extends Error {
  constructor(message = 'Invalid user data') {
    super(message)
    this.name = 'InvalidUserDataError'
  }
}
```

**Usage Pattern:**
```typescript
// Service layer - Throw domain errors
export async function deleteById(id: string): Promise<void> {
  const user = await userQueries.findById(id)
  if (!user) throw new UserNotFoundError()

  await userQueries.deleteById(id)
}

// Action layer - Catch and handle
try {
  await userService.deleteById(id)
  return { success: true }
} catch (error) {
  if (error instanceof UserNotFoundError) {
    return { success: false, message: error.message }
  }
  throw error
}
```

---

### 3. Query Layer Pattern

Pure database operations with Drizzle ORM.

**Example:** `app/features/users/queries/find-paginated.ts:1`

```typescript
import { and, asc, desc, eq, gte, lte, like, type SQL, sql } from 'drizzle-orm'
import type { PaginateDocs } from '~/types/pagination'
import { users } from '~/db/schema'
import { db } from '~/lib/database'
import type { UserWithRoles } from '../types'
import { toUserWithRoles } from './utils'

type SortField = 'createdAt' | 'name' | 'email' | 'updatedAt' | 'emailVerified'
type SortDir = 'asc' | 'desc'

export type FindPaginatedParams = {
  sortBy?: SortField
  sortDir?: SortDir
  page?: number
  limit?: number
  // Filter fields
  id?: string
  name?: string
  email?: string
  emailVerified?: boolean
  createdAtFrom?: Date
  createdAtTo?: Date
  updatedAtFrom?: Date
  updatedAtTo?: Date
}

// Whitelist sort columns to prevent SQL injection
const sortColumns = {
  createdAt: users.createdAt,
  name: users.name,
  email: users.email,
  updatedAt: users.updatedAt,
  emailVerified: users.emailVerified,
} satisfies Record<SortField, unknown>

export async function findPaginated(params: FindPaginatedParams): Promise<PaginateDocs<UserWithRoles>> {
  const {
    sortBy = 'createdAt',
    sortDir = 'desc',
    page = 1,
    limit = 20,
    id,
    name,
    email,
    emailVerified,
    createdAtFrom,
    createdAtTo,
  } = params

  // Build dynamic WHERE conditions
  const conditions: SQL[] = []
  if (id) conditions.push(eq(users.id, id))
  if (name) conditions.push(like(users.name, `%${name}%`))
  if (email) conditions.push(like(users.email, `%${email}%`))
  if (emailVerified !== undefined) conditions.push(eq(users.emailVerified, emailVerified))
  if (createdAtFrom) conditions.push(gte(users.createdAt, createdAtFrom))
  if (createdAtTo) conditions.push(lte(users.createdAt, createdAtTo))

  const where = conditions.length ? and(...conditions) : undefined
  const orderCol = sortColumns[sortBy] // Type-safe, whitelisted
  const orderBy = sortDir === 'asc' ? asc(orderCol) : desc(orderCol)
  const offset = (page - 1) * limit

  // Parallel execution for performance
  const [rows, [{ count }]] = await Promise.all([
    db.query.users.findMany({
      where,
      orderBy,
      limit,
      offset,
      with: { userRoles: { with: { role: true } } },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where ?? sql`1=1`),
  ])

  const totalDocs = Number(count)
  const totalPages = Math.ceil(totalDocs / limit)

  return {
    docs: rows.map(toUserWithRoles),
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
```

**Key Features:**
- Type-safe sorting with whitelisted columns
- Dynamic filtering with optional parameters
- Parallel query execution (data + count)
- Eager loading of relations
- Transformation to domain types

---

### 4. Data Transformation Pattern

Transform database results to domain types.

**Location:** `app/features/users/queries/utils.ts`

```typescript
import type { UserWithRoles } from '../types'

export function toUserWithRoles(user: any): UserWithRoles {
  return {
    ...user,
    userRoles: undefined, // Remove junction table data
    roles: user.userRoles.map((e: any) => ({
      ...e.role,
    })),
  }
}
```

**Type Definition:** `app/features/users/types/index.ts`
```typescript
import type { TRole, TUser } from '~/db/schema'

export type UserWithRoles = TUser & {
  roles: TRole[]
}
```

**Benefits:**
- Clean domain model (no junction table exposure)
- Type-safe transformations
- Reusable across queries

---

### 5. Service Layer Pattern

Business logic with validation, error handling, and orchestration.

**Location:** `app/features/users/services/user.service.ts:1`

```typescript
import { auth } from '~/lib/auth'
import type { PaginateDocs } from '~/types/pagination'
import * as userQueries from '../queries'
import type { TCreateUser, TUpdateUser } from '../schemas/form/user-schema'
import type { UserWithRoles } from '../types'
import {
  EmailAlreadyExistsError,
  InvalidUserDataError,
  UserCreationFailedError,
  UserNotFoundError,
} from '../types/errors/user-errors'

const ROLE_ADMIN = 'Admin'
const ROLE_USER = 'User'

// Private helper - Auto-assign role based on admin count
async function assignDefaultRole(userId: string): Promise<void> {
  const adminCount = await userQueries.countAdmin()
  const roleName = adminCount === 0 ? ROLE_ADMIN : ROLE_USER
  await userQueries.assignRoleByName(userId, roleName)
}

export async function create(
  data: TCreateUser,
): Promise<{ userId: string; setCookie: string | null }> {
  const { name, email, password } = data
  const response = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: true,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    if (response.status === 400) {
      throw new InvalidUserDataError(errorData?.message)
    }
    if (response.status === 409) {
      throw new EmailAlreadyExistsError(errorData?.message)
    }
    throw new UserCreationFailedError(errorData?.message)
  }

  const body = (await response.json().catch(() => null)) as { user?: { id?: string } } | null
  if (!body?.user?.id) {
    throw new UserCreationFailedError('Failed to create user')
  }

  // Auto-assign role
  await assignDefaultRole(body.user.id)

  return {
    userId: body.user.id,
    setCookie: response.headers.get('set-cookie'),
  }
}

export async function update(id: string, data: TUpdateUser): Promise<void> {
  const existingUser = await userQueries.findById(id)
  if (!existingUser) {
    throw new UserNotFoundError()
  }

  // Check email uniqueness
  if (data.email && data.email !== existingUser.email) {
    const userWithEmail = await userQueries.findByEmail(data.email)
    if (userWithEmail && userWithEmail.id !== id) {
      throw new EmailAlreadyExistsError('Email already in use')
    }
  }

  await userQueries.update(id, data)
}

export async function deleteById(id: string): Promise<void> {
  const existingUser = await userQueries.findById(id)
  if (!existingUser) {
    throw new UserNotFoundError()
  }

  await userQueries.deleteById(id)
}

export async function deleteMany(ids: string[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new InvalidUserDataError('Invalid user IDs provided')
  }

  await userQueries.deleteMany(ids)
}

export async function findPaginated(
  params: userQueries.FindPaginatedParams,
): Promise<PaginateDocs<UserWithRoles>> {
  return await userQueries.findPaginated(params)
}

export async function findById(id: string): Promise<UserWithRoles | undefined> {
  return await userQueries.findById(id)
}
```

**Responsibilities:**
- Business logic (auto-role assignment)
- Validation (email uniqueness, existence checks)
- Error throwing with domain errors
- Orchestration (multiple query calls)
- Integration with external services (Better Auth)

---

### 6. Action Layer Pattern

Handle HTTP requests, validate input, delegate to services.

**Example:** `app/features/users/actions/update-user-action.ts:1`

```typescript
import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { updateUserSchema } from '../schemas/form/user-schema'
import * as userService from '../services'
import { EmailAlreadyExistsError, UserNotFoundError } from '../types/errors/user-errors'

export async function updateUserAction(args: ActionArgs) {
  const id = args.params.id
  if (!id) {
    throw new Response('User ID is required', { status: 400 })
  }

  const formData = await args.request.formData()
  const result = updateUserSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    await userService.update(id, result.data)
    return redirect('/admin/users')
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw new Response(error.message, { status: 404 })
    }

    if (error instanceof EmailAlreadyExistsError) {
      return {
        errors: {
          name: [],
          email: [error.message],
        },
      }
    }

    return {
      errors: {
        name: ['An unexpected error occurred. Please try again.'],
        email: [],
      },
    }
  }
}
```

**Pattern:**
1. Extract and validate params
2. Parse and validate form data
3. Delegate to service layer
4. Handle errors appropriately
5. Return success (redirect) or errors

---

### 7. Loader Layer Pattern

Fetch data for routes.

**Example:** `app/features/users/loaders/get-users-loader.ts:1`

```typescript
import { type ApiResponse, createSuccessResponse, type LoaderArgs } from '~/lib/types'
import type { PaginateDocs } from '~/types/pagination'
import * as userService from '../services'
import type { UserWithRoles } from '../types'

export async function getUsersLoader(
  args: LoaderArgs,
): Promise<ApiResponse<PaginateDocs<UserWithRoles> | undefined>> {
  const url = new URL(args.request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return createSuccessResponse(
    await userService.findPaginated({
      page,
      limit,
      name: search || undefined,
    }),
  )
}
```

**Pattern:**
1. Extract query params from URL
2. Parse and transform params
3. Delegate to service layer
4. Wrap in API response format

---

## Layer-by-Layer Breakdown

### Database Schema Layer

**Location:** `app/features/users/schemas/db/`

#### Users Table
`app/features/users/schemas/db/users.ts:4`

```typescript
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TUser = typeof users.$inferSelect
export type TInsertUser = typeof users.$inferInsert
```

#### User Roles Junction Table
`app/features/users/schemas/db/user-roles.ts:6`

```typescript
import { primaryKey, pgTable, text } from 'drizzle-orm/pg-core'
import { roles } from '~/features/roles/schemas/db/roles'
import { users } from './users'

export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text('roleId')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  }),
)
```

#### Relations
`app/features/users/schemas/db/relations.ts:1`

```typescript
import { relations } from 'drizzle-orm'
import { roles } from '~/features/roles/schemas/db/roles'
import { userRoles } from './user-roles'
import { users } from './users'

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}))
```

---

## Authentication & Authorization

### Authentication Middleware

**Location:** `app/features/users/middlewares/auth.middleware.ts:1`

```typescript
import { type RouteMatch, redirect } from 'react-router'
import { userContext } from '~/features/users/contexts/user-context'
import { auth } from '~/lib/auth'
import type { Arguments } from '~/lib/types'
import { findById } from '../queries'
import type { UserWithRoles } from '../types'

export type AuthSession = {
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
  }
  user: UserWithRoles
}

/**
 * Get the current authenticated session
 * Returns session with user data including roles, or null if not authenticated
 */
export async function getSession(request: Request): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.id) {
    return null
  }

  const user = await findById(session.user.id)

  if (!user) {
    return null
  }

  return {
    session: session.session,
    user,
  }
}

/**
 * Authentication middleware
 * Adds authenticated user to context, throws 401 if not authenticated
 */
export async function requireAuth(args: Arguments) {
  const authSession = await getSession(args.request)

  if (!authSession) {
    throw redirect('/login')
  }

  // Add user to context for downstream loaders/actions to access
  args.context.set(userContext, authSession)
}

/**
 * Optional authentication middleware
 * Adds authenticated user to context if available, doesn't throw if not authenticated
 */
export async function withAuth(args: Arguments) {
  const authSession = await getSession(args.request)
  if (authSession) args.context.set(userContext, authSession)
}
```

### Authorization Middleware

**Location:** `app/features/users/middlewares/role.middleware.ts:1`

```typescript
import { userContext } from '~/features/users/contexts/user-context'
import type { Arguments } from '~/lib/types'
import { requireAuth } from './auth.middleware'

/**
 * Role-based authorization middleware
 * Requires user to have specific role(s)
 * First ensures authentication, then checks roles
 *
 * @param args - Middleware arguments
 * @param roles - Single role or array of roles (user must have at least one)
 * @throws 403 Forbidden if user doesn't have required role
 * @throws 401 Unauthorized if user is not authenticated
 */
export async function requireRole(args: Arguments, roles: string | string[]): Promise<void> {
  // First ensure user is authenticated (this sets context)
  await requireAuth(args)

  // Get user from context
  const authSession = args.context.get(userContext)

  if (!authSession?.user) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const roleNames = authSession.user.roles.map((role: any) => role.name)
  const requiredRoles = Array.isArray(roles) ? roles : [roles]

  const hasRole = requiredRoles.some((role) => roleNames.includes(role))

  if (!hasRole) {
    throw new Response('Forbidden - Insufficient permissions', { status: 403 })
  }
}

/**
 * Admin authorization middleware
 * Requires user to have Admin role
 */
export async function requireAdmin(args: Arguments) {
  await requireRole(args, 'Admin')
}
```

### User Context

**Location:** `app/features/users/contexts/user-context.ts:1`

```typescript
import { createContext } from 'react-router'
import type { UserWithRoles } from '~/features/users/types'

export interface UserContextValue {
  user: UserWithRoles | null
}

export const userContext = createContext<UserContextValue>({
  user: null,
})
```

### Usage in Routes

```typescript
import { requireAdmin } from '~/features/users/middlewares'

// Apply middleware in route
export async function loader(args: Route.LoaderArgs) {
  await requireAdmin(args)
  return await getUsersLoader(args)
}
```

---

## Testing Patterns

### Query Layer Tests

**Location:** `app/features/users/queries/find-paginated.test.ts:1`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findPaginated } from './find-paginated'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    query: {
      users: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn().mockReturnThis(),
  },
}))

describe('findPaginated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated users with default parameters', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            role: {
              id: 'role-1',
              name: 'User',
              description: 'Regular User',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      },
    ]

    vi.mocked(db.query.users.findMany).mockResolvedValue(mockUsers)

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 2 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({})

    expect(result.docs).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.totalDocs).toBe(2)
  })

  it('should handle pagination correctly', async () => {
    const mockUsers = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [],
    }))

    vi.mocked(db.query.users.findMany).mockResolvedValue(mockUsers)

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 50 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ page: 2, limit: 10 })

    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
    expect(result.totalDocs).toBe(50)
    expect(result.totalPages).toBe(5)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPrevPage).toBe(true)
  })

  it('should filter by email', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [],
    }

    vi.mocked(db.query.users.findMany).mockResolvedValue([mockUser])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 1 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ email: 'john' })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].email).toBe('john@example.com')
  })
})
```

**Testing Patterns:**
- Mock database with Vitest
- Test default parameters
- Test pagination logic
- Test filtering
- Test edge cases (empty results)
- Test data transformations

---

### Service Layer Tests

**Location:** `app/features/users/services/user.service.test.ts:1`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '~/lib/auth'
import * as userQueries from '../queries'
import * as userService from './user.service'

vi.mock('~/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}))

vi.mock('../queries', () => ({
  countAdmin: vi.fn(),
  assignRoleByName: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  update: vi.fn(),
  deleteById: vi.fn(),
}))

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create user and assign Admin role when no admins exist', async () => {
      const userData = {
        name: 'First User',
        email: 'first@example.com',
        password: 'password123',
      }

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'set-cookie': 'session=abc123' }),
        json: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
      }

      vi.mocked(auth.api.signUpEmail).mockResolvedValue(mockResponse as any)
      vi.mocked(userQueries.countAdmin).mockResolvedValue(0)
      vi.mocked(userQueries.assignRoleByName).mockResolvedValue(undefined)

      const result = await userService.create(userData)

      expect(result.userId).toBe('user-123')
      expect(result.setCookie).toBe('session=abc123')
      expect(userQueries.assignRoleByName).toHaveBeenCalledWith('user-123', 'Admin')
    })

    it('should create user and assign User role when admins exist', async () => {
      const userData = {
        name: 'Second User',
        email: 'second@example.com',
        password: 'password123',
      }

      const mockResponse = {
        ok: true,
        headers: new Headers({ 'set-cookie': 'session=xyz789' }),
        json: vi.fn().mockResolvedValue({ user: { id: 'user-456' } }),
      }

      vi.mocked(auth.api.signUpEmail).mockResolvedValue(mockResponse as any)
      vi.mocked(userQueries.countAdmin).mockResolvedValue(1)
      vi.mocked(userQueries.assignRoleByName).mockResolvedValue(undefined)

      const result = await userService.create(userData)

      expect(result.userId).toBe('user-456')
      expect(userQueries.assignRoleByName).toHaveBeenCalledWith('user-456', 'User')
    })
  })

  describe('update', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'Original Name',
        email: 'original@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      }

      const updateData = {
        name: 'Updated Name',
        email: 'original@example.com',
      }

      vi.mocked(userQueries.findById).mockResolvedValue(mockUser)
      vi.mocked(userQueries.update).mockResolvedValue(undefined)

      await userService.update('1', updateData)

      expect(userQueries.update).toHaveBeenCalledWith('1', updateData)
    })

    it('should throw error when email is already in use', async () => {
      const mockUser = {
        id: '1',
        name: 'Original Name',
        email: 'original@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      }

      const otherUser = {
        id: '2',
        name: 'Other User',
        email: 'taken@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      }

      vi.mocked(userQueries.findById).mockResolvedValue(mockUser)
      vi.mocked(userQueries.findByEmail).mockResolvedValue(otherUser)

      await expect(
        userService.update('1', { name: 'Test', email: 'taken@example.com' })
      ).rejects.toThrow('Email already in use')
    })
  })
})
```

**Testing Patterns:**
- Mock external dependencies (auth, queries)
- Test business logic (role assignment)
- Test error cases
- Test validation logic
- Verify function calls

---

## Best Practices

### 1. Strict Layer Separation

**DO:**
```typescript
// Action layer - delegates to service
export async function updateUserAction(args: ActionArgs) {
  const result = updateUserSchema.safeParse(formData)
  if (!result.success) return { errors: ... }

  await userService.update(id, result.data)
  return redirect('/admin/users')
}

// Service layer - business logic
export async function update(id: string, data: TUpdateUser) {
  const existing = await userQueries.findById(id)
  if (!existing) throw new UserNotFoundError()

  await userQueries.update(id, data)
}

// Query layer - database operations
export async function update(id: string, data: UpdateUserData) {
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
}
```

**DON'T:**
```typescript
// ❌ Don't put business logic in actions
export async function updateUserAction(args: ActionArgs) {
  const existing = await db.query.users.findFirst(...)  // ❌
  if (data.email !== existing.email) {                  // ❌ Business logic
    const duplicate = await db.query.users.findFirst(...) // ❌
  }
}

// ❌ Don't put validation in queries
export async function update(id: string, data: UpdateUserData) {
  if (!data.email.includes('@')) throw new Error(...) // ❌ Validation
  await db.update(users)...
}
```

---

### 2. Use Domain Errors

```typescript
// ✓ Good - Domain-specific errors
export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

// Service throws domain errors
export async function deleteById(id: string) {
  const user = await userQueries.findById(id)
  if (!user) throw new UserNotFoundError()
  await userQueries.deleteById(id)
}

// Action catches and handles
try {
  await userService.deleteById(id)
} catch (error) {
  if (error instanceof UserNotFoundError) {
    return { success: false, message: error.message }
  }
  throw error
}

// ✗ Bad - Generic errors
if (!user) throw new Error('User not found') // ❌
```

---

### 3. Schema Validation

```typescript
// ✓ Good - Validate early in action layer
export async function updateUserAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const result = updateUserSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  await userService.update(id, result.data) // Type-safe data
}

// ✗ Bad - No validation
export async function updateUserAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const data = Object.fromEntries(formData) // ❌ Unvalidated
  await userService.update(id, data as any) // ❌ Unsafe
}
```

---

### 4. Type Safety Throughout

```typescript
// ✓ Good - Types flow through layers
export const updateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export type TUpdateUser = z.infer<typeof updateUserSchema>

export type UpdateUserData = {
  email?: string
  name?: string
}

// Action uses TUpdateUser (validated)
export async function updateUserAction(args: ActionArgs) {
  const result = updateUserSchema.safeParse(...)
  await userService.update(id, result.data) // TUpdateUser
}

// Service uses TUpdateUser
export async function update(id: string, data: TUpdateUser) {
  await userQueries.update(id, data)
}

// Query uses UpdateUserData (partial)
export async function update(id: string, data: UpdateUserData) {
  await db.update(users).set(data)...
}
```

---

### 5. Parallel Queries

```typescript
// ✓ Good - Parallel execution
const [rows, [{ count }]] = await Promise.all([
  db.query.users.findMany({ ... }),
  db.select({ count: sql`count(*)` }).from(users).where(...),
])

// ✗ Bad - Sequential execution
const rows = await db.query.users.findMany({ ... })
const [{ count }] = await db.select({ count: sql`count(*)` }).from(users)
```

---

### 6. Co-locate Tests

```
app/features/users/
├── queries/
│   ├── find-paginated.ts
│   └── find-paginated.test.ts      # ✓ Co-located
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts        # ✓ Co-located
└── actions/
    ├── update-user-action.ts
    └── update-user-action.test.ts  # ✓ Co-located
```

---

## Examples

### Complete CRUD Flow

#### 1. Create User

**Route:** `app/routes/admin/users.new.tsx`
```typescript
import { useActionData } from 'react-router'
import { NewUserForm } from '~/features/users/components/admin/form/new-user-form'
import { createUserAction } from '~/features/users/actions/create-user-action'

export async function action(args: Route.ActionArgs) {
  return createUserAction(args)
}

export default function NewUserPage() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="container w-full mx-auto p-5">
      <h3 className="text-2xl">Create User</h3>
      <NewUserForm errors={actionData?.errors} />
    </div>
  )
}
```

**Action:** `app/features/users/actions/create-user-action.ts:1`
```typescript
export async function createUserAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const result = createUserSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return createErrorResponse(result.error.flatten().fieldErrors, 400)
  }

  try {
    const createResult = await userService.create(result.data)
    return createSuccessResponse(createResult)
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return createErrorResponse({ email: [error.message] }, 409)
    }
    return createErrorResponse({ name: ['An unexpected error occurred'] }, 500)
  }
}
```

**Service:** Calls Better Auth, assigns role
**Query:** N/A (uses Better Auth)

---

#### 2. List Users

**Route:** `app/routes/admin/users._index.tsx:1`

**Loader:** `app/features/users/loaders/get-users-loader.ts:1`
```typescript
export async function getUsersLoader(args: LoaderArgs) {
  const url = new URL(args.request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return createSuccessResponse(
    await userService.findPaginated({
      page,
      limit,
      name: search || undefined,
    }),
  )
}
```

**Service:** Delegates to query
**Query:** `app/features/users/queries/find-paginated.ts:35`

---

#### 3. Update User

**Route:** `app/routes/admin/users.$id.tsx:1`
**Action:** `app/features/users/actions/update-user-action.ts:1`
**Service:** `app/features/users/services/user.service.ts:64`
**Query:** `app/features/users/queries/update.ts:10`

---

#### 4. Delete User

**Action in route:** `app/routes/admin/users._index.tsx:22`
**Action function:** `app/features/users/actions/delete-user-action.ts:1`
**Service:** `app/features/users/services/user.service.ts:80`
**Query:** `app/features/users/queries/delete.ts:5`

---

## Summary

The Users feature demonstrates these key patterns:

1. **Strict layered architecture** - Routes → Actions/Loaders → Services → Queries
2. **Schema-driven validation** - Zod schemas for all inputs
3. **Domain-specific errors** - Custom error classes for better error handling
4. **Type safety** - TypeScript throughout with type inference
5. **Middleware pattern** - Authentication and authorization
6. **Context pattern** - User context for sharing auth state
7. **Comprehensive testing** - Unit tests for all layers
8. **Data transformation** - Clean domain models from database results
9. **Auto-role assignment** - First user gets Admin role
10. **Parallel queries** - Performance optimization

By following these patterns, you can build maintainable, testable, and type-safe features with clear separation of concerns.
