import type { ZodError } from 'zod'

/**
 * Validation error format for field-level errors
 * Maps field names to arrays of error messages
 */
export type ValidationErrors = Record<string, string[]>

/**
 * Error type can be:
 * - string: Simple error message
 * - string[]: Array of error messages
 * - ValidationErrors: Field-specific validation errors (from Zod)
 */
export type ErrorType = string | string[] | ValidationErrors

/**
 * Unified response structure for both API and regular actions/loaders
 */
export type ApiResponse<TData = unknown> = {
  success: boolean
  status: number
  data?: TData
  error?: ErrorType
}

/**
 * Success response helper type
 */
export type SuccessResponse<TData = unknown> = {
  success: true
  status: number
  data: TData
  error?: never
}

/**
 * Error response helper type
 */
export type ErrorResponse = {
  success: false
  status: number
  data?: never
  error: ErrorType
}

/**
 * Helper function to create a success response
 */
export function createSuccessResponse<TData>(
  data: TData,
  status: number = 200
): SuccessResponse<TData> {
  return {
    success: true,
    status,
    data,
  }
}

/**
 * Helper function to create an error response
 */
export function createErrorResponse(
  error: ErrorType,
  status: number = 400
): ErrorResponse {
  return {
    success: false,
    status,
    error,
  }
}

/**
 * Convert Zod error to ValidationErrors format
 */
export function zodErrorToValidationErrors(error: ZodError): ValidationErrors {
  return error.flatten().fieldErrors as ValidationErrors
}

/**
 * Convert ApiResponse to JSON Response for API routes
 */
export function toJsonResponse<TData>(response: ApiResponse<TData>): Response {
  const { status, success, data, error } = response

  if (success) {
    return Response.json(
      { success, data },
      { status }
    )
  }

  return Response.json(
    { success, error },
    { status }
  )
}
