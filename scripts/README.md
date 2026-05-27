# Database Utilities Scripts

This directory contains utility scripts for managing the database.

## Available Scripts

### Core Database Operations

#### `pnpm db:push`
Push schema changes to the database without generating migration files.
```bash
pnpm db:push
```
**Use case:** Development - Quick schema updates

---

#### `pnpm db:generate`
Generate migration files based on schema changes.
```bash
pnpm db:generate
```
**Use case:** Production - Create migration files before deployment

---

#### `pnpm db:migrate`
Apply pending migration files to the database.
```bash
pnpm db:migrate
```
**Use case:** Production - Run migrations on deployment

---

#### `pnpm db:seed`
Seed the database with initial/sample data.
```bash
pnpm db:seed
```
**Use case:** Development/Testing - Populate database with test data

---

### Database Studio & Inspection

#### `pnpm db:studio`
Open Drizzle Studio - a visual database browser.
```bash
pnpm db:studio
```
**Use case:** Visual inspection and editing of database data
**Access:** Opens in browser at https://local.drizzle.studio

---

#### `pnpm db:inspect`
Display detailed database statistics and table information.
```bash
pnpm db:inspect
```
**Output:**
- Total tables count
- Row counts per table
- Column information
- Primary keys
- Foreign key relationships
- Database size

---

### Migration Management

#### `pnpm db:check`
Validate migration files and check for inconsistencies.
```bash
pnpm db:check
```
**Use case:** Verify migration integrity before applying

---

#### `pnpm db:drop`
Drop migration files (interactive).
```bash
pnpm db:drop
```
**Warning:** This removes migration files, not database data

---

#### `pnpm db:up`
Update snapshot and apply changes.
```bash
pnpm db:up
```
**Use case:** Sync schema snapshot with current state

---

### Backup & Restore

#### `pnpm db:backup`
Create a timestamped backup of the current database.
```bash
pnpm db:backup
```
**Output:** `backups/app-YYYY-MM-DDTHH-mm-ss.db`

---

#### `pnpm db:restore`
Restore database from a backup file (interactive).
```bash
pnpm db:restore
```
**Features:**
- Lists all available backups
- Interactive selection
- Auto-backup before restore

---

#### `pnpm db:snapshot`
Generate migration + create backup (combined operation).
```bash
pnpm db:snapshot
```
**Use case:** Before major schema changes

---

### Combined Operations

#### `pnpm db:reset`
Drop all data, push schema, and reseed.
```bash
pnpm db:reset
```
**Warning:** Destructive operation - all data will be lost
**Workflow:** drop → push → seed

---

#### `pnpm db:fresh`
Push schema changes and reseed database.
```bash
pnpm db:fresh
```
**Use case:** Development - Quick reset with fresh data
**Workflow:** push → seed

---

#### `pnpm db:setup`
Complete database setup from scratch.
```bash
pnpm db:setup
```
**Use case:** First-time setup or CI/CD
**Workflow:** generate → push → seed

---

#### `pnpm db:validate`
Check migrations and validate TypeScript types.
```bash
pnpm db:validate
```
**Use case:** Pre-commit validation
**Workflow:** check → typecheck

---

## Workflow Examples

### Development Workflow

1. **Make schema changes** (edit files in `app/db/schema/`)
2. **Push to local database**
   ```bash
   pnpm db:push
   ```
3. **Inspect changes**
   ```bash
   pnpm db:inspect
   # or
   pnpm db:studio
   ```

### Production Deployment Workflow

1. **Make schema changes** (edit files in `app/db/schema/`)
2. **Generate migration**
   ```bash
   pnpm db:generate
   ```
3. **Validate migration**
   ```bash
   pnpm db:check
   pnpm db:validate
   ```
4. **Commit migration files**
   ```bash
   git add drizzle/
   git commit -m "feat: add new schema changes"
   ```
5. **Deploy and run migration**
   ```bash
   pnpm db:migrate
   ```

### Before Major Changes

```bash
# Create snapshot (migration + backup)
pnpm db:snapshot

# Make your changes...

# If something goes wrong:
pnpm db:restore
```

### Fresh Start

```bash
# Complete reset
pnpm db:reset

# Or fresh setup
pnpm db:setup
```

### Testing Workflow

```bash
# Fresh database with seed data
pnpm db:fresh

# Run tests
pnpm test

# Reset after tests
pnpm db:reset
```

## Backup Strategy

Backups are stored in the `backups/` directory with timestamped filenames:
- Format: `app-YYYY-MM-DDTHH-mm-ss.db`
- Auto-created before restore operations
- Manually created with `pnpm db:backup`

### Automated Backups (Recommended)

Add to your deployment pipeline:
```bash
# Before deployment
pnpm db:backup
pnpm db:migrate
```

## Environment Variables

Scripts use the following environment variables from `.env`:

- `DB_FILE_NAME` - Database file path (default: `file:./app.db`)

## Error Handling

All scripts include:
- ✅ Success indicators
- ❌ Error messages with exit codes
- 📊 Progress information
- 🔍 Detailed output

## Safety Features

1. **Restore** - Auto-backup before restore
2. **Validation** - Check before destructive operations
3. **Interactive prompts** - For dangerous operations
4. **Timestamped backups** - Never overwrite backups

## Troubleshooting

### "Database file not found"
```bash
# Initialize database
pnpm db:push
```

### "Migration conflict"
```bash
# Check migrations
pnpm db:check

# Reset if needed
pnpm db:reset
```

### "Permission denied"
```bash
# Check file permissions
ls -la *.db

# Fix permissions
chmod 644 app.db
```

## Best Practices

1. **Always backup before major changes**
   ```bash
   pnpm db:snapshot
   ```

2. **Use migrations in production**
   ```bash
   pnpm db:generate  # not db:push
   ```

3. **Validate before committing**
   ```bash
   pnpm db:validate
   ```

4. **Keep backups organized**
   - Regular cleanup of old backups
   - Store critical backups externally

5. **Document schema changes**
   - Write clear migration descriptions
   - Update schema documentation
