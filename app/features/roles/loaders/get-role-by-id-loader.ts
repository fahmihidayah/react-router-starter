import * as roleService from '../services'

export function getRoleByIdLoader(id: string) {
  return roleService.findById(id)
}
