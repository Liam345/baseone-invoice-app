'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { CustomerTable } from '@/components/customers/customer-table'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')

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

      <CustomerTable 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  )
}