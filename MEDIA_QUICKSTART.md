# Media Feature - Quick Start

## What's New?

Complete file upload and media management system with CRUD operations, file storage, and full integration with your React Router application.

## Get Started in 3 Steps

### 1. Set Up Database

```bash
pnpm db:push
```

This creates the `media` table with columns for storing file metadata.

### 2. Start Development Server

```bash
pnpm dev
```

### 3. Access Media Management

Navigate to: http://localhost:5173/dashboard/media

## Available Pages

- **List** (`/dashboard/media`) - View all media files with search and pagination
- **Create** (`/dashboard/media/add`) - Upload new file or add via URL
- **Edit** (`/dashboard/media/:id`) - Update metadata or replace file

## File Upload Flow

1. Select file via upload field
2. Auto-fills filename and URL path
3. Add optional alt text for accessibility
4. Submit form
5. File saved to `./uploads/` directory
6. Database record created
7. Redirected to list page

## Environment Setup

Upload path is configured in `.env`:

```env
UPLOAD_DIR=./uploads
```

The directory is auto-created on first upload. To use a different path, update the env variable and restart the server.

## Using UploadField in Your Forms

```typescript
import { UploadField } from '~/components/ui/upload-field'
import { useForm } from 'react-hook-form'

export function MyForm() {
  const form = useForm()

  return (
    <UploadField
      form={form}
      name="file"
      label="Upload Image"
      description="Select an image file (max 10MB)"
      accept="image/*"
    />
  )
}
```

## File Upload in Custom Actions

```typescript
import { saveUploadedFile } from '~/lib/upload'

export async function myAction(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (file && file.size > 0) {
    const { url, filename, path } = await saveUploadedFile(file)
    // url: "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
    // filename: "original-name.jpg"
    // path: "/path/to/app/uploads/550e8400..."
  }
}
```

## Database Operations

All standard CRUD operations are available through repositories:

```typescript
import { mediaRepository } from '~/features/media/repositories'

// Create
await mediaRepository.create({
  id: randomUUID(),
  url: '/uploads/file.jpg',
  filename: 'file.jpg',
  alt: 'Description',
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Read
const media = await mediaRepository.findById('id')
const allMedia = await mediaRepository.findAll()

// Update
await mediaRepository.update('id', { alt: 'New description' })

// Delete
await mediaRepository.delete('id')
```

## Pagination & Search

List loader supports pagination and search:

```typescript
// Query parameters:
// ?page=1&limit=10&search=filename
```

Returns paginated response:
```typescript
{
  docs: TMedia[]
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
```

## Form Patterns

### Create Form

```typescript
import { AddMediaForm } from '~/features/media/components/admin/form/add-media-form'

export default function AddPage() {
  const submit = useSubmit()
  const actionData = useActionData()

  return (
    <AddMediaForm
      errors={actionData?.errors}
      onSubmit={(fd) => submit(fd, { method: 'post' })}
    />
  )
}
```

### Edit Form

```typescript
import { EditMediaForm } from '~/features/media/components/admin/form/edit-media-form'

export default function EditPage() {
  const media = useLoaderData()
  const submit = useSubmit()
  const actionData = useActionData()

  return (
    <EditMediaForm
      media={media}
      errors={actionData?.errors}
      onSubmit={(fd) => submit(fd, { method: 'post' })}
    />
  )
}
```

## Types

```typescript
// Type from schema
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

// Type from database
type TMedia = {
  id: string
  url: string
  alt: string | null
  filename: string
  createdAt: Date | null
  updatedAt: Date | null
}
```

## Error Handling

Validation errors are returned from actions and displayed via `ErrorDisplay`:

```typescript
{
  errors: {
    url: ['Invalid URL format'],
    filename: ['Filename is required'],
    alt: []
  }
}
```

## Key Files

- `app/features/media/` - Feature implementation
- `app/components/ui/upload-field.tsx` - Upload component
- `app/lib/upload.ts` - Upload utilities
- `app/routes/dashboard.media.*` - Routes
- `MEDIA_SETUP.md` - Full documentation

## Next: Production Setup

Before deploying:

1. **Static File Serving**: Configure nginx/Apache to serve `/uploads/`
2. **File Size Limits**: Set limits in server config or schema validation
3. **File Type Validation**: Add MIME type checking if needed
4. **Access Control**: Implement authorization if needed
5. **Backup**: Set up backup strategy for uploaded files

See `MEDIA_SETUP.md` for detailed production guide.

## Troubleshooting

### Upload directory not created
- Check `UPLOAD_DIR` env variable
- Ensure app has write permissions to parent directory
- Error will appear in action response

### Files not appearing after upload
- Verify `UPLOAD_DIR` path is correct
- Check browser console and server logs
- Confirm database migration ran (`pnpm db:push`)

### Static files not serving
- Configure web server to serve upload directory
- In development, files are served via Vite
- Production requires explicit static file configuration

## Support

Refer to:
- `MEDIA_SETUP.md` - Full documentation
- `app/features/media/` - Implementation examples
- `.claude/skills/` - Project pattern guides
