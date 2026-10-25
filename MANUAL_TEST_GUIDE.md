# Manual Testing Guide for Starter Template

## Current Status

✅ **All fixes have been applied to:** `/Users/s/Documents/NodeJs/learning-tracker/starter-template/`

### Fixed Issues:
1. ✅ Database schema exports cleaned
2. ✅ Public layout rewritten (no `page` feature dependency)
3. ✅ Privacy and Terms pages standalone
4. ✅ Admin routes for posts/categories removed

## Testing Steps

### 1. Navigate to Starter Template

```bash
cd /Users/s/Documents/NodeJs/learning-tracker/starter-template
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Test Database

**IMPORTANT:** Use a fresh database, NOT the learning-tracker database!

```bash
# Option A: Create new PostgreSQL database
createdb react_router_starter_test

# Option B: Use existing empty database
```

### 4. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit .env with your test database
# Change this line:
DATABASE_URL=postgresql://user:password@localhost:5432/react_router_starter_test
```

**Required minimum configuration:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/react_router_starter_test
BETTER_AUTH_SECRET=change-this-to-at-least-16-characters-long
BETTER_AUTH_URL=http://localhost:5173
EMAIL_FROM=noreply@example.com
```

### 5. Initialize Database

```bash
# Generate schema
pnpm db:generate

# Push schema to database
pnpm db:push
```

**Expected Output:**
- No errors about missing features (posts, tags, etc.)
- Tables created successfully

### 6. Create Admin User

```bash
ADMIN_EMAIL=admin@test.com \
ADMIN_PASSWORD=Admin123! \
ADMIN_NAME="Test Admin" \
pnpm db:bootstrap-admin
```

### 7. Run Type Check

```bash
pnpm typecheck
```

**Expected:**
- ✅ No import errors
- ✅ No module not found errors
- ✅ Type checking passes

### 8. Start Development Server

```bash
pnpm dev
```

**Expected:**
- Server starts on http://localhost:5173
- No module resolution errors
- No import errors

### 9. Test Routes

Open browser and test these routes:

1. **Home Page:** http://localhost:5173/
   - Should show template landing page
   - No errors in console

2. **Login:** http://localhost:5173/login
   - Should show login form
   - Test with admin@test.com / Admin123!

3. **Admin Dashboard:** http://localhost:5173/admin
   - Should show dashboard after login
   - No errors about missing features

4. **Admin Users:** http://localhost:5173/admin/users
   - Should show user management

5. **Admin Roles:** http://localhost:5173/admin/roles
   - Should show role management

6. **Admin Media:** http://localhost:5173/admin/media
   - Should show media management

7. **Privacy Policy:** http://localhost:5173/privacy
   - Should show privacy page (standalone)

8. **Terms:** http://localhost:5173/terms
   - Should show terms page (standalone)

### 10. Test Admin Routes (Should NOT Exist)

These should return 404:
- http://localhost:5173/admin/posts (excluded)
- http://localhost:5173/admin/categories (excluded)
- http://localhost:5173/admin/learners (excluded)
- http://localhost:5173/admin/goals (excluded)

### 11. Build Test

```bash
pnpm build
```

**Expected:**
- Build completes successfully
- No type errors
- No module resolution errors

## Verification Checklist

- [ ] Database schema pushed without errors
- [ ] TypeScript compilation passes
- [ ] Dev server starts without errors
- [ ] Landing page loads correctly
- [ ] Login works with admin user
- [ ] Admin dashboard accessible
- [ ] User management works
- [ ] Role management works
- [ ] Media management works
- [ ] Privacy page loads (standalone)
- [ ] Terms page loads (standalone)
- [ ] Build completes successfully
- [ ] No references to excluded features (posts, learners, etc.)

## Common Issues

### Issue: "Cannot find module posts/schemas/db"
**Solution:** The schema export fix wasn't applied. Check:
```bash
cat /Users/s/Documents/NodeJs/learning-tracker/starter-template/app/db/schema/index.ts
```

Should only have 6 exports (audit-log, media, permissions, privacy, roles, users).

### Issue: "LandingHeader not found"
**Solution:** The public layout fix wasn't applied. Check:
```bash
head -20 /Users/s/Documents/NodeJs/learning-tracker/starter-template/app/routes/_public.tsx
```

Should import from 'react-router' not '~/features/page'.

### Issue: Database has tables from learning-tracker
**Solution:** Use a fresh database:
```bash
dropdb react_router_starter_test
createdb react_router_starter_test
pnpm db:push
```

## Features to Test

### Authentication
- [ ] Register new user
- [ ] Email verification flow
- [ ] Login/logout
- [ ] Password reset flow
- [ ] OAuth (if configured)

### User Management (Admin)
- [ ] List users
- [ ] View user details
- [ ] Edit user
- [ ] Delete user
- [ ] Assign roles

### Role Management (Admin)
- [ ] List roles
- [ ] Create role
- [ ] Edit role
- [ ] Delete role
- [ ] Assign permissions

### Media Upload (Admin)
- [ ] Upload image
- [ ] View media library
- [ ] Delete media

### Permissions
- [ ] Access denied without login
- [ ] Access denied without admin role
- [ ] Proper redirects to login

## Performance Check

```bash
# Check bundle size
pnpm build
du -sh build/

# Check dependencies
pnpm list --depth=0 | wc -l
```

## Success Criteria

✅ All routes load without errors
✅ No references to excluded features
✅ Authentication works end-to-end
✅ Admin panel fully functional
✅ Build completes successfully
✅ Type checking passes
✅ No console errors in browser

## Next Steps After Testing

1. ✅ Confirm all tests pass
2. 📦 Create new zip: `cd .. && zip -r react-router-starter-clean.zip starter-template`
3. 🚀 Push to GitHub
4. 📝 Update documentation with test results
5. 🎉 Use for new projects!

## Reporting Issues

If you find any issues during testing:

1. Note the exact error message
2. Note which step failed
3. Check browser console for errors
4. Check terminal output
5. Document in `starter-template/TESTING_RESULTS.md`

## Sample Test Results Template

Create `starter-template/TESTING_RESULTS.md`:

```markdown
# Testing Results

**Date:** [Date]
**Tester:** [Name]
**Node Version:** [Version]
**pnpm Version:** [Version]

## Test Results

- [ ] Database initialization: PASS/FAIL
- [ ] Type checking: PASS/FAIL
- [ ] Dev server: PASS/FAIL
- [ ] Landing page: PASS/FAIL
- [ ] Authentication: PASS/FAIL
- [ ] Admin panel: PASS/FAIL
- [ ] Build: PASS/FAIL

## Issues Found

[List any issues]

## Notes

[Additional observations]
```
