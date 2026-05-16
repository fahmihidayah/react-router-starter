# Posts Feature - Quick Start Guide

## 🎯 Quick Links

| Action | Route | Description |
|--------|-------|-------------|
| **View Posts** | `/dashboard/posts` | List all posts with search/filter |
| **Create Post** | `/dashboard/posts/add` | New post form |
| **Edit Post** | `/dashboard/posts/:id` | Edit existing post |

---

## 🚀 Getting Started

### 1. Push Database Schema
```bash
pnpm db:push
```

### 2. Create a Post
Navigate to `/dashboard/posts/add`:
1. Enter **Title** (e.g., "My First Post")
2. Select **Category** from dropdown
3. Write content in **Rich Editor**
4. Click **Save**

✨ Slug auto-generated: "My First Post" → "my-first-post"

### 3. Edit a Post
Navigate to `/dashboard/posts/:id`:
1. Form auto-populated with existing data
2. Rich Editor shows original content
3. Modify any fields
4. Click **Save**

### 4. Delete a Post
From `/dashboard/posts`:
1. Click **Delete** button on post row
2. Confirm in dialog
3. ✅ Post deleted with cascade

---

## 📚 File Reference

### Core Files
- **Schema**: `app/db/schema.ts`
- **Repository**: `app/features/posts/repositories/post-repository.ts`
- **Schemas**: `app/features/posts/schemas/post-schema.ts`
- **Routes**: `app/routes/dashboard.posts*.tsx`

### UI Components
- **Add Form**: `app/features/posts/components/admin/form/add-post-form.tsx`
- **Edit Form**: `app/features/posts/components/admin/form/edit-post-form.tsx`
- **Rich Editor**: `app/components/ui/rich-editor.tsx`

### Utilities
- **Slug**: `app/utils/slug.ts`

---

## 🧪 Testing

Run all tests:
```bash
pnpm vitest run app/features/posts app/utils/slug.test.ts
```

Expected output:
```
✓ 3 test files passed
✓ 43 tests passed
```

---

## 🎨 Rich Editor Features

In the post editor, use the toolbar:

- **Bold** - Ctrl/Cmd + B
- **Italic** - Ctrl/Cmd + I
- **Underline** - Ctrl/Cmd + U
- **Headings** - H1, H2, H3 dropdown
- **Lists** - Bullet or numbered lists
- **Quotes** - Block quote formatting
- **Undo/Redo** - Full edit history

---

## 🔍 Search & Filter

From posts list:
- **Search Box**: Filter by post title (case-insensitive)
- **Category Filter**: Filter by category (if added to UI)
- **Pagination**: Navigate between pages
- **Sort**: Click column headers

---

## 📋 Post Structure

Each post contains:
- `id` - Unique identifier (UUID)
- `slug` - URL-safe slug (auto-generated from title)
- `title` - Post title (max 255 chars)
- `content` - Post content (rich text)
- `categoryId` - Related category (required)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

---

## ⚡ Common Tasks

### Create Post Programmatically
```typescript
import { postRepository } from '~/features/posts/repositories'
import { createSlugFrom } from '~/utils/slug'

const post = await postRepository.create({
  id: 'post-123',
  slug: createSlugFrom('My Title'),
  title: 'My Title',
  content: 'Content here...',
  categoryId: 'cat-123',
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Find Post by Slug
```typescript
const post = await postRepository.findBySlug('my-first-post')
```

### Search Posts
```typescript
const result = await postRepository.findWithFilter({
  search: 'javascript',
  categoryId: 'cat-123',
  page: 1,
  limit: 10
})
```

### Delete Post
```typescript
await postRepository.delete('post-123')
```

---

## 🐛 Troubleshooting

### Post not showing in list
- Check category is created
- Verify posts assigned to valid category
- Check pagination (may be on page 2+)

### Slug validation error
- Title already in use (slug must be unique)
- Use different title for new post

### Rich editor content not loading
- Ensure `initialContent` prop passed to RichEditor
- Check post.content is not empty

### Form submission error
- Check category is selected
- Verify title and content are not empty
- Check browser console for details

---

## 📞 Need Help?

See full documentation: `POSTS_FEATURE_GUIDE.md`

---

**Happy blogging!** 📝✨
