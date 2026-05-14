# Starter App - Project Documentation

A production-ready **React Router 7.11.0** full-stack application with server-side rendering, authentication, and a modern component library.

## Project Overview

This is a modern web application built with React Router 7 (successor to Remix) using **file-based routing**, **TypeScript**, **Drizzle ORM**, and **Better Auth**. The project demonstrates best practices for building scalable, type-safe web applications.

**Key Stack:**
- Framework: React Router 7.11.0 with SSR enabled
- Language: TypeScript 5.8.0
- Database: SQLite with Drizzle ORM 0.45.2
- Authentication: Better Auth 1.6.9
- Build Tool: Vite 7.1.0
- Runtime: Node.js (ESM modules)

## Architecture & Project Structure

### Directory Organization

```
app/
├── routes/                    # File-based routing (React Router convention)
│   ├── _index.tsx            # Home page (/)
│   ├── login.tsx             # Login page
│   ├── register.tsx          # Registration page
│   ├── dashboard.tsx         # Dashboard layout
│   ├── dashboard._index.tsx  # /dashboard
│   ├── dashboard.tasks.tsx   # Tasks layout
│   ├── dashboard.tasks.$id.tsx # Dynamic route /dashboard/tasks/:id
│   └── api.auth.$.tsx        # API catch-all /api/auth/*
│
├── components/               # Reusable UI components
│   ├── ui/                   # Base components (Radix UI + Tailwind)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── [25+ UI components]
│   ├── layouts/              # Page layouts
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── admin/                # Admin-specific components
│
├── features/                 # Feature-specific modules
│   ├── tasks/                # Task feature
│   │   ├── task-repository.ts
│   │   ├── type.ts
│   │   └── components/
│   └── users/                # User feature
│
├── lib/                      # Core utilities & services
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth browser client
│   ├── database.ts          # Drizzle ORM client
│   └── repository/
│       └── index.ts         # BaseRepository pattern (CRUD)
│
├── db/
│   └── schema.ts            # Drizzle schema definitions
│
├── providers/
│   └── react-query.tsx      # TanStack React Query provider
│
├── hooks/
│   └── use-mobile.ts        # Custom React hooks
│
├── utils/
│   └── logger.ts            # Logging utility
│
└── root.tsx                 # Root layout component

drizzle/                     # Auto-generated migrations
seeds/                       # Database seed scripts
build/                       # Production build output
```

### File-Based Routing Convention

Uses `@react-router/fs-routes` with `flatRoutes()` configuration.

**Naming Convention:**
- `_index.tsx` = Index route (/ or section index)
- `dashboard.tsx` = Layout route for `/dashboard`
- `dashboard.tasks.$id.tsx` = Dynamic route `/dashboard/tasks/:id`
- `api.auth.$.tsx` = Catch-all route `/api/auth/*`

**Route Structure:**
```
/ (_index.tsx)
├── /login
├── /register
└── /dashboard (protected - loader checks session)
    ├── /dashboard/tasks
    │   ├── /dashboard/tasks/add
    │   └── /dashboard/tasks/:id
    ├── /dashboard/users
    └── /dashboard/settings
```

### Protected Routes Pattern

```typescript
// In loader function
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return redirect('/login')
  }
  return { user: session.user }
}
```

## Code Patterns

### 1. Component Structure

**Server Component (Route Component)** - `app/routes/_index.tsx`
```typescript
import type { Route } from './+types/_index'

// Meta tags for SEO
export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Page Title' },
    { name: 'description', content: 'Meta description' },
  ]
}

// Server-side data loading (runs before component)
export async function loader({ request }: Route.LoaderArgs) {
  const data = await fetchData()
  return { data }
}

// Client-side component (renders after loader completes)
export default function Home({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData
  return (
    <div>
      {/* JSX here */}
    </div>
  )
}
```

### 2. Repository Pattern for Data Access

```typescript
// Create typed repository
class TaskRepository extends BaseRepository<Task> {
  constructor(db: Database) {
    super(db, tasksTable)
  }
}

// Usage in loader or API route
const taskRepo = new TaskRepository(db)
const tasks = await taskRepo.findMany()
const task = await taskRepo.findById(id)
```

**BaseRepository Methods:**
```
findById(id), findOne(where), findMany(where)
findAll(), findManyPaginated(where, limit, offset)
create(data), createMany(data[])
update(id, data), updateMany(data[])
delete(id), deleteMany(ids)
exists(where), count(where)
```

### 3. Form Handling Pattern

Uses **React Hook Form + Zod** for validation.

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Submit form
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### 4. Client-Side Data Fetching with React Query

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'

