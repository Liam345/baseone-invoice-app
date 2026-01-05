'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  FileText,
  Mail,
  Download,
  Copy,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import type { InvoiceFiltersInput } from '@invoice/api'

interface InvoiceTableProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Canceled', value: 'canceled' },
]

export function InvoiceTable({ searchQuery, onSearchChange }: InvoiceTableProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  
  const filters: InvoiceFiltersInput = {
    search: searchQuery || undefined,
    status: selectedStatus !== 'all' ? [selectedStatus as any] : undefined,
    page,
    limit: 10,
  }

  const { data: invoicesData, isLoading, error } = trpc.invoice.list.useQuery(filters)
  const { data: customersData } = trpc.customer.list.useQuery({ limit: 100 })
  const deleteInvoiceMutation = trpc.invoice.delete.useMutation()
  const sendInvoiceMutation = trpc.invoice.sendEmail.useMutation()
  const generateTokenMutation = trpc.invoice.generateShareToken.useMutation()
  const utils = trpc.useUtils()

  const handleEdit = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}/edit`)
  }

  const handleView = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}`)
  }

  const handleDelete = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoiceMutation.mutateAsync({ id: invoiceId })
        utils.invoice.list.invalidate()
      } catch (error) {
        console.error('Failed to delete invoice:', error)
      }
    }
  }

  const handleSendEmail = async (invoiceId: string) => {
    try {
      await sendInvoiceMutation.mutateAsync({ id: invoiceId })
      utils.invoice.list.invalidate()
    } catch (error) {
      console.error('Failed to send invoice:', error)
    }
  }

  const handleCopyLink = async (invoiceId: string) => {
    try {
      const { token } = await generateTokenMutation.mutateAsync({ id: invoiceId })
      const publicUrl = `${window.location.origin}/invoice/${token}`
      await navigator.clipboard.writeText(publicUrl)
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
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

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-6 text-center">
        <p className="text-destructive">Failed to load invoices: {error.message}</p>
      </div>
    )
  }

  const invoices = invoicesData?.invoices || []
  const totalCount = invoicesData?.total || 0
  const hasInvoices = invoices.length > 0

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices by number, customer, or amount..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {hasInvoices ? `${totalCount} invoice${totalCount === 1 ? '' : 's'} found` : 'No invoices found'}
          </span>
          {(searchQuery || selectedStatus !== 'all' || dateRange !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange('')
                setSelectedStatus('all')
                setDateRange('all')
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-18" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-18" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : !hasInvoices ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">No invoices found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Create your first invoice to get started'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Invoice rows
              invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        #{invoice.id.slice(-8)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{invoice.customer?.name || 'Unknown'}</div>
                        {invoice.customer?.company && (
                          <div className="text-sm text-muted-foreground">{invoice.customer.company}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.amount || 0, invoice.currency || 'USD')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(invoice.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSendEmail(invoice.id)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(invoice.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(invoice.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {hasInvoices && totalCount > filters.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * filters.limit + 1} to{' '}
            {Math.min(page * filters.limit, totalCount)} of {totalCount} invoices
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page * filters.limit >= totalCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}