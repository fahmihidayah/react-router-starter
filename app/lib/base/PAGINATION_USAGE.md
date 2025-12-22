# Enhanced Pagination Usage Guide

The BaseRepository now includes comprehensive pagination support with detailed pagination metadata.

## PaginationResult Type

All paginated methods return a `PaginationResult<T>` with the following structure:

```typescript
interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;      // Current page number (1-based)
    pageSize: number;          // Number of items per page
    totalItems: number;        // Total number of items
    totalPages: number;        // Total number of pages
    hasNextPage: boolean;      // Whether there's a next page
    hasPrevPage: boolean;      // Whether there's a previous page
    nextPage: number | null;   // Next page number (null if no next page)
    prevPage: number | null;   // Previous page number (null if no prev page)
  };
}
```

## Available Methods

### 1. findPaginated (Core Method)

Basic pagination with optional where conditions.

```typescript
const result = await taskRepository.findPaginated(
  page,      // page number (default: 1)
  pageSize,  // items per page (default: 10)
  where      // optional SQL condition
);

console.log(result.data);                    // Array of tasks
console.log(result.pagination.currentPage);  // 2
console.log(result.pagination.totalPages);   // 10
console.log(result.pagination.hasNextPage);  // true
console.log(result.pagination.nextPage);     // 3
```

### 2. findAllPaginated

Paginate all records without any filters.

```typescript
const result = await taskRepository.findAllPaginated(1, 20);

// Result structure
{
  data: [...],
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 150,
    totalPages: 8,
    hasNextPage: true,
    hasPrevPage: false,
    nextPage: 2,
    prevPage: null
  }
}
```

### 3. findManyPaginated

Paginate with flexible options including where conditions.

```typescript
import { eq, like } from 'drizzle-orm';
import { task } from '~/db/schema';

const result = await taskRepository.findManyPaginated({
  where: like(task.title, '%important%'),
  page: 2,
  pageSize: 15
});
```

## Usage Examples

### Example 1: Basic Pagination in Route Loader

```typescript
// app/routes/dashboard.tasks._index.tsx
import { taskRepository } from "~/features/tasks/actions/task-actions";
import type { Route } from "./+types/dashboard.tasks._index";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

  const result = await taskRepository.findAllPaginated(page, pageSize);

  return {
    tasks: result.data,
    pagination: result.pagination
  };
}

export default function TasksPage() {
  const { tasks, pagination } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Tasks</h1>

      {/* Display data */}
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}

      {/* Pagination controls */}
      <div className="pagination">
        <p>
          Page {pagination.currentPage} of {pagination.totalPages}
          ({pagination.totalItems} total items)
        </p>

        {pagination.hasPrevPage && (
          <Link to={`?page=${pagination.prevPage}`}>Previous</Link>
        )}

        {pagination.hasNextPage && (
          <Link to={`?page=${pagination.nextPage}`}>Next</Link>
        )}
      </div>
    </div>
  );
}
```

### Example 2: Pagination with Search

```typescript
import { like } from 'drizzle-orm';
import { task } from '~/db/schema';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || "";

  const result = await taskRepository.findManyPaginated({
    where: search ? like(task.title, `%${search}%`) : undefined,
    page,
    pageSize: 10
  });

  return {
    tasks: result.data,
    pagination: result.pagination,
    search
  };
}
```

### Example 3: Using Pagination Metadata

```typescript
const result = await taskRepository.findAllPaginated(5, 10);

// Navigate pages
if (result.pagination.hasNextPage) {
  const nextPageNumber = result.pagination.nextPage; // 6
  const nextResult = await taskRepository.findAllPaginated(nextPageNumber, 10);
}

// Show page info
console.log(`
  Showing ${result.data.length} items
  Page ${result.pagination.currentPage} of ${result.pagination.totalPages}
  Total: ${result.pagination.totalItems} items
`);

// Conditional rendering
if (!result.pagination.hasPrevPage) {
  console.log("This is the first page");
}

if (!result.pagination.hasNextPage) {
  console.log("This is the last page");
}
```

### Example 4: Building Pagination UI Component

```typescript
interface PaginationProps {
  pagination: PaginationResult<any>['pagination'];
  onPageChange: (page: number) => void;
}

function PaginationControls({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = pagination;

  return (
    <div className="flex items-center justify-between">
      <div>
        Showing page {currentPage} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => prevPage && onPageChange(prevPage)}
          disabled={!hasPrevPage}
        >
          Previous
        </button>

        <span>{currentPage}</span>

        <button
          onClick={() => nextPage && onPageChange(nextPage)}
          disabled={!hasNextPage}
        >
          Next
        </button>
      </div>

      <div>
        Total: {pagination.totalItems} items
      </div>
    </div>
  );
}
```

### Example 5: API-Style Response

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");

  const result = await taskRepository.findAllPaginated(page, 25);

  // Return API-style response
  return {
    success: true,
    data: result.data,
    meta: {
      pagination: {
        page: result.pagination.currentPage,
        perPage: result.pagination.pageSize,
        total: result.pagination.totalItems,
        totalPages: result.pagination.totalPages,
        links: {
          first: 1,
          last: result.pagination.totalPages,
          prev: result.pagination.prevPage,
          next: result.pagination.nextPage,
        }
      }
    }
  };
}
```

## Migration from Old findPaginated

If you're using the old `findPaginated` return type:

**Old:**
```typescript
const result = await taskRepository.findPaginated(1, 10);
// result: { data, page, limit, total }
```

**New:**
```typescript
const result = await taskRepository.findPaginated(1, 10);
// result: { data, pagination: { currentPage, pageSize, totalItems, ... } }

// Access the same data:
result.data                        // same
result.pagination.currentPage      // was: result.page
result.pagination.pageSize         // was: result.limit
result.pagination.totalItems       // was: result.total
```

## Benefits

1. **Complete Pagination Info**: Get all navigation metadata in one call
2. **Boolean Flags**: Easy conditionals with `hasNextPage` and `hasPrevPage`
3. **Direct Page Numbers**: No math needed - use `nextPage` and `prevPage` directly
4. **Type Safety**: Full TypeScript support with proper generics
5. **Consistent API**: All methods return the same structured response
6. **Zero Configuration**: Smart defaults (page 1, pageSize 10)

## Best Practices

1. **Always validate page numbers from user input**
   ```typescript
   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
   ```

2. **Use reasonable page sizes**
   ```typescript
   const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get("pageSize") || "20")));
   ```

3. **Cache total counts for expensive queries** (if needed)

4. **Use the appropriate method**:
   - `findAllPaginated` - When you need all records paginated
   - `findManyPaginated` - When you have filter conditions
   - `findPaginated` - When you need full control

5. **Handle empty results**
   ```typescript
   if (result.data.length === 0) {
     return { message: "No items found" };
   }
   ```