export function TaskList() {
  const { data: tasks } = useSuspenseQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks')
      return res.json()
    },
    staleTime: 1000 * 60, // 1 minute
  })

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

### 5. Authentication Pattern

```typescript
// Server-side
import { auth } from '~/lib/auth'

const session = await auth.api.getSession({
  headers: request.headers,
})

// Client-side
import { authClient } from '~/lib/auth-client'

const { data: session } = authClient.useSession()
const { signIn, signUp, signOut } = authClient
```

### 6. UI Component Pattern (Radix + Tailwind)

```typescript
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'

export function FeatureCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Name</CardTitle>
        <CardDescription>Feature description</CardDescription>
      </CardHeader>
    </Card>
  )
}
```

**Styling Convention:**
- Use Tailwind CSS classes
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Layout: `flex`, `grid`, `container`, `mx-auto`
- Colors: `bg-primary`, `text-muted-foreground`, `border-secondary`
- Spacing: `p-4`, `m-6`, `gap-2` (units of 4px)

### 7. Database Schema with Drizzle

```typescript
import { sqliteTable, text, timestamp } from 'drizzle-orm/sqlite-core'

export const tasksTable = sqliteTable('task', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Task = typeof tasksTable.$inferSelect
export type NewTask = typeof tasksTable.$inferInsert
```

### 8. Logging Pattern

```typescript
import { logger } from '~/utils/logger'

// With scope
const log = logger.create('FeatureName')

log.info('User logged in', { userId: user.id })
log.error('Database error', error)
log.warn('Deprecated API usage')
log.debug('Debug information', { data })
```

### 9. Environment Configuration

Create `.env` file:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./app.db
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:5173
```

## Linting & Code Quality

### Biome Configuration

The project uses **Biome 2.4.14** (replaces Prettier + ESLint) for formatting and linting.

**File:** `biome.json`

**Key Rules:**
- **Formatter**: 2-space indentation, 100 character line width, LF line endings
- **JavaScript**: Single quotes, double quotes for JSX, trailing commas, semicolons as needed
- **Linter**:
  - Recommended rules enabled
  - Complexity checks (no useless catch, no extra boolean cast)
  - Correctness (no const reassign, undeclared variables are errors)
  - Security warnings (no dangerously set innerHTML)
  - Style (use const, use templates)
  - Suspicious (no debugger, no double equals, no var)
  - A11y warnings (no autofocus, useKeyWithClickEvents)

**TypeScript Overrides:**
- Turns off some rules that TypeScript handles (undeclaredVariables, unreachable code, etc.)
- Enforces `useConst` and `noVar`

**JSON Formatting:**
- 2-space indentation

### NPM Scripts

```bash
# Development
npm run dev                    # Start dev server with HMR
npm run typecheck            # TypeScript checking

# Linting & Formatting
npm run lint                 # Check linting issues
npm run lint:fix            # Fix linting issues
npm run format              # Format code
npm run check               # Full Biome check
npm run check:fix           # Fix all issues
npm run biome:ci            # CI-grade checks

# Database
npm run db:push             # Push schema changes
npm run db:seed             # Run seed scripts

