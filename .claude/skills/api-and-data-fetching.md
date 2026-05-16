---
name: api-and-data-fetching
description: >
  How to choose between React Router loaders and React Query for data fetching in this project.
  Use this skill when deciding where to fetch data, adding client-side polling or optimistic
  updates, setting up React Query queries/mutations, configuring cache strategies, or when
  the user asks about data flow, stale data, refetching, or "should I use a loader or React
  Query for this?". Also trigger when working with TanStack React Query hooks or query keys.
---

# API & Data Fetching Patterns

## The Two Paths

This project has two data fetching mechanisms. Using the wrong one creates bugs and confusion.

| | React Router Loaders | React Query |
|---|---|---|
| **Runs on** | Server (before render) | Client (after render) |
| **Good for** | Initial page data, SEO-critical content, auth-gated data | Polling, optimistic updates, background refetch, infinite scroll |
| **Data flow** | `loader` → `loaderData` prop | `useQuery` → component state |
| **Cache** | None (re-runs on navigation) | Automatic with staleTime/gcTime |

## Decision Rule

**Use a loader when:**
- The data is needed to render the page on first load.
- The data should be available before the component mounts (no loading spinner).
- The route can't render meaningfully without this data.
- SEO needs the content in the initial HTML.
- Examples: product detail page, user list, dashboard stats.

**Use React Query when:**
- The data updates frequently and needs background refetching.
- You want optimistic updates (update UI before server confirms).
- The fetch is triggered by user interaction (not page load).
- You need polling (live scores, notifications, status checks).
- Infinite scroll or paginated client-side fetching.
- Examples: notification count, live task status, search-as-you-type results.

**Use BOTH when:**
- Loader provides the initial data (server-rendered, fast first paint).
- React Query takes over on the client for refetching/polling.
- This is the advanced pattern — only use when you genuinely need both.

## Loader Pattern (Primary)

Most data fetching in this project uses loaders. See `route-and-component.md` for full details.

```typescript
// Route file
export async function loader({ request }: Route.LoaderArgs) {
  return await getProductsLoader(request)
}

export default function ProductsPage({ loaderData }: Route.ComponentProps) {
  const { items, totalCount, page } = loaderData
  // Render immediately — data is already available
}
```

## React Query Pattern

### Query Key Convention

Use array keys with a consistent structure: `[feature, scope, ...params]`.

```typescript
// Query key factory per feature
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: TProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}
```

Place query key factories in `app/features/[feature]/query-keys.ts`.

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { productKeys } from '~/features/products/query-keys'

export function useProductStatus(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/status`)
      if (!res.ok) throw new Error('Failed to fetch status')
      return res.json() as Promise<TProductStatus>
    },
    staleTime: 1000 * 30,   // 30 seconds — data considered fresh
    refetchInterval: 1000 * 60, // Poll every 60 seconds
  })
}
```

### Mutation with Cache Invalidation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '~/features/products/query-keys'

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<TProduct> }) => {
      const res = await fetch(`/api/products/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      })
      if (!res.ok) throw new Error('Update failed')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      // Invalidate the specific product and the list
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```

### Optimistic Update

```typescript
export function useToggleTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      return res.json()
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      const previous = queryClient.getQueryData(taskKeys.detail(id))

      // Optimistically update the cache
      queryClient.setQueryData(taskKeys.detail(id), (old: TTask) => ({
        ...old,
        status,
      }))

      return { previous }
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(taskKeys.detail(id), context?.previous)
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}
```

## Cache Configuration

Default in `app/providers/react-query.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1 minute default
      gcTime: 1000 * 60 * 5,     // 5 minutes garbage collection
      retry: 1,                   // Retry once on failure
      refetchOnWindowFocus: false, // Don't refetch on tab focus
    },
  },
})
```

Override per query when needed:
- Frequently changing data: `staleTime: 1000 * 10` (10 seconds)
- Rarely changing data: `staleTime: 1000 * 60 * 30` (30 minutes)
- Real-time data: add `refetchInterval: 1000 * 5` (poll every 5 seconds)

## Rules

- Never call `fetch()` directly in a component for initial page data — use a loader.
- React Query hooks go in `app/features/[feature]/hooks/` as custom hooks.
- Query key factories go in `app/features/[feature]/query-keys.ts`.
- Always type the return of `queryFn` with `as Promise<TExpectedType>`.
- Always handle loading and error states when using `useQuery`:
  ```typescript
  const { data, isLoading, error } = useQuery(...)
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  ```
- Never mix loader data and React Query for the same data in the same component
  unless you're doing the "loader seeds, Query takes over" pattern intentionally.
