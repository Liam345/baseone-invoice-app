import { TRPCError } from '@trpc/server'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { logError } from './logger'

/**
 * Custom error class for business logic errors
 */
export class BusinessError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string = 'BUSINESS_ERROR', statusCode: number = 400) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends Error {
  public readonly operation: string
  public readonly table?: string

  constructor(message: string, operation: string, table?: string) {
    super(message)
    this.name = 'DatabaseError'
    this.operation = operation
    this.table = table
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  public readonly field?: string
  public readonly value?: any

  constructor(message: string, field?: string, value?: any) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
  }
}

/**
 * Convert various error types to tRPC errors
 */
export function handleError(error: unknown, context: string): TRPCError {
  // Log the error for monitoring
  logError(error, context)

  // Handle known error types
  if (error instanceof TRPCError) {
    return error
  }

  if (error instanceof AuthenticationError) {
    return new TRPCError({
      code: 'UNAUTHORIZED',
      message: error.message,
    })
  }

  if (error instanceof AuthorizationError) {
    return new TRPCError({
      code: 'FORBIDDEN',
      message: error.message,
    })
  }

  if (error instanceof ValidationError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: {
        field: error.field,
        value: error.value,
      },
    })
  }

  if (error instanceof BusinessError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: {
        code: error.code,
        statusCode: error.statusCode,
      },
    })
  }

  if (error instanceof DatabaseError) {
    return new TRPCError({
      code: 'INTERNAL_ERROR',
      message: 'Database operation failed',
      cause: {
        operation: error.operation,
        table: error.table,
      },
    })
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  
  return new TRPCError({
    code: 'INTERNAL_ERROR',
    message,
    cause: error,
  })
}

/**
 * Error response helper for consistent error formatting
 */
export function createErrorResponse(
  code: TRPC_ERROR_CODE_KEY,
  message: string,
  details?: Record<string, any>
): TRPCError {
  return new TRPCError({
    code,
    message,
    cause: details,
  })
}

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: 'Authentication required',
  ACCESS_DENIED: 'Access denied',
  RESOURCE_NOT_FOUND: 'Resource not found',
  INVALID_INPUT: 'Invalid input data',
  OPERATION_FAILED: 'Operation failed',
  DATABASE_ERROR: 'Database operation failed',
  VALIDATION_ERROR: 'Validation error',
  TEAM_MEMBERSHIP_REQUIRED: 'Team membership required',
  ADMIN_ACCESS_REQUIRED: 'Admin access required',
  INVOICE_NOT_FOUND: 'Invoice not found',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  TEAM_NOT_FOUND: 'Team not found',
  USER_NOT_FOUND: 'User not found',
} as const