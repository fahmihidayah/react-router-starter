import { useRef } from 'react'
import { Link, useNavigation, useSubmit } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { RichEditor, type RichEditorHandle } from '~/components/ui/rich-editor'
import type { TCategory, TPost } from '~/db/schema'

export interface PostFormProps {
  post?: TPost
  categories: TCategory[]
  errors?: Record<string, string[] | undefined>
}

export function PostForm({ post, categories, errors }: PostFormProps) {
  const submit = useSubmit()
  const navigation = useNavigation()
  const editorRef = useRef<RichEditorHandle>(null)
  const saving = navigation.state !== 'idle'

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (saving) return
        const data = new FormData(event.currentTarget)
        data.set('content', editorRef.current?.getJSON() ?? '')
        submit(data, { method: 'post' })
      }}
    >
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to="/admin/posts">Cancel</Link>
        </Button>
        <Button type="submit" disabled={saving || categories.length === 0}>
          {saving ? 'Saving...' : 'Save post'}
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={post?.title ?? ''}
          required
          maxLength={255}
          placeholder="Post title"
          aria-invalid={!!errors?.title}
          aria-describedby={errors?.title ? 'title-error' : undefined}
        />
        {errors?.title?.[0] && (
          <p id="title-error" role="alert" className="text-sm text-destructive">
            {errors.title[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={post?.categoryId ?? ''}
          required
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          aria-invalid={!!errors?.categoryId}
          aria-describedby={errors?.categoryId ? 'category-error' : undefined}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <Link className="underline" to="/admin/categories/new">
              Create a category
            </Link>{' '}
            before adding a post.
          </p>
        )}
        {errors?.categoryId?.[0] && (
          <p id="category-error" role="alert" className="text-sm text-destructive">
            {errors.categoryId[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <RichEditor
          id="content"
          ref={editorRef}
          initialContent={post?.content}
          placeholder="Write your post..."
          aria-invalid={!!errors?.content}
          aria-describedby={errors?.content ? 'content-error' : undefined}
        />
        {errors?.content?.[0] && (
          <p id="content-error" role="alert" className="text-sm text-destructive">
            {errors.content[0]}
          </p>
        )}
      </div>
    </form>
  )
}
