import { randomUUID } from 'node:crypto'
import type { TAuditLog } from '~/db/schema'
import * as auditLogQueries from '../queries'

export interface RecordAuditLogInput {
  actorId: string
  entityType: string
  entityId: string
}

export function record(input: RecordAuditLogInput): Promise<TAuditLog> {
  return auditLogQueries.create({
    id: randomUUID(),
    actorId: input.actorId,
    entityType: input.entityType,
    entityId: input.entityId,
    createdAt: new Date(),
  })
}

export function findByEntity(entityType: string, entityId: string): Promise<TAuditLog[]> {
  return auditLogQueries.findByEntity(entityType, entityId)
}

export function findRecentByActor(actorId: string, limit?: number): Promise<TAuditLog[]> {
  return auditLogQueries.findRecentByActor(actorId, limit)
}
