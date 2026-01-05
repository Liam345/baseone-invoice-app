'use client'

import { useParams, useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Mail,
  Download,
  Copy,
  MoreHorizontal,
  FileText,
  User,
  Calendar,
  DollarSign,
  Hash,
  MapPin,
  Phone,
  Globe,
  Building,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'

export default function InvoiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params?.id as string

  const { data: invoice, isLoading, error } = trpc.invoice.getById.useQuery({ id: invoiceId })
  const sendInvoiceMutation = trpc.invoice.sendEmail.useMutation()
  const generateTokenMutation = trpc.invoice.generateShareToken.useMutation()
  const markPaidMutation = trpc.invoice.markPaid.useMutation()
  const utils = trpc.useUtils()

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-6 text-center">
          <p className="text-destructive">Failed to load invoice: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost">← Back</Button>
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Invoice not found</h3>
          <p className="text-muted-foreground mb-4">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/dashboard/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary', label: 'Draft' },
      unpaid: { variant: 'destructive', label: 'Unpaid' },
      paid: { variant: 'default', label: 'Paid' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      canceled: { variant: 'outline', label: 'Canceled' },
    } as const

    const config = variants[status as keyof typeof variants] || { variant: 'secondary', label: status }
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  // Calculate totals
  const subtotal = invoice.line_items?.reduce((sum: number, item: any) => {
    return sum + (item.quantity || 0) * (item.price || 0)
  }, 0) || 0

  const totalTax = invoice.line_items?.reduce((sum: number, item: any) => {
    const itemTotal = (item.quantity || 0) * (item.price || 0)
    const itemTax = itemTotal * ((item.tax || 0) / 100)
    return sum + itemTax
  }, 0) || 0

  const total = subtotal + totalTax

  const handleSendEmail = async () => {
    try {
      await sendInvoiceMutation.mutateAsync({ id: invoiceId })
      utils.invoice.getById.invalidate()
    } catch (error) {
      console.error('Failed to send invoice:', error)
    }
  }

  const handleCopyLink = async () => {
    try {
      const { token } = await generateTokenMutation.mutateAsync({ id: invoiceId })
      const publicUrl = `${window.location.origin}/invoice/${token}`
      await navigator.clipboard.writeText(publicUrl)
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleMarkPaid = async () => {
    try {
      await markPaidMutation.mutateAsync({ 
        id: invoiceId,
        paid_at: new Date().toISOString(),
      })
      utils.invoice.getById.invalidate()
      utils.invoice.list.invalidate()
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {invoice.invoice_number || `#${invoice.id.slice(-8)}`}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-muted-foreground">
              {invoice.template?.title || 'Invoice'} for {invoice.customer?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status !== 'paid' && (
            <Button 
              variant="outline" 
              onClick={handleMarkPaid}
              disabled={markPaidMutation.isLoading}
            >
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSendEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* From (Company) */}
                <div>
                  <h3 className="font-medium mb-3">From</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {invoice.template?.from_details ? (
                      <>
                        <div className="font-medium text-foreground">
                          {invoice.template.from_details.name}
                        </div>
                        {invoice.template.from_details.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {invoice.template.from_details.email}
                          </div>
                        )}
                        {invoice.template.from_details.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {invoice.template.from_details.phone}
                          </div>
                        )}
                        {invoice.template.from_details.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {invoice.template.from_details.website}
                          </div>
                        )}
                        {invoice.template.from_details.address && (
                          <div className="flex items-start gap-1 mt-2">
                            <MapPin className="h-3 w-3 mt-0.5" />
                            <div>
                              <div>{invoice.template.from_details.address}</div>
                              <div>
                                {[
                                  invoice.template.from_details.city,
                                  invoice.template.from_details.state,
                                  invoice.template.from_details.zip
                                ].filter(Boolean).join(', ')}
                              </div>
                              {invoice.template.from_details.country && (
                                <div>{invoice.template.from_details.country}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        Company details not configured
                      </div>
                    )}
                  </div>
                </div>

                {/* To (Customer) */}
                <div>
                  <h3 className="font-medium mb-3">Bill To</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {invoice.customer?.name}
                    </div>
                    {invoice.customer?.company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {invoice.customer.company}
                      </div>
                    )}
                    {invoice.customer?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {invoice.customer.email}
                      </div>
                    )}
                    {invoice.customer?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {invoice.customer.phone}
                      </div>
                    )}
                    {(invoice.customer?.address_line_1 || invoice.customer?.city) && (
                      <div className="flex items-start gap-1 mt-2">
                        <MapPin className="h-3 w-3 mt-0.5" />
                        <div>
                          {invoice.customer.address_line_1 && (
                            <div>{invoice.customer.address_line_1}</div>
                          )}
                          {invoice.customer.address_line_2 && (
                            <div>{invoice.customer.address_line_2}</div>
                          )}
                          <div>
                            {[
                              invoice.customer.city,
                              invoice.customer.state,
                              invoice.customer.zip
                            ].filter(Boolean).join(', ')}
                          </div>
                          {invoice.customer.country && (
                            <div>{invoice.customer.country}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.line_items?.map((item: any, index: number) => {
                    const itemTotal = (item.quantity || 0) * (item.price || 0)
                    const itemTax = itemTotal * ((item.tax || 0) / 100)
                    const lineTotal = itemTotal + itemTax

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price || 0, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.tax || 0}%
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(lineTotal, invoice.currency)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.note && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {invoice.note}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal, invoice.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(totalTax, invoice.currency)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(total, invoice.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date</span>
                <span className="font-medium">
                  {invoice.issue_date 
                    ? new Date(invoice.issue_date).toLocaleDateString()
                    : new Date(invoice.created_at).toLocaleDateString()
                  }
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <Badge variant="outline">{invoice.currency}</Badge>
              </div>

              {invoice.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Date</span>
                  <span className="font-medium">
                    {new Date(invoice.paid_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}