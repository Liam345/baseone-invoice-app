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
  family: 'Helvetica',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/helvetica/v10/helvetica-regular.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/helvetica/v10/helvetica-bold.woff2',
      fontWeight: 'bold',
    },
  ],
})

interface MinimalTemplateProps {
  invoice: InvoiceData
  options?: PDFGenerationOptions
}

const defaultTheme: TemplateTheme = {
  primary_color: '#000000',
  secondary_color: '#666666',
  text_color: '#333333',
  background_color: '#ffffff',
  border_color: '#eeeeee',
  accent_color: '#000000',
}

export function MinimalTemplate({ invoice, options = {} }: MinimalTemplateProps) {
  const theme = {
    ...defaultTheme,
    primary_color: invoice.template?.primary_color || defaultTheme.primary_color,
    secondary_color: invoice.template?.secondary_color || defaultTheme.secondary_color,
  }

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: theme.background_color,
      padding: 60,
      fontSize: 10,
      fontFamily: 'Helvetica',
      color: theme.text_color,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 50,
    },
    companySection: {
      flexDirection: 'column',
    },
    logo: {
      width: 80,
      height: 25,
      marginBottom: 15,
    },
    companyName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 5,
    },
    companyDetails: {
      fontSize: 9,
      color: theme.secondary_color,
      lineHeight: 1.4,
    },
    invoiceSection: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    invoiceTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 10,
    },
    invoiceNumber: {
      fontSize: 11,
      color: theme.text_color,
      marginBottom: 3,
    },
    invoiceDate: {
      fontSize: 9,
      color: theme.secondary_color,
    },
    customerSection: {
      marginBottom: 40,
    },
    sectionLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.secondary_color,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    customerInfo: {
      fontSize: 10,
      color: theme.text_color,
      lineHeight: 1.5,
    },
    customerName: {
      fontWeight: 'bold',
      marginBottom: 3,
    },
    table: {
      marginBottom: 30,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.primary_color,
      marginBottom: 5,
    },
    tableHeaderText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.primary_color,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border_color,
    },
    tableCell: {
      fontSize: 9,
      color: theme.text_color,
      paddingRight: 10,
    },
    tableCellBold: {
      fontWeight: 'bold',
    },
    tableCellNumber: {
      textAlign: 'right',
    },
    col1: { flex: 4 },
    col2: { flex: 1, textAlign: 'center' },
    col3: { flex: 1, textAlign: 'right' },
    col4: { flex: 1, textAlign: 'right' },
    totalsSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
    },
    totalsContainer: {
      width: 200,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    totalLabel: {
      fontSize: 9,
      color: theme.text_color,
    },
    totalAmount: {
      fontSize: 9,
      color: theme.text_color,
      textAlign: 'right',
    },
    finalTotalRow: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.primary_color,
      marginTop: 5,
    },
    finalTotalLabel: {
      fontSize: 11,
      fontWeight: 'bold',
      color: theme.primary_color,
    },
    finalTotalAmount: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primary_color,
      textAlign: 'right',
    },
    notesSection: {
      marginTop: 40,
    },
    notesTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.secondary_color,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    notesText: {
      fontSize: 9,
      color: theme.text_color,
      lineHeight: 1.5,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 60,
      right: 60,
      textAlign: 'center',
    },
    footerText: {
      fontSize: 8,
      color: theme.secondary_color,
    },
    statusBadge: {
      backgroundColor: theme.primary_color,
      color: '#ffffff',
      padding: '3 8',
      borderRadius: 2,
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 5,
    },
    paymentInfo: {
      marginTop: 30,
      padding: 15,
      borderWidth: 1,
      borderColor: theme.border_color,
    },
    paymentTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.primary_color,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    paymentDetails: {
      fontSize: 9,
      color: theme.text_color,
      lineHeight: 1.5,
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
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      paid: '#2ecc71',
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
          <View style={styles.companySection}>
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
          
          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>
              {invoice.template?.title || 'INVOICE'}
            </Text>
            <Text style={styles.invoiceNumber}>
              #{invoice.invoice_number}
            </Text>
            <Text style={styles.invoiceDate}>
              {formatDate(invoice.issue_date)}
            </Text>
            <Text style={styles.invoiceDate}>
              Due: {formatDate(invoice.due_date)}
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

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{invoice.customer.name}</Text>
            {invoice.customer.company && <Text>{invoice.customer.company}</Text>}
            {invoice.customer.email && <Text>{invoice.customer.email}</Text>}
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

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Total</Text>
          </View>
          
          {invoice.line_items.map((item, index) => {
            const itemTotal = item.quantity * item.price
            const itemTax = itemTotal * (item.tax / 100)
            const lineTotal = itemTotal + itemTax

            return (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {item.name}
                  </Text>
                  {item.description && (
                    <Text style={[styles.tableCell, { fontSize: 8, color: theme.secondary_color, marginTop: 2 }]}>
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
                <Text style={[styles.tableCell, styles.col4, styles.tableCellNumber, styles.tableCellBold]}>
                  {formatCurrency(lineTotal)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            {invoice.total_tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(invoice.total_tax)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalAmount}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
            {invoice.amount_due && invoice.amount_due !== invoice.total && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.tableCellBold]}>
                  Amount Due
                </Text>
                <Text style={[styles.totalAmount, styles.tableCellBold]}>
                  {formatCurrency(invoice.amount_due)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        {invoice.payment_details && (
          <View style={styles.paymentInfo}>
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
        </View>
      </Page>
    </Document>
  )
}