import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  DollarSign,
  TrendingUp 
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your invoice management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Invoices
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Customers
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-3xl font-bold">$0</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Outstanding
              </p>
              <p className="text-3xl font-bold">$0</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/dashboard/invoices/new">
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers/new">
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/invoices">
              View All Invoices
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers">
              View All Customers
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}