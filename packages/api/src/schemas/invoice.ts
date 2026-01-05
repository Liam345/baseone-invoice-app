import { z } from 'zod'

/**
 * Invoice status enum
 */
export const invoiceStatusSchema = z.enum([
  'draft',
  'unpaid',
  'paid',
  'overdue',
  'canceled'
])

/**
 * Invoice creation schema
 */
export const createInvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  invoice_number: z.string().optional(),
  issue_date: z.string().datetime().optional(),
  due_date: z.string().datetime(),
  currency: z.string().length(3).default('USD'),
  exchange_rate: z.number().positive().optional(),
  status: invoiceStatusSchema.default('draft'),
  note: z.string().optional(),
  template: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    logo_url: z.string().url().optional(),
    from_details: z.object({
      name: z.string(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
    }).optional(),
    payment_details: z.object({
      bank_name: z.string().optional(),
      account_number: z.string().optional(),
      routing_number: z.string().optional(),
      swift: z.string().optional(),
      iban: z.string().optional(),
    }).optional(),
  }).optional(),
  line_items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().positive(),
    price: z.number(),
    tax: z.number().optional().default(0),
  })).min(1),
})

/**
 * Invoice update schema
 */
export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.string().uuid(),
})

/**
 * Invoice filters schema
 */
export const invoiceFiltersSchema = z.object({
  status: z.array(invoiceStatusSchema).optional(),
  customer_id: z.string().uuid().optional(),
  search: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
  sort_field: z.enum(['created_at', 'due_date', 'amount', 'invoice_number']).default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Get invoice by ID schema
 */
export const getInvoiceSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Delete invoice schema
 */
export const deleteInvoiceSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Send invoice email schema
 */
export const sendInvoiceSchema = z.object({
  id: z.string().uuid(),
  to: z.string().email().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
})

/**
 * Invoice payment schema
 */
export const markInvoicePaidSchema = z.object({
  id: z.string().uuid(),
  paid_at: z.string().datetime().optional(),
  payment_method: z.string().optional(),
  payment_reference: z.string().optional(),
})

/**
 * Public invoice access schema (for sharing)
 */
export const publicInvoiceSchema = z.object({
  token: z.string(),
})

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type InvoiceFiltersInput = z.infer<typeof invoiceFiltersSchema>
export type GetInvoiceInput = z.infer<typeof getInvoiceSchema>
export type DeleteInvoiceInput = z.infer<typeof deleteInvoiceSchema>
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>
export type MarkInvoicePaidInput = z.infer<typeof markInvoicePaidSchema>
export type PublicInvoiceInput = z.infer<typeof publicInvoiceSchema>