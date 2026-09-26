export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(message = 'An account with this email already exists') {
    super(message)
    this.name = 'EmailAlreadyExistsError'
  }
}

export class UserCreationFailedError extends Error {
  constructor(message = 'Failed to create user') {
    super(message)
    this.name = 'UserCreationFailedError'
  }
}

export class InvalidUserDataError extends Error {
  constructor(message = 'Invalid user data') {
    super(message)
    this.name = 'InvalidUserDataError'
  }
}
