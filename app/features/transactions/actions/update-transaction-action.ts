import { redirect } from 'react-router'
import { transactionRepository } from '../repositories'
import { updateTransactionSchema } from '../schemas/transaction-schema'

export async function updateTransactionAction(request: Request, id: string) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  // Convert amount to number if it's a string
  const parsedData = {
    ...rawData,
    amount: rawData.amount ? Number(rawData.amount) : undefined,
  }

  const result = updateTransactionSchema.safeParse(parsedData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { congregationId, amount, paymentMethod, status, notes, transactionDate } = result.data

    await transactionRepository.update(id, {
      congregationId,
      amount,
      paymentMethod,
      status,
      notes: notes || null,
      transactionDate: new Date(transactionDate),
      updatedAt: new Date(),
    })

    return redirect('/dashboard/transactions')
  } catch (_error) {
    return {
      errors: {
        congregationId: ['Failed to update transaction. Please try again.'],
        amount: [],
        paymentMethod: [],
        status: [],
        notes: [],
        transactionDate: [],
      },
    }
  }
}
