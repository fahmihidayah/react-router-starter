# Media Features Setup Guide

## Overview

The media feature provides complete CRUD functionality for managing media files with file upload capability. Files are stored locally in a directory configured via environment variables.

## Configuration

### Environment Variables

The upload path is configured in `.env` file:

```env
UPLOAD_DIR=./uploads
```

**Default**: `./uploads` (relative to project root)

The upload directory will be automatically created if it doesn't exist when the first file is uploaded.

## Directory Structure

```
app/features/media/
├── type.ts                              # Media type definitions
├── repositories/
│   ├── media-repository.ts              # Database access layer
│   └── index.ts                         # Barrel export
├── schemas/
│   └── media-schema.ts                  # Zod validation schemas
├── loaders/
│   ├── get-media-loader.ts              # List with pagination & search
│   └── get-media-by-id-loader.ts        # Fetch single media
├── actions/
│   ├── create-media-action.ts           # Create with file upload
│   ├── update-media-action.ts           # Update with optional file replacement
│   ├── delete-media-action.ts           # Delete single media
│   └── delete-many-media-action.ts      # Bulk delete
└── components/admin/form/
    ├── add-media-form.tsx               # Create form with upload
    └── edit-media-form.tsx              # Edit form with optional file replacement

app/components/ui/
└── upload-field.tsx                     # Reusable file upload field component

app/lib/
└── upload.ts                            # File upload utilities

app/routes/
├── dashboard.media._index.tsx           # List page
├── dashboard.media.add.tsx              # Create page
└── dashboard.media.$id.tsx              # Edit page
```

## Database Schema

The `media` table includes:

```typescript
{
  id: text (primary key)           // UUID
  url: text (required)             // URL to file (local or external)
  alt: text (optional)             // Alt text for accessibility
  filename: text (required)        // Original filename
  createdAt: timestamp             // Creation timestamp
  updatedAt: timestamp             // Last update timestamp
}
```

Run `pnpm db:push` to create the table.

## File Upload Utility (`app/lib/upload.ts`)

### Functions

#### `saveUploadedFile(file: File)`

Saves an uploaded file to the upload directory and returns metadata.

**Returns:**
```typescript
{
  filename: string    // Original filename
  path: string       // Full file path on disk
  url: string        // URL path (e.g., /uploads/uuid.ext)
}
```

**Example:**
```typescript
const file = await request.formData().get('file') as File
const { url, filename } = await saveUploadedFile(file)
// url: "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
```

#### `ensureUploadDir()`

Creates the upload directory if it doesn't exist. Called automatically by `saveUploadedFile()`.

#### `getUploadDir()`

Returns the configured upload directory path.

## Upload Field Component (`app/components/ui/upload-field.tsx`)

Reusable file upload field integrated with React Hook Form and Zod.

### Props

```typescript
interface UploadFieldProps {
  form: UseFormReturn<TFieldValues>           // React Hook Form instance
  name: FieldPath                             // Field name
  label: string                               // Field label
  description?: string                        // Helper text
  accept?: string                             // File types (default: "image/*")
  disabled?: boolean                          // Disable input
}
```

### Usage

```typescript
import { UploadField } from '~/components/ui/upload-field'

<UploadField
  form={form}
  name="file"
  label="Upload Image"
  description="Select an image file"
  accept="image/*"
/>
```

The component:
- Displays selected filename
- Integrates with form validation
- Shows form errors automatically
- Includes file icon indicator

## Schemas

### `createMediaSchema`

Required fields for creating media:
- `url` (string): Valid URL to media file
- `filename` (string): Original filename (max 255 chars)
- `alt` (string, optional): Accessibility text

### `updateMediaSchema`

Same as create schema. Alt text is optional.

**Example validation:**
```typescript
{
  url: 'https://example.com/image.jpg' or '/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
  filename: 'my-image.jpg',
  alt: 'A beautiful sunset'  // optional
}
```

## Actions

### Create Media

**File:** `create-media-action.ts`

Handles both scenarios:
1. **File upload**: Saves file, auto-fills URL and filename
2. **Manual entry**: Uses provided URL and filename

```typescript
export async function createMediaAction(request: Request)
```

**Response on success:** Redirects to `/dashboard/media`