# Build & Deploy
npm run build               # Production build
npm start                   # Production server
```

### Biome Rules Breakdown

**Correctness (Errors):**
- `noConstAssign`: Cannot reassign const variables
- `noConstantCondition`: Conditions that are always true/false
- `noUndeclaredVariables`: Variables used without declaration
- `noUnreachable`: Code after return/throw
- `noUnsafeOptionalChaining`: Chaining on potentially null values

**Complexity (Errors):**
- `noBannedTypes`: Avoid using `object` or `{}` types
- `noExtraBooleanCast`: Remove unnecessary boolean casts
- `noUselessCatch`: Catch blocks that just rethrow

**Suspicious (Errors/Warnings):**
- `noDebugger`: Remove debugger statements (error)
- `noDoubleEquals`: Use `===` instead of `==` (warn)
- `noDuplicateCase`: No duplicate switch cases
- `noFallthroughSwitchClause`: Add break statements
- `noVar`: Use `let` or `const` instead of `var`

**Security:**
- `noDangerouslySetInnerHtml`: Warn on innerHTML usage (XSS risk)

**Accessibility:**
- `noAutofocus`: Warn on autofocus attributes
- `useKeyWithClickEvents`: Warn on click without keyboard support

## Technology Stack

### Core Framework
- **react-router**: 7.11.0 (SSR, file-based routing, loaders/actions)
- **react**: 19.2.6 (UI library)
- **typescript**: 5.8.0 (static typing)

### Database & ORM
- **drizzle-orm**: 0.45.2 (Type-safe query builder)
- **better-sqlite3**: 12.9.0 (SQLite adapter for Node.js)
- **@libsql/client**: 0.17.3 (Alternative SQLite client)
- **drizzle-kit**: 0.31.10 (Schema management and migrations)

### Authentication
- **better-auth**: 1.6.9 (Full-featured auth framework)

### Data Management
- **@tanstack/react-query**: 5.100.9 (Server state management)
- **@tanstack/react-table**: 8.21.3 (Headless table library)

### UI & Styling
- **radix-ui**: 29+ components (Unstyled, accessible components)
- **@tailwindcss/vite**: 4.3.0 (Tailwind CSS via Vite)
- **tailwind-css**: 4.3.0 (Utility-first CSS)
- **lucide-react**: 1.14.0 (Icon library)
- **sonner**: 2.0.7 (Toast notifications)
- **next-themes**: 0.4.6 (Dark mode support)
- **vaul**: 1.1.2 (Mobile-friendly drawers)
- **cmdk**: 1.1.1 (Command palette)

### Forms & Validation
- **react-hook-form**: 7.75.0 (Performant form management)
- **@hookform/resolvers**: 5.2.2 (Validation resolvers)
- **zod**: 4.4.3 (TypeScript-first schema validation)

### Build & Development
- **vite**: 7.1.0 (Fast build tool)
- **@vitejs/plugin-react**: 6.0.1 (React plugin for Vite)
- **vite-tsconfig-paths**: 5.1.0 (Path alias resolution)
- **@tailwindcss/vite**: 4.3.0 (Tailwind CSS plugin)

### Code Quality
- **@biomejs/biome**: 2.4.14 (Formatter + Linter)
- **prettier**: 3.8.3 (Backup formatter)
- **eslint**: 10.3.0 (JavaScript linter)

### Testing
- **@playwright/test**: 1.59.1 (E2E testing)
- **vitest**: 4.1.5 (Unit testing)
- **@testing-library/react**: 16.3.2 (React component testing)
- **jsdom**: 29.1.1 (DOM simulation)

## Key Features

### Authentication System
- Email/password authentication
- Session management
- Protected routes with server-side validation
- User context available on both server and client

### Database Features
- SQLite with type-safe queries via Drizzle ORM
- Automatic migrations
- Seeding support
- Built-in user/session/account tables from Better Auth

### UI Features
- 29+ pre-built Radix UI components
- Dark mode support with next-themes
- Responsive design (mobile-first)
- Toast notifications (Sonner)
- Command palette (cmdk)
- Data tables with TanStack React Table

### Performance
- Server-side rendering (SSR)
- Automatic type generation from routes
- React Query for efficient data fetching
- Code splitting via Vite
- Build optimization

### Developer Experience
- Hot Module Replacement (HMR) for instant updates
- TypeScript strict mode
- Biome for unified linting/formatting
- React Query DevTools in development
- Comprehensive error boundaries

## Getting Started

### Installation
```bash
pnpm install
```

### Development
```bash
# Start dev server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint:fix

# Database
pnpm db:push
pnpm db:seed
```

### Production
```bash
# Build
pnpm build

# Start server
pnpm start
```

## Best Practices Used

1. **Type Safety**: Full TypeScript with strict mode
2. **Separation of Concerns**: Routes, components, features, utilities clearly separated
3. **Reusable Components**: Radix UI base components with custom styling
4. **Repository Pattern**: Centralized data access layer
5. **Server-Side Session**: Validation on protected routes
6. **Form Validation**: Zod schemas for runtime validation
7. **Error Handling**: Error boundaries and error states
8. **Accessibility**: Radix UI ensures A11y compliance
9. **Code Quality**: Biome enforces consistent style
10. **Performance**: React Query deduplication and caching

## Common Development Tasks

### Add a New Page
1. Create file in `app/routes/` (e.g., `about.tsx`)
2. Export `meta` function for SEO
3. Export `loader` for server data
4. Export default component
5. Use `Route.MetaArgs`, `Route.LoaderArgs`, `Route.ComponentProps` types

### Add a Database Table
1. Define schema in `app/db/schema.ts`
2. Run `pnpm db:push` to create migration
3. Create repository class extending `BaseRepository`
4. Use in loaders/actions

### Add a Form
1. Create Zod schema
2. Use `react-hook-form` with `zodResolver`
3. Use Radix UI form components
4. Handle submission with server action or API route

### Style New Components
1. Use Tailwind CSS classes
2. For base components, import from `~/components/ui/`
3. Compose with `cn()` utility for conditional classes
4. Follow responsive mobile-first design

---

**Last Updated:** 2026-05-10
**Framework Version:** React Router 7.11.0
**Node Version:** 18+ (ESM support required)
