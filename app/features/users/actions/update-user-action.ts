import { redirect } from 'react-router'
import { userRepository } from '../repositories'
import { updateUserSchema } from '../schemas/user-schema'

export async function updateUserAction(request: Request, id: string) {
  const formData = await request.formData()
  const result = updateUserSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, email } = result.data

    await userRepository.update(id, {
      name,
      email,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/users')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to update user. Please try again.'],
        email: [],
      },
    }
  }
}