**Response on error:** Returns validation errors

### Update Media

**File:** `update-media-action.ts`

Allows optional file replacement while keeping other fields editable.

```typescript
export async function updateMediaAction(request: Request, id: string)
```

### Delete Media

**File:** `delete-media-action.ts`

Deletes single media record.

```typescript
export async function deleteMediaAction(id: string)
```

### Delete Many Media

**File:** `delete-many-media-action.ts`

Bulk delete using array of IDs.

```typescript
export async function deleteManyMediaAction(ids: string[])
```

## Routes

### List Page (`/dashboard/media`)

- Displays all media with pagination
- Search by filename
- Single and bulk delete
- Link to create/edit pages
- Table columns: ID, Filename, URL, Alt Text, Created Date

### Create Page (`/dashboard/media/add`)

- File upload with drag-and-drop support
- Manual URL entry as alternative
- Auto-fills filename from upload
- Alt text (optional)

### Edit Page (`/dashboard/media/:id`)

- Pre-filled values from database
- Optional file replacement
- Updates other fields independently
- Shows current file info

## Loaders

### `getMediaLoader(request: Request)`

Returns paginated list with search:

```typescript
{
  docs: TMedia[]           // Media records
  page: number            // Current page
  limit: number           // Items per page
  totalDocs: number       // Total count
  totalPages: number      // Total pages
  hasNextPage: boolean
  hasPrevPage: boolean
}
```

### `getMediaByIdLoader(id: string)`

Returns single media record or null.

## Integration Example

### In a Feature Form

```typescript
import { UploadField } from '~/components/ui/upload-field'

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(mySchema),
  })

  return (
    <Form {...form}>
      <UploadField
        form={form}
        name="media"
        label="Featured Image"
        accept="image/*"
      />
      {/* other fields */}
    </Form>
  )
}
```

### In a Custom Action

```typescript
import { saveUploadedFile } from '~/lib/upload'

export async function myAction(request: Request) {
  const formData = await request.formData()
  const file = formData.get('media') as File

  if (file) {
    const { url, filename } = await saveUploadedFile(file)
    // Use url and filename in your logic
  }
}
```

## Error Handling

File upload errors are caught and returned as validation errors:

```typescript
{
  errors: {
    url: ['Failed to upload file'],
    filename: [],
    alt: []
  }
}
```

These display in the `<ErrorDisplay />` component at the top of the form.

## File Organization

Uploaded files are stored in the configured `UPLOAD_DIR` with:
- **Unique names**: UUID-based to prevent conflicts
- **Original extension**: Preserved from original filename
- **Structure**: Flat directory (no subfolders)

Example: `/uploads/550e8400-e29b-41d4-a716-446655440000.jpg`

## Performance Considerations

- Files are streamed to disk to avoid memory issues
- No file size limits configured (set via nginx/server config if needed)
- Search is indexed on filename field
- Pagination prevents loading all records at once

## Security Notes

- File upload path is configurable via environment variables
- Original filename is preserved in database for reference
- File serving should be configured in your web server (nginx, Apache)
- Consider adding:
  - File type validation (MIME type checking)
  - File size limits
  - Virus scanning for production
  - Access controls (who can upload/delete)

## Static File Serving

To serve uploaded files, configure your web server:

### Vite (Development)

Files are accessible via `/uploads/` path automatically if served from project root.

### Production

Configure nginx/Apache to serve the `uploads/` directory:

```nginx
location /uploads/ {
  alias /path/to/app/uploads/;
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

## TypeScript Types

```typescript
// From schema
type TCreateMedia = {
  url: string
  filename: string
  alt?: string | null
}

type TUpdateMedia = {
  url: string
  filename: string
  alt?: string | null
}

// From database
type TMedia = {
  id: string
  url: string
  alt: string | null
  filename: string
  createdAt: Date | null
  updatedAt: Date | null
}
```

## Next Steps

1. Run `pnpm db:push` to create the media table
2. Access `/dashboard/media` to start managing media
3. Configure `UPLOAD_DIR` in `.env` if using custom path
4. Set up static file serving in your deployment environment
5. Consider adding file type validation to schemas
6. Add access controls if needed (e.g., only admins can upload)
