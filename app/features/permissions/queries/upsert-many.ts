import { sql } from 'drizzle-orm'
import { permissions, type TInsertPermission, type TPermission } from '~/db/schema'
import { db } from '~/lib/database'

export async function upsertMany(values: TInsertPermission[]): Promise<TPermission[]> {
  if (!values.length) return []

  return db
    .insert(permissions)
    .values(values)
    .onConflictDoUpdate({
      target: permissions.key,
      set: {
        resource: sql`excluded."resource"`,
        action: sql`excluded."action"`,
        name: sql`excluded."name"`,
        description: sql`excluded."description"`,
        updatedAt: sql`excluded."updatedAt"`,
      },
    })
    .returning()
}
