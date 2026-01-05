'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { InvoiceTable } from '@/components/invoices/invoice-table'

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')

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

      <InvoiceTable 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  )
}