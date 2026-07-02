---
name: performance-optimization
description: >
  Performance optimization patterns for React Router 7 applications. Covers code splitting,
  lazy loading, React optimization (memoization, callbacks), bundle analysis, database query
  optimization, and caching strategies. Use this skill when optimizing slow pages, reducing
  bundle size, fixing performance bottlenecks, or when the user asks about performance,
  optimization, slow rendering, bundle size, or lazy loading.
---

# Performance Optimization Patterns

## Performance Checklist

Before optimizing, measure first:
1. Use browser DevTools Performance tab to identify bottlenecks
2. Check bundle size with `pnpm build && ls -lh build/client/assets`
3. Profile component re-renders with React DevTools Profiler
4. Monitor loader/action response times in Network tab

**Rule**: Don't optimize prematurely. Only optimize when you've identified a real problem.

---

## Code Splitting & Lazy Loading

### Route-Level Code Splitting (Automatic)

React Router 7 automatically code-splits each route. Each route file becomes a separate chunk.

```typescript
// app/routes/admin/products._index.tsx
// This automatically becomes its own chunk — no extra work needed

export async function loader({ request }: Route.LoaderArgs) {
  return await getProductsLoader(request)
}

export default function ProductsPage() {
  // This component and its imports are in a separate chunk
}
```

**What's included in the route chunk:**
- The route component itself
- Direct imports (components, utilities)
- NOT included: Shared UI components (bundled separately)

### Lazy Loading Heavy Components

For components that are conditionally rendered or below the fold:

```typescript
import { lazy, Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'

// Lazy load heavy editor component
const RichEditor = lazy(() => import('~/components/ui/rich-editor'))

export function PostForm() {
  const [showEditor, setShowEditor] = useState(false)

  return (
    <div>
      {showEditor ? (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <RichEditor />
        </Suspense>
      ) : (
        <Button onClick={() => setShowEditor(true)}>Open Editor</Button>
      )}
    </div>
  )
}
```

**Use lazy loading for:**
- Rich text editors (Lexical, TipTap)
- Chart libraries (Recharts, Chart.js)
- Data visualization components
- Modals/dialogs that aren't immediately visible
- Admin-only features on public pages

**Don't lazy load:**
- Small components (< 50KB)
- Above-the-fold content
- Critical UI elements

### Dynamic Imports for Utilities

For heavy utility libraries used conditionally:

```typescript
// app/features/export/actions/export-csv-action.ts

export async function exportCsvAction(data: unknown[]) {
  // Only load Papa Parse when CSV export is triggered
  const Papa = await import('papaparse')

  const csv = Papa.unparse(data)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="export.csv"',
    },
  })
}
```

---

## React Optimization

### Memoization: useMemo

Use `useMemo` for expensive calculations that don't need to recompute on every render:

```typescript
import { useMemo } from 'react'

export function ProductList({ products }: { products: TProduct[] }) {
  // Expensive calculation — only recompute when products change
  const sortedProducts = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => b.price - a.price)
      .filter((p) => p.stock > 0)
  }, [products])

  return (
    <div>
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**When to use `useMemo`:**
- ✅ Expensive calculations (sorting, filtering large arrays)
- ✅ Derived data that's passed to child components
- ✅ Calculations that run on every render and take > 5ms

**When NOT to use `useMemo`:**
- ❌ Simple calculations (adding numbers, string concatenation)
- ❌ Creating objects/arrays that don't trigger re-renders
- ❌ Premature optimization without profiling

### Memoization: useCallback

Use `useCallback` for functions passed as props to prevent child re-renders:

```typescript
import { useCallback, memo } from 'react'

// Child component wrapped in memo
const ProductCard = memo(({ product, onDelete }: TProductCardProps) => {
  return (
    <Card>
      <CardContent>{product.name}</CardContent>
      <Button onClick={() => onDelete(product.id)}>Delete</Button>
    </Card>
  )
})

export function ProductList({ products }: { products: TProduct[] }) {
  const navigate = useNavigate()

  // Memoize callback to prevent ProductCard re-renders
  const handleDelete = useCallback((id: string) => {
    // Delete logic
    navigate('/admin/products')
  }, [navigate])

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onDelete={handleDelete} />
      ))}
    </div>
  )
}
```

**When to use `useCallback`:**
- ✅ Functions passed to memoized child components
- ✅ Dependencies of other hooks (useEffect, useMemo)
- ✅ Event handlers passed to large lists

**When NOT to use `useCallback`:**
- ❌ Functions only used within the component (not passed down)
- ❌ Event handlers on single elements
- ❌ Without profiling to confirm re-render issues

### React.memo for Component Memoization

Wrap components in `memo()` to prevent re-renders when props haven't changed:

```typescript
import { memo } from 'react'

