import React from 'react'
import { pdf, renderToStream } from '@react-pdf/renderer'
import type { InvoiceData, PDFGenerationOptions, PDFGenerationResult } from '../types'
import { ModernTemplate } from '../templates/modern-template'
import { ClassicTemplate } from '../templates/classic-template'
import { MinimalTemplate } from '../templates/minimal-template'

/**
 * Generate PDF buffer from invoice data
 */
export async function generateInvoicePDF(
  invoice: InvoiceData,
  options: PDFGenerationOptions = {}
): Promise<PDFGenerationResult> {
  try {
    // Select template based on options
    const template = options.template || 'modern'
    
    let TemplateComponent: React.ComponentType<{ invoice: InvoiceData; options?: PDFGenerationOptions }>
    
    switch (template) {
      case 'modern':
        TemplateComponent = ModernTemplate
        break
      case 'classic':
        TemplateComponent = ClassicTemplate
        break
      case 'minimal':
        TemplateComponent = MinimalTemplate
        break
      case 'professional':
        // TODO: Implement professional template
        TemplateComponent = ModernTemplate
        break
      default:
        TemplateComponent = ModernTemplate
    }

    const doc = <TemplateComponent invoice={invoice} options={options} />
    
    // Generate PDF buffer
    const pdfBuffer = await pdf(doc).toBuffer()
    
    return {
      success: true,
      buffer: pdfBuffer,
      size: pdfBuffer.length,
      pages: 1, // TODO: Calculate actual pages
    }
  } catch (error) {
    console.error('PDF generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Generate PDF stream for direct response
 */
export async function generateInvoicePDFStream(
  invoice: InvoiceData,
  options: PDFGenerationOptions = {}
) {
  const template = options.template || 'modern'
  
  let TemplateComponent: React.ComponentType<{ invoice: InvoiceData; options?: PDFGenerationOptions }>
  
  switch (template) {
    case 'modern':
      TemplateComponent = ModernTemplate
      break
    case 'classic':
      TemplateComponent = ClassicTemplate
      break
    case 'minimal':
      TemplateComponent = MinimalTemplate
      break
    default:
      TemplateComponent = ModernTemplate
  }

  const doc = <TemplateComponent invoice={invoice} options={options} />
  
  return renderToStream(doc)
}