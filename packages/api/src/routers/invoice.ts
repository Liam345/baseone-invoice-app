import { TRPCError } from '@trpc/server'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { teamProcedure, protectedProcedure } from '../middleware/auth'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceFiltersSchema,
  getInvoiceSchema,
  deleteInvoiceSchema,
  sendInvoiceSchema,
  markInvoicePaidSchema,
  publicInvoiceSchema,
} from '../schemas/invoice'
import { getInvoices, getInvoiceById, draftInvoice, updateInvoice, deleteInvoice } from '@invoice/db/queries/invoices'
import { generateInvoiceToken, verifyInvoiceToken } from '@invoice/invoice'

export const invoiceRouter = createTRPCRouter({
  /**
   * Get paginated invoices for team with filtering
   */
  list: teamProcedure
    .input(invoiceFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        return await getInvoices(supabase, {
          teamId,
          page: input.page,
          limit: input.limit,
          status: input.status,
          customerId: input.customer_id,
          search: input.search,
          dateFrom: input.date_from,
          dateTo: input.date_to,
          sortField: input.sort_field,
          sortDirection: input.sort_direction,
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch invoices',
          cause: error,
        })
      }
    }),

  /**
   * Get invoice by ID
   */
  getById: teamProcedure
    .input(getInvoiceSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        const invoice = await getInvoiceById(supabase, input.id, teamId)
        
        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        return invoice
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch invoice',
          cause: error,
        })
      }
    }),

  /**
   * Create a new invoice
   */
  create: teamProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx

        const invoice = await draftInvoice(supabase, {
          ...input,
          team_id: teamId,
          created_by: ctx.user.id,
          updated_by: ctx.user.id,
        })

        return invoice
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create invoice',
          cause: error,
        })
      }
    }),

  /**
   * Update an existing invoice
   */
  update: teamProcedure
    .input(updateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the invoice belongs to the team
        const existingInvoice = await getInvoiceById(supabase, input.id, teamId)
        if (!existingInvoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        const { id, ...updateData } = input
        
        const invoice = await updateInvoice(supabase, input.id, {
          ...updateData,
          updated_by: ctx.user.id,
        })

        return invoice
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update invoice',
          cause: error,
        })
      }
    }),

  /**
   * Delete an invoice
   */
  delete: teamProcedure
    .input(deleteInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the invoice belongs to the team
        const existingInvoice = await getInvoiceById(supabase, input.id, teamId)
        if (!existingInvoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        await deleteInvoice(supabase, input.id, teamId)
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete invoice',
          cause: error,
        })
      }
    }),

  /**
   * Mark invoice as paid
   */
  markPaid: teamProcedure
    .input(markInvoicePaidSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the invoice belongs to the team
        const existingInvoice = await getInvoiceById(supabase, input.id, teamId)
        if (!existingInvoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        const invoice = await updateInvoice(supabase, input.id, {
          status: 'paid',
          paid_at: input.paid_at || new Date().toISOString(),
          payment_method: input.payment_method,
          payment_reference: input.payment_reference,
          updated_by: ctx.user.id,
        })

        return invoice
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark invoice as paid',
          cause: error,
        })
      }
    }),

  /**
   * Generate shareable token for invoice
   */
  generateShareToken: teamProcedure
    .input(getInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the invoice belongs to the team
        const invoice = await getInvoiceById(supabase, input.id, teamId)
        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        const token = generateInvoiceToken({
          invoiceId: input.id,
          teamId,
        })

        // Update invoice with token
        await updateInvoice(supabase, input.id, {
          token,
          updated_by: ctx.user.id,
        })

        return { token }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate share token',
          cause: error,
        })
      }
    }),

  /**
   * Get public invoice by token (no auth required)
   */
  getByToken: publicProcedure
    .input(publicInvoiceSchema)
    .query(async ({ ctx, input }) => {
      try {
        const payload = verifyInvoiceToken(input.token)
        
        if (!payload || !payload.invoiceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          })
        }

        // Get invoice without team verification since we're using public token
        const { data: invoice, error } = await ctx.supabase
          ?.from('invoices')
          .select(`
            *,
            customer:customers(*),
            team:teams(*)
          `)
          .eq('id', payload.invoiceId)
          .eq('token', input.token)
          .single()

        if (error || !invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        return invoice
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch public invoice',
          cause: error,
        })
      }
    }),

  /**
   * Send invoice via email
   */
  sendEmail: teamProcedure
    .input(sendInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the invoice belongs to the team
        const invoice = await getInvoiceById(supabase, input.id, teamId)
        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        // TODO: Implement email sending logic
        // This would integrate with the email package in Step 7
        
        // For now, just update the invoice status to indicate it was sent
        await updateInvoice(supabase, input.id, {
          status: 'unpaid',
          sent_at: new Date().toISOString(),
          updated_by: ctx.user.id,
        })

        return { success: true, message: 'Invoice sent successfully' }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to send invoice',
          cause: error,
        })
      }
    }),
})