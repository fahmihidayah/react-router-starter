import { qurbanRepository } from '../repositories'

export async function getQurbanByIdLoader(id: string) {
  return qurbanRepository.findById(id)
}
