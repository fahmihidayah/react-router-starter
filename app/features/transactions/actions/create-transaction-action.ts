import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { transactionRepository } from '../repositories'
import { createTransactionSchema } from '../schemas/transaction-schema'

export async function createTransactionAction(request: Request) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  // Convert amount to number if it's a string
  const parsedData = {
    ...rawData,
    amount: rawData.amount ? Number(rawData.amount) : undefined,
  }

  const result = createTransactionSchema.safeParse(parsedData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { congregationId, amount, paymentMethod, status, notes, transactionDate } = result.data

    const now = new Date()

    await transactionRepository.create({
      id: randomUUID(),
      congregationId,
      amount,
      paymentMethod,
      status,
      notes: notes || null,
      transactionDate: new Date(transactionDate),
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/transactions')
  } catch (_error) {
    return {
      errors: {
        congregationId: ['Failed to create transaction. Please try again.'],
        amount: [],
        paymentMethod: [],
        status: [],
        notes: [],
        transactionDate: [],
      },
    }
  }
}
