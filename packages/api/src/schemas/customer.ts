import { z } from 'zod'

/**
 * Customer creation schema
 */
export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  company: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().length(3).default('USD'),
  tax_id: z.string().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * Customer update schema
 */
export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().uuid(),
})

/**
 * Customer filters schema
 */
export const customerFiltersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  country: z.string().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
  sort_field: z.enum(['created_at', 'name', 'company']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Get customer by ID schema
 */
export const getCustomerSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Delete customer schema
 */
export const deleteCustomerSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Customer analytics schema
 */
export const customerAnalyticsSchema = z.object({
  id: z.string().uuid(),
  period: z.enum(['30d', '90d', '1y', 'all']).default('90d'),
})

/**
 * Tag management schemas
 */
export const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const updateTagSchema = createTagSchema.partial().extend({
  id: z.string().uuid(),
})

export const deleteTagSchema = z.object({
  id: z.string().uuid(),
})

export const addCustomerTagSchema = z.object({
  customer_id: z.string().uuid(),
  tag_id: z.string().uuid(),
})

export const removeCustomerTagSchema = z.object({
  customer_id: z.string().uuid(),
  tag_id: z.string().uuid(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CustomerFiltersInput = z.infer<typeof customerFiltersSchema>
export type GetCustomerInput = z.infer<typeof getCustomerSchema>
export type DeleteCustomerInput = z.infer<typeof deleteCustomerSchema>
export type CustomerAnalyticsInput = z.infer<typeof customerAnalyticsSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type DeleteTagInput = z.infer<typeof deleteTagSchema>
export type AddCustomerTagInput = z.infer<typeof addCustomerTagSchema>
export type RemoveCustomerTagInput = z.infer<typeof removeCustomerTagSchema>