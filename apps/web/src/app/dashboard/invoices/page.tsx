import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

export default function InvoicesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track payments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first invoice
        </p>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            Create your first invoice
          </Link>
        </Button>
      </div>
    </div>
  )
}