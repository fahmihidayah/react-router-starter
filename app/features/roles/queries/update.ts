import { eq } from 'drizzle-orm'
import { roles } from '~/db/schema'
import { db } from '~/lib/database'

export type UpdateRoleData = {
  name?: string
  description?: string | null
}

export async function update(id: string, data: UpdateRoleData) {
  await db
    .update(roles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(roles.id, id))
}
