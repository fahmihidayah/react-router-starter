---
name: code-review
description: >
  How to review code in this project. Use this skill when the user asks Claude to review code,
  check a PR, audit a file, find issues, or improve code quality. Also trigger when asked to
  "look at this", "what's wrong with this", "is this good", "can you review", or any request
  to evaluate existing code. Covers both what to check and how to communicate feedback.
---

# Code Review Standards

## Review Priorities (in order)

1. **Correctness** — Does it work? Logic errors, off-by-ones, null access, race conditions.
2. **Security** — SQL injection (raw queries), XSS, auth bypass, exposed secrets.
3. **Error handling** — Missing try/catch in actions, unhandled null from repository, no ErrorBoundary.
4. **Type safety** — Any `any` usage, missing types, incorrect type assertions.
5. **Architecture** — Correct layer (loader vs action vs component), feature boundary violations.
6. **Naming** — Follows conventions (T prefix for types, kebab-case files, descriptive names).
7. **Performance** — Unnecessary re-renders, N+1 queries, missing pagination.
8. **Readability** — Clear intent, reasonable function length, no clever tricks.

Do NOT flag: formatting issues (Biome handles it), import order, minor style preferences.

## Red Flags (Always Flag)

These should always be called out:

```
🔴 `any` type usage — suggest `unknown` + narrowing or proper type
🔴 Missing error handling in action — every action needs try/catch
🔴 Raw SQL without parameterization — use Drizzle operators
🔴 Secret/credential in code — should be in .env
🔴 `console.log` left in — use logger.create() instead
🔴 Default export on non-route file — named exports only
🔴 Cross-feature import — features must import through index.ts
🔴 Missing null check after findById — it can return null
🔴 Mutation in a loader — loaders are GET, use actions for mutations
🔴 useEffect for data fetching — use loader or React Query
```

## Yellow Flags (Mention, Not Block)

Worth noting but not necessarily wrong:

```
🟡 Component > 200 lines — consider splitting
🟡 Prop drilling > 2 levels — consider context or composition
🟡 Inline type definition > 5 fields — extract to named type with T prefix
🟡 Multiple responsibilities in one function — may need decomposition
🟡 Magic numbers/strings — extract to constants
🟡 No loading/error state in component using React Query
🟡 Missing aria-label on icon-only button
```

## Review Feedback Format

When reviewing, organize feedback by severity. Be specific — show the problem AND the fix.

```
### Issues

**🔴 Missing error handling in createProductAction (line 15)**
The action has no try/catch. If the repository throws, the route will crash
instead of returning a user-friendly error.

Fix:
- Wrap in try/catch
- Return `{ success: false, message: 'Failed to create product' }`
- Log the error with `logger.create('ProductActions')`

**🟡 Component could be split (product-list.tsx, 280 lines)**
The table configuration, filter logic, and delete handling could be
extracted into separate hooks or sub-components.

### Looks Good
- Type safety is solid throughout
- Loader correctly validates session before fetching data
- Pagination params have sensible defaults
```

## Architecture Checks

When reviewing feature code, verify the layer boundaries:

```
Route file (app/routes/)
├── imports loader from features/[name]/loaders/     ✅
├── imports action from features/[name]/actions/     ✅
├── imports component from features/[name]/components/ ✅
├── imports UI from components/ui/                   ✅
├── calls repository directly                       🔴 Wrong layer
├── imports from another feature's internals         🔴 Boundary violation
└── has business logic inline                        🟡 Extract to loader/action
```

## Testing Check

When reviewing a new feature or significant change:
- Does it have tests for the repository methods used?
- Does it have tests for the loader (param parsing, response shape)?
- Does it have tests for the action (success, failure, edge cases)?
- Does it have tests for interactive components (user events, validation)?

If tests are missing, note which tests should be added and what they should cover.

## Checklist for Common Patterns

### New CRUD Feature
- [ ] Schema has T-prefixed types exported
- [ ] Repository extends BaseRepository
- [ ] Loaders handle missing params gracefully
- [ ] Actions return consistent `{ success, message }` shape
- [ ] Bulk delete uses `inArray()` not raw SQL
- [ ] Route has ErrorBoundary for 404/unexpected errors
- [ ] List page has empty state
- [ ] Delete has confirmation dialog
- [ ] Toast notifications on action results

### New Form
- [ ] Zod schema defined, type inferred with `z.infer`
- [ ] Using zodResolver with react-hook-form
- [ ] All fields show validation errors inline
- [ ] Submit button disabled during submission
- [ ] Server errors shown via toast
- [ ] Edit form pre-fills with defaultValues

### New Component
- [ ] Named export (no default export)
- [ ] Props typed with `T[Name]Props`
- [ ] Uses semantic color tokens (not raw colors)
- [ ] Icon-only buttons have aria-label
- [ ] Responsive (works on mobile)
- [ ] Handles empty/loading states if applicable

---

## Performance Review Checklist

When reviewing code for performance issues:

### Database Operations
- [ ] **Pagination**: Large lists use `findManyPaginated()` with reasonable limits (20-50)
- [ ] **N+1 queries**: Related data fetched with joins/relations, not in loops
- [ ] **Indexes**: Frequently queried columns have database indexes
- [ ] **Select specific columns**: Not selecting all columns when only a few are needed
- [ ] **Parallel fetching**: Independent queries use `Promise.all()`, not sequential awaits

