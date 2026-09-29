export class RoleNotFoundError extends Error {
  constructor(message = 'Role not found') {
    super(message)
    this.name = 'RoleNotFoundError'
  }
}

export class RoleAlreadyExistsError extends Error {
  constructor(message = 'A role with this name already exists') {
    super(message)
    this.name = 'RoleAlreadyExistsError'
  }
}

export class InvalidRoleDataError extends Error {
  constructor(message = 'Invalid role data') {
    super(message)
    this.name = 'InvalidRoleDataError'
  }
}
