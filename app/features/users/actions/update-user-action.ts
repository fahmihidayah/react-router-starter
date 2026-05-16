import { redirect } from 'react-router'
import { userRepository } from '../repositories'

export async function updateUserAction(request: Request, id: string) {
  const formData = await request.formData()

  try {
    const name = formData.get('name')?.toString()
    const email = formData.get('email')?.toString()

    await userRepository.update(id, {
      name,
      email,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/users')
  } catch (_error) {
    return {
      error: 'Failed to update user. Please try again.',
    }
  }
}
