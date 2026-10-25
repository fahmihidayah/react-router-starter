# Extract and Test the Starter Template

## Quick Start (Recommended)

### Option 1: Automated Extraction with Validation

```bash
cd /Users/s/Documents/NodeJs/learning-tracker
bash scripts/extract-and-test.sh
```

This will:

- ✅ Run the extraction script
- ✅ Create `starter-template/` directory
- ✅ Create clean `react-router-starter.zip`
- ✅ Validate all files are correct
- ✅ Check excluded features are removed
- ✅ Verify included features are present

### Option 2: Manual Extraction

```bash
cd /Users/s/Documents/NodeJs/learning-tracker
pnpm create-starter
```

This creates:

- `starter-template/` - The extracted template
- `react-router-starter.zip` - Clean zip with simple structure

## Zip Structure (Fixed!)

The new zip has a clean structure:

```
react-router-starter.zip
├── package.json
├── README.md
├── ARCHITECTURE.md
├── app/
│   ├── features/
│   ├── routes/
│   ├── components/
│   └── ...
├── scripts/
├── seeds/
└── ...
```

**NOT** the old deep structure:

```
❌ Users/s/Documents/NodeJs/learning-tracker/starter-template/...
```

## Testing the Extracted Template

### 1. Test from Directory

```bash
cd starter-template

# Install
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your test database URL

# Initialize database (use FRESH database!)
createdb react_router_starter_test
pnpm db:push

# Create admin
ADMIN_EMAIL=admin@test.com \
ADMIN_PASSWORD=Admin123! \
ADMIN_NAME="Test Admin" \
pnpm db:bootstrap-admin

# Verify
pnpm typecheck  # Should pass ✅
pnpm build      # Should succeed ✅
pnpm dev        # Should start ✅
```

### 2. Test from Zip

```bash
# Extract to new directory
unzip react-router-starter.zip -d my-test-project
cd my-test-project

# Same steps as above
pnpm install
cp .env.example .env
# ... etc
```

## What's Included

### ✅ Features (12)

- auth (Better Auth + OAuth)
- users (User management)
- roles (RBAC)
- permissions (Permission system)
- security (Rate limiting)
- email (Templates, SMTP/Resend)
- media (Upload, Local/S3)
- audit-log (Activity tracking)
- observability (Metrics, Sentry)
- privacy (Cookie consent)
- admin (Admin panel)
- queue (RabbitMQ)

### ✅ Components

- 40+ Radix UI components
- Layouts and navigation
- Forms and inputs
- All pre-styled

### ✅ Infrastructure

- Environment validation (t3-env)
- Database setup (Drizzle + PostgreSQL)
- Testing (Vitest + Playwright)
- Linting (Biome)
- Type safety throughout

## What's Excluded

### ❌ Domain-Specific Features

- learners (student management)
- goals (learning goals)
- activities (learning records)
- schedules (schedule tracking)
- learning-plan
- learning-template
- categories
- reports
- track-app
- page (landing components)

## Verification Checklist

After extraction, verify:

- [ ] `starter-template/` directory exists
- [ ] `react-router-starter.zip` created
- [ ] Zip has clean structure (no deep paths)
- [ ] No `posts/` or `tags/` features
- [ ] No `learners/`, `goals/`, etc.
- [ ] Schema exports only 6 features
- [ ] Public layout is self-contained
- [ ] Privacy/Terms pages standalone
- [ ] No admin routes for excluded features

## Quick Validation Commands

```bash
# Check schema exports
cat starter-template/app/db/schema/index.ts
# Should only have: audit-log, media, permissions, privacy, roles, users

# Check features
ls starter-template/app/features/
# Should NOT have: posts, tags, learners, goals, activities, etc.

# Check admin routes
ls starter-template/app/routes/admin/
# Should NOT have: posts.*, categories.*, learners.*, etc.

# Check public layout
head -10 starter-template/app/routes/_public.tsx
# Should import from 'react-router', NOT '~/features/page'
```

## Distribution

### For GitHub

```bash
# Create repository
cd starter-template
git init
git add .
git commit -m "Initial commit: React Router 7 Starter"
gh repo create react-router-starter --public
git push -u origin main

# Create release
gh release create v1.0.0 ../react-router-starter.zip --title "v1.0.0" --notes "Initial release"
```

### For Team/Users

Share the zip file:

```bash
# Upload to file sharing
# Or attach to GitHub release
# Or distribute via npm
```

Users extract and use:

```bash
unzip react-router-starter.zip -d my-new-project
cd my-new-project
pnpm install
# ... setup and start
```

## Troubleshooting

### Issue: "Cannot find module posts/schemas/db"

**Solution:** Re-run extraction, the schema fix wasn't applied

```bash
pnpm create-starter
```

### Issue: "LandingHeader not found"

**Solution:** Re-run extraction, the layout fix wasn't applied

```bash
pnpm create-starter
```

### Issue: Zip has deep nested paths

**Solution:** Use the updated script (already fixed in current version)

```bash
pnpm create-starter
```

### Issue: Database has old tables

**Solution:** Use a fresh database

```bash
createdb new_test_db
# Update .env with new DATABASE_URL
pnpm db:push
```

## Success Criteria

✅ Extraction completes without errors
✅ Zip structure is clean (no deep paths)
✅ TypeScript compiles without errors
✅ Database schema pushes successfully
✅ Dev server starts without errors
✅ All routes load correctly
✅ No references to excluded features
✅ Build completes successfully

## Next Steps

After successful testing:

1. ✅ Confirm everything works
2. 📦 Distribute the zip file
3. 🚀 Push to GitHub
4. 📝 Update documentation
5. 🎉 Use for new projects!

## Files Created

- `starter-template/` - Extracted template directory
- `react-router-starter.zip` - Clean distribution package
- `MANUAL_TEST_GUIDE.md` - Detailed testing guide
- `FIXES_APPLIED.md` - Documentation of fixes
- `scripts/extract-and-test.sh` - Automated validation script

## Support

See documentation:

- `starter-template/README.md` - Quick start
- `starter-template/ARCHITECTURE.md` - Architecture guide
- `STARTER_USAGE_GUIDE.md` - Complete usage guide
- `MANUAL_TEST_GUIDE.md` - Testing instructions
