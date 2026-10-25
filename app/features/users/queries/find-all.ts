import { db } from '~/lib/database'
import type { UserWithRole } from '../types'
import { toUserWithRole } from './utils'

export async function findAll(): Promise<UserWithRole[]> {
  const result = await db.query.users.findMany({
    with: {
      userRole: {
        with: {
          role: true,
        },
      },
    },
  })
  return result.map(toUserWithRole)
}
