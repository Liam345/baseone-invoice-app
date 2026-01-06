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
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.woff2',
      fontWeight: 'bold',
    },
  ],
})

interface ModernTemplateProps {
  invoice: InvoiceData
  options?: PDFGenerationOptions
}

const defaultTheme: TemplateTheme = {
  primary_color: '#1f2937',
  secondary_color: '#6b7280',
  text_color: '#111827',
  background_color: '#ffffff',
  border_color: '#e5e7eb',
  accent_color: '#3b82f6',
}

export function ModernTemplate({ invoice, options = {} }: ModernTemplateProps) {
  const theme = {
    ...defaultTheme,
    primary_color: invoice.template?.primary_color || defaultTheme.primary_color,
    secondary_color: invoice.template?.secondary_color || defaultTheme.secondary_color,
  }

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: theme.background_color,
      padding: 40,
      fontSize: 10,
      fontFamily: 'Inter',
      color: theme.text_color,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 30,
      paddingBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: theme.primary_color,
    },
    headerLeft: {
      flexDirection: 'column',
      flex: 1,
    },
    headerRight: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      minWidth: 200,
    },
    logo: {
      width: 120,
      height: 40,
      marginBottom: 10,
    },
    companyName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 9,
      color: theme.secondary_color,
      lineHeight: 1.4,
    },
    invoiceTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 8,
      textAlign: 'right',
    },
    invoiceNumber: {
      fontSize: 12,
      color: theme.text_color,
      marginBottom: 4,
      textAlign: 'right',
    },
    invoiceDate: {
      fontSize: 10,
      color: theme.secondary_color,
      textAlign: 'right',
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border_color,
      paddingBottom: 4,
    },
    addressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
    },
    addressBlock: {
      flex: 1,
      marginRight: 20,
    },
    addressTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 6,
    },
    addressText: {
      fontSize: 9,
      color: theme.text_color,
      lineHeight: 1.4,
    },
    table: {
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.primary_color,
      padding: 8,
      marginBottom: 1,
    },
    tableHeaderText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border_color,
    },
    tableRowAlt: {
      backgroundColor: '#f9fafb',
    },
    tableCell: {
      fontSize: 9,
      color: theme.text_color,
    },
    tableCellNumber: {
      textAlign: 'right',
    },
    col1: { flex: 3 },
    col2: { flex: 1, textAlign: 'center' },
    col3: { flex: 1, textAlign: 'right' },
    col4: { flex: 1, textAlign: 'center' },
    col5: { flex: 1, textAlign: 'right' },
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 15,
    },
    totalsBlock: {
      width: 200,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    totalRowFinal: {
      backgroundColor: theme.primary_color,
      marginTop: 2,
    },
    totalLabel: {
      fontSize: 10,
      color: theme.text_color,
    },
    totalLabelFinal: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    totalAmount: {
      fontSize: 10,
      color: theme.text_color,
      textAlign: 'right',
    },
    totalAmountFinal: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'right',
    },
    notesSection: {
      marginTop: 30,
    },
    notesTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 6,
    },
    notesText: {
      fontSize: 9,
      color: theme.text_color,
      lineHeight: 1.5,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.border_color,
    },
    footerText: {
      fontSize: 8,
      color: theme.secondary_color,
    },
    paymentSection: {
      marginTop: 20,
      padding: 15,
      backgroundColor: '#f9fafb',
      borderRadius: 4,
    },
    paymentTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 8,
    },
    paymentDetails: {
      fontSize: 9,
      color: theme.text_color,
      lineHeight: 1.4,
    },
    statusBadge: {
      backgroundColor: theme.accent_color,
      color: '#ffffff',
      padding: '4 8',
      borderRadius: 12,
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 4,
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
      paid: '#059669',
      unpaid: '#dc2626',
      overdue: '#d97706',
      draft: '#6b7280',
      canceled: '#9ca3af',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {invoice.template?.logo_url && options?.include_logo !== false && (
              <Image src={invoice.template.logo_url} style={styles.logo} />
            )}
            <Text style={styles.companyName}>
              {invoice.company?.name || 'Your Company'}
            </Text>
            {invoice.company && (
              <View style={styles.companyDetails}>
                {invoice.company.email && <Text>{invoice.company.email}</Text>}
                {invoice.company.phone && <Text>{invoice.company.phone}</Text>}
                {invoice.company.website && <Text>{invoice.company.website}</Text>}
                {invoice.company.address && (
                  <Text>
                    {invoice.company.address}
                    {invoice.company.city && `, ${invoice.company.city}`}
                    {invoice.company.state && `, ${invoice.company.state}`}
                    {invoice.company.zip && ` ${invoice.company.zip}`}
                    {invoice.company.country && `, ${invoice.company.country}`}
                  </Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>
              {invoice.template?.title || 'INVOICE'}
            </Text>
            <Text style={styles.invoiceNumber}>
              #{invoice.invoice_number}
            </Text>
            <Text style={styles.invoiceDate}>
              Issue Date: {formatDate(invoice.issue_date)}
            </Text>
            <Text style={styles.invoiceDate}>
              Due Date: {formatDate(invoice.due_date)}
            </Text>
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

        {/* Address Section */}
        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Bill To:</Text>
            <View style={styles.addressText}>
              <Text style={{ fontWeight: 'bold' }}>{invoice.customer.name}</Text>
              {invoice.customer.company && <Text>{invoice.customer.company}</Text>}
              {invoice.customer.email && <Text>{invoice.customer.email}</Text>}
              {invoice.customer.phone && <Text>{invoice.customer.phone}</Text>}
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
            <Text style={styles.addressTitle}>Invoice Details:</Text>
            <View style={styles.addressText}>
              <Text>Currency: {invoice.currency}</Text>
              {invoice.exchange_rate && invoice.exchange_rate !== 1 && (
                <Text>Exchange Rate: {invoice.exchange_rate}</Text>
              )}
              {invoice.template?.description && (
                <Text>{invoice.template.description}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Tax</Text>
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
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                    {item.name}
                  </Text>
                  {item.description && (
                    <Text style={[styles.tableCell, { marginTop: 2, color: theme.secondary_color }]}>
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
                <Text style={[styles.tableCell, styles.col5, styles.tableCellNumber]}>
                  {formatCurrency(lineTotal)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(invoice.total_tax)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabelFinal}>Total:</Text>
              <Text style={styles.totalAmountFinal}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
            {invoice.amount_due && invoice.amount_due !== invoice.total && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>
                  Amount Due:
                </Text>
                <Text style={[styles.totalAmount, { fontWeight: 'bold' }]}>
                  {formatCurrency(invoice.amount_due)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Details */}
        {invoice.payment_details && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Information</Text>
            <View style={styles.paymentDetails}>
              {invoice.payment_details.bank_name && (
                <Text>Bank: {invoice.payment_details.bank_name}</Text>
              )}
              {invoice.payment_details.account_number && (
                <Text>Account: {invoice.payment_details.account_number}</Text>
              )}
              {invoice.payment_details.routing_number && (
                <Text>Routing: {invoice.payment_details.routing_number}</Text>
              )}
              {invoice.payment_details.swift && (
                <Text>SWIFT: {invoice.payment_details.swift}</Text>
              )}
              {invoice.payment_details.iban && (
                <Text>IBAN: {invoice.payment_details.iban}</Text>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {invoice.note && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.note}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.footerText}>
            Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  )
}