import { randomUUID } from 'node:crypto'
import type { TPermission } from '~/db/schema'
import {
  PERMISSION_REGISTRY,
  type PermissionDefinition,
  type PermissionKey,
} from '../permission-registry'
import * as permissionQueries from '../queries'

export function findAll(): Promise<TPermission[]> {
  return permissionQueries.findAll()
}

export function findByKey(key: PermissionKey): Promise<TPermission | undefined> {
  return permissionQueries.findByKey(key)
}

export function findForUser(userId: string): Promise<TPermission[]> {
  return permissionQueries.findForUser(userId)
}

export async function findKeysForUser(userId: string): Promise<Set<PermissionKey>> {
  const assignedPermissions = await permissionQueries.findForUser(userId)
  return new Set(assignedPermissions.map(({ key }) => key as PermissionKey))
}

export async function hasPermission(userId: string, key: PermissionKey): Promise<boolean> {
  return (await findKeysForUser(userId)).has(key)
}

export async function hasAnyPermission(
  userId: string,
  keys: readonly PermissionKey[],
): Promise<boolean> {
  if (!keys.length) return false
  const assignedKeys = await findKeysForUser(userId)
  return keys.some((key) => assignedKeys.has(key))
}

export async function hasAllPermissions(
  userId: string,
  keys: readonly PermissionKey[],
): Promise<boolean> {
  if (!keys.length) return true
  const assignedKeys = await findKeysForUser(userId)
  return keys.every((key) => assignedKeys.has(key))
}

export function syncRegistry(
  registry: readonly PermissionDefinition[] = PERMISSION_REGISTRY,
): Promise<TPermission[]> {
  const now = new Date()
  return permissionQueries.upsertMany(
    registry.map((permission) => ({
      id: randomUUID(),
      ...permission,
      createdAt: now,
      updatedAt: now,
    })),
  )
}
