import { zodResolver } from '@hookform/resolvers/zod'
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
import { createCategorySchema, type TCreateCategory } from '~/features/categories/schemas/category-schema'

interface AddCategoryFormProps {
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function AddCategoryForm({ errors, onSubmit }: AddCategoryFormProps) {
  const form = useForm<TCreateCategory>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      title: '',
    },
  })

  const handleSubmit = async (data: TCreateCategory) => {
    const formData = new FormData()
    formData.append('title', data.title)

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
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
                  <Input disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  )
}
