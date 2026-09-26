export class PostNotFoundError extends Error {
  constructor(message = 'Post not found') {
    super(message)
    this.name = 'PostNotFoundError'
  }
}

export class PostCreationFailedError extends Error {
  constructor(message = 'Failed to create post') {
    super(message)
    this.name = 'PostCreationFailedError'
  }
}

export class PostUpdateFailedError extends Error {
  constructor(message = 'Failed to update post') {
    super(message)
    this.name = 'PostUpdateFailedError'
  }
}

export class SlugAlreadyExistsError extends Error {
  constructor(message = 'A post with this title already exists') {
    super(message)
    this.name = 'SlugAlreadyExistsError'
  }
}

export class InvalidPostDataError extends Error {
  constructor(message = 'Invalid post data') {
    super(message)
    this.name = 'InvalidPostDataError'
  }
}
