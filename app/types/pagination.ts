/**
 * Generic paginated response wrapper for API responses
 * Extracts pagination metadata from the response
 */
export interface PaginateDocs<T> {
  docs: T[]
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
