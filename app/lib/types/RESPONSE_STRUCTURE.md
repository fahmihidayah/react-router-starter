# Unified Response Structure

This document describes the unified response structure used across all actions and loaders in the application.

## Overview

All actions and loaders (both API and regular) now return a consistent `ApiResponse<TData>` structure:

```typescript
type ApiResponse<TData = unknown> = {
  success: boolean
  status: number
  data?: TData
  error?: ErrorType
}
```

## Response Types

### Success Response
```typescript
{
  success: true
  status: 200 | 201 | ...
  data: TData
  error?: never
}
```

### Error Response
```typescript
{
  success: false
  status: 400 | 404 | 500 | ...
  data?: never
  error: ErrorType
}
```

## Error Types

The `error` field can be one of three types:

1. **String**: Simple error message
   ```typescript
   { success: false, status: 404, error: "User not found" }
   ```

2. **String Array**: Multiple error messages
   ```typescript
   { success: false, status: 400, error: ["Email is required", "Password is too short"] }
   ```

3. **ValidationErrors**: Field-specific validation errors (from Zod)
   ```typescript
   {
     success: false,
     status: 400,
     error: {
       email: ["Invalid email format"],
       password: ["Password must be at least 8 characters"]
     }
   }
   ```

## Helper Functions

### Creating Responses

```typescript
import { createSuccessResponse, createErrorResponse } from '~/lib/types'

// Success response
const result = createSuccessResponse({ userId: '123' }, 201)
// { success: true, status: 201, data: { userId: '123' } }

// Error response
const error = createErrorResponse('User not found', 404)
// { success: false, status: 404, error: 'User not found' }
```

### Converting to JSON Response (for API routes)

```typescript
import { toJsonResponse } from '~/lib/types'

export async function getUserApiLoader(args: { request: Request }) {
  const result = await userService.findById(id)
  return toJsonResponse(result)
  // Returns Response.json({ success, data/error }, { status })
}
```

### Handling Zod Validation Errors

```typescript
import { zodErrorToValidationErrors, createErrorResponse } from '~/lib/types'

const validation = schema.safeParse(data)
if (!validation.success) {
  return createErrorResponse(
    zodErrorToValidationErrors(validation.error),
    400
  )
}
```

## Usage Examples

### Service Layer

```typescript
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '~/lib/types'

export async function findById(id: string): Promise<ApiResponse<User>> {
  try {
    const user = await userQueries.findById(id)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }
    return createSuccessResponse(user, 200)
  } catch (error) {
    return createErrorResponse('Failed to fetch user', 500)
  }
}
```

### API Actions

```typescript
import { toJsonResponse, zodErrorToValidationErrors, createErrorResponse } from '~/lib/types'

export async function createUserApiAction(args: { request: Request }) {
  const body = await args.request.json()
  const validation = createUserSchema.safeParse(body)

  if (!validation.success) {
    return toJsonResponse(
      createErrorResponse(zodErrorToValidationErrors(validation.error), 400)
    )
  }

  const result = await userService.create(validation.data)
  return toJsonResponse(result)
}
```

### Regular Actions

```typescript
import { redirect } from 'react-router'
import type { ActionArgs, ApiResponse } from '~/lib/types'
import { createErrorResponse, zodErrorToValidationErrors } from '~/lib/types'

export async function createUserAction(args: ActionArgs): Promise<Response | ApiResponse> {
  const formData = await args.request.formData()
  const validation = createUserSchema.safeParse(Object.fromEntries(formData))

  if (!validation.success) {
    return createErrorResponse(zodErrorToValidationErrors(validation.error), 400)
  }

  const result = await userService.create(validation.data)

  if (!result.success) {
    return result
  }

  return redirect('/admin/users')
}
```

### Loaders

```typescript
import type { LoaderArgs, ApiResponse } from '~/lib/types'

export async function getUsersLoader(args: LoaderArgs): Promise<ApiResponse<PaginateDocs<User>>> {
  const result = await userService.findPaginated({ page: 1, limit: 10 })
  return result
}
```

### Using in Routes

```typescript
// Route loader
export async function loader({ request, context, params }: Route.LoaderArgs) {
  return await getUsersLoader({ request, context, params })
}

// In component
export default function UsersPage() {
  const loaderData = useLoaderData<typeof loader>()

  if (!loaderData.success || !loaderData.data) {
    return <div>Error: {loaderData.error}</div>
  }

  return (
    <div>
      {loaderData.data.docs.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

## Benefits

1. **Consistency**: Same response structure across all features
2. **Type Safety**: Full TypeScript support with proper type inference
3. **Reusability**: Shared types can be used in any feature
4. **Error Handling**: Standardized error formats (string, array, validation errors)
5. **Status Codes**: HTTP status codes included in responses
6. **No Redundancy**: API and regular actions/loaders use the same structure

## Migration Guide

When creating new features or updating existing ones:

1. Import the response types from `~/lib/types`
2. Use helper functions (`createSuccessResponse`, `createErrorResponse`)
3. For API routes, use `toJsonResponse` to convert to HTTP responses
4. For validation errors, use `zodErrorToValidationErrors`
5. Access data via `result.data` and errors via `result.error`
6. Check `result.success` before accessing `data`
