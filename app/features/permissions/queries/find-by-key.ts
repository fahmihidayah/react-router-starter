import { eq } from 'drizzle-orm'
import { permissions, type TPermission } from '~/db/schema'
import { db } from '~/lib/database'
import type { PermissionKey } from '../permission-registry'

export async function findByKey(key: PermissionKey): Promise<TPermission | undefined> {
  const [permission] = await db.select().from(permissions).where(eq(permissions.key, key)).limit(1)
  return permission
}
