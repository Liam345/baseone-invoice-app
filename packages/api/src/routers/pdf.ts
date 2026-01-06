import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  generateInvoicePDF, 
  generateInvoicePDFStream,
  formatInvoiceForPDF,
  validateInvoiceData,
  generatePDFFilename,
  type PDFGenerationOptions 
} from '@invoice/pdf'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from '@invoice/db'
import { invoices, customers, teams } from '@invoice/db/schema'

const pdfOptionsSchema = z.object({
  template: z.enum(['modern', 'classic', 'minimal', 'professional']).optional().default('modern'),
  theme: z.enum(['light', 'dark']).optional().default('light'),
  language: z.string().optional().default('en'),
  include_qr: z.boolean().optional().default(false),
  include_logo: z.boolean().optional().default(true),
  watermark: z.string().optional(),
  page_size: z.enum(['A4', 'Letter', 'Legal']).optional().default('A4'),
  margin: z.number().optional().default(40),
  font_size: z.number().optional().default(10),
})

export const pdfRouter = createTRPCRouter({
  /**
   * Generate PDF for an invoice
   */
  generateInvoicePDF: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().min(1),
        options: pdfOptionsSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the invoice with related data
        const invoice = await ctx.db.query.invoices.findFirst({
          where: eq(invoices.id, input.invoiceId),
          with: {
            customer: true,
            team: true,
            line_items: true,
          },
        })

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          })
        }

        // Check if user has access to this invoice
        if (invoice.team_id !== ctx.user.team_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          })
        }

        // Format invoice data for PDF
        const formattedInvoice = formatInvoiceForPDF({
          ...invoice,
          company: {
            name: invoice.team.name || 'Your Company',
            email: invoice.team.email,
            // Add more team/company details as needed
          },
          template: {
            ...invoice.template,
            logo_url: invoice.team.logoUrl || invoice.template?.logo_url,
            primary_color: invoice.team.primaryColor || invoice.template?.primary_color,
            secondary_color: invoice.team.secondaryColor || invoice.template?.secondary_color,
            font_family: invoice.team.fontFamily || invoice.template?.font_family,
            from_details: {
              name: invoice.team.name,
              email: invoice.team.email,
            },
          },
        })

        // Validate invoice data
        const validation = validateInvoiceData(formattedInvoice)
        if (!validation.valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid invoice data: ${validation.errors.join(', ')}`,
          })
        }

        // Generate PDF
        const result = await generateInvoicePDF(formattedInvoice, input.options)

        if (!result.success || !result.buffer) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Failed to generate PDF',
          })
        }

        // Convert buffer to base64 for transmission
        const base64PDF = result.buffer.toString('base64')

        return {
          success: true,
          filename: generatePDFFilename(formattedInvoice),
          size: result.size,
          pages: result.pages,
          data: base64PDF,
          contentType: 'application/pdf',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        
        console.error('PDF generation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate PDF',
        })
      }
    }),

  /**
   * Preview PDF options (validate without generating)
   */
  previewPDFOptions: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().min(1),
        options: pdfOptionsSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      // Get basic invoice info for preview
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
        with: {
          customer: true,
          line_items: true,
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        })
      }

      // Check access
      if (invoice.team_id !== ctx.user.team_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        })
      }

      const formattedInvoice = formatInvoiceForPDF(invoice)
      const validation = validateInvoiceData(formattedInvoice)

      return {
        valid: validation.valid,
        errors: validation.errors,
        filename: generatePDFFilename(formattedInvoice),
        options: input.options,
        invoice: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer.name,
          total: formattedInvoice.total,
          currency: invoice.currency,
          line_items_count: invoice.line_items.length,
        },
      }
    }),

  /**
   * Get PDF templates list
   */
  getTemplates: protectedProcedure.query(async () => {
    return {
      templates: [
        {
          id: 'modern',
          name: 'Modern',
          description: 'Clean and professional design with modern typography',
          preview_url: '/templates/modern-preview.png',
          features: ['Clean design', 'Professional layout', 'Company branding'],
        },
        {
          id: 'classic',
          name: 'Classic',
          description: 'Traditional invoice layout with timeless appeal',
          preview_url: '/templates/classic-preview.png',
          features: ['Traditional layout', 'Business formal', 'Conservative styling'],
          available: true,
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Simple and clean design with minimal elements',
          preview_url: '/templates/minimal-preview.png',
          features: ['Minimal design', 'Clean typography', 'Focused layout'],
          available: true,
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'Corporate design with enhanced branding options',
          preview_url: '/templates/professional-preview.png',
          features: ['Corporate design', 'Enhanced branding', 'Detailed layout'],
          available: false, // Not implemented yet
        },
      ],
      default_template: 'modern',
    }
  }),
})