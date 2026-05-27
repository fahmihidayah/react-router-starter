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
import { updateTagSchema, type TUpdateTag } from '~/features/tags/schemas/tag-schema'
import type { TTag } from '~/db/schema'

interface EditTagFormProps {
  tag: TTag
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function EditTagForm({ tag, errors, onSubmit }: EditTagFormProps) {
  const form = useForm<TUpdateTag>({
    resolver: zodResolver(updateTagSchema),
    defaultValues: {
      name: tag.name || '',
      color: tag.color || '#000000',
    },
  })

  const handleSubmit = async (data: TUpdateTag) => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.color) {
      formData.append('color', data.color)
    }

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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={form.formState.isSubmitting} {...field} maxLength={50} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    disabled={form.formState.isSubmitting}
                    {...field}
                    value={field.value || '#000000'}
                  />
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
