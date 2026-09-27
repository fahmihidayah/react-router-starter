import { auth } from '~/lib/auth'
import type { PaginateDocs } from '~/types/pagination'
import * as userQueries from '../queries'
import type { TCreateUser, TUpdateUser } from '../schemas/form/user-schema'
import type { UserWithRoles } from '../types'
import {
  EmailAlreadyExistsError,
  InvalidUserDataError,
  UserCreationFailedError,
  UserNotFoundError,
} from '../types/errors/user-errors'

const ROLE_USER = 'User'

async function assignDefaultRole(userId: string): Promise<void> {
  await userQueries.assignRoleByName(userId, ROLE_USER)
}

export async function create(
  data: TCreateUser,
): Promise<{ userId: string; setCookie: string | null }> {
  const { name, email, password } = data
  const response = await auth.api.createUser({
    body: { name, email, password, role: 'user' },
    asResponse: true,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    if (response.status === 400) {
      const message = errorData?.message ?? 'Invalid user data'
      if (message.toLowerCase().includes('exist')) {
        throw new EmailAlreadyExistsError(message)
      }
      throw new InvalidUserDataError(message)
    }
    if (response.status === 409) {
      throw new EmailAlreadyExistsError(errorData?.message)
    }
    throw new UserCreationFailedError(errorData?.message)
  }

  const body = (await response.json().catch(() => null)) as { user?: { id?: string } } | null
  if (!body?.user?.id) {
    throw new UserCreationFailedError('Failed to create user')
  }

  await assignDefaultRole(body.user.id)
  return {
    userId: body.user.id,
    setCookie: null,
  }
}

export async function register(
  data: TCreateUser,
): Promise<{ userId: string; setCookie: string | null }> {
  const { name, email, password } = data
  const response = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: true,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    if (response.status === 400 || response.status === 422) {
      const message = errorData?.message ?? 'Invalid user data'
      if (message.toLowerCase().includes('exist')) {
        throw new EmailAlreadyExistsError(message)
      }
      throw new InvalidUserDataError(message)
    }
    if (response.status === 409) {
      throw new EmailAlreadyExistsError(errorData?.message)
    }
    throw new UserCreationFailedError(errorData?.message)
  }

  const body = (await response.json().catch(() => null)) as { user?: { id?: string } } | null
  if (!body?.user?.id) {
    throw new UserCreationFailedError('Failed to create user')
  }

  await assignDefaultRole(body.user.id)
  return {
    userId: body.user.id,
    setCookie: response.headers.get('set-cookie'),
  }
}

export async function findPaginated(
  params: userQueries.FindPaginatedParams,
): Promise<PaginateDocs<UserWithRoles>> {
  return await userQueries.findPaginated(params)
}

export async function findById(id: string): Promise<UserWithRoles | undefined> {
  return await userQueries.findById(id)
}

export async function update(id: string, data: TUpdateUser): Promise<void> {
  const existingUser = await userQueries.findById(id)
  if (!existingUser) {
    throw new UserNotFoundError()
  }

  if (data.email && data.email !== existingUser.email) {
    const userWithEmail = await userQueries.findByEmail(data.email)
    if (userWithEmail && userWithEmail.id !== id) {
      throw new EmailAlreadyExistsError('Email already in use')
    }
  }

  await userQueries.update(id, data)
}

export async function deleteById(id: string): Promise<void> {
  const existingUser = await userQueries.findById(id)
  if (!existingUser) {
    throw new UserNotFoundError()
  }

  await userQueries.deleteById(id)
}

export async function deleteMany(ids: string[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new InvalidUserDataError('Invalid user IDs provided')
  }

  await userQueries.deleteMany(ids)
}
