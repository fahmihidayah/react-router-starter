---
name: testing
description: >
  How to write tests for this React Router 7 project using Vitest, Testing Library, and MSW.
  Use this skill when creating tests for components, server actions, loaders, or repositories.
  Also use when the user asks about testing patterns, mocking strategies, test file organization,
  what to test vs what to skip, or wants to add tests to an existing feature. Trigger even for
  casual mentions like "add tests", "write specs", "test this", or "is this tested".
---

# Testing Patterns

## Stack
- **Unit/Integration**: Vitest + @testing-library/react + jsdom
- **E2E**: Playwright
- **Mocking**: Vitest mocks (`vi.mock`, `vi.fn`) for modules, MSW for HTTP if needed

## Test File Location

Tests live next to the code they test, with `.test.ts` or `.test.tsx` suffix:

```
app/features/products/
├── product-repository.ts
├── product-repository.test.ts        # Repository tests
├── type.ts
├── components/
│   ├── product-card.tsx
│   └── product-card.test.tsx         # Component tests
├── loaders/
│   ├── get-products-loader.ts
│   └── get-products-loader.test.ts   # Loader tests
└── actions/
    ├── create-product-action.ts
    └── create-product-action.test.ts # Action tests
```

Rules:
- Co-locate tests with source files. No separate `__tests__/` directory.
- Name: `[source-file].test.ts(x)` — mirrors the source file exactly.
- Use `.test.tsx` only when the test renders JSX. Otherwise `.test.ts`.

## General Testing Rules

- Test behavior, not implementation. Ask "what should happen?" not "how does it work internally?"
- One `describe` block per function/component. Nest `describe` for sub-scenarios.
- Test names read as sentences: `it('returns paginated results with correct total count')`.
- No `test.only` or `test.skip` committed — CI should run everything.
- Prefer `toEqual` for objects/arrays, `toBe` for primitives, `toMatchObject` for partial checks.
- Always clean up: `afterEach(() => { vi.restoreAllMocks() })`.

---

## 1. Repository Tests

Repositories are the data layer. Test them against a real test database (in-memory SQLite)
or mock the Drizzle `db` instance. Prefer real DB for repositories since they're thin wrappers.

```typescript
// app/features/products/product-repository.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { productRepository } from './product-repository'
import { db } from '~/lib/database'
import { products } from '~/db/schema'

describe('ProductRepository', () => {
  // Seed a known state before each test
  beforeEach(async () => {
    await db.insert(products).values([
      { id: 'p1', name: 'Widget', price: 100, createdAt: new Date(), updatedAt: new Date() },
      { id: 'p2', name: 'Gadget', price: 200, createdAt: new Date(), updatedAt: new Date() },
      { id: 'p3', name: 'Widget Pro', price: 300, createdAt: new Date(), updatedAt: new Date() },
    ])
  })

  // Clean up after each test
  afterEach(async () => {
    await db.delete(products)
  })

  describe('findById', () => {
    it('returns the product when it exists', async () => {
      const result = await productRepository.findById('p1')

      expect(result).toMatchObject({ id: 'p1', name: 'Widget', price: 100 })
    })

    it('returns null when product does not exist', async () => {
      const result = await productRepository.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findManyPaginated', () => {
    it('returns paginated results with correct metadata', async () => {
      const result = await productRepository.findManyPaginated({
        page: 1,
        pageSize: 2,
      })

      expect(result.data).toHaveLength(2)
      expect(result.pagination.totalItems).toBe(3)
      expect(result.pagination.totalPages).toBe(2)
    })

    it('filters results with where clause', async () => {
      const result = await productRepository.findManyPaginated({
        where: like(products.name, '%Widget%'),
        page: 1,
        pageSize: 10,
      })

      expect(result.data).toHaveLength(2)
      expect(result.data.every((p) => p.name.includes('Widget'))).toBe(true)
    })
  })

  describe('create', () => {
    it('creates and returns the new product', async () => {
      const newProduct = { id: 'p4', name: 'New Item', price: 50 }
      const result = await productRepository.create(newProduct)

      expect(result).toMatchObject(newProduct)

      // Verify it's persisted
      const found = await productRepository.findById('p4')
      expect(found).toMatchObject(newProduct)
    })
  })

  describe('delete', () => {
    it('removes the product', async () => {
      await productRepository.delete('p1')

      const result = await productRepository.findById('p1')
      expect(result).toBeNull()
    })
  })

  describe('deleteMany', () => {
    it('removes multiple products by ID', async () => {
      await productRepository.deleteMany(inArray(products.id, ['p1', 'p2']))

      const remaining = await productRepository.findAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('p3')
    })
  })
})
```

