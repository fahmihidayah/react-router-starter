# Starter App — React Router 7.11.0

## Stack
- React Router 7.11.0 (file-based routing via flatRoutes, SSR)
- TypeScript 5.8, Vite 7.1, Biome 2.4
- Drizzle ORM + SQLite (better-sqlite3), Better Auth
- UI: Radix UI + Tailwind 4, Lucide icons, Sonner toasts
- Forms: React Hook Form + Zod
- Data: TanStack React Query + React Table

## Critical Conventions
- File naming: kebab-case for all files.
- Types: `T` prefix (`TUser`, `TTask`). Interfaces: `I` prefix if needed.
- Use `$inferSelect` / `$inferInsert` from Drizzle for DB types.
- No `any`. Use `unknown` + type narrowing.
- No default exports except route components (React Router requires it).
- Imports use `~/` alias (maps to `app/`).
- Formatting: Biome — single quotes, no semicolons, 2-space indent, 100 char line width.

## Directory Structure
```
app/
├── routes/           # File-based routing (flatRoutes convention)
├── features/         # Feature modules: components/, loaders/, actions/, type.ts
├── components/ui/    # Shared Radix UI base components
├── components/admin/ # Admin-specific (DataTable, DeleteDialog)
├── components/layouts/ # Header, Footer
├── lib/              # Core services (auth, database, repository)
├── db/               # Drizzle schema definitions
├── hooks/            # Shared custom hooks
├── providers/        # React Query provider
└── utils/            # Utilities (logger)
```

## Route File Naming (flatRoutes)
- `_index.tsx` → index route
- `dashboard.tsx` → layout route for /dashboard
- `dashboard.users.$id.tsx` → /dashboard/users/:id
- `api.auth.$.tsx` → catch-all /api/auth/*

## Key Patterns (details in .claude/skills/)
- **Routes**: loader → server data, action → mutations, default export → component
- **Features**: `features/[name]/` with loaders/, actions/, components/, type.ts
- **Data**: BaseRepository pattern with typed CRUD methods
- **Forms**: Zod schema → RHF zodResolver → Radix UI components
- **Auth**: Better Auth server (`~/lib/auth`) + client (`~/lib/auth-client`)

## Commands
- `pnpm dev` — dev server with HMR
- `pnpm db:push` — push schema changes
- `pnpm db:seed` — seed database
- `pnpm lint:fix` — fix lint issues
- `pnpm typecheck` — TypeScript checking
- `pnpm build` — production build

## Skills Reference
- Route & component patterns: `.claude/skills/route-and-component.md`
- Feature CRUD workflow: `.claude/skills/feature-crud.md`
- Data layer (repository, schema): `.claude/skills/data-layer.md`
- Form & validation patterns: `.claude/skills/form-and-validation.md`
- Testing (components, loaders, actions, repos): `.claude/skills/testing.md`
- Error handling (boundaries, responses, toast/inline): `.claude/skills/error-handling.md`
- API & data fetching (loaders vs React Query): `.claude/skills/api-and-data-fetching.md`
- UI components (Radix, Tailwind, icons, a11y): `.claude/skills/ui-component.md`
- Code review standards: `.claude/skills/code-review.md`
- Auth & sessions (Better Auth): `.claude/skills/auth-and-session.md`
