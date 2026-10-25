# How to Extract the Starter Template

Due to shell state issues, here are manual extraction instructions:

## Option 1: Run the Extraction Script Manually

```bash
cd /Users/s/Documents/NodeJs/learning-tracker
npx tsx scripts/create-starter.ts
```

This will create a fresh `starter-template/` directory with all fixes applied.

## Option 2: Use the Existing Fixed Template

The fixes have already been applied to the current `starter-template` directory if it exists. Just navigate and test:

```bash
cd /Users/s/Documents/NodeJs/learning-tracker/starter-template
pnpm install
cp .env.example .env
# Edit .env with your test database URL
pnpm db:push
pnpm dev
```

## Option 3: Extract from Zip (if zip exists)

```bash
cd /Users/s/Documents/NodeJs/learning-tracker
unzip react-router-starter.zip -d temp-extraction
# The files will be in temp-extraction/Users/s/Documents/NodeJs/learning-tracker/starter-template/
# Move them to the desired location:
mv temp-extraction/Users/s/Documents/NodeJs/learning-tracker/starter-template ./starter-template-clean
cd starter-template-clean
```

## Summary of Fixes Applied

All these fixes are in the extraction script and will be applied automatically:

### 1. Database Schema (`app/db/schema/index.ts`)
- Removed references to `posts` and `tags`
- Only exports 6 included features

### 2. Admin Routes
- Removed: `admin/posts.*`
- Removed: `admin/categories.*`
- Removed: All other domain-specific admin routes

### 3. Public Layout (`app/routes/_public.tsx`)
- Replaced `~/features/page/components/landing` imports
- Simple self-contained layout

### 4. Privacy & Terms Pages
- Standalone implementations
- No external feature dependencies

## Testing After Extraction

See `MANUAL_TEST_GUIDE.md` for complete testing instructions.

Quick test:
```bash
cd starter-template
pnpm install
pnpm typecheck  # Should pass
pnpm db:push    # Should work (use fresh DB!)
pnpm dev        # Should start
```

## What's Included

✅ 12 infrastructure features
✅ 40+ UI components
✅ Complete auth system
✅ Admin panel framework
✅ Email service
✅ Media upload
✅ And more...

See `README.md` in the starter-template for full feature list.
