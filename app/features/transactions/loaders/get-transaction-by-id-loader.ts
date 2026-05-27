import { transactionRepository } from '../repositories'

export async function getTransactionByIdLoader(id: string) {
  return transactionRepository.findById(id)
}
