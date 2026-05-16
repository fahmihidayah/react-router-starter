---
name: error-handling
description: >
  How to handle errors consistently across routes, loaders, actions, and components in this
  React Router 7 project. Use this skill when adding error boundaries, handling loader/action
  failures, displaying error states to users, or building 404/403/500 pages. Also trigger when
  the user asks about error handling, error responses, toast vs inline errors, or when reviewing
  code that lacks proper error handling.
---

# Error Handling Patterns

## Error Response Shape

All actions return a consistent shape. Never throw from actions — return error objects.

```typescript
// Success
return { success: true, message: 'Product created' }

// Failure with message
return { success: false, message: 'Failed to create product' }

// Failure with field errors (from Zod validation)
return {
  success: false,
  message: 'Validation failed',
  errors: parsed.error.flatten().fieldErrors,
}
```

Type definition (place in `app/types/action-result.ts` or shared types):

```typescript
type TActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}
```

## Route Error Boundaries

React Router 7 supports an `ErrorBoundary` export per route file. It catches errors
thrown in loaders, actions, or during rendering.

```typescript
// In any route file (e.g. dashboard.products._index.tsx)
import { isRouteErrorResponse } from 'react-router'
import type { Route } from './+types/dashboard.products._index'

// Component and loader/action exports...

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    // Thrown responses: 404, 403, etc.
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-4xl font-bold">{error.status}</h1>
        <p className="text-muted-foreground">{error.statusText}</p>
      </div>
    )
  }

  // Unexpected errors
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">Please try again later.</p>
    </div>
  )
}
```

### When to Add ErrorBoundary
- Every layout route (`dashboard.tsx`) — catches errors from all child routes.
- Feature index routes (`dashboard.products._index.tsx`) — feature-specific error UI.
- NOT on every single route — let errors bubble to the nearest parent boundary.

## Throwing vs Returning in Loaders

Loaders CAN throw responses for hard stops (404, unauthorized). Use `data()` for typed responses.

```typescript
import { data, redirect } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
  // Auth check — redirect
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    throw redirect('/login')
  }

  // Not found — throw response
  const product = await productRepository.findById(params.id)
  if (!product) {
    throw data('Product not found', { status: 404 })
  }

  return { product }
}
```

Rules:
- `throw redirect()` for auth failures → sends user to login.
- `throw data(message, { status: 404 })` for missing resources → caught by ErrorBoundary.
- Never `throw new Error()` in loaders for expected cases — use typed responses.
- Unexpected errors (DB down, etc.) naturally throw and get caught by ErrorBoundary.

## Action Error Handling

Actions should NEVER throw. Always return the `TActionResult` shape.

```typescript
export async function createProductAction(request: Request) {
  try {
    const formData = await request.formData()
    const parsed = productSchema.safeParse({
      name: formData.get('name'),
      price: formData.get('price'),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      }
    }

    await productRepository.create({ id: crypto.randomUUID(), ...parsed.data })
    return { success: true, message: 'Product created' }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, message: 'Failed to create product' }
  }
}
```

## Error Display: Toast vs Inline

**Toast (Sonner)** — for action results (success/failure after form submit, delete confirmation):

```typescript
import { toast } from 'sonner'

// After action returns
if (result.success) {
  toast.success(result.message)
} else {
  toast.error(result.message)
}
```

**Inline** — for field validation errors (shown below the input):

```typescript
{errors.name && (
  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
)}
```

### Decision Rule
- User submits a form and something fails server-side → **toast**
- User hasn't submitted yet, field is invalid → **inline under the field**
- Resource not found / unauthorized → **ErrorBoundary** (full page)
- Network/server unreachable → **ErrorBoundary** (full page)

## Logging Errors

Always log server-side errors with context before returning:

```typescript
import { logger } from '~/utils/logger'
const log = logger.create('ProductActions')

catch (error) {
  log.error('Failed to create product', error)
  return { success: false, message: 'Failed to create product' }
}
```

Rules:
- Log scope matches the module: `'ProductActions'`, `'UserLoader'`, `'TaskRepository'`.
- Log the actual error object — don't stringify it.
- Never expose internal error details to the client (DB errors, stack traces).
- Client sees generic messages: "Failed to create product", not "SQLITE_CONSTRAINT: UNIQUE".
