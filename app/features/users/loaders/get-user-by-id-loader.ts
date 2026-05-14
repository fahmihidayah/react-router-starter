import { userRepository } from '../user-repository'

export async function getUserByIdLoader(id: string) {
  const user = await userRepository.findById(id)

  if (!user) {
    throw new Response('User not found', { status: 404 })
  }

  return user
}
