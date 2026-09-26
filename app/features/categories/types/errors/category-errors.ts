export class CategoryNotFoundError extends Error {
  constructor(message = 'Category not found') {
    super(message)
    this.name = 'CategoryNotFoundError'
  }
}

export class CategoryAlreadyExistsError extends Error {
  constructor(message = 'A category with this title already exists') {
    super(message)
    this.name = 'CategoryAlreadyExistsError'
  }
}

export class CategoryCreationFailedError extends Error {
  constructor(message = 'Failed to create category') {
    super(message)
    this.name = 'CategoryCreationFailedError'
  }
}

export class InvalidCategoryDataError extends Error {
  constructor(message = 'Invalid category data') {
    super(message)
    this.name = 'InvalidCategoryDataError'
  }
}
