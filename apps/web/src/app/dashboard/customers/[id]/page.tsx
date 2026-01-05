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
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  FileText,
  Plus,
  MoreHorizontal,
  Eye,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'

interface CustomerDetailsPageProps {}

export default function CustomerDetailsPage({}: CustomerDetailsPageProps) {
  const params = useParams()
  const router = useRouter()
  const customerId = params?.id as string

  const { data: customer, isLoading: customerLoading, error: customerError } = 
    trpc.customer.getById.useQuery({ id: customerId })
  
  const { data: analytics, isLoading: analyticsLoading } = 
    trpc.customer.analytics.useQuery({ id: customerId, period: '90d' })

  // Mock invoice data - replace with actual invoice query
  const invoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      status: 'paid',
      amount: 1500.00,
      currency: 'USD',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      paid_at: '2024-02-10',
    },
    {
      id: '2',
      invoice_number: 'INV-002',
      status: 'unpaid',
      amount: 2300.00,
      currency: 'USD',
      issue_date: '2024-01-20',
      due_date: '2024-02-20',
      paid_at: null,
    },
  ]

  if (customerError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-6 text-center">
          <p className="text-destructive">Failed to load customer: {customerError.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (customerLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Button variant="ghost">← Back</Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Customer not found</h3>
          <p className="text-muted-foreground mb-4">
            The customer you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/dashboard/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      unpaid: 'destructive',
      overdue: 'destructive',
      draft: 'secondary',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
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
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            {customer.company && (
              <p className="text-muted-foreground">{customer.company}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/customers/${customerId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/invoices/new?customer=${customerId}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Invoiced</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics?.total_invoiced || 0, customer.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Outstanding</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics?.outstanding_amount || 0, customer.currency || 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Invoices</span>
            </div>
            <div className="text-2xl font-bold">{analytics?.invoice_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Avg Payment Time</span>
            </div>
            <div className="text-2xl font-bold">
              {analytics?.avg_payment_days ? `${Math.round(analytics.avg_payment_days)}d` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-3">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              {customer.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {customer.website}
                  </a>
                </div>
              )}
              {customer.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.company}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Address */}
            {(customer.address_line_1 || customer.city || customer.country) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1 ml-6">
                  {customer.address_line_1 && <div>{customer.address_line_1}</div>}
                  {customer.address_line_2 && <div>{customer.address_line_2}</div>}
                  <div>
                    {[customer.city, customer.state, customer.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {customer.country && <div>{customer.country}</div>}
                </div>
              </div>
            )}

            <Separator />

            {/* Additional Information */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{customer.currency || 'USD'}</span>
              </div>
              {customer.tax_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ID</span>
                  <span className="font-medium">{customer.tax_id}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer Since</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-sm font-medium mb-2 block">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {customer.note && (
              <>
                <Separator />
                <div>
                  <span className="text-sm font-medium mb-2 block">Notes</span>
                  <p className="text-sm text-muted-foreground">{customer.note}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/invoices?customer=${customerId}`}>
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No invoices yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create the first invoice for this customer
                </p>
                <Button asChild>
                  <Link href={`/dashboard/invoices/new?customer=${customerId}`}>
                    Create Invoice
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.invoice_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(invoice.issue_date), { addSuffix: true })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/invoices/${invoice.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}