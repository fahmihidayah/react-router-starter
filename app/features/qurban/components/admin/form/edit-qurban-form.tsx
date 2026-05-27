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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { updateQurbanSchema, type TUpdateQurban } from '~/features/qurban/schemas/qurban-schema'
import type { TQurban } from '~/db/schema'

interface EditQurbanFormProps {
  qurban: TQurban
  transactions?: Array<{ id: string; amount: number; congregationName?: string }>
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function EditQurbanForm({ qurban, transactions = [], errors, onSubmit }: EditQurbanFormProps) {
  const form = useForm<TUpdateQurban>({
    resolver: zodResolver(updateQurbanSchema),
    defaultValues: {
      transactionId: qurban.transactionId || '',
      animalType: qurban.animalType || 'goat',
      groupNumber: qurban.groupNumber || undefined,
      hijriYear: qurban.hijriYear || new Date().getFullYear() - 579,
      notes: qurban.notes || '',
    },
  })

  const handleSubmit = async (data: TUpdateQurban) => {
    const formData = new FormData()
    formData.append('transactionId', data.transactionId)
    formData.append('animalType', data.animalType)
    if (data.groupNumber) {
      formData.append('groupNumber', data.groupNumber.toString())
    }
    formData.append('hijriYear', data.hijriYear.toString())
    if (data.notes) {
      formData.append('notes', data.notes)
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
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={form.formState.isSubmitting}>
                      <SelectValue placeholder="Select transaction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactions.map((transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {transaction.congregationName || 'Unknown'} - ${transaction.amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="animalType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Animal Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={form.formState.isSubmitting}>
                      <SelectValue placeholder="Select animal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="cow">Cow</SelectItem>
                    <SelectItem value="camel">Camel</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={form.formState.isSubmitting}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hijriYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hijri Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={form.formState.isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea disabled={form.formState.isSubmitting} {...field} />
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
