# Media quick start

1. Apply the current database schema with `pnpm db:push`.
2. Keep `MEDIA_STORAGE_DRIVER=local` for local files, or configure the S3 variables in `.env.example`.
3. Start the app with `pnpm dev` and open `/admin/media`.
4. Drag an image onto the upload area. The server converts it to WebP, stores it, and saves its final URL and metadata.

See `MEDIA_SETUP.md` for all local and S3 options.
