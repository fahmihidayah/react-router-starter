# Media feature

The admin media library is available at `/admin/media`. Every uploaded image is converted to WebP before it is stored. The resulting URL and file metadata are saved in the `media` table.

## Local storage

Local storage is the default:

```env
MEDIA_STORAGE_DRIVER=local
MEDIA_UPLOAD_DIR=./uploads/media
MEDIA_LOCAL_BASE_URL=/api/media/files
MEDIA_MAX_FILE_SIZE=10485760
MEDIA_WEBP_QUALITY=82
```

The application serves local images through `/api/media/files/:key`, so the same URL works in development and production. Persist `MEDIA_UPLOAD_DIR` when deploying with ephemeral containers.

## S3 storage

```env
MEDIA_STORAGE_DRIVER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=my-bucket
S3_MEDIA_PREFIX=media
```

The bucket must make stored objects readable at the URL saved in the database. For a CDN or an S3-compatible service, set `S3_PUBLIC_URL`. Use `S3_ENDPOINT` and `S3_FORCE_PATH_STYLE=true` when the provider requires them.

## Database

Apply the schema after changing branches:

```bash
pnpm db:push
```

New records include the stable public URL, storage provider/key, WebP MIME type, byte size, dimensions, original filename, and timestamps. Legacy rows remain valid because the added metadata columns are nullable.

## Code layout

- `app/features/media/storage` — WebP processing and local/S3 adapters
- `app/features/media/queries` — database access
- `app/features/media/services` — upload, replace, and delete workflows
- `app/features/media/actions` and `loaders` — route-facing logic
- `app/features/media/components` — forms and table columns
