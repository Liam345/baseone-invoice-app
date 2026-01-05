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
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Users,
  Building,
  Mail,
  Phone,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import type { CustomerFiltersInput } from '@invoice/api'

interface CustomerTableProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CustomerTable({ searchQuery, onSearchChange }: CustomerTableProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const filters: CustomerFiltersInput = {
    search: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    page,
    limit: 10,
  }

  const { data: customersData, isLoading, error } = trpc.customer.list.useQuery(filters)
  const { data: tagsData } = trpc.customer.getTags.useQuery()
  const deleteCustomerMutation = trpc.customer.delete.useMutation()
  const utils = trpc.useUtils()

  const handleEdit = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}/edit`)
  }

  const handleView = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  const handleDelete = async (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomerMutation.mutateAsync({ id: customerId })
        utils.customer.list.invalidate()
      } catch (error) {
        console.error('Failed to delete customer:', error)
      }
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-6 text-center">
        <p className="text-destructive">Failed to load customers: {error.message}</p>
      </div>
    )
  }

  const customers = customersData?.customers || []
  const totalCount = customersData?.total || 0
  const hasCustomers = customers.length > 0

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {tagsData && tagsData.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {tagsData.map((tag) => (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color || '#6b7280' }}
                    />
                    <span>{tag.name}</span>
                  </div>
                  {selectedTags.includes(tag.id) && (
                    <Badge variant="secondary" className="ml-auto">
                      ✓
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {hasCustomers ? `${totalCount} customer${totalCount === 1 ? '' : 's'} found` : 'No customers found'}
          </span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last Invoice</TableHead>
              <TableHead>Total Invoiced</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : !hasCustomers ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">No customers found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Add your first customer to get started'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Customer rows
              customers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.company && (
                          <div className="text-sm text-muted-foreground">{customer.company}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          <span className="text-muted-foreground">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span className="text-muted-foreground">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {customer.tags?.slice(0, 2).map((tag: any) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {customer.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{customer.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.last_invoice_date ? (
                      formatDistanceToNow(new Date(customer.last_invoice_date), { addSuffix: true })
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.total_amount ? (
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: customer.currency || 'USD',
                      }).format(customer.total_amount)
                    ) : (
                      '$0.00'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(customer.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(customer.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(customer.id)}
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
      {hasCustomers && totalCount > filters.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * filters.limit + 1} to{' '}
            {Math.min(page * filters.limit, totalCount)} of {totalCount} customers
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