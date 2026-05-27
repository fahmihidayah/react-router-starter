# Mosque Management System - System Documentation

Mosque Management is a modern, full-stack Information System to manage mosque operations including congregations, events, transactions, and Qurban (sacrificial animal) management.

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API & Data Flow](#api--data-flow)
- [Feature Implementation Guide](#feature-implementation-guide)
- [User Interface](#user-interface)

## Features

### 1. Congregations Management (Implemented)

Full CRUD operations for managing mosque congregation members.

#### Database Schema

**Table:** `congregation`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `name` | text(100) | NOT NULL | Congregation member name |
| `gender` | text (enum) | 'f' \| 'm' | Gender (Female/Male) |
| `phone` | text(20) | NOT NULL | Contact phone number |
| `address` | text | NOT NULL | Full address |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/congregations` | List all congregations (paginated, searchable) |
| GET | `/dashboard/congregations/add` | Render create form |
| POST | `/dashboard/congregations/add` | Create new congregation |
| GET | `/dashboard/congregations/:id` | Render edit form |
| POST | `/dashboard/congregations/:id` | Update congregation |
| POST | `/dashboard/congregations` (intent: delete) | Delete single congregation |
| POST | `/dashboard/congregations` (intent: deleteMany) | Bulk delete congregations |

#### Features

- **Search** - Real-time search by name with URL parameter sync
- **Pagination** - Server-side pagination with configurable page size
- **Single Delete** - Delete individual congregation with confirmation dialog
- **Bulk Delete** - Multi-select rows and delete in batch
- **Form Validation** - Zod schema validation with inline error messages
- **Gender Selection** - Radio button group for Male/Female
- **Responsive Design** - Mobile-friendly data table with horizontal scroll

#### Implementation Files

```
app/features/congregations/
├── type.ts                                          # TCongregation type
├── repositories/
│   ├── congregation-repository.ts                   # Data access layer
│   └── index.ts
├── schemas/
│   └── congregation-schema.ts                       # Zod validation schemas
├── loaders/
│   ├── get-congregations-loader.ts                  # List with pagination/search
│   └── get-congregation-by-id-loader.ts             # Single item by ID
├── actions/
│   ├── create-congregation-action.ts                # Create handler
│   ├── update-congregation-action.ts                # Update handler
│   ├── delete-congregation-action.ts                # Delete single
│   └── delete-many-congregations-action.ts          # Bulk delete
└── components/admin/form/
    ├── add-congregation-form.tsx                    # Create form
    └── edit-congregation-form.tsx                   # Edit form

app/routes/
├── dashboard.congregations._index.tsx               # List page
├── dashboard.congregations.add.tsx                  # Create page
└── dashboard.congregations.$id.tsx                  # Edit page
```

### 2. Tags (Planned)

Categorization system for congregations, events, and transactions.

#### Planned Schema

**Table:** `tag`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `name` | text(50) | NOT NULL, UNIQUE | Tag name |
| `color` | text(7) | | Hex color code (e.g., #FF5733) |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Planned Features

- CRUD operations for tag management
- Color picker for visual categorization
- Tag assignment to congregations
- Filter by tags in list views

### 3. Events (Planned)

Management of mosque events and activities.

#### Planned Schema

**Table:** `event`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `name` | text(200) | NOT NULL | Event name |
| `description` | text | | Event details |
| `eventDate` | timestamp | NOT NULL | Event date and time |
| `location` | text(200) | | Event location |
| `status` | text (enum) | 'planned' \| 'ongoing' \| 'completed' \| 'cancelled' | Event status |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Planned Features

- Calendar view for events
- Event registration system
- Attendee tracking
- Reminder notifications
- Recurring events support

### 4. Transactions (Planned)

Financial transaction tracking for congregation members.

#### Planned Schema

**Table:** `transaction`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `congregationId` | text (UUID) | FOREIGN KEY | Reference to congregation |
| `amount` | integer | NOT NULL | Amount in cents |
| `paymentMethod` | text (enum) | 'cash' \| 'transfer' \| 'card' | Payment method |
| `status` | text (enum) | 'pending' \| 'completed' \| 'failed' \| 'refunded' | Transaction status |
| `notes` | text | | Additional notes |
| `transactionDate` | timestamp | NOT NULL | Transaction date |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

#### Planned Features

- Transaction history per congregation
- Receipt generation (PDF export)
- Payment method statistics
- Financial reports and dashboards
- Filter by date range, status, payment method

### 5. Qurban Management (Planned)

Detailed management of Qurban (sacrificial animal) transactions.

#### Planned Schema

**Table:** `qurban`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text (UUID) | PRIMARY KEY | Unique identifier |
| `transactionId` | text (UUID) | FOREIGN KEY | Reference to transaction |
| `animalType` | text (enum) | 'goat' \| 'sheep' \| 'cow' \| 'camel' | Animal type |
| `groupNumber` | integer | | Group number for shared sacrifice |
| `hijriYear` | integer | NOT NULL | Hijri year (e.g., 1446) |
| `notes` | text | | Additional notes |
| `createdAt` | timestamp | NOT NULL | Record creation time |
| `updatedAt` | timestamp | NOT NULL | Last update time |

**Note:** The `groupNumber` field allows multiple congregation members to pool together for a single animal sacrifice, which is common practice in Islamic tradition (e.g., 7 people can share a cow or camel).

#### Planned Features

- Group management for shared sacrifices
- Animal type selection with rules (individual vs shared)
- Qurban year tracking (Hijri calendar)
- Distribution tracking
- Reports by year and animal type

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
mosque-management/
├── app/
│   ├── routes/                     # File-based routing
│   │   ├── _index.tsx             # Home page
│   │   ├── dashboard.tsx          # Dashboard layout
│   │   ├── dashboard.congregations._index.tsx
│   │   ├── dashboard.congregations.add.tsx
│   │   └── dashboard.congregations.$id.tsx
│   ├── features/                   # Feature modules (CRUD)
│   │   └── congregations/
│   │       ├── type.ts
│   │       ├── repositories/
│   │       ├── schemas/
│   │       ├── loaders/
│   │       ├── actions/
│   │       └── components/
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
│   │   ├── schema.ts              # Drizzle schema definitions
│   │   └── schema-sqlite.ts       # SQLite-specific schema
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
class CongregationRepository extends BaseRepository<typeof congregations> {
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
  return await getCongregationsLoader(request)
}

// Action - handles mutations
export async function action({ request }: Route.ActionArgs) {
  return await createCongregationAction(request)
}
```

#### 3. Form Validation Pattern

Zod schemas define validation rules, shared between client and server:

```typescript
// Schema definition
export const createCongregationSchema = z.object({
  name: z.string().min(1).max(100),
  gender: z.enum(['f', 'm']),
  phone: z.string().max(20),
  address: z.string().min(1),
})

// Form component
const form = useForm<TCreateCongregation>({
  resolver: zodResolver(createCongregationSchema),
})

// Action validation
const result = createCongregationSchema.safeParse(formData)
```

#### 4. Type Safety

- Database types inferred from Drizzle schema
- Frontend types use `T` prefix (e.g., `TCongregation`)
- No `any` types allowed
- Strict TypeScript configuration

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│  Congregation   │
│─────────────────│
│ id (PK)         │
│ name            │
│ gender          │
│ phone           │
│ address         │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        │ (1:N)
        ▼
┌─────────────────┐       ┌─────────────────┐
│  Transaction    │       │     Event       │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ congregationId  │       │ name            │
│ amount          │       │ description     │
│ paymentMethod   │       │ eventDate       │
│ status          │       │ location        │
│ notes           │       │ status          │
│ transactionDate │       │ createdAt       │
│ createdAt       │       │ updatedAt       │
│ updatedAt       │       └─────────────────┘
└─────────────────┘
        │
        │ (1:1)
        ▼
┌─────────────────┐
│     Qurban      │
│─────────────────│
│ id (PK)         │
│ transactionId   │
│ animalType      │
│ groupNumber     │
│ hijriYear       │
│ notes           │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

(Planned: Tag system with many-to-many relationships)
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
- [ ] Implement Tags feature
- [ ] Add Events management
- [ ] Build Transactions system
- [ ] Implement user authentication UI

### Medium-term (3-6 months)
- [ ] Qurban management system
- [ ] Financial reporting dashboard
- [ ] Export data to Excel/PDF
- [ ] Email notifications
- [ ] SMS integration

### Long-term (6-12 months)
- [ ] Mobile application (React Native)
- [ ] Multi-mosque support (multi-tenancy)
- [ ] Advanced analytics and insights
- [ ] Automated backup system
- [ ] Integration with payment gateways

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
