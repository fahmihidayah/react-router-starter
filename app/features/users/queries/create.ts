import { type TInsertUser, users } from '~/db/schema'
import { db } from '~/lib/database'

export async function create(data: TInsertUser): Promise<string> {
  const [result] = await db.insert(users).values(data).returning({ id: users.id })
  return result.id
}
