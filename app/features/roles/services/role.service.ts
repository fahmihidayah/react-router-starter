import { randomUUID } from 'node:crypto'
import type { PaginateDocs } from '~/types/pagination'
import * as roleQueries from '../queries'
import type { TCreateRole, TUpdateRole } from '../schemas/form/role-schema'
import type { RoleWithPermissions } from '../types'
import { InvalidRoleDataError, RoleAlreadyExistsError, RoleNotFoundError } from '../types/errors'

export async function create(data: TCreateRole): Promise<string> {
  if (await roleQueries.findByName(data.name)) {
    throw new RoleAlreadyExistsError()
  }

  const now = new Date()
  const role = await roleQueries.create({
    id: randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return role.id
}

export function findAll(): Promise<RoleWithPermissions[]> {
  return roleQueries.findAll()
}

export function findPaginated(
  params: roleQueries.FindPaginatedParams,
): Promise<PaginateDocs<RoleWithPermissions>> {
  return roleQueries.findPaginated(params)
}

export function findById(id: string): Promise<RoleWithPermissions | undefined> {
  return roleQueries.findById(id)
}

export async function update(id: string, data: TUpdateRole): Promise<void> {
  const existingRole = await roleQueries.findById(id)
  if (!existingRole) throw new RoleNotFoundError()

  if (data.name !== existingRole.name) {
    const roleWithName = await roleQueries.findByName(data.name)
    if (roleWithName && roleWithName.id !== id) throw new RoleAlreadyExistsError()
  }

  await roleQueries.update(id, data)
}

export async function deleteById(id: string): Promise<void> {
  if (!(await roleQueries.findById(id))) throw new RoleNotFoundError()
  await roleQueries.deleteById(id)
}

export async function deleteMany(ids: string[]): Promise<void> {
  if (!ids.length) throw new InvalidRoleDataError('Invalid role IDs provided')
  await roleQueries.deleteMany(ids)
}