### What to Test in Repositories
- ✅ CRUD operations return correct data
- ✅ Pagination metadata (totalItems, totalPages, currentPage)
- ✅ Filtering/search with where clauses
- ✅ Edge cases: empty results, nonexistent IDs, bulk delete with empty array
- ✅ Custom repository methods (if any)
- ❌ Don't test BaseRepository internals — trust the base class

---

## 2. Loader Tests

Loaders are pure async functions that accept a `Request` and return data.
Mock the repository, test the loader logic (parsing params, calling repo, shaping response).

```typescript
// app/features/products/loaders/get-products-loader.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getProductsLoader } from './get-products-loader'

// Mock the repository module
vi.mock('../product-repository', () => ({
  productRepository: {
    findManyPaginated: vi.fn(),
  },
}))

import { productRepository } from '../product-repository'

describe('getProductsLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses page and pageSize from URL search params', async () => {
    const mockResult = {
      data: [],
      pagination: { totalItems: 0, currentPage: 2, pageSize: 5, totalPages: 0 },
    }
    vi.mocked(productRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/products?page=2&pageSize=5')
    await getProductsLoader(request)

    expect(productRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 5 })
    )
  })

  it('defaults to page 1 and pageSize 10 when params are missing', async () => {
    const mockResult = {
      data: [],
      pagination: { totalItems: 0, currentPage: 1, pageSize: 10, totalPages: 0 },
    }
    vi.mocked(productRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/products')
    await getProductsLoader(request)

    expect(productRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 })
    )
  })

  it('passes search filter as like() clause when search param exists', async () => {
    const mockResult = {
      data: [{ id: 'p1', name: 'Widget', price: 100 }],
      pagination: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 },
    }
    vi.mocked(productRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/products?search=widget')
    const result = await getProductsLoader(request)

    expect(productRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.anything() })
    )
    expect(result.items).toHaveLength(1)
  })

  it('returns flat shape expected by the route', async () => {
    const mockResult = {
      data: [{ id: 'p1', name: 'Widget', price: 100 }],
      pagination: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 },
    }
    vi.mocked(productRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/products')
    const result = await getProductsLoader(request)

    expect(result).toEqual({
      items: [{ id: 'p1', name: 'Widget', price: 100 }],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })
  })
})
```

### What to Test in Loaders
- ✅ URL param parsing (page, pageSize, search, filters) with defaults
- ✅ Correct repository method called with correct arguments
- ✅ Response shape matches what the route component expects
- ✅ Edge cases: missing params, invalid numbers, empty search
- ❌ Don't test the repository logic itself — that's the repository test's job

---

## 3. Action Tests

Actions handle mutations. Mock the repository, test input parsing + response shape.

```typescript
// app/features/products/actions/create-product-action.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createProductAction } from './create-product-action'

vi.mock('../product-repository', () => ({
  productRepository: {
    create: vi.fn(),
  },
}))

import { productRepository } from '../product-repository'

// Helper to build a Request with FormData
function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return new Request('http://localhost/dashboard/products', {
    method: 'POST',
    body: formData,
  })
}

describe('createProductAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a product and returns success', async () => {
    vi.mocked(productRepository.create).mockResolvedValue({
      id: 'generated-id',
      name: 'New Widget',
      price: 150,
    })

    const request = buildFormRequest({ name: 'New Widget', price: '150' })
    const result = await createProductAction(request)

    expect(result.success).toBe(true)
    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Widget', price: 150 })
    )
  })

  it('returns failure when repository throws', async () => {
    vi.mocked(productRepository.create).mockRejectedValue(new Error('DB error'))

    const request = buildFormRequest({ name: 'Fail', price: '100' })
    const result = await createProductAction(request)

    expect(result.success).toBe(false)
    expect(result.message).toContain('Failed')
  })
})
```

