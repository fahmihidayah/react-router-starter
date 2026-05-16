import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { accountRepository, userRepository } from '../repositories'
import { createUserSchema } from '../schemas/user-schema'

export async function createUserAction(request: Request) {
  const formData = await request.formData()
  const result = createUserSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, email, password } = result.data
    const userId = randomUUID()
    const now = new Date()

    // Create user via repository
    await userRepository.create({
      id: userId,
      name,
      email,
      emailVerified: false,
      image: null,
      createdAt: now,
      updatedAt: now,
    })

    // Create account via repository
    await accountRepository.create({
      id: randomUUID(),
      accountId: email,
      providerId: 'credential',
      userId: userId,
      password,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/users')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to create user. Please try again.'],
        email: [],
        password: [],
      },
    }
  }
}
