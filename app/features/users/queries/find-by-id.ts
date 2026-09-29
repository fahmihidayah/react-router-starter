import { db } from '~/lib/database'
import type { UserWithRoles } from '../types'
import { toUserWithRoles } from './utils'

export async function findById(id: string): Promise<UserWithRoles | undefined> {
  const result = await db.query.users.findFirst({
    where: { id: id },
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  })
  return result ? toUserWithRoles(result) : undefined
}
