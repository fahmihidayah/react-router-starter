import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { accountRepository, userRepository } from '../repositories'

export async function createUserAction(request: Request) {
  const formData = await request.formData()

  try {
    const name = formData.get('name')?.toString()
    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()

    const userId = randomUUID()
    const now = new Date()

    // Create user via repository
    await userRepository.create({
      id: userId,
      name: name!,
      email: email!,
      emailVerified: false,
      image: null,
      createdAt: now,
      updatedAt: now,
    })

    // Create account via repository
    await accountRepository.create({
      id: randomUUID(),
      accountId: email!,
      providerId: 'credential',
      userId: userId,
      password: password!,
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
      error: 'Failed to create user. Please try again.',
    }
  }
}
