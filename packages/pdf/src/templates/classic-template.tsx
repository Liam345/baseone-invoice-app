import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import type { InvoiceData, PDFGenerationOptions, TemplateTheme } from '../types'

// Register fonts
Font.register({
  family: 'Times',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/timesnewroman/v14/VNTQ_dHJw-V3DbWB_a2C2AXGi4sGVMVp-HcCHM0P.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/timesnewroman/v14/VNTQ_dHJw-V3DbWB_a2C2AXGi4sGVMVp-HcCBM0P-A.woff2',
      fontWeight: 'bold',
    },
  ],
})

interface ClassicTemplateProps {
  invoice: InvoiceData
  options?: PDFGenerationOptions
}

const defaultTheme: TemplateTheme = {
  primary_color: '#2c3e50',
  secondary_color: '#7f8c8d',
  text_color: '#2c3e50',
  background_color: '#ffffff',
  border_color: '#bdc3c7',
  accent_color: '#3498db',
}

export function ClassicTemplate({ invoice, options = {} }: ClassicTemplateProps) {
  const theme = {
    ...defaultTheme,
    primary_color: invoice.template?.primary_color || defaultTheme.primary_color,
    secondary_color: invoice.template?.secondary_color || defaultTheme.secondary_color,
  }

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: theme.background_color,
      padding: 50,
      fontSize: 11,
      fontFamily: 'Times',
      color: theme.text_color,
    },
    header: {
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: 3,
      borderBottomColor: theme.primary_color,
      borderBottomStyle: 'solid',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    logo: {
      width: 100,
      height: 35,
      marginBottom: 15,
    },
    companyInfo: {
      flexDirection: 'column',
      maxWidth: 250,
    },
    companyName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    companyDetails: {
      fontSize: 10,
      color: theme.secondary_color,
      lineHeight: 1.5,
    },
    invoiceInfo: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      maxWidth: 200,
    },
    invoiceTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    invoiceDetails: {
      backgroundColor: '#f8f9fa',
      padding: 15,
      borderWidth: 1,
      borderColor: theme.border_color,
      borderStyle: 'solid',
    },
    invoiceDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    detailLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.secondary_color,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      fontSize: 11,
      color: theme.text_color,
      fontWeight: 'bold',
    },
    statusBadge: {
      backgroundColor: theme.accent_color,
      color: '#ffffff',
      padding: '6 12',
      borderRadius: 3,
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 8,
    },
    billingSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 15,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottomWidth: 1,
      borderBottomColor: theme.border_color,
      paddingBottom: 5,
    },
    addressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    addressBlock: {
      flex: 1,
      marginRight: 30,
      backgroundColor: '#f8f9fa',
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border_color,
      borderStyle: 'solid',
    },
    addressTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    addressText: {
      fontSize: 10,
      color: theme.text_color,
      lineHeight: 1.6,
    },
    table: {
      marginBottom: 25,
      borderWidth: 1,
      borderColor: theme.border_color,
      borderStyle: 'solid',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.primary_color,
      padding: 12,
    },
    tableHeaderText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border_color,
      borderBottomStyle: 'solid',
    },
    tableRowAlt: {
      backgroundColor: '#f8f9fa',
    },
    tableCell: {
      fontSize: 10,
      color: theme.text_color,
    },
    tableCellBold: {
      fontWeight: 'bold',
    },
    tableCellNumber: {
      textAlign: 'right',
    },
    col1: { flex: 3 },
    col2: { flex: 1, textAlign: 'center' },
    col3: { flex: 1, textAlign: 'right' },
    col4: { flex: 1, textAlign: 'center' },
    col5: { flex: 1, textAlign: 'right' },
    summarySection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
    },
    summaryBox: {
      width: 250,
      backgroundColor: '#f8f9fa',
      borderWidth: 2,
      borderColor: theme.primary_color,
      borderStyle: 'solid',
      padding: 20,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 5,
    },
    summaryLabel: {
      fontSize: 11,
      color: theme.text_color,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    summaryAmount: {
      fontSize: 11,
      color: theme.text_color,
      fontWeight: 'bold',
      textAlign: 'right',
    },
    totalRow: {
      borderTopWidth: 2,
      borderTopColor: theme.primary_color,
      borderTopStyle: 'solid',
      paddingTop: 10,
      marginTop: 5,
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary_color,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary_color,
      textAlign: 'right',
    },
    notesSection: {
      marginTop: 40,
      backgroundColor: '#f8f9fa',
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border_color,
      borderStyle: 'solid',
    },
    notesTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    notesText: {
      fontSize: 10,
      color: theme.text_color,
      lineHeight: 1.6,
    },
    footer: {
      position: 'absolute',
      bottom: 50,
      left: 50,
      right: 50,
      textAlign: 'center',
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.border_color,
      borderTopStyle: 'solid',
    },
    footerText: {
      fontSize: 9,
      color: theme.secondary_color,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      paid: '#27ae60',
      unpaid: '#e74c3c',
      overdue: '#f39c12',
      draft: '#95a5a6',
      canceled: '#7f8c8d',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.companyInfo}>
              {invoice.template?.logo_url && options?.include_logo !== false && (
                <Image src={invoice.template.logo_url} style={styles.logo} />
              )}
              <Text style={styles.companyName}>
                {invoice.company?.name || 'Your Company'}
              </Text>
              {invoice.company && (
                <View style={styles.companyDetails}>
                  {invoice.company.email && <Text>{invoice.company.email}</Text>}
                  {invoice.company.phone && <Text>Tel: {invoice.company.phone}</Text>}
                  {invoice.company.website && <Text>Web: {invoice.company.website}</Text>}
                  {invoice.company.address && (
                    <Text>
                      {invoice.company.address}
                      {invoice.company.city && `, ${invoice.company.city}`}
                      {invoice.company.state && `, ${invoice.company.state}`}
                      {invoice.company.zip && ` ${invoice.company.zip}`}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceTitle}>
                {invoice.template?.title || 'Invoice'}
              </Text>
              <View style={styles.invoiceDetails}>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.detailLabel}>Invoice #</Text>
                  <Text style={styles.detailValue}>{invoice.invoice_number}</Text>
                </View>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.detailLabel}>Issue Date</Text>
                  <Text style={styles.detailValue}>{formatDate(invoice.issue_date)}</Text>
                </View>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text style={styles.detailValue}>{formatDate(invoice.due_date)}</Text>
                </View>
                <View style={styles.invoiceDetailRow}>
                  <Text style={styles.detailLabel}>Currency</Text>
                  <Text style={styles.detailValue}>{invoice.currency}</Text>
                </View>
              </View>
              <View 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(invoice.status) }
                ]}
              >
                <Text>{invoice.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Billing Information */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <View style={styles.addressRow}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Bill To:</Text>
              <View style={styles.addressText}>
                <Text style={styles.tableCellBold}>{invoice.customer.name}</Text>
                {invoice.customer.company && <Text>{invoice.customer.company}</Text>}
                {invoice.customer.email && <Text>{invoice.customer.email}</Text>}
                {invoice.customer.phone && <Text>Tel: {invoice.customer.phone}</Text>}
                {invoice.customer.address_line_1 && (
                  <Text>
                    {invoice.customer.address_line_1}
                    {invoice.customer.address_line_2 && `, ${invoice.customer.address_line_2}`}
                  </Text>
                )}
                {(invoice.customer.city || invoice.customer.state || invoice.customer.zip) && (
                  <Text>
                    {[invoice.customer.city, invoice.customer.state, invoice.customer.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                )}
                {invoice.customer.country && <Text>{invoice.customer.country}</Text>}
              </View>
            </View>
            
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Payment Terms:</Text>
              <View style={styles.addressText}>
                <Text>Payment Due: {formatDate(invoice.due_date)}</Text>
                <Text>Total Amount: {formatCurrency(invoice.total)}</Text>
                {invoice.exchange_rate && invoice.exchange_rate !== 1 && (
                  <Text>Exchange Rate: {invoice.exchange_rate}</Text>
                )}
                {invoice.template?.description && (
                  <Text>{invoice.template.description}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Tax Rate</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>Total</Text>
          </View>
          
          {invoice.line_items.map((item, index) => {
            const itemTotal = item.quantity * item.price
            const itemTax = itemTotal * (item.tax / 100)
            const lineTotal = itemTotal + itemTax

            return (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  index % 2 === 1 ? styles.tableRowAlt : {}
                ]}
              >
                <View style={styles.col1}>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {item.name}
                  </Text>
                  {item.description && (
                    <Text style={[styles.tableCell, { marginTop: 3, fontSize: 9, color: theme.secondary_color }]}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <Text style={[styles.tableCell, styles.col2]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.col3, styles.tableCellNumber]}>
                  {formatCurrency(item.price)}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {item.tax}%
                </Text>
                <Text style={[styles.tableCell, styles.col5, styles.tableCellNumber, styles.tableCellBold]}>
                  {formatCurrency(lineTotal)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tax</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(invoice.total_tax)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
            {invoice.amount_due && invoice.amount_due !== invoice.total && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontSize: 12, fontWeight: 'bold' }]}>
                  Amount Due
                </Text>
                <Text style={[styles.summaryAmount, { fontSize: 12, fontWeight: 'bold', color: theme.primary_color }]}>
                  {formatCurrency(invoice.amount_due)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {invoice.note && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.note}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business • Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}