// Expensive component that renders often
export const ProductCard = memo(({ product }: { product: TProduct }) => {
  // Heavy rendering logic
  return <Card>{/* ... */}</Card>
})

// With custom comparison function
export const ProductCard = memo(
  ({ product }: { product: TProduct }) => {
    return <Card>{/* ... */}</Card>
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.product.id === nextProps.product.id
  }
)
```

**When to use `memo()`:**
- ✅ Components in large lists
- ✅ Components that re-render frequently with same props
- ✅ Heavy components with expensive render logic

**When NOT to use `memo()`:**
- ❌ Components that always receive new props
- ❌ Lightweight components (< 50 DOM elements)
- ❌ Without measuring actual performance improvement

---

## Database Query Optimization

### Avoid N+1 Queries

**Bad** (N+1 queries):
```typescript
// Fetches posts, then makes N separate queries for authors
const posts = await postRepository.findAll()
for (const post of posts) {
  post.author = await userRepository.findById(post.authorId) // ❌ N queries
}
```

**Good** (single query with join):
```typescript
// Use Drizzle relations to fetch in one query
const posts = await db.query.posts.findMany({
  with: {
    author: true,
  },
})
```

### Use Pagination

Always paginate large datasets:

```typescript
// app/features/products/loaders/get-products-loader.ts
export async function getProductsLoader(request: Request) {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)

  return await productRepository.findManyPaginated({
    page,
    limit, // Don't load all records at once
  })
}
```

### Index Database Columns

Add indexes to frequently queried columns:

```typescript
// app/db/schema.ts
import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(), // Frequently queried
  authorId: text('author_id').notNull(), // Foreign key
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  slugIdx: index('slug_idx').on(table.slug), // ✅ Add index
  authorIdx: index('author_idx').on(table.authorId), // ✅ Add index
}))
```

After adding indexes, run `pnpm db:push`.

### Select Only Required Columns

Don't fetch unnecessary data:

```typescript
// Bad: Fetches all columns
const products = await db.select().from(products)

// Good: Select only what you need
const products = await db
  .select({
    id: products.id,
    name: products.name,
    price: products.price,
  })
  .from(products)
```

---

## Caching Strategies

### React Query Cache (Client-Side)

Configure appropriate stale times for different data types:

```typescript
// app/providers/react-query.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1 minute default
      gcTime: 1000 * 60 * 5,     // 5 minutes garbage collection
      retry: 1,
    },
  },
})
```

Per-query configuration:

```typescript
// Fast-changing data (live scores, notifications)
useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  staleTime: 1000 * 10, // 10 seconds
  refetchInterval: 1000 * 30, // Poll every 30 seconds
})

// Slow-changing data (user profile, settings)
useQuery({
  queryKey: ['user-profile', userId],
  queryFn: () => fetchUserProfile(userId),
  staleTime: 1000 * 60 * 30, // 30 minutes
})

// Static data (categories, tags)
useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  staleTime: Number.POSITIVE_INFINITY, // Never refetch (cache forever)
})
```

### Loader Data Caching (Server-Side)

React Router loaders re-run on every navigation. For expensive operations, add caching:

```typescript
// app/lib/cache.ts
const cache = new Map<string, { data: unknown; timestamp: number }>()

export function cacheGet<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const isExpired = Date.now() - entry.timestamp > ttl
  if (isExpired) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

export function cacheSet(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}
```

Use in loaders:

```typescript
// app/features/categories/loaders/get-categories-loader.ts
import { cacheGet, cacheSet } from '~/lib/cache'

