/**
 * PDF Generation Types and Interfaces
 */

export interface InvoiceLineItem {
  name: string
  description?: string
  quantity: number
  price: number
  tax: number
}

export interface CompanyDetails {
  name: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  logo?: string
  tax_id?: string
}

export interface CustomerDetails {
  name: string
  company?: string
  email?: string
  phone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  tax_id?: string
}

export interface PaymentDetails {
  bank_name?: string
  account_number?: string
  routing_number?: string
  swift?: string
  iban?: string
  payment_terms?: string
  late_fees?: string
}

export interface InvoiceTemplate {
  title?: string
  description?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  font_family?: string
  show_logo?: boolean
  show_payment_terms?: boolean
  show_notes?: boolean
  language?: string
  date_format?: string
  currency_format?: string
  from_details?: CompanyDetails
  payment_details?: PaymentDetails
}

export interface InvoiceData {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  currency: string
  exchange_rate?: number
  status: string
  note?: string
  template?: InvoiceTemplate
  line_items: InvoiceLineItem[]
  customer: CustomerDetails
  company: CompanyDetails
  payment_details?: PaymentDetails
  
  // Calculated fields
  subtotal: number
  total_tax: number
  total: number
  amount_due?: number
  paid_amount?: number
  
  // Additional metadata
  created_at?: string
  paid_at?: string
  sent_at?: string
  public_url?: string
}

export interface PDFGenerationOptions {
  template?: 'modern' | 'classic' | 'minimal' | 'professional'
  theme?: 'light' | 'dark'
  language?: string
  include_qr?: boolean
  include_logo?: boolean
  watermark?: string
  page_size?: 'A4' | 'Letter' | 'Legal'
  margin?: number
  font_size?: number
}

export interface PDFGenerationResult {
  success: boolean
  buffer?: Buffer
  error?: string
  size?: number
  pages?: number
}

export interface TemplateTheme {
  primary_color: string
  secondary_color: string
  text_color: string
  background_color: string
  border_color: string
  accent_color: string
}

export interface TemplateFont {
  family: string
  size: {
    title: number
    heading: number
    body: number
    small: number
  }
  weight: {
    normal: number
    bold: number
  }
}

export interface TemplateLayout {
  header_height: number
  footer_height: number
  margin: {
    top: number
    bottom: number
    left: number
    right: number
  }
  spacing: {
    section: number
    line: number
  }
}