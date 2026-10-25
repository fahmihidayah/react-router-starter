import { and, desc, eq } from 'drizzle-orm'
import { auditLogs, type TAuditLog, type TInsertAuditLog } from '~/db/schema'
import { db } from '~/lib/database'

export async function create(data: TInsertAuditLog): Promise<TAuditLog> {
  const [auditLog] = await db.insert(auditLogs).values(data).returning()
  return auditLog
}

export function findByEntity(entityType: string, entityId: string): Promise<TAuditLog[]> {
  return db
    .select()
    .from(auditLogs)
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.createdAt))
}

export function findRecentByActor(actorId: string, limit = 50): Promise<TAuditLog[]> {
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.actorId, actorId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
}
