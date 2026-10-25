import { db } from '~/lib/database'
import type { UserWithRole } from '../types'
import { toUserWithRole } from './utils'

export async function findById(id: string): Promise<UserWithRole | undefined> {
  const result = await db.query.users.findFirst({
    where: { id: id },
    with: {
      userRole: {
        with: {
          role: true,
        },
      },
    },
  })
  return result ? toUserWithRole(result) : undefined

}
