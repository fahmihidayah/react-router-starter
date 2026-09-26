import { roles } from '~/db/schema'
import { db } from '~/lib/database'
import type { TInsertRole } from '../schemas/db/roles'

export async function create(data: TInsertRole) {
  const [role] = await db.insert(roles).values(data).returning()
  return role
}
