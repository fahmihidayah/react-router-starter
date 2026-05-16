import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { RichEditor, type RichEditorHandle } from '~/components/ui/rich-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { TCategory } from '~/features/categories/type'
import { createPostSchema, type TCreatePost } from '~/features/posts/schemas/post-schema'

interface AddPostFormProps {
  categories: TCategory[]
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function AddPostForm({ categories, errors, onSubmit }: AddPostFormProps) {
  const form = useForm<TCreatePost>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
    },
  })

  const editorRef = useRef<RichEditorHandle>(null)

  const handleSubmit = async (data: TCreatePost) => {
    const editorJSON = editorRef.current?.getJSON() || '{}'

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', editorJSON)
    formData.append('categoryId', data.categoryId)

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex flex-row justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Post title"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <RichEditor
                ref={editorRef}
                placeholder="Write your post content here... Use the toolbar to format your text"
              />
            </FormControl>
            <FormMessage>{errors?.content?.[0]}</FormMessage>
          </FormItem>
        </form>
      </Form>
    </>
  )
}
