import { useRef } from 'react'
import { useSubmit } from 'react-router'
import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { RichEditorHandle } from '~/components/ui/rich-editor'
import { RichEditor } from '~/components/ui/rich-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { TCategory } from '~/db/schema'
import type { TPost } from '~/db/schema'

interface EditPostFormProps {
  post: TPost
  categories: TCategory[]
  errors?: Record<string, string[] | undefined>
}

export function EditPostForm({ post, categories, errors }: EditPostFormProps) {
  const submit = useSubmit()
  const editorRef = useRef<RichEditorHandle>(null)
  const categoryRef = useRef<HTMLInputElement>(null)

  // Parse double-stringified content if needed
  const getInitialContent = () => {
    if (!post.content) return ''
    try {
      // If content is double-stringified, parse it once
      const parsed = JSON.parse(post.content)
      if (typeof parsed === 'string') {
        return parsed
      }
      return post.content
    } catch {
      return post.content
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const content = editorRef.current?.getJSON()
    formData.set('content', content || '{}')
    submit(formData, { method: 'post' })
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Post title" defaultValue={post.title || ''} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            name="categoryId"
            defaultValue={post.categoryId || ''}
            onValueChange={(value) => {
              if (categoryRef.current) categoryRef.current.value = value
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={categoryRef}
            name="categoryId"
            type="hidden"
            defaultValue={post.categoryId || ''}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="content">Content</Label>
          <RichEditor
            ref={editorRef}
            placeholder="Write your post content here... Use the toolbar to format your text"
            initialContent={getInitialContent()}
          />
        </div>
      </form>
    </>
  )
}