### React Optimization
- [ ] **Large lists**: Components in lists wrapped with `React.memo()` when appropriate
- [ ] **Expensive calculations**: Heavy computations use `useMemo()` with correct dependencies
- [ ] **Callback stability**: Functions passed to memoized children use `useCallback()`
- [ ] **Unnecessary re-renders**: Parent re-renders don't cause unnecessary child re-renders
- [ ] **Component size**: Large components (> 200 lines) are candidates for splitting

### Bundle Size
- [ ] **Lazy loading**: Heavy components (editors, charts) are lazy-loaded with `React.lazy()`
- [ ] **Tree-shaking**: Imports use named imports, not default imports from barrel files
- [ ] **Heavy libraries**: No unnecessarily heavy libraries (moment.js, lodash, full recharts)
- [ ] **Code splitting**: Routes are properly split (automatic with React Router)

### Images & Assets
- [ ] **Image optimization**: Images use modern formats (WebP, AVIF)
- [ ] **Lazy loading**: Images below fold have `loading="lazy"`
- [ ] **Responsive images**: Large images use `srcSet` for different screen sizes
- [ ] **SVG for icons**: Vector graphics used for icons, not PNGs

### Caching
- [ ] **React Query staleTime**: Appropriate `staleTime` set based on data freshness needs
- [ ] **Loader caching**: Expensive loader operations cached with TTL
- [ ] **Static data**: Rarely-changing data cached indefinitely

---

## Security Review Checklist

Critical security checks for every code review:

### Authentication & Authorization
- [ ] **Protected routes**: All admin/private routes check session in loader
- [ ] **Session validation**: `auth.api.getSession({ headers: request.headers })` used correctly
- [ ] **Redirect on failure**: Unauthenticated users redirected to login, not shown error
- [ ] **Role checks**: Role-based access checks in place where needed
- [ ] **No client-side auth**: Auth state never stored in localStorage or Zustand

### Input Validation
- [ ] **All inputs validated**: Every action validates input with Zod schema
- [ ] **No `any` types**: All types are explicit, no `any` that bypasses type checking
- [ ] **SQL injection safe**: All queries use Drizzle ORM (parameterized), no raw SQL strings
- [ ] **Type coercion safe**: Numeric inputs use `z.coerce.number()` or proper parsing
- [ ] **File uploads**: File types and sizes validated (if applicable)

### Data Exposure
- [ ] **No secrets in client**: Environment variables with secrets NOT prefixed with `VITE_`
- [ ] **No secrets in logs**: `console.log()` doesn't expose secrets or sensitive data
- [ ] **No stack traces to users**: Error messages generic, internal errors logged server-side
- [ ] **Sensitive data filtered**: API responses don't leak sensitive fields (passwords, tokens)
- [ ] **User isolation**: Users can only access their own data, not others'

### XSS Prevention
- [ ] **No `dangerouslySetInnerHTML`**: HTML not injected unless sanitized
- [ ] **User content sanitized**: User-generated content sanitized before rendering
- [ ] **React escaping**: Relying on React's automatic escaping for user content
- [ ] **No `eval()` or `Function()`**: No dynamic code execution

### CSRF & Request Security
- [ ] **Better Auth CSRF**: Better Auth's built-in CSRF protection enabled
- [ ] **Form actions**: All mutations go through actions, not GET requests
- [ ] **Intent validation**: Multi-intent actions validate intent field

### Environment & Configuration
- [ ] **Strong secrets**: `BETTER_AUTH_SECRET` is 32+ characters, randomly generated
- [ ] **No hardcoded secrets**: All secrets in environment variables
- [ ] **`.env` in `.gitignore`**: `.env` files not committed to version control
- [ ] **Production mode**: `NODE_ENV=production` in production environment
- [ ] **HTTPS enforced**: Production uses HTTPS, not HTTP

### Dependencies
- [ ] **No known vulnerabilities**: Run `pnpm audit` and address issues
- [ ] **Dependencies up to date**: Critical security updates applied
- [ ] **Minimal dependencies**: No unnecessary packages installed

---

## Red Flag Examples & Fixes

### 🔴 SQL Injection Risk
```typescript
// ❌ BAD: Raw SQL with string interpolation
const results = await db.run(sql`SELECT * FROM users WHERE email = '${email}'`)

// ✅ GOOD: Parameterized query with Drizzle
const results = await db.select().from(users).where(eq(users.email, email))
```

### 🔴 XSS Vulnerability
```typescript
// ❌ BAD: Rendering raw HTML from user input
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ GOOD: Let React escape it automatically
<div>{userContent}</div>

// ✅ GOOD: If HTML needed, sanitize first
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### 🔴 Secret Exposure
```typescript
// ❌ BAD: Secret exposed to client
VITE_AUTH_SECRET="my-secret-key"

// ✅ GOOD: Server-only (no VITE_ prefix)
BETTER_AUTH_SECRET="my-secret-key"
```

### 🔴 Missing Auth Check
```typescript
// ❌ BAD: No auth check in admin loader
export async function loader() {
  return await getAdminData()
}

// ✅ GOOD: Auth check before data fetch
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) throw redirect('/login')
  return await getAdminData()
}
```

### 🔴 N+1 Query Problem
```typescript
// ❌ BAD: Queries in loop (N+1)
const posts = await postRepository.findAll()
for (const post of posts) {
  post.author = await userRepository.findById(post.authorId) // N queries!
}

// ✅ GOOD: Fetch with relations in one query
const posts = await db.query.posts.findMany({
  with: { author: true }
})
```

### 🔴 Performance Issue - No Pagination
```typescript
// ❌ BAD: Loading all records at once
const products = await productRepository.findAll() // Could be 10,000+

// ✅ GOOD: Paginated
const products = await productRepository.findManyPaginated({
  page: 1,
  limit: 20
})
```
