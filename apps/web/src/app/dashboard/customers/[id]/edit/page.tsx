'use client'

import { useParams, useRouter } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params?.id as string

  const { data: customer, isLoading, error } = trpc.customer.getById.useQuery({ id: customerId })

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-6 text-center">
          <p className="text-destructive">Failed to load customer: {error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost">← Back</Button>
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
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
            The customer you're trying to edit doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/dashboard/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CustomerForm 
      customerId={customerId}
      initialData={customer}
    />
  )
}