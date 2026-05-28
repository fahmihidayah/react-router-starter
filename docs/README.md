# Application Starter - System Documentation

A modern, full-stack React Router 7 application starter with authentication, CRUD operations, and admin dashboard capabilities.

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API & Data Flow](#api--data-flow)
- [Feature Implementation Guide](#feature-implementation-guide)
- [User Interface](#user-interface)

## Features

### 1. User Management (Implemented)

Full CRUD operations with authentication and role-based access control.

#### Database Schema

**Table:** `user`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `name` | text(100) | NOT NULL | User full name |
| `email` | text(255) | NOT NULL, UNIQUE | Email address |
| `role` | text (enum) | 'admin' \| 'user' | User role |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Features

- **Search** - Real-time search by name/email
- **Pagination** - Server-side pagination
- **Single Delete** - Delete individual users with confirmation
- **Bulk Delete** - Multi-select and batch delete
- **Form Validation** - Zod schema validation
- **Role Management** - Admin/user role assignment

### 2. Categories (Implemented)

Content organization and categorization system.

#### Database Schema

**Table:** `category`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `name` | text(100) | NOT NULL | Category name |
| `slug` | text(100) | NOT NULL, UNIQUE | URL-friendly slug |
| `description` | text | | Category description |
| `color` | text(7) | | Hex color code |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Features

- CRUD operations
- Slug auto-generation
- Color coding
- Hierarchical support (planned)

### 3. Posts (Implemented)

Content management with rich text editing.

#### Database Schema

**Table:** `post`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `title` | text(200) | NOT NULL | Post title |
| `slug` | text(200) | NOT NULL, UNIQUE | URL-friendly slug |
| `content` | text | | Rich text content |
| `excerpt` | text | | Short description |
| `status` | text (enum) | 'draft' \| 'published' | Publication status |
| `categoryId` | text (UUID) | FOREIGN KEY | Category reference |
| `authorId` | text (UUID) | FOREIGN KEY | Author reference |
| `publishedAt` | timestamp | | Publication date |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Features

- Rich text editor (Lexical)
- Draft/publish workflow
- Category assignment
- Tag assignment
- Featured images
- SEO-friendly slugs

### 4. Media Library (Implemented)

File upload and management system.

#### Database Schema

**Table:** `media`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `fileName` | text(255) | NOT NULL | Original filename |
| `fileType` | text(50) | NOT NULL | MIME type |
| `fileSize` | integer | NOT NULL | File size in bytes |
| `url` | text(500) | NOT NULL | File URL/path |
| `uploadedBy` | text (UUID) | FOREIGN KEY | User reference |
| `createdAt` | timestamp | NOT NULL | Upload time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Features

- File upload with validation
- Image optimization
- Metadata tracking
- Bulk operations
- Search and filtering

### 5. Tags (Implemented)

Flexible tagging and categorization system.

#### Database Schema

**Table:** `tag`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `name` | text(50) | NOT NULL, UNIQUE | Tag name |
| `slug` | text(50) | NOT NULL, UNIQUE | URL-friendly slug |
| `color` | text(7) | | Hex color code |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Features

- CRUD operations
- Color picker
- Multi-select support
- Tag-based filtering
- Many-to-many relationships

## System Architecture

### Technology Stack

#### Frontend
- **React Router 7.11.0** - File-based routing with SSR support
- **React 19** - UI library with concurrent features
- **TypeScript 5.8** - Type-safe development
- **Vite 7.1** - Fast build tooling with HMR
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide Icons** - Beautiful icon library
- **React Hook Form** - Performant form library
- **Zod** - Schema validation
- **TanStack React Query** - Data synchronization
- **TanStack React Table** - Powerful table utilities
- **Sonner** - Toast notifications

#### Backend
- **React Router Server** - SSR and server-side data loading
- **Drizzle ORM** - Type-safe SQL query builder
- **SQLite** (better-sqlite3) - Embedded database
- **Better Auth** - Authentication and session management

#### Development Tools
- **Biome** - Fast linting and formatting
- **TypeScript** - Static type checking

### Project Structure

```
app-starter/
├── app/
│   ├── routes/                     # File-based routing
│   │   ├── _index.tsx             # Home page
│   │   ├── dashboard.tsx          # Dashboard layout
│   │   ├── dashboard.users._index.tsx
│   │   ├── dashboard.users.add.tsx
│   │   ├── dashboard.users.$id.tsx
│   │   ├── dashboard.posts._index.tsx
│   │   ├── dashboard.categories._index.tsx
│   │   └── ...
│   ├── features/                   # Feature modules (CRUD)
│   │   ├── users/
│   │   ├── categories/
│   │   ├── posts/
│   │   ├── media/
│   │   ├── tags/
│   │   │   ├── type.ts
│   │   │   ├── repositories/
│   │   │   ├── schemas/
│   │   │   ├── loaders/
│   │   │   ├── actions/
│   │   │   └── components/
│   │   └── ...
│   ├── components/
│   │   ├── ui/                    # Radix UI base components
│   │   ├── admin/                 # Admin components (DataTable, etc.)
│   │   └── layouts/               # Layout components
│   ├── lib/
│   │   ├── auth.ts                # Better Auth server config
│   │   ├── auth-client.ts         # Auth client hooks
│   │   ├── database.ts            # Database connection
│   │   └── repository.ts          # Base repository pattern
│   ├── db/
│   │   ├── schema/                # Drizzle schema definitions
│   │   │   ├── index.ts
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   └── ...
│   ├── hooks/                     # Custom React hooks
│   ├── providers/                 # React context providers
│   ├── utils/                     # Utility functions
│   └── types/                     # Shared TypeScript types
├── .claude/
│   ├── skills/                    # Development skills/patterns
│   │   ├── feature-crud.md        # CRUD implementation guide
│   │   ├── route-and-component.md
│   │   ├── data-layer.md
│   │   ├── form-and-validation.md
│   │   └── ...
│   └── settings.local.json
├── docs/
│   └── README.md                  # This file
├── CLAUDE.md                      # Project instructions for AI
└── README.md                      # Main project README
```

### Architecture Patterns

#### 1. Repository Pattern

All data access goes through repository classes that extend `BaseRepository`:

```typescript
class UserRepository extends BaseRepository<typeof users> {
  // Inherits: create, findById, findMany, update, delete, deleteMany
  // Add custom methods here
}
```

#### 2. Loader/Action Pattern

- **Loaders** - Server-side data fetching (runs before render)
- **Actions** - Server-side mutations (form submissions)

```typescript
// Loader - fetches data
export async function loader({ request }: Route.LoaderArgs) {
  return await getUsersLoader(request)
}

// Action - handles mutations
export async function action({ request }: Route.ActionArgs) {
  return await createUserAction(request)
}
```

#### 3. Form Validation Pattern

Zod schemas define validation rules, shared between client and server:

```typescript
// Schema definition
export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  role: z.enum(['admin', 'user']),
  password: z.string().min(8),
})

// Form component
const form = useForm<TCreateUser>({
  resolver: zodResolver(createUserSchema),
})

// Action validation
const result = createUserSchema.safeParse(formData)
```

#### 4. Type Safety

- Database types inferred from Drizzle schema
- Frontend types use `T` prefix (e.g., `TUser`, `TPost`)
- No `any` types allowed
- Strict TypeScript configuration

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ name            │
│ email           │
│ role            │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        │ (1:N)
        ▼
┌─────────────────┐       ┌─────────────────┐
│      Post       │       │     Media       │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ title           │       │ fileName        │
│ slug            │       │ fileType        │
│ content         │       │ fileSize        │
│ status          │       │ url             │
│ categoryId (FK) │       │ uploadedBy (FK) │
│ authorId (FK)   │       │ createdAt       │
│ publishedAt     │       │ updatedAt       │
│ createdAt       │       └─────────────────┘
│ updatedAt       │
└─────────────────┘
        │
        │ (M:N)
        ▼
┌─────────────────┐       ┌─────────────────┐
│      Tag        │       │    Category     │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ slug            │       │ slug            │
│ color           │       │ description     │
│ createdAt       │       │ color           │
│ updatedAt       │       │ createdAt       │
└─────────────────┘       │ updatedAt       │
                          └─────────────────┘
```

### Schema Conventions

1. **Primary Keys** - UUID text type
2. **Timestamps** - `createdAt` and `updatedAt` on all tables
3. **Enums** - Text type with specific allowed values
4. **Money** - Stored as integers (cents) to avoid floating-point issues
5. **Foreign Keys** - Explicit relationships with ON DELETE CASCADE

## API & Data Flow

### Request Flow

```
User Action → Form Submit → React Router Action →
  Zod Validation → Repository Method → Database →
  Response/Redirect → UI Update → Toast Notification
```

### Data Loading Flow

```
Route Match → React Router Loader → Repository Query →
  Database → Transform Data → Component Render → UI Display
```

### Search & Pagination Flow

```
User Input → Update URL Params → Loader Re-execution →
  SQL Query with WHERE/LIMIT/OFFSET → Results →
  DataTable Render → Pagination Controls
```

## Feature Implementation Guide

### Creating a New CRUD Feature

Follow these 8 steps to create a complete CRUD feature:

#### Step 1: Define Database Schema

Add table to `app/db/schema.ts`:

```typescript
export const newFeature = sqliteTable('new_feature', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})
```

Run: `pnpm db:push`

#### Step 2: Create Type Definition

`app/features/new-feature/type.ts`

#### Step 3: Create Repository

`app/features/new-feature/repositories/new-feature-repository.ts`

#### Step 4: Create Zod Schemas

`app/features/new-feature/schemas/new-feature-schema.ts`

#### Step 5: Create Loaders

- `loaders/get-new-features-loader.ts` (list)
- `loaders/get-new-feature-by-id-loader.ts` (single)

#### Step 6: Create Actions

- `actions/create-new-feature-action.ts`
- `actions/update-new-feature-action.ts`
- `actions/delete-new-feature-action.ts`
- `actions/delete-many-new-features-action.ts`

#### Step 7: Create Forms

- `components/admin/form/add-new-feature-form.tsx`
- `components/admin/form/edit-new-feature-form.tsx`

#### Step 8: Create Routes

- `app/routes/dashboard.new-features._index.tsx` (list)
- `app/routes/dashboard.new-features.add.tsx` (create)
- `app/routes/dashboard.new-features.$id.tsx` (edit)

### Detailed Implementation Reference

See `.claude/skills/feature-crud.md` for complete code examples and implementation patterns.

## User Interface

### Design System

- **Colors** - Tailwind default palette with customization
- **Typography** - System font stack with fallbacks
- **Spacing** - Tailwind spacing scale (0.25rem increments)
- **Breakpoints** - Mobile-first responsive design
- **Components** - Radix UI primitives with custom styling

### Component Library

#### Admin Components

- **DataTable** - Server-side paginated table with search, sorting, row selection
- **DeleteDialog** - Confirmation modal for delete operations
- **TablePagination** - Pagination controls with page numbers
- **FormField** - Reusable form field wrapper with label and error display

#### UI Components

All components located in `app/components/ui/`:

- Button, Input, Textarea, Select
- Dialog, AlertDialog
- Form, FormField, FormLabel, FormMessage
- RadioGroup, Checkbox
- Toast (via Sonner)
- Card, Badge, Separator

### Accessibility

- **ARIA Labels** - All interactive elements have proper labels
- **Keyboard Navigation** - Full keyboard support for forms and tables
- **Focus Management** - Visible focus indicators
- **Screen Reader Support** - Semantic HTML and ARIA attributes
- **Color Contrast** - WCAG AA compliant

## Development Workflow

### Adding a New Feature

1. Design database schema
2. Create feature directory structure
3. Implement repository
4. Create Zod schemas
5. Implement loaders and actions
6. Build form components
7. Create route files
8. Test CRUD operations
9. Add error handling
10. Document feature

### Code Review Checklist

- [ ] TypeScript types are correct (no `any`)
- [ ] Zod schemas match database schema
- [ ] Form validation handles all edge cases
- [ ] Error messages are user-friendly
- [ ] Loading states are handled
- [ ] Success messages are shown
- [ ] Code follows project conventions (kebab-case, T-prefix)
- [ ] No console errors or warnings
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Responsive on mobile devices

## Future Enhancements

### Short-term (Next 3 months)
- [ ] Comments system for posts
- [ ] Post scheduling and auto-publish
- [ ] SEO meta tags management
- [ ] Advanced search and filtering
- [ ] Image upload with drag-and-drop

### Medium-term (3-6 months)
- [ ] Multi-language support (i18n)
- [ ] Email notification system
- [ ] Activity logs and audit trail
- [ ] Export data to Excel/PDF
- [ ] Advanced analytics dashboard

### Long-term (6-12 months)
- [ ] Mobile application (React Native)
- [ ] Multi-tenancy support
- [ ] Advanced caching strategies
- [ ] GraphQL API layer
- [ ] Third-party integrations (webhooks)

## Contributing

When contributing to this project:

1. Follow the CRUD implementation pattern in `.claude/skills/feature-crud.md`
2. Adhere to code conventions in `CLAUDE.md`
3. Write clear commit messages
4. Test all CRUD operations
5. Update documentation

## Support

For questions or issues:

1. Check `.claude/skills/` for implementation guides
2. Review existing features for patterns
3. Consult `CLAUDE.md` for project conventions
