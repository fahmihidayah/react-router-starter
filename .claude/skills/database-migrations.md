---
name: database-migrations
description: >
  How to manage database schema changes with Drizzle ORM in this project. Covers schema
  modifications, running migrations, handling data migrations, rollback strategies, and
  best practices for production deployments. Use this skill when adding/modifying tables,
  columns, indexes, or when the user asks about migrations, schema changes, database
  updates, or Drizzle migration commands.
---

# Database Migrations with Drizzle ORM

## Migration Philosophy

This project uses **Drizzle Kit** for schema management. There are two approaches:

1. **`db:push`** (Development) — Push schema changes directly to the database
2. **`db:generate` + `db:migrate`** (Production) — Generate SQL migrations and apply them

---

## Development Workflow (db:push)

For local development, use `db:push` for quick iteration:

### Making Schema Changes

```typescript
// app/db/schema/products.ts
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: int('price').notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),

  // NEW: Add a column
  stock: int('stock').notNull().default(0),
})
```

### Push Changes to Database

```bash
pnpm db:push
```

This command:
- Reads your schema files
- Compares with the current database state
- Applies changes directly to the database
- **No migration files generated**

### When to Use db:push

✅ **Use `db:push` for:**
- Local development
- Rapid prototyping
- Quick schema iterations
- Single-developer projects
- Non-production databases

❌ **Don't use `db:push` for:**
- Production databases
- Team environments (creates drift)
- When you need rollback capability
- When you need migration history

---

## Production Workflow (Migrations)

For production and team environments, use migration files:

### Step 1: Modify Schema

```typescript
// app/db/schema/products.ts
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: int('price').notNull(),
  stock: int('stock').notNull().default(0), // NEW column
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})
```

### Step 2: Generate Migration

```bash
pnpm db:generate
```

This creates a migration file in `migrations/` directory:

```
migrations/
└── 0001_add_stock_to_products.sql
```

**Example migration file:**
```sql
-- migrations/0001_add_stock_to_products.sql
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0 NOT NULL;
```

### Step 3: Review Migration

**ALWAYS review the generated SQL before applying:**
- Check that it matches your intent
- Look for destructive operations (DROP, DELETE)
- Ensure data integrity is maintained

### Step 4: Apply Migration

```bash
pnpm db:migrate
```

This applies all pending migrations to the database.

### Step 5: Commit Migration Files

```bash
git add migrations/
git commit -m "feat: add stock column to products table"
```

**Important**: Commit migration files to version control so teammates and production get the same changes.

---

## Common Schema Changes

### Adding a Column

```typescript
// Before
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
})

// After: Add nullable column (safe)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'), // Nullable — safe to add
})

// After: Add non-nullable column with default (safe)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().default(''), // Default value provided
})
```

### Renaming a Column

```typescript
// Drizzle doesn't auto-detect renames — it sees DROP + ADD
// You must manually edit the migration file

// 1. Change schema
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(), // Renamed from 'name'
})

// 2. Generate migration
// pnpm db:generate

// 3. Edit the generated SQL file:
// migrations/0002_rename_name_to_full_name.sql
-- Don't use the generated DROP + ADD, use this instead:
ALTER TABLE users RENAME COLUMN name TO full_name;
```

### Removing a Column

```typescript
// 1. Remove from schema
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  // name: text('name').notNull(), // REMOVED
})

// 2. Generate migration
// pnpm db:generate

// Generated SQL:
ALTER TABLE users DROP COLUMN name;
```

**Warning**: This is destructive. Data will be lost.

### Adding an Index

```typescript
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  authorId: text('author_id').notNull(),
}, (table) => ({
  slugIdx: index('slug_idx').on(table.slug), // NEW index
}))
```

Run `pnpm db:push` or `pnpm db:generate`.

### Adding a Foreign Key

```typescript
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // NEW foreign key
})
```

**For existing columns**, you may need to manually write the migration:

```sql
-- Manually create constraint
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fk
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
```

---

## Data Migrations

Sometimes you need to transform existing data, not just change the schema.

### Example: Populate New Column from Existing Data

```typescript
// Scenario: Add 'slug' column, generate from 'title'

// 1. Add nullable column first
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug'), // Nullable initially
})

// 2. Generate migration
// pnpm db:generate

// 3. Manually add data migration to the SQL file:
// migrations/0003_add_slug_column.sql
ALTER TABLE posts ADD COLUMN slug TEXT;

-- Data migration: Generate slugs from titles
UPDATE posts SET slug = LOWER(REPLACE(title, ' ', '-'));

-- Now make column non-nullable
ALTER TABLE posts ALTER COLUMN slug SET NOT NULL;
```

### Seed Script for Data Migrations

For complex data transformations, use a seed script:

