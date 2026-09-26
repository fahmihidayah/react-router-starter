import { eq } from 'drizzle-orm'
import { users } from '~/db/schema'
import { db } from '~/lib/database'

export type UpdateUserData = {
  email?: string
  name?: string
}

export async function update(id: string, data: UpdateUserData): Promise<void> {
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
}
