import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { account, user } from '~/db/schema'
import { db } from '~/lib/database'

export async function createUserAction(request: Request) {
  const formData = await request.formData()

  try {
    const name = formData.get('name')?.toString()
    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()

    const userId = randomUUID()
    const now = new Date()

    // Insert user
    await db.insert(user).values({
      id: userId,
      name: name!,
      email: email!,
      emailVerified: false,
      image: null,
      createdAt: now,
      updatedAt: now,
    })

    // Insert account with password
    await db.insert(account).values({
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
