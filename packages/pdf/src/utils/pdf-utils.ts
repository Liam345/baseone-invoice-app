import type { InvoiceData } from '../types'

/**
 * Create PDF buffer utility function
 */
export async function createPDFBuffer(doc: any): Promise<Buffer> {
  return await doc.toBuffer()
}

/**
 * Format invoice data for PDF generation
 */
export function formatInvoiceForPDF(invoice: any): InvoiceData {
  // Ensure all required fields are present with defaults
  return {
    id: invoice.id,
    invoice_number: invoice.invoice_number || 'Draft',
    issue_date: invoice.issue_date || new Date().toISOString(),
    due_date: invoice.due_date,
    currency: invoice.currency || 'USD',
    exchange_rate: invoice.exchange_rate,
    status: invoice.status || 'draft',
    note: invoice.note,
    template: {
      title: invoice.template?.title || 'INVOICE',
      description: invoice.template?.description,
      primary_color: invoice.template?.primary_color || '#1f2937',
      secondary_color: invoice.template?.secondary_color || '#6b7280',
      logo_url: invoice.template?.logo_url,
      ...invoice.template,
    },
    line_items: invoice.line_items || [],
    customer: {
      name: invoice.customer?.name || 'Customer',
      company: invoice.customer?.company,
      email: invoice.customer?.email,
      phone: invoice.customer?.phone,
      address_line_1: invoice.customer?.address_line_1,
      address_line_2: invoice.customer?.address_line_2,
      city: invoice.customer?.city,
      state: invoice.customer?.state,
      zip: invoice.customer?.zip,
      country: invoice.customer?.country,
      tax_id: invoice.customer?.tax_id,
    },
    company: {
      name: invoice.company?.name || 'Your Company',
      email: invoice.company?.email,
      phone: invoice.company?.phone,
      website: invoice.company?.website,
      address: invoice.company?.address,
      city: invoice.company?.city,
      state: invoice.company?.state,
      zip: invoice.company?.zip,
      country: invoice.company?.country,
      logo: invoice.company?.logo,
      tax_id: invoice.company?.tax_id,
    },
    payment_details: invoice.payment_details,
    
    // Calculated fields
    subtotal: calculateSubtotal(invoice.line_items || []),
    total_tax: calculateTotalTax(invoice.line_items || []),
    total: calculateTotal(invoice.line_items || []),
    amount_due: invoice.amount_due,
    paid_amount: invoice.paid_amount,
    
    // Additional metadata
    created_at: invoice.created_at,
    paid_at: invoice.paid_at,
    sent_at: invoice.sent_at,
    public_url: invoice.public_url,
  }
}

/**
 * Calculate subtotal from line items
 */
function calculateSubtotal(lineItems: any[]): number {
  return lineItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0)
  }, 0)
}

/**
 * Calculate total tax from line items
 */
function calculateTotalTax(lineItems: any[]): number {
  return lineItems.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.price || 0)
    const itemTax = itemTotal * ((item.tax || 0) / 100)
    return sum + itemTax
  }, 0)
}

/**
 * Calculate total amount from line items
 */
function calculateTotal(lineItems: any[]): number {
  const subtotal = calculateSubtotal(lineItems)
  const totalTax = calculateTotalTax(lineItems)
  return subtotal + totalTax
}

/**
 * Generate filename for PDF
 */
export function generatePDFFilename(invoice: InvoiceData): string {
  const invoiceNumber = invoice.invoice_number.replace(/[^a-zA-Z0-9]/g, '_')
  const customerName = invoice.customer.name.replace(/[^a-zA-Z0-9]/g, '_')
  return `invoice_${invoiceNumber}_${customerName}.pdf`
}

/**
 * Validate invoice data for PDF generation
 */
export function validateInvoiceData(invoice: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!invoice.customer?.name) {
    errors.push('Customer name is required')
  }
  
  if (!invoice.due_date) {
    errors.push('Due date is required')
  }
  
  if (!invoice.line_items || invoice.line_items.length === 0) {
    errors.push('At least one line item is required')
  }
  
  if (invoice.line_items) {
    invoice.line_items.forEach((item: any, index: number) => {
      if (!item.name) {
        errors.push(`Line item ${index + 1}: Name is required`)
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Valid quantity is required`)
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Line item ${index + 1}: Valid price is required`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}