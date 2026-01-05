import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'

export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and contact information
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No customers yet</h3>
        <p className="text-muted-foreground mb-4">
          Add customers to start creating invoices
        </p>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            Add your first customer
          </Link>
        </Button>
      </div>
    </div>
  )
}