# Database Utilities Guide

## Quick Reference

| Command | Purpose | Safe for Production? |
|---------|---------|---------------------|
| `pnpm db:push` | Push schema to DB | ⚠️ Development only |
| `pnpm db:generate` | Create migrations | ✅ Yes |
| `pnpm db:migrate` | Run migrations | ✅ Yes |
| `pnpm db:seed` | Add sample data | 🔶 Staging/Dev |
| `pnpm db:studio` | Visual DB browser | ✅ Yes (read-only recommended) |
| `pnpm db:inspect` | Show DB stats | ✅ Yes |
| `pnpm db:backup` | Create backup | ✅ Yes - **Use frequently!** |
| `pnpm db:restore` | Restore backup | ⚠️ Careful |
| `pnpm db:snapshot` | Migration + backup | ✅ Yes |
| `pnpm db:reset` | **Destructive!** | ❌ Never |
| `pnpm db:fresh` | Push + seed | 🔶 Staging/Dev |
| `pnpm db:setup` | First-time setup | ✅ Initial setup only |
| `pnpm db:validate` | Check migrations | ✅ Yes - **Use before commits!** |

## Common Workflows

### 🎯 Daily Development

```bash
# 1. Pull latest code
git pull

# 2. Update dependencies if needed
pnpm install

# 3. Update database schema
pnpm db:push

# 4. Start development
pnpm dev
```

### 🔄 Schema Changes (Development)

```bash
# 1. Backup first!
pnpm db:backup

# 2. Edit schema files in app/db/schema/

# 3. Push changes
pnpm db:push

# 4. Verify with Studio
pnpm db:studio
```

### 🚀 Schema Changes (Production)

```bash
# 1. Edit schema files in app/db/schema/

# 2. Generate migration
pnpm db:generate

# 3. Review migration file in drizzle/ directory

# 4. Validate
pnpm db:validate

# 5. Commit migration files
git add drizzle/
git commit -m "feat: add user preferences table"

# 6. On production server:
pnpm db:backup  # Always backup first!
pnpm db:migrate
```

### 🆕 Fresh Database Setup

```bash
# Complete setup
pnpm db:setup

# Or step by step:
pnpm db:generate  # Generate migrations
pnpm db:push      # Apply schema
pnpm db:seed      # Add sample data
```

### 🔍 Inspecting Database

```bash
# Terminal output
pnpm db:inspect

# Visual browser (opens in browser)
pnpm db:studio

# Or use any SQLite browser with: app.db
```

### 💾 Backup & Restore

```bash
# Create backup
pnpm db:backup

# List available backups
ls -lh backups/

# Restore (interactive)
pnpm db:restore
```

### 🧪 Testing Database Changes

```bash
# 1. Create snapshot before changes
pnpm db:snapshot

# 2. Make changes and test
pnpm db:fresh
# ... run tests ...

# 3. If something breaks:
pnpm db:restore
# Select the snapshot backup
```

### 🔧 Troubleshooting

#### "Table already exists" error
```bash
# Option 1: Reset (⚠️ loses data)
pnpm db:reset

# Option 2: Drop specific table via Studio
pnpm db:studio
```

#### "Migration conflict"
```bash
# Check what's wrong
pnpm db:check

# If safe, drop and regenerate
pnpm db:drop
pnpm db:generate
```

#### "Out of sync" with production
```bash
# Never db:push in production!
# Always use migrations:
pnpm db:generate
pnpm db:validate
# Deploy with: pnpm db:migrate
```

## Script Details

### Core Scripts

#### `db:push`
- **What**: Syncs schema directly to database
- **When**: Development only
- **Danger**: ⚠️ Can lose data, no migration history
- **Use case**: Rapid prototyping

#### `db:generate`
- **What**: Creates migration SQL files
- **When**: Before any production deployment
- **Danger**: ✅ Safe
- **Use case**: Version-controlled schema changes

#### `db:migrate`
- **What**: Applies pending migrations
- **When**: Production deployments
- **Danger**: ✅ Safe (with backups)
- **Use case**: Applying tested migrations

### Utility Scripts

#### `db:studio`
- **What**: Web UI for browsing/editing database
- **When**: Anytime
- **Danger**: ✅ Safe (be careful with edits)
- **Access**: Opens browser at https://local.drizzle.studio

#### `db:inspect`
- **What**: Prints database statistics
- **When**: Anytime
- **Output**: Tables, columns, foreign keys, size

