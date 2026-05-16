---
name: ui-component
description: >
  How to build, compose, and style UI components using Radix UI and Tailwind CSS in this project.
  Use this skill when creating new UI components, composing existing ones from components/ui/,
  styling with Tailwind, handling responsive design, dark mode, or accessibility. Also trigger
  when the user asks about the cn() utility, component variants, Radix UI primitives, icons
  (Lucide), or when reviewing component code for UI/UX consistency.
---

# UI Component Patterns

## Component Inventory

Before creating a new component, check what already exists in `app/components/ui/`.
This project has 25+ pre-built Radix UI components including:

```
button, card, dialog, dropdown-menu, input, label, select,
table, tabs, textarea, tooltip, badge, checkbox, radio-group,
separator, sheet, sidebar, skeleton, switch, toast (sonner),
command (cmdk), drawer (vaul), popover, scroll-area, avatar,
form (RHF), error-display (validation errors)
```

Rule: **Always reuse before creating.** If a component exists in `components/ui/`,
compose with it — don't build a custom version.

## Component Locations

```
app/components/
├── ui/          # Base primitives (Radix + Tailwind). Shared across entire app.
├── layouts/     # Page-level layouts (header, footer, sidebar).
├── admin/       # Admin-specific composites (DataTable, DeleteDialog).
└── [feature]/   # If truly app-wide but not a primitive, rare.

app/features/[name]/components/  # Feature-specific components. NOT shared.
```

### Where Does My Component Go?
- Generic, reusable across any feature → `components/ui/`
- Admin panel specific (tables, dialogs, filters) → `components/admin/`
- Only used within one feature → `features/[name]/components/`
- Layout/shell → `components/layouts/`

## Composing Components

Build feature components by composing `ui/` primitives:

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

type TProductCardProps = {
  product: TProduct
  onEdit: (id: string) => void
}

export function ProductCard({ product, onEdit }: TProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
        <CardDescription>${product.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={() => onEdit(product.id)}>
          Edit
        </Button>
      </CardContent>
    </Card>
  )
}
```

## The `cn()` Utility

Use `cn()` for conditional and merged Tailwind classes. It combines `clsx` + `tailwind-merge`.

```typescript
import { cn } from '~/lib/utils'

// Conditional classes
<div className={cn('p-4 rounded-lg', isActive && 'bg-primary text-primary-foreground')} />

// Merging with overrides (tailwind-merge resolves conflicts)
<Button className={cn('w-full', className)} />

// Multiple conditions
<span className={cn(
  'text-sm font-medium',
  status === 'active' && 'text-green-600',
  status === 'inactive' && 'text-muted-foreground',
  status === 'error' && 'text-destructive',
)} />
```

Rules:
- Always use `cn()` when combining conditional classes — never template literals.
- Accept `className` prop in reusable components and merge with `cn()`.

## Tailwind Conventions

### Color System (CSS Variables)
Use semantic color tokens, not raw colors:

```
bg-background          # Page background
bg-card                # Card/surface background
bg-primary             # Primary action color
bg-secondary           # Secondary surfaces
bg-muted               # Muted/subtle backgrounds
bg-destructive         # Danger/delete

text-foreground        # Primary text
text-muted-foreground  # Secondary/subtle text
text-primary           # Text on primary bg or accent text
text-destructive       # Error text

border-border          # Default borders
border-input           # Form input borders
```

Rule: Never use raw Tailwind colors (`bg-blue-500`, `text-gray-700`).
Always use semantic tokens for theme/dark mode compatibility.

### Spacing
- Use Tailwind's spacing scale: `p-2` (8px), `p-4` (16px), `p-6` (24px).
- Gaps between items: `gap-2`, `gap-4`, `gap-6`.
- Page-level padding: `p-6` on the content container.
- Section spacing: `space-y-4` or `space-y-6`.

### Responsive Design (Mobile-First)
Write base styles for mobile, then override for larger screens:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

<div className="flex flex-col sm:flex-row gap-4">
  {/* Stack on mobile, row on desktop */}
</div>
```

Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px).

## Icons (Lucide React)

```typescript
import { Plus, Trash2, Pencil, Search, ChevronDown } from 'lucide-react'

// In JSX — always set size, default 16 for inline, 20 for buttons
<Plus className="h-4 w-4" />
<Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
```

Rules:
- Import only the icons you use (tree-shaking).
- Standard sizes: `h-4 w-4` (16px) for buttons/inline, `h-5 w-5` (20px) for standalone.
- Use `mr-2` gap when icon precedes text in a button.

## Dark Mode

Handled by `next-themes`. The theme provider wraps the app in `root.tsx`.

- All semantic color tokens (`bg-background`, `text-foreground`, etc.) automatically
  switch between light and dark values.
- Never hardcode light-only or dark-only styles unless intentional.
- Test both modes when building new components.

## Accessibility Checklist

Radix UI handles most a11y, but verify:
- Interactive elements are focusable and have visible focus styles.
- Buttons have readable text or `aria-label` for icon-only buttons.
- Form inputs are linked to labels (`htmlFor` / `id`).
- Color is not the only indicator (add icons or text alongside color).
- Modals/dialogs trap focus and are dismissible with Escape.

```typescript
// Icon-only button — always add aria-label
<Button variant="ghost" size="icon" aria-label="Delete product">
  <Trash2 className="h-4 w-4" />
</Button>
```

## Loading States

Use the `Skeleton` component for loading placeholders:

```typescript
import { Skeleton } from '~/components/ui/skeleton'

// Match the shape of the real content
<div className="space-y-4">
  <Skeleton className="h-8 w-[200px]" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-[80%]" />
</div>
```

## Empty States

When a list/table has no data:

```typescript
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Package className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium">No products yet</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Get started by adding your first product.
  </p>
  <Button className="mt-4" asChild>
    <Link to="/dashboard/products/add">
      <Plus className="h-4 w-4 mr-2" /> Add Product
    </Link>
  </Button>
</div>
```

## ErrorDisplay Component

Display server-side validation errors from form actions in a consistent alert box:

```typescript
import { ErrorDisplay } from '~/components/ui/error-display'

interface ErrorDisplayProps {
  errors: Record<string, string[] | undefined>
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
  const errorMessages = Object.entries(errors)
    .filter(([, messages]) => messages && messages.length > 0)
    .flatMap(([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) || [])

  if (errorMessages.length === 0) return null

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Validation errors</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
            {errorMessages.map((msg) => (
              <li key={`${msg}`}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

### Usage in Forms

Display errors at the top of the form when server validation fails:

```typescript
const AddUserForm = ({ errors, onSubmit }) => {
  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <Form {...form}>
        {/* form fields */}
      </Form>
    </>
  )
}
```

The `errors` object comes from server action validation:
- Key: field name (e.g., `'email'`, `'name'`)
- Value: array of error messages (or undefined if no errors)

Example return from action:
```typescript
return {
  errors: {
    email: ['Invalid email format'],
    name: [],
  },
}
```
