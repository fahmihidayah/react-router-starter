import { db } from '~/lib/database'
import type { UserWithRoles } from '../types'
import { toUserWithRoles } from './utils'

export async function findAll(): Promise<UserWithRoles[]> {
  const result = await db.query.users.findMany({
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  })
  return result.map(toUserWithRoles)
}