export async function getCategoriesLoader() {
  const CACHE_KEY = 'categories'
  const TTL = 1000 * 60 * 5 // 5 minutes

  // Check cache first
  const cached = cacheGet<TCategory[]>(CACHE_KEY, TTL)
  if (cached) return { categories: cached }

  // Fetch from DB
  const categories = await categoryRepository.findAll()

  // Store in cache
  cacheSet(CACHE_KEY, categories)

  return { categories }
}
```

**When to cache loaders:**
- ✅ Expensive DB queries that don't change often
- ✅ External API calls
- ✅ Complex calculations

**When NOT to cache:**
- ❌ User-specific data (different per user)
- ❌ Real-time data
- ❌ Data that changes frequently

---

## Bundle Size Optimization

### Analyze Bundle Size

```bash
pnpm build
ls -lh build/client/assets/*.js
```

Or use a bundle analyzer:

```bash
npm install -D vite-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'vite-plugin-visualizer'

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({ open: true }), // Opens report after build
  ],
})
```

### Replace Heavy Libraries

Common heavy libraries and lightweight alternatives:

| Heavy Library | Size | Lightweight Alternative | Size |
|---------------|------|------------------------|------|
| moment.js | ~70KB | date-fns (tree-shakeable) | ~5KB per function |
| lodash | ~70KB | lodash-es (tree-shakeable) | ~3KB per function |
| axios | ~14KB | native fetch | 0KB (built-in) |
| Recharts | ~120KB | Chart.js | ~60KB |

**Example**: Replace Moment.js with date-fns:

```typescript
// Before (moment.js)
import moment from 'moment'
const formatted = moment(date).format('YYYY-MM-DD')

// After (date-fns)
import { format } from 'date-fns'
const formatted = format(date, 'yyyy-MM-dd')
```

### Tree-Shaking Best Practices

Ensure imports are tree-shakeable:

```typescript
// Bad: Imports entire lodash library
import _ from 'lodash'
const result = _.uniq(array)

// Good: Imports only uniq function
import { uniq } from 'lodash-es'
const result = uniq(array)

// Better: Direct import (best tree-shaking)
import uniq from 'lodash-es/uniq'
const result = uniq(array)
```

---

## Image Optimization

### Use Appropriate Formats

- **WebP**: Modern format, 30% smaller than JPEG
- **AVIF**: Even smaller, but less browser support
- **SVG**: For icons and logos (scalable, tiny)

### Lazy Load Images

```typescript
export function ProductGrid({ products }: { products: TProduct[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <img
          key={product.id}
          src={product.image}
          alt={product.name}
          loading="lazy" // ✅ Native lazy loading
          width={300}
          height={300}
        />
      ))}
    </div>
  )
}
```

### Responsive Images

```tsx
<img
  src="/images/product-small.webp"
  srcSet="
    /images/product-small.webp 300w,
    /images/product-medium.webp 600w,
    /images/product-large.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Product"
/>
```

---

## Loader Performance Best Practices

### Parallel Data Fetching

Fetch independent data in parallel:

```typescript
// Bad: Sequential fetches (slow)
export async function loader() {
  const products = await productRepository.findAll() // Wait
  const categories = await categoryRepository.findAll() // Wait
  return { products, categories }
}

// Good: Parallel fetches (fast)
export async function loader() {
  const [products, categories] = await Promise.all([
    productRepository.findAll(), // Fetch concurrently
    categoryRepository.findAll(), // Fetch concurrently
  ])
  return { products, categories }
}
```

### Defer Non-Critical Data

For slow loaders, defer non-critical data to avoid blocking initial render:

```typescript
import { defer } from 'react-router'

export async function loader() {
  // Critical: Load immediately (blocks render)
  const products = await productRepository.findAll()

  // Non-critical: Load in background (doesn't block)
  const analytics = productRepository.getAnalytics() // Promise, not awaited

  return defer({
    products, // Resolved
    analytics, // Promise (deferred)
  })
}

// In component
export default function ProductsPage() {
  const { products, analytics } = useLoaderData<typeof loader>()

  return (
    <div>
      <ProductList products={products} />

      <Suspense fallback={<Skeleton />}>
        <Await resolve={analytics}>
          {(data) => <AnalyticsChart data={data} />}
        </Await>
      </Suspense>
    </div>
  )
}
```

---

## Performance Monitoring

### Add Performance Marks

```typescript
// In loader
export async function loader() {
  performance.mark('loader-start')

  const data = await fetchData()

  performance.mark('loader-end')
  performance.measure('loader-duration', 'loader-start', 'loader-end')

  return data
}
```

View in DevTools Performance tab → User Timing section.

### Log Slow Operations

```typescript
import { logger } from '~/utils/logger'

export async function expensiveOperation() {
  const start = performance.now()

  const result = await heavyCalculation()

  const duration = performance.now() - start
  if (duration > 1000) {
    logger.create('Performance').warn(`Slow operation: ${duration}ms`)
  }

  return result
}
```

---

## Quick Wins Checklist

- [ ] Enable compression (Gzip/Brotli) on your hosting
- [ ] Lazy load heavy components (editors, charts)
- [ ] Add database indexes to frequently queried columns
- [ ] Use pagination for all list endpoints
- [ ] Replace heavy libraries with lighter alternatives
- [ ] Use `loading="lazy"` on images below the fold
- [ ] Fetch independent data in parallel with `Promise.all()`
- [ ] Add `staleTime` to React Query for slow-changing data
- [ ] Use `memo()` for components in large lists
- [ ] Profile with React DevTools before optimizing React code
