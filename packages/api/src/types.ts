import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Base tRPC context interface
 */
export interface TRPCContext {
  user: User | null
  supabase: SupabaseClient | null | undefined
  req?: Request
}

/**
 * Error codes used throughout the API
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Common API response types
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * Filter parameters for invoices
 */
export interface InvoiceFilters {
  status?: string[]
  customerId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Filter parameters for customers
 */
export interface CustomerFilters {
  search?: string
  tags?: string[]
}

/**
 * Sort parameters
 */
export interface SortParams {
  field?: string
  direction?: 'asc' | 'desc'
}