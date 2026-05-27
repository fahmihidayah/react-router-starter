# Mosque Management System

A modern, full-stack application for managing mosque operations including congregations, events, transactions, and Qurban (sacrificial animal) management.

## Technical Stack

- **React Router 7.11.0** - File-based routing with SSR
- **TypeScript 5.8** - Type-safe development
- **Vite 7.1** - Fast build tooling with HMR
- **Biome 2.4** - Fast linting and formatting
- **Drizzle ORM** + **SQLite** (better-sqlite3) - Type-safe database layer
- **Better Auth** - Authentication and session management
- **Radix UI** + **Tailwind 4** - Accessible UI components and styling
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications
- **React Hook Form** + **Zod** - Form handling and validation
- **TanStack React Query** + **React Table** - Data fetching and table management

## Features

### Implemented
- **Congregations Management** - Full CRUD operations for mosque congregation members
  - Search by name
  - Pagination support
  - Single and bulk delete operations
  - Form validation with Zod
  - Gender selection (Male/Female)
  - Address input with textarea

### Planned
- **Tags** - Categorization system for congregations
- **Events** - Management of mosque events and activities
- **Transactions** - Financial transaction tracking for congregation members
- **Qurban Management** - Detailed management of Qurban (sacrificial animal) transactions

## Getting Started

### Prerequisites

- Node.js 18+ (with pnpm installed)
- SQLite3

### Installation

Install dependencies:

```bash
pnpm install
```

### Database Setup

Complete database setup (recommended for first-time setup):

```bash
pnpm db:setup
```

Or manually:

```bash
# Push the database schema
pnpm db:push

# Seed with sample data (optional)
pnpm db:seed
```

**Tip:** Use `pnpm db:studio` to visually browse and edit your database.

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Project Structure

```
app/
├── routes/              # File-based routing (flatRoutes convention)
├── features/            # Feature modules with CRUD patterns
│   ├── congregations/   # Example feature module
│   │   ├── type.ts      # TypeScript types (T-prefixed)
│   │   ├── repositories/
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── loaders/     # Server-side data fetching
│   │   ├── actions/     # Server-side mutations
│   │   └── components/
│   └── ...
├── components/
│   ├── ui/              # Shared Radix UI base components
│   ├── admin/           # Admin-specific (DataTable, DeleteDialog)
│   └── layouts/         # Header, Footer
├── lib/                 # Core services (auth, database, repository)
├── db/                  # Drizzle schema definitions
├── hooks/               # Shared custom hooks
├── providers/           # React Query provider
└── utils/               # Utilities (logger, etc.)
```

## Development Commands

```bash
# Development server
pnpm dev

# Database operations
pnpm db:push          # Push schema changes to database
pnpm db:seed          # Seed database with sample data
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio (visual database browser)
pnpm db:inspect       # Display database statistics and table info
pnpm db:backup        # Create timestamped database backup
pnpm db:restore       # Restore from backup (interactive)
pnpm db:snapshot      # Generate migration + create backup
pnpm db:reset         # Drop, push, and reseed (⚠️ destructive)
pnpm db:fresh         # Push and reseed
pnpm db:setup         # Complete database setup from scratch
pnpm db:validate      # Check migrations and validate types

# Code quality
pnpm lint:fix         # Fix linting issues with Biome
pnpm typecheck        # Run TypeScript type checking
pnpm format           # Format code with Biome

# Build
pnpm build            # Production build
```

For detailed database utilities documentation, see [scripts/README.md](./scripts/README.md).

## CRUD Feature Implementation

This project follows a consistent CRUD pattern for all features. Each feature includes:

1. **Schema** - Database table definition in `app/db/schema.ts`
2. **Types** - TypeScript types with `T` prefix in `app/features/[name]/type.ts`
3. **Repository** - Data access layer extending `BaseRepository`
4. **Loaders** - Server-side data fetching with pagination and search
5. **Actions** - Server-side mutations (create, update, delete, bulk delete)
6. **Schemas** - Zod validation schemas for forms
7. **Forms** - React Hook Form components with Zod resolver
8. **Routes** - Page components following flatRoutes convention

### Example Feature Structure

```
app/features/congregations/
├── type.ts                                    # TCongregation type
├── repositories/
│   ├── congregation-repository.ts             # Extends BaseRepository
│   └── index.ts
├── schemas/
│   └── congregation-schema.ts                 # Zod schemas
├── loaders/
│   ├── get-congregations-loader.ts            # List with pagination
│   └── get-congregation-by-id-loader.ts       # Single item
├── actions/
│   ├── create-congregation-action.ts
│   ├── update-congregation-action.ts
│   ├── delete-congregation-action.ts
│   └── delete-many-congregations-action.ts
└── components/admin/form/
    ├── add-congregation-form.tsx
    └── edit-congregation-form.tsx
```

### Corresponding Routes

```
app/routes/
├── dashboard.congregations._index.tsx    # List page
├── dashboard.congregations.add.tsx       # Create page
└── dashboard.congregations.$id.tsx       # Edit page
```

For detailed implementation guide, see `.claude/skills/feature-crud.md`.

## Code Conventions

- **File naming** - kebab-case for all files
- **Types** - `T` prefix (e.g., `TUser`, `TTask`)
- **Interfaces** - `I` prefix if needed
- **No `any`** - Use `unknown` + type narrowing
- **No default exports** - Except route components (React Router requirement)
- **Imports** - Use `~/` alias (maps to `app/`)
- **Formatting** - Biome: single quotes, no semicolons, 2-space indent, 100 char line width

## Database Schema

The database schema is organized in `app/db/schema/` with individual files for each entity:

### Schema Organization

```
app/db/schema/
├── index.ts                 # Central export (source of truth)
├── users.ts                 # User authentication
├── categories.ts            # Content categories
├── posts.ts                 # Blog posts
├── media.ts                 # Media assets
├── congregations.ts         # Congregation members
├── tags.ts                  # Tag system
├── congregation-tags.ts     # Many-to-many junction table
├── events.ts                # Event management
├── transactions.ts          # Financial transactions
└── qurbans.ts               # Qurban sacrifices
```

### Key Tables

#### Congregations
- Many-to-many relationship with Tags via `congregation_tags`
- Tracks member information (name, gender, phone, address)

#### Tags
- Categorization system for congregations
- Color-coded tags with unique names

#### Events
- Status tracking: planned, ongoing, completed, cancelled
- Date, location, and description fields

#### Transactions
- Linked to congregations
- Payment method tracking (cash, transfer, card)
- Status: pending, completed, failed, refunded

#### Qurbans
- Linked to transactions
- Animal type tracking (goat, sheep, cow, camel)
- Hijri year tracking

For complete schema details, inspect with:
```bash
pnpm db:inspect
# or
pnpm db:studio
```

## Route File Naming (flatRoutes Convention)

- `_index.tsx` → index route
- `dashboard.tsx` → layout route for /dashboard
- `dashboard.users.$id.tsx` → /dashboard/users/:id
- `api.auth.$.tsx` → catch-all /api/auth/*

## Authentication

This project uses **Better Auth** for authentication and session management.

- Server-side auth configured in `~/lib/auth`
- Client-side auth hooks in `~/lib/auth-client`

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t mosque-management .

# Run the container
docker run -p 3000:3000 mosque-management
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `pnpm build`:

```
├── package.json
├── pnpm-lock.yaml
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Documentation

- Project Overview: `/docs/README.md`
- CRUD Implementation: `.claude/skills/feature-crud.md`
- Additional Skills: `.claude/skills/` directory
- Project Instructions: `CLAUDE.md`

## License

MIT
