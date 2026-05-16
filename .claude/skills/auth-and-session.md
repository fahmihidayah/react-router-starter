---
name: auth-and-session
description: >
  How authentication and session management work in this project using Better Auth.
  Use this skill when adding auth checks to routes, implementing login/register flows,
  working with sessions, adding role-based access, or configuring Better Auth providers.
  Also trigger when the user asks about auth, session, login, register, protected routes,
  or when reviewing code that accesses user/session data.
---

# Authentication & Session Patterns

## Stack
- **Better Auth 1.6.9** — full-featured auth framework
- Server config: `app/lib/auth.ts`
- Client config: `app/lib/auth-client.ts`
- API catch-all route: `app/routes/api.auth.$.tsx`

## Server-Side Auth (`~/lib/auth`)

Used in loaders and actions. Always pass the request headers.

```typescript
import { auth } from '~/lib/auth'

// Get current session
const session = await auth.api.getSession({
  headers: request.headers,
})

// session shape:
// {
//   user: { id, name, email, image, ... },
//   session: { id, userId, expiresAt, ... }
// }
// Returns null if not authenticated.
```

### Protected Loader Pattern

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    throw redirect('/login')
  }

  // User is authenticated — proceed
  const data = await getProducts(request)
  return { user: session.user, ...data }
}
```

Rules:
- Check session at the top of every protected loader.
- Use `throw redirect('/login')` — not return.
- Pass `session.user` in the return so the component can access it.
- Layout routes (`dashboard.tsx`) should check auth — child routes inherit protection.

### Auth in Actions

```typescript
export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return { success: false, message: 'Unauthorized' }
  }

  // Proceed with mutation, use session.user.id for ownership
  await productRepository.create({
    ...data,
    createdBy: session.user.id,
  })
}
```

## Client-Side Auth (`~/lib/auth-client`)

Used in components for UI state and auth actions.

```typescript
import { authClient } from '~/lib/auth-client'

// Hook: get current session (reactive)
const { data: session, isPending } = authClient.useSession()

// Check if logged in
if (session?.user) {
  // Authenticated
}

// Sign in with email/password
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
})

// Sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
})

// Sign out
await authClient.signOut()
```

### Login Page Pattern

```typescript
// app/routes/login.tsx
import { authClient } from '~/lib/auth-client'
import { useNavigate } from 'react-router'

export default function LoginPage() {
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<TLoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: TLoginFormData) => {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    navigate('/dashboard')
  }

  return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>
}
```

### Redirect If Already Logged In

For login/register pages — redirect authenticated users away:

```typescript
// app/routes/login.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (session?.user) {
    throw redirect('/dashboard')
  }

  return {}
}
```

## The API Catch-All Route

`app/routes/api.auth.$.tsx` handles all Better Auth API routes (`/api/auth/*`).
This is auto-configured — don't modify unless adding custom auth endpoints.

```typescript
// app/routes/api.auth.$.tsx
import { auth } from '~/lib/auth'
import type { Route } from './+types/api.auth.$'

export async function loader({ request }: Route.LoaderArgs) {
  return auth.handler(request)
}

export async function action({ request }: Route.ActionArgs) {
  return auth.handler(request)
}
```

## Role-Based Access (when needed)

If you add roles to users, check in loaders:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    throw redirect('/login')
  }

  if (session.user.role !== 'admin') {
    throw data('Forbidden', { status: 403 })
  }

  return { user: session.user }
}
```

## Rules

- Server-side: always use `auth.api.getSession({ headers: request.headers })`.
- Client-side: always use `authClient.useSession()` for reactive session state.
- Never store session data in localStorage or Zustand — Better Auth manages cookies.
- Never expose session tokens to client JavaScript.
- Check auth in layout loaders to protect entire sections (e.g., `dashboard.tsx`).
- Individual routes under a protected layout don't need duplicate auth checks
  unless they need role-specific access.
- Login/register pages should redirect if already authenticated.