```typescript
// app/features/products/actions/delete-many-product-action.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { deleteManyProductsAction } from './delete-many-product-action'

vi.mock('../product-repository', () => ({
  productRepository: {
    deleteMany: vi.fn(),
  },
}))

import { productRepository } from '../product-repository'

describe('deleteManyProductsAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes multiple products and returns success', async () => {
    vi.mocked(productRepository.deleteMany).mockResolvedValue(undefined)

    const result = await deleteManyProductsAction(['p1', 'p2', 'p3'])

    expect(result.success).toBe(true)
    expect(productRepository.deleteMany).toHaveBeenCalledOnce()
  })

  it('returns failure when given empty array', async () => {
    const result = await deleteManyProductsAction([])

    expect(result.success).toBe(false)
    expect(productRepository.deleteMany).not.toHaveBeenCalled()
  })

  it('returns failure when repository throws', async () => {
    vi.mocked(productRepository.deleteMany).mockRejectedValue(new Error('DB error'))

    const result = await deleteManyProductsAction(['p1'])

    expect(result.success).toBe(false)
  })
})
```

### What to Test in Actions
- ✅ Successful mutation returns `{ success: true }`
- ✅ FormData parsing extracts correct values
- ✅ Error handling returns `{ success: false }` with message
- ✅ Edge cases: empty IDs array, missing fields, invalid data
- ✅ Correct repository method called with correct arguments
- ❌ Don't test form validation here — that's the Zod schema / form test's job

---

## 4. Component Tests

Test components with Testing Library. Focus on what the user sees and does.

```typescript
// app/features/products/components/product-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from './product-card'
import type { TProduct } from '../type'

const mockProduct: TProduct = {
  id: 'p1',
  name: 'Test Widget',
  price: 2500,
  description: 'A fine widget',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Widget')).toBeInTheDocument()
    expect(screen.getByText(/2,500/)).toBeInTheDocument()
  })

  it('calls onSelect with product id when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<ProductCard product={mockProduct} onSelect={onSelect} />)

    await user.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith('p1')
  })

  it('does not crash when onSelect is not provided', async () => {
    const user = userEvent.setup()

    render(<ProductCard product={mockProduct} />)

    // Should not throw
    await user.click(screen.getByRole('button'))
  })
})
```

### Form Component Tests

```typescript
// app/features/products/components/product-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from './product-form'

describe('ProductForm', () => {
  it('submits valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<ProductForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'New Product')
    await user.type(screen.getByLabelText(/price/i), '999')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Product', price: 999 })
      )
    })
  })

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<ProductForm onSubmit={onSubmit} />)

    // Submit without filling name
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('pre-fills values in edit mode', () => {
    const existingProduct = { name: 'Existing', price: 500, description: 'Desc' }

    render(<ProductForm onSubmit={vi.fn()} defaultValues={existingProduct} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Existing')
    expect(screen.getByLabelText(/price/i)).toHaveValue(500)
  })
})
```

### What to Test in Components
- ✅ Renders expected text, labels, buttons
- ✅ User interactions trigger callbacks with correct arguments
- ✅ Form validation shows/hides error messages
- ✅ Conditional rendering (loading states, empty states, error states)
- ✅ Accessibility: elements findable by role, label
- ❌ Don't test internal state values — test what the user sees
- ❌ Don't test styling/CSS classes — test behavior
- ❌ Don't test Radix UI internals (dropdown opening, etc.)

---

## Testing Utilities

### Helper: Build Request with FormData

```typescript
// app/test-utils/build-form-request.ts
export function buildFormRequest(
  url: string,
  data: Record<string, string>,
  method = 'POST'
): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return new Request(url, { method, body: formData })
}
```

### Helper: Build Request with Search Params

```typescript
// app/test-utils/build-search-request.ts
export function buildSearchRequest(
  base: string,
  params: Record<string, string>
): Request {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return new Request(url.toString())
}
```

### Custom Render with Providers

If components need React Query or other providers:

```typescript
// app/test-utils/render.tsx
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
```

---

## Commands

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test -- --run     # Run once (CI)
pnpm test -- path/to/file.test.ts   # Run specific file
```
