#!/usr/bin/env tsx
/**
 * React Router 7 Starter Template Extraction Script
 *
 * This script extracts common, reusable features from the Learning Tracker
 * application to create a standalone starter template for future projects.
 *
 * Usage:
 *   pnpm tsx scripts/create-starter.ts
 *
 * Output:
 *   Creates a 'starter-template' directory with the extracted files
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT_DIR = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT_DIR, 'starter-template')

// Features to INCLUDE in the starter
const INCLUDED_FEATURES = [
  'auth',
  'users',
  'roles',
  'permissions',
  'security',
  'email',
  'media',
  'audit-log',
  'observability',
  'privacy',
  'admin',
  'queue',
  // Optional: uncomment to include
  // 'posts',
  // 'tags',
]

// Features to EXCLUDE (domain-specific)
const EXCLUDED_FEATURES = [
  'learners',
  'goals',
  'activities',
  'schedules',
  'learning-plan',
  'learning-template',
  'categories',
  'reports',
  'track-app',
  'page',
]

// Route directories to exclude
const EXCLUDED_ROUTE_DIRS = ['track-app']

// Route files to exclude (domain-specific public pages)
const EXCLUDED_ROUTE_FILES = [
  '_public.about.tsx',
  '_public.contact.tsx',
  '_public.posts.$slug.tsx',
  '_public.posts._index.tsx',
  '_public.posts.tsx',
]

// Admin route patterns to exclude
const EXCLUDED_ADMIN_ROUTE_PATTERNS = [
  'posts.',
  'categories.',
  'learners.',
  'goals.',
  'activities.',
  'schedules.',
  'learning-',
  'reports.',
]

// Root files to include
const ROOT_FILES = [
  'package.json',
  'tsconfig.json',
  'biome.json',
  'drizzle.config.ts',
  'vite.config.ts',
  'vitest.config.ts',
  'playwright.config.ts',
  'react-router.config.ts',
  'components.json',
  '.env.example',
  '.gitignore',
  '.nvmrc',
]

// Directories to copy entirely
const COPY_DIRS = ['scripts', 'seeds', 'worker', 'messages', 'project.inlang', '.vscode', 'public']

function log(message: string) {
  console.log(`✓ ${message}`)
}

function warn(message: string) {
  console.warn(`⚠ ${message}`)
}

function error(message: string) {
  console.error(`✗ ${message}`)
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function copyFile(src: string, dest: string) {
  ensureDir(dirname(dest))
  cpSync(src, dest, { force: true })
}

function copyDirectory(src: string, dest: string, filter?: (path: string) => boolean) {
  if (!existsSync(src)) {
    warn(`Source directory does not exist: ${src}`)
    return
  }
  ensureDir(dest)
  cpSync(src, dest, {
    recursive: true,
    force: true,
    filter: filter || (() => true),
  })
}

function cleanPackageJson(packageJsonPath: string) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  // Update package metadata
  pkg.name = 'react-router-starter'
  pkg.version = '1.0.0'
  pkg.description =
    'A production-ready React Router 7 starter template with auth, RBAC, email, media upload, and more'

  // Keep all dependencies as they're all needed for the infrastructure
  // Users can remove optional features they don't need

  writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
  log('Cleaned package.json')
}

function updateDbSchemaExports(schemaPath: string) {
  // Instead of filtering, rebuild the file with only included features
  const header = '// Re-export all schemas and types from features\n\n'
  const exports = INCLUDED_FEATURES.map(
    (feature) => `export * from '~/features/${feature}/schemas/db'`,
  ).join('\n')

  const content = header + exports + '\n'

  writeFileSync(schemaPath, content)
  log('Updated database schema exports')
}

function cleanMessageFiles(messagesDir: string) {
  const enPath = join(messagesDir, 'en.json')
  const idPath = join(messagesDir, 'id.json')

  for (const path of [enPath, idPath]) {
    if (!existsSync(path)) continue

    const messages = JSON.parse(readFileSync(path, 'utf-8'))

    // Remove domain-specific message keys
    const domainPrefixes = [
      'learner',
      'goal',
      'activity',
      'schedule',
      'learning_plan',
      'learning_template',
      'category',
      'report',
      'track_app',
    ]

    const cleanedMessages: Record<string, string> = {}
    for (const [key, value] of Object.entries(messages)) {
      const shouldKeep = !domainPrefixes.some((prefix) =>
        key.toLowerCase().startsWith(prefix.toLowerCase()),
      )
      if (shouldKeep) {
        cleanedMessages[key] = value as string
      }
    }

    writeFileSync(path, JSON.stringify(cleanedMessages, null, 2) + '\n')
  }

  log('Cleaned message files')
}

function createStarterReadme(outputDir: string) {
  const readme = `# React Router 7 Starter Template

A production-ready React Router 7 starter template with authentication, authorization, email service, media uploads, and comprehensive infrastructure.

## Features

### 🔐 Authentication & Authorization
- **Better Auth** integration with email/password and OAuth (Google)
- Email verification and password reset flows
- Role-based access control (RBAC)
- Dynamic permission system with middleware
- Rate limiting and security headers

### 👥 User Management
- Complete user CRUD operations
- User profiles and contexts
- Admin panel for user management
- Session management

### 📧 Email System
- Template-based emails with Handlebars
- Multiple providers: SMTP, Resend
- Queue support with RabbitMQ for async processing
- Tailwind CSS styling for emails
- Development test endpoint

### 📁 Media Upload
- Local and S3 storage support
- Image processing with Sharp (WebP conversion)
- Presigned URLs for secure access
- File validation and size limits

### 🔍 Observability
- Prometheus metrics endpoint
- Sentry error tracking integration
- Database health checks
- Structured logging with pino

### 🛡️ Privacy & Compliance
- Cookie consent banner
- Privacy policy management
- GDPR-ready patterns
- Audit logging for user actions

### 🎨 UI Components
- 40+ pre-built Radix UI components
- Tailwind CSS 4 with custom theme
- Dark mode support
- Responsive layouts
- Accessibility built-in

### 🌍 Internationalization
- Paraglide.js integration
- English and Indonesian translations included
- Easy to add more languages

### 🧪 Testing
- Vitest for unit and integration tests
- Playwright for E2E tests
- Test coverage reporting
- Example test patterns

## Tech Stack

- **Framework**: React Router 7 with SSR
- **Runtime**: React 19, Node.js 20.19+
- **Language**: TypeScript
- **Build**: Vite
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Code Quality**: Biome

## Quick Start

### Prerequisites
- Node.js 20.19 or newer
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. **Extract the template**
   \`\`\`bash
   # Download and extract
   curl -L https://github.com/yourorg/react-router-starter/archive/main.zip -o starter.zip
   unzip starter.zip
   mv react-router-starter-main my-new-project
   cd my-new-project
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Configure environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   \`\`\`

4. **Setup database**
   \`\`\`bash
   # Generate migrations (if needed)
   pnpm db:generate

   # Push schema to database
   pnpm db:push

   # Create initial admin user
   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword ADMIN_NAME="Admin User" pnpm db:bootstrap-admin
   \`\`\`

5. **Start development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

Visit http://localhost:5173

## Environment Variables

See \`.env.example\` for all available configuration options. Key variables:

\`\`\`bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5173

# Email (choose provider)
EMAIL_PROVIDER=smtp # or 'resend'
EMAIL_FROM=no-reply@example.com

# Media
MEDIA_STORAGE_DRIVER=local # or 's3'
\`\`\`

## Architecture

This starter follows a clean, layered architecture:

\`\`\`
schemas/db + schemas/form
          ↓
        queries
          ↓
        services
          ↓
   actions and loaders
          ↓
 routes and components
\`\`\`

- **Schemas**: Database tables (Drizzle) and form validation (Zod)
- **Queries**: Database operations
- **Services**: Business logic and orchestration
- **Actions/Loaders**: HTTP request handling
- **Routes/Components**: UI and routing

## Project Structure

\`\`\`
├── app/
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── roles/         # RBAC roles
│   │   ├── permissions/   # Permission system
│   │   ├── email/         # Email service
│   │   ├── media/         # File uploads
│   │   ├── audit-log/     # Activity tracking
│   │   └── ...
│   ├── components/        # Shared UI components
│   ├── routes/            # Route definitions
│   ├── lib/               # Core libraries
│   ├── utils/             # Utilities
│   └── env.ts             # Environment validation
├── drizzle/               # Database migrations
├── scripts/               # Utility scripts
├── seeds/                 # Database seeds
└── worker/                # Background workers
\`\`\`

## Available Scripts

- \`pnpm dev\` - Start development server
- \`pnpm build\` - Build for production
- \`pnpm start\` - Start production server
- \`pnpm typecheck\` - Run TypeScript checks
- \`pnpm test\` - Run tests
- \`pnpm test:e2e\` - Run E2E tests
- \`pnpm check\` - Lint and format check
- \`pnpm check:fix\` - Auto-fix lint and format issues
- \`pnpm db:generate\` - Generate database migrations
- \`pnpm db:push\` - Push schema to database
- \`pnpm db:studio\` - Open Drizzle Studio

## Adding Features

1. Create a new feature directory: \`app/features/my-feature/\`
2. Follow the layered architecture pattern
3. Add database schemas in \`schemas/db/\`
4. Export from feature barrel file
5. Add routes in \`app/routes/\`

See existing features for examples.

## Testing

Run unit tests:
\`\`\`bash
pnpm test
\`\`\`

Run with coverage:
\`\`\`bash
pnpm test:coverage
\`\`\`

Run E2E tests:
\`\`\`bash
pnpm test:e2e
\`\`\`

## Deployment

### Railway
1. Create new project
2. Add PostgreSQL database
3. Set environment variables
4. Deploy from GitHub

### Vercel
1. Import project
2. Add PostgreSQL (Vercel Postgres or external)
3. Configure build command: \`pnpm build\`
4. Deploy

### Docker
\`\`\`bash
docker build -t my-app .
docker run -p 3000:3000 my-app
\`\`\`

## Optional Features

### Posts/Blog System
Uncomment the \`posts\` and \`tags\` features in the extraction script to include a full CMS with:
- Rich text editor (Lexical)
- Draft/publish workflow
- Slug management
- Tag system

### Queue System
The RabbitMQ queue infrastructure is included. Configure with:
\`\`\`bash
EMAIL_DELIVERY_MODE=rabbitmq
RABBITMQ_URL=amqp://localhost:5672
\`\`\`

## Documentation

- \`AGENTS.md\` - Development guidelines and patterns
- \`ARCHITECTURE.md\` - Detailed architecture documentation
- \`DEPLOYMENT.md\` - Deployment guides

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## Support

- GitHub Issues: https://github.com/yourorg/react-router-starter/issues
- Documentation: https://github.com/yourorg/react-router-starter/wiki
`

  writeFileSync(join(outputDir, 'README.md'), readme)
  log('Created starter README.md')
}

function createArchitectureDoc(outputDir: string) {
  const architecture = `# Architecture Documentation

## Overview

This starter template follows a clean, layered architecture pattern that separates concerns and maintains clear dependencies.

## Layered Architecture

\`\`\`
schemas/db + schemas/form
          ↓
        queries
          ↓
        services
          ↓
   actions and loaders
          ↓
 routes and components
\`\`\`

### Layer Responsibilities

**1. Schemas**
- \`schemas/db/\`: Drizzle table definitions
- \`schemas/form/\`: Zod validation schemas
- Pure data structure definitions
- No business logic

**2. Queries**
- Database operations using Drizzle
- Returns typed rows or explicit absence
- Single-purpose functions
- No business logic, just data access

**3. Services**
- Business logic and rules
- Orchestrates multiple queries
- Handles transactions
- Ownership and permission checks
- Data transformation

**4. Actions & Loaders**
- HTTP request/response handling
- Input validation
- Calls services
- Returns HTTP responses or throws
- Thin orchestration layer

**5. Routes & Components**
- UI rendering
- User interactions
- Route configuration
- Minimal logic

## Feature Structure

Each feature follows this structure:

\`\`\`
features/my-feature/
├── schemas/
│   ├── db/              # Database tables
│   │   ├── my-table.ts
│   │   └── index.ts
│   └── form/            # Validation schemas
│       ├── create.ts
│       ├── update.ts
│       └── index.ts
├── queries/
│   ├── my-queries.ts
│   ├── my-queries.test.ts
│   └── index.ts
├── services/
│   ├── my-service.ts
│   ├── my-service.test.ts
│   └── index.ts
├── actions/
│   ├── my-actions.ts
│   ├── my-actions.test.ts
│   └── index.ts
├── loaders/
│   ├── my-loaders.ts
│   ├── my-loaders.test.ts
│   └── index.ts
├── components/
│   ├── my-component.tsx
│   └── index.ts
├── types/
│   └── index.ts
└── utils/
    └── helpers.ts
\`\`\`

## Key Patterns

### Environment Variables

All environment variables are centrally validated in \`app/env.ts\` using t3-env:

\`\`\`typescript
import { env } from '~/env'

// Type-safe access
const dbUrl = env.DATABASE_URL
\`\`\`

### Authentication & Authorization

**Middleware Pattern:**
\`\`\`typescript
// Protect routes with middleware
export const requireUser = async ({ context }: MiddlewareArgs) => {
  const user = await auth.api.getSession({ headers: context.headers })
  if (!user) throw redirect('/login')
  return { user }
}
\`\`\`

**Permission Checking:**
\`\`\`typescript
import { requirePermission } from '~/features/permissions'

export const requireAdmin = requirePermission('admin:access')
\`\`\`

### Database Operations

**Queries:**
\`\`\`typescript
export async function getUserById(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
}
\`\`\`

**Services:**
\`\`\`typescript
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
  currentUserId: string,
) {
  // Authorization check
  if (userId !== currentUserId) {
    throw new Error('Unauthorized')
  }

  // Business logic
  const user = await getUserById(userId)
  if (!user) throw new Error('User not found')

  // Update
  return await updateUser(userId, data)
}
\`\`\`

### Form Handling

\`\`\`typescript
export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const result = schema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  await service.doSomething(result.data)
  return redirect('/success')
}
\`\`\`

### Error Handling

**Expected Errors:**
\`\`\`typescript
throw new Response('Not found', { status: 404 })
\`\`\`

**Unexpected Errors:**
\`\`\`typescript
// Let them bubble up to error boundaries
throw new Error('Unexpected error')
\`\`\`

### Testing Strategy

**Query Tests:**
\`\`\`typescript
// Mock database
vi.mock('~/lib/database', () => ({
  db: mockDb,
}))
\`\`\`

**Service Tests:**
\`\`\`typescript
// Mock queries
vi.mock('../queries', () => ({
  getUserById: vi.fn(),
}))
\`\`\`

**Action/Loader Tests:**
\`\`\`typescript
// Mock services
vi.mock('../services', () => ({
  userService: {
    updateProfile: vi.fn(),
  },
}))
\`\`\`

## Infrastructure Components

### Email Service

Supports multiple providers and delivery modes:

\`\`\`typescript
import { sendEmail } from '~/features/email'

await sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'John' },
})
\`\`\`

### Media Upload

Supports local and S3 storage:

\`\`\`typescript
import { uploadMedia } from '~/features/media'

const media = await uploadMedia({
  file: buffer,
  filename: 'image.jpg',
  mimeType: 'image/jpeg',
})
\`\`\`

### Audit Logging

Track user actions:

\`\`\`typescript
import { createAuditLog } from '~/features/audit-log'

await createAuditLog({
  userId: user.id,
  action: 'user.updated',
  entityType: 'user',
  entityId: userId,
})
\`\`\`

### Observability

**Metrics:**
\`\`\`typescript
import { metrics } from '~/features/observability'

const counter = metrics.counter('my_counter')
counter.inc()
\`\`\`

**Logging:**
\`\`\`typescript
import { logger } from '~/utils/logger'

logger.info({ userId }, 'User logged in')
\`\`\`

## Best Practices

1. **Single Responsibility**: Each module does one thing well
2. **Dependency Direction**: Always flows downward through layers
3. **Type Safety**: Use TypeScript strictly, avoid \`any\`
4. **Error Handling**: Throw \`Response\` for expected HTTP errors
5. **Testing**: Test at the boundary (service tests, action tests)
6. **Security**: Always validate input, check permissions
7. **Performance**: Use database indexes, optimize queries
8. **Logging**: Log meaningful events without secrets

## Cross-Feature Dependencies

Features can depend on each other when needed:

\`\`\`typescript
// Good: Using public API
import { getUserById } from '~/features/users/queries'

// Bad: Reaching into internals
import { internalHelper } from '~/features/users/utils/internal'
\`\`\`

Use barrel exports (\`index.ts\`) to expose public APIs.

## Database Migrations

1. Update schema in \`schemas/db/\`
2. Generate migration: \`pnpm db:generate\`
3. Review SQL in \`drizzle/\`
4. Apply: \`pnpm db:push\` (dev) or \`pnpm db:migrate\` (prod)

## Routing

This starter uses React Router 7 with file-based routing:

- \`routes/_public.*\` - Public pages with optional locale
- \`routes/admin/*\` - Admin panel (requires admin role)
- \`routes/api/*\` - API endpoints (no locale)
- \`routes/*.tsx\` - Auth pages (login, register, etc.)

## Deployment Considerations

1. **Environment**: Use \`NODE_ENV=production\`
2. **Database**: Run migrations before deployment
3. **Secrets**: Never commit \`.env\`, use secret management
4. **Build**: Run \`pnpm build\` to generate production bundle
5. **Workers**: Deploy email worker separately if using queues
6. **Monitoring**: Configure Sentry and metrics endpoints

## Scaling

This architecture supports:
- Horizontal scaling (stateless application)
- Database read replicas (separate read/write connections)
- Queue-based async processing (RabbitMQ)
- CDN for static assets
- S3 for media storage
`

  writeFileSync(join(outputDir, 'ARCHITECTURE.md'), architecture)
  log('Created ARCHITECTURE.md')
}

function createTemplatePages(outputDir: string) {
  const routesDir = join(outputDir, 'app', 'routes')
  ensureDir(routesDir)

  // Template index page
  const indexPage = `import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [
    { title: 'React Router Starter' },
    {
      name: 'description',
      content: 'A production-ready React Router 7 starter template',
    },
  ]
}

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold">
          React Router 7 Starter
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          A production-ready starter template with authentication, authorization, and more.
        </p>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 text-4xl">🔐</div>
            <h3 className="mb-2 font-semibold">Auth & RBAC</h3>
            <p className="text-sm text-muted-foreground">
              Complete authentication with role-based access control
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 text-4xl">📧</div>
            <h3 className="mb-2 font-semibold">Email Service</h3>
            <p className="text-sm text-muted-foreground">
              Template-based emails with multiple providers
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 text-4xl">📁</div>
            <h3 className="mb-2 font-semibold">Media Upload</h3>
            <p className="text-sm text-muted-foreground">Local and S3 storage with image processing</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Get Started
          </a>
          <a
            href="/register"
            className="rounded-lg border bg-background px-6 py-3 font-semibold transition hover:bg-accent"
          >
            Create Account
          </a>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            Built with React Router 7, React 19, TypeScript, Tailwind CSS, and PostgreSQL
          </p>
        </div>
      </div>
    </div>
  )
}
`

  // Template public layout
  const publicLayout = `import { Link, Outlet } from 'react-router'
import { auth } from '~/lib/auth'

export function meta() {
  return [
    { title: 'React Router Starter' },
    { name: 'description', content: 'A production-ready React Router 7 starter template' },
  ]
}

export async function loader({ request }: { request: Request }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return {
    user: session?.user || null,
  }
}

export default function PublicLayout({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>
}) {
  const data = loaderData

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold">
            React Router Starter
          </Link>
          <nav className="flex items-center gap-4">
            {data?.user ? (
              <>
                <Link to="/admin" className="text-sm hover:underline">
                  Dashboard
                </Link>
                <span className="text-sm text-muted-foreground">{data.user.email}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:underline">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} React Router Starter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
`

  writeFileSync(join(routesDir, '_public._index.tsx'), indexPage)
  writeFileSync(join(routesDir, '_public.tsx'), publicLayout)
  log('Created template pages')
}

async function main() {
  console.log('🚀 Starting React Router 7 Starter Extraction...\n')

  // Clean output directory
  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true })
    log('Cleaned output directory')
  }

  // Create output directory structure
  ensureDir(OUTPUT_DIR)
  ensureDir(join(OUTPUT_DIR, 'app'))

  // 1. Copy root configuration files
  console.log('\n📄 Copying root configuration files...')
  for (const file of ROOT_FILES) {
    const src = join(ROOT_DIR, file)
    const dest = join(OUTPUT_DIR, file)
    if (existsSync(src)) {
      copyFile(src, dest)
      log(`Copied ${file}`)
    } else {
      warn(`Skipped ${file} (not found)`)
    }
  }

  // 2. Copy directories
  console.log('\n📁 Copying directories...')
  for (const dir of COPY_DIRS) {
    const src = join(ROOT_DIR, dir)
    const dest = join(OUTPUT_DIR, dir)
    if (existsSync(src)) {
      copyDirectory(src, dest)
      log(`Copied ${dir}/`)
    } else {
      warn(`Skipped ${dir}/ (not found)`)
    }
  }

  // 3. Copy app structure
  console.log('\n🏗️  Copying app structure...')

  // Copy entire app directory first
  const appDirs = ['components', 'lib', 'hooks', 'utils', 'db', 'types', 'providers', 'paraglide']
  for (const dir of appDirs) {
    const src = join(ROOT_DIR, 'app', dir)
    const dest = join(OUTPUT_DIR, 'app', dir)
    if (existsSync(src)) {
      copyDirectory(src, dest)
      log(`Copied app/${dir}/`)
    }
  }

  // Copy app root files
  const appFiles = ['root.tsx', 'entry.server.tsx', 'app.css', 'routes.ts', 'env.ts']
  for (const file of appFiles) {
    const src = join(ROOT_DIR, 'app', file)
    const dest = join(OUTPUT_DIR, 'app', file)
    if (existsSync(src)) {
      copyFile(src, dest)
      log(`Copied app/${file}`)
    }
  }

  // 4. Copy included features
  console.log('\n🎯 Copying included features...')
  const featuresDir = join(OUTPUT_DIR, 'app', 'features')
  ensureDir(featuresDir)

  for (const feature of INCLUDED_FEATURES) {
    const src = join(ROOT_DIR, 'app', 'features', feature)
    const dest = join(featuresDir, feature)
    if (existsSync(src)) {
      copyDirectory(src, dest)
      log(`Copied feature: ${feature}`)
    } else {
      warn(`Feature not found: ${feature}`)
    }
  }

  // 5. Copy routes (with filtering)
  console.log('\n🛣️  Copying routes...')
  const routesSrc = join(ROOT_DIR, 'app', 'routes')
  const routesDest = join(OUTPUT_DIR, 'app', 'routes')
  ensureDir(routesDest)

  copyDirectory(routesSrc, routesDest, (src) => {
    const relativePath = src.replace(routesSrc + '/', '')

    // Exclude directories
    for (const excludeDir of EXCLUDED_ROUTE_DIRS) {
      if (relativePath.startsWith(excludeDir)) {
        return false
      }
    }

    // Exclude files
    for (const excludeFile of EXCLUDED_ROUTE_FILES) {
      if (relativePath === excludeFile || relativePath.endsWith(`/${excludeFile}`)) {
        return false
      }
    }

    // Exclude admin route patterns
    if (relativePath.startsWith('admin/')) {
      const filename = relativePath.replace('admin/', '')
      for (const pattern of EXCLUDED_ADMIN_ROUTE_PATTERNS) {
        if (filename.startsWith(pattern)) {
          return false
        }
      }
    }

    return true
  })
  log('Copied routes/ (filtered)')

  // Create empty drizzle directory
  ensureDir(join(OUTPUT_DIR, 'drizzle'))
  log('Created empty drizzle/ directory')

  // 6. Clean and update files
  console.log('\n🧹 Cleaning and updating files...')

  // Clean package.json
  cleanPackageJson(join(OUTPUT_DIR, 'package.json'))

  // Update database schema exports
  const schemaPath = join(OUTPUT_DIR, 'app', 'db', 'schema', 'index.ts')
  if (existsSync(schemaPath)) {
    updateDbSchemaExports(schemaPath)
  }

  // Clean message files
  const messagesDir = join(OUTPUT_DIR, 'messages')
  if (existsSync(messagesDir)) {
    cleanMessageFiles(messagesDir)
  }

  // 7. Create documentation
  console.log('\n📚 Creating documentation...')
  createStarterReadme(OUTPUT_DIR)
  createArchitectureDoc(OUTPUT_DIR)

  // 8. Create template pages
  console.log('\n📄 Creating template pages...')
  createTemplatePages(OUTPUT_DIR)

  // 9. Create .gitignore if not exists
  const gitignoreDest = join(OUTPUT_DIR, '.gitignore')
  if (!existsSync(gitignoreDest)) {
    const defaultGitignore = `node_modules
.env
.env.local
dist
build
.react-router
coverage
*.log
.DS_Store
uploads
drizzle/*.sql
.vscode/settings.json
`
    writeFileSync(gitignoreDest, defaultGitignore)
    log('Created .gitignore')
  }

  console.log('\n✅ Extraction complete!')
  console.log(`\n📦 Starter template created in: ${OUTPUT_DIR}`)

  // Create a clean zip file
  console.log('\n📦 Creating distribution zip...')
  try {
    const zipPath = join(ROOT_DIR, 'react-router-starter.zip')

    // Remove old zip if exists
    if (existsSync(zipPath)) {
      rmSync(zipPath, { force: true })
    }

    // Create zip with clean structure: react-router-starter/* instead of deep paths
    execSync(
      `cd "${OUTPUT_DIR}" && zip -r "${zipPath}" . -x '*/node_modules/*' -x '*/.git/*' -x '*/coverage/*' -x '*/build/*' -x '*/dist/*' -x '*/.react-router/*'`,
      { stdio: 'inherit' },
    )

    log(`Created zip at: ${zipPath}`)

    // Show zip contents sample
    console.log('\n📋 Zip structure preview:')
    execSync(`unzip -l "${zipPath}" | head -20`, { stdio: 'inherit' })
  } catch (zipError) {
    warn('Failed to create zip file, but template directory is ready')
    console.error(zipError)
  }

  console.log('\n📝 Next steps:')
  console.log('   1. Review the extracted files')
  console.log('   2. Test the starter: cd starter-template && pnpm install')
  console.log('   3. Extract zip: unzip react-router-starter.zip -d my-new-project')
  console.log('   4. Push to GitHub or distribute the zip')
  console.log('')
}

main().catch((err) => {
  error('Extraction failed!')
  console.error(err)
  process.exit(1)
})
