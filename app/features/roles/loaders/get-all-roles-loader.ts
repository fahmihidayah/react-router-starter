import * as roleService from '../services'

export function getAllRolesLoader() {
  return roleService.findAll()
}