```typescript
// app/db/scripts/migrate-data.ts
import { db } from '~/lib/database'
import { posts } from '~/db/schema'
import { createSlugFrom } from '~/utils/slug'

async function migrateData() {
  const allPosts = await db.select().from(posts)

  for (const post of allPosts) {
    const slug = createSlugFrom(post.title)
    await db.update(posts).set({ slug }).where(eq(posts.id, post.id))
  }

  console.log(`Migrated ${allPosts.length} posts`)
}

migrateData()
```

Run manually:
```bash
node --loader tsx app/db/scripts/migrate-data.ts
```

---

## Rollback Strategies

Drizzle doesn't have built-in rollback. You must manage it manually.

### Option 1: Manual Rollback SQL

When you generate a migration, create a corresponding rollback file:

```sql
-- migrations/0004_add_email_to_users.sql (forward)
ALTER TABLE users ADD COLUMN email TEXT;

-- migrations/0004_add_email_to_users_rollback.sql (backward)
ALTER TABLE users DROP COLUMN email;
```

Run the rollback manually if needed:
```bash
sqlite3 app/data.db < migrations/0004_add_email_to_users_rollback.sql
```

### Option 2: Database Backups

**Before running migrations in production:**

```bash
# Backup SQLite database
cp app/data.db app/data.db.backup
```

If migration fails:
```bash
# Restore from backup
cp app/data.db.backup app/data.db
```

### Option 3: Version Control

Keep migration files in Git. Rollback by:
1. Reverting the commit that added the migration
2. Deleting the migration file
3. Restoring the database from backup

---

## Production Deployment Checklist

- [ ] **Backup database** before running migrations
- [ ] **Review generated SQL** for destructive operations
- [ ] **Test migrations** in staging environment first
- [ ] **Run migrations** during low-traffic window if possible
- [ ] **Monitor application** after migration for errors
- [ ] **Have rollback plan** ready (backup + rollback SQL)
- [ ] **Communicate** to team about migration deployment

---

## Multi-File Schema Migrations

When using multi-file schema (`app/db/schema/`), Drizzle reads all files:

```
app/db/schema/
├── index.ts          # Exports all schemas
├── users.ts
├── posts.ts
└── categories.ts
```

**Migration config** (`drizzle.config.ts`):
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/db/schema/index.ts', // Points to barrel export
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './app/data.db',
  },
})
```

All schema files are included automatically through the `index.ts` export.

---

## Common Issues & Solutions

### Issue: "Table already exists"

**Cause**: Running `db:push` or migrations when table already exists.

**Solution**:
```bash
# Drop the table manually in SQLite
sqlite3 app/data.db "DROP TABLE IF EXISTS table_name;"

# Or reset database (CAUTION: loses all data)
rm app/data.db
pnpm db:push
pnpm db:seed
```

### Issue: Migration file not generated

**Cause**: Drizzle didn't detect schema changes.

**Solution**:
- Ensure schema changes are saved
- Check `drizzle.config.ts` points to correct schema path
- Try `pnpm db:generate --force`

### Issue: Column constraint violation

**Cause**: Adding non-nullable column to table with existing rows.

**Solution**:
- Add column as nullable first
- Populate with default values via data migration
- Alter column to non-nullable

```sql
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN email TEXT;

-- Step 2: Populate default values
UPDATE users SET email = '' WHERE email IS NULL;

-- Step 3: Make non-nullable (SQLite doesn't support this directly)
-- Recreate table with constraint in a new migration
```

### Issue: SQLite doesn't support all ALTER operations

**SQLite limitations**:
- Cannot alter column types
- Cannot drop constraints
- Cannot rename columns (before SQLite 3.25.0)

**Workaround**: Recreate table
```sql
-- 1. Create new table with desired schema
CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL -- New constraint
);

-- 2. Copy data
INSERT INTO users_new (id, name, email)
SELECT id, name, COALESCE(email, '') FROM users;

-- 3. Drop old table
DROP TABLE users;

-- 4. Rename new table
ALTER TABLE users_new RENAME TO users;
```

---

## Commands Reference

```bash
# Development: Push schema changes directly
pnpm db:push

# Production: Generate migration files
pnpm db:generate

# Production: Apply migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed

# Open SQLite console
sqlite3 app/data.db

# View migrations table
sqlite3 app/data.db "SELECT * FROM __drizzle_migrations;"
```

---

## Best Practices

1. **Always review generated SQL** before applying
2. **Test migrations in staging** before production
3. **Use migration files for production** (not `db:push`)
4. **Backup before migrations** in production
5. **Add indexes for frequently queried columns**
6. **Use nullable columns** when adding to existing tables (or provide defaults)
7. **Write rollback SQL** for critical migrations
8. **Document data migrations** in comments
9. **Commit migration files** to version control
10. **Run migrations as part of deployment** (CI/CD pipeline)

---

## Example CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Backup database
        run: cp app/data.db app/data.db.backup

      - name: Run migrations
        run: pnpm db:migrate

      - name: Build application
        run: pnpm build

      - name: Deploy
        run: ./deploy.sh
```
