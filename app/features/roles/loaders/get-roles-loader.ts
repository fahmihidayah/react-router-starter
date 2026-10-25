import type { PaginateDocs } from '~/types/pagination'
import * as roleService from '../services'
import type { RoleWithPermissions } from '../types'

export function getRolesLoader(request: Request): Promise<PaginateDocs<RoleWithPermissions>> {
  const url = new URL(request.url)
  return roleService.findPaginated({
    page: Number.parseInt(url.searchParams.get('page') || '1', 10),
    limit: Number.parseInt(url.searchParams.get('limit') || '10', 10),
    name: url.searchParams.get('search') || undefined,
  })
}