#### `db:backup`
- **What**: Creates timestamped .db backup
- **When**: Before any risky operation
- **Location**: `backups/app-YYYY-MM-DDTHH-mm-ss.db`

#### `db:restore`
- **What**: Interactive restore from backup
- **When**: After something went wrong
- **Safety**: Auto-backups current DB before restore

### Combined Scripts

#### `db:reset`
```bash
# ⚠️ DESTRUCTIVE! Drops all data
pnpm db:drop && pnpm db:push && pnpm db:seed
```

#### `db:fresh`
```bash
# Push schema + seed data
pnpm db:push && pnpm db:seed
```

#### `db:setup`
```bash
# Complete first-time setup
pnpm db:generate && pnpm db:push && pnpm db:seed
```

#### `db:snapshot`
```bash
# Safe schema checkpoint
pnpm db:generate && pnpm db:backup
```

#### `db:validate`
```bash
# Pre-commit validation
pnpm db:check && pnpm typecheck
```

## Best Practices

### ✅ DO

1. **Always backup before major changes**
   ```bash
   pnpm db:backup
   ```

2. **Use migrations in production**
   ```bash
   pnpm db:generate  # NOT db:push
   ```

3. **Validate before committing**
   ```bash
   pnpm db:validate
   ```

4. **Keep backups organized**
   - Delete old development backups
   - Store production backups externally

5. **Review migration files**
   - Check `drizzle/*.sql` files
   - Verify before deploying

6. **Test migrations locally first**
   ```bash
   pnpm db:backup
   pnpm db:migrate
   # test...
   pnpm db:restore  # if needed
   ```

### ❌ DON'T

1. **Never `db:push` in production**
   - No migration history
   - Can cause data loss
   - Use `db:migrate` instead

2. **Never skip backups**
   - Especially before migrations
   - Especially in production

3. **Never commit database files**
   - `*.db` files are in .gitignore
   - Only commit migration files

4. **Never edit migrations manually** (usually)
   - Regenerate if needed
   - Unless you know what you're doing

5. **Never use `db:reset` in production**
   - It's destructive
   - Development/staging only

## CI/CD Integration

### Example GitHub Actions

```yaml
name: Database Migration
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm db:validate

      # In production deployment:
      - run: pnpm db:backup
      - run: pnpm db:migrate
```

### Example Docker Entrypoint

```bash
#!/bin/bash
set -e

# Run migrations on startup
pnpm db:migrate

# Start app
exec pnpm start
```

## Backup Strategy

### Local Development
- Manual backups before major changes
- Keep last 5-10 backups

### Staging
- Automated daily backups
- Keep last 30 days

### Production
- Automated backups before each deployment
- Automated daily backups
- Keep last 90 days
- Off-site backup storage
- Test restore process monthly

## Monitoring

### Health Checks

```bash
# Check database is accessible
pnpm db:inspect

# Check migrations are up to date
pnpm db:check

# Check schema matches code
pnpm db:validate
```

### Size Monitoring

```bash
# Current size
pnpm db:inspect

# Monitor growth
ls -lh app.db
```

## Emergency Procedures

### Database Corrupted

```bash
# 1. Stop application
# 2. Check integrity
sqlite3 app.db "PRAGMA integrity_check;"

# 3. If corrupted, restore from backup
pnpm db:restore

# 4. Restart application
```

### Migration Failed

```bash
# 1. Don't panic!
# 2. Restore from pre-migration backup
pnpm db:restore

# 3. Fix migration file
# 4. Validate
pnpm db:validate

# 5. Try again
pnpm db:backup
pnpm db:migrate
```

### Lost Data

```bash
# 1. Restore from latest backup
pnpm db:restore

# 2. Identify what was lost
pnpm db:inspect

# 3. Re-enter data or restore from earlier backup
```

## Advanced Usage

### Custom Migration

```bash
# 1. Generate base migration
pnpm db:generate

# 2. Edit drizzle/*.sql file carefully
# 3. Add data migration SQL
# 4. Validate
pnpm db:validate

# 5. Test locally
pnpm db:backup
pnpm db:migrate
```

### Seeding Production

```bash
# Only initial data, not test data
# Edit seeds/index.ts to use env check:
if (process.env.NODE_ENV === 'production') {
  // Only essential data
}

pnpm db:seed
```

## Support

For detailed script documentation: [scripts/README.md](../scripts/README.md)

For schema documentation: See `app/db/schema/` files

For issues: Check project README.md
