# Application Starter

A modern, full-stack React Router 7 application starter with authentication, CRUD operations, and admin dashboard.

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

- **User Management** - Full CRUD operations with authentication
  - Search by name/email
  - Pagination support
  - Single and bulk delete operations
  - Form validation with Zod
  - Role-based access control

- **Categories** - Organize and categorize content
  - Hierarchical structure support
  - Color coding
  - Slug generation

- **Posts** - Content management system
  - Rich text editor (Lexical)
  - Draft/publish workflow
  - Category assignment
  - Featured images

- **Media Library** - File upload and management
  - Image optimization
  - File type validation
  - Bulk operations

- **Tags** - Flexible tagging system
  - Multi-select support
  - Tag-based filtering
  - Color customization

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
│   ├── users/           # User management
│   ├── categories/      # Category management
│   ├── posts/           # Post/content management
│   ├── media/           # Media library
│   ├── tags/            # Tag system
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
app/features/users/
├── type.ts                                    # TUser type
├── repositories/
│   ├── user-repository.ts                     # Extends BaseRepository
│   └── index.ts
├── schemas/
│   └── user-schema.ts                         # Zod schemas
├── loaders/
│   ├── get-users-loader.ts                    # List with pagination
│   └── get-user-by-id-loader.ts               # Single item
├── actions/
│   ├── create-user-action.ts
│   ├── update-user-action.ts
│   ├── delete-user-action.ts
│   └── delete-many-users-action.ts
└── components/admin/form/
    ├── add-user-form.tsx
    └── edit-user-form.tsx
```

### Corresponding Routes

```
app/routes/
├── dashboard.users._index.tsx    # List page
├── dashboard.users.add.tsx       # Create page
└── dashboard.users.$id.tsx       # Edit page
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
├── users.ts                 # User authentication and profiles
├── categories.ts            # Content categories
├── posts.ts                 # Blog posts/content
├── media.ts                 # Media assets
├── tags.ts                  # Tag system
└── post-tags.ts             # Many-to-many junction table
```

### Key Tables

#### Users

- Authentication and session management
- Role-based access control (admin, user)
- Profile information (name, email, avatar)

#### Categories

- Hierarchical content organization
- Color-coded for visual distinction
- Slug generation for SEO-friendly URLs

#### Posts

- Rich text content with Lexical editor
- Draft/publish workflow
- Category and tag assignment
- Featured image support

#### Media

- File upload and storage
- Metadata tracking (size, type, dimensions)
- Relationship with posts and users

#### Tags

- Flexible tagging system
- Many-to-many relationships
- Color customization
- Search and filtering support

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
docker build -t app-starter .

# Run the container
docker run -p 3000:3000 app-starter
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
