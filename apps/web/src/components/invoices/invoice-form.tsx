'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  Calendar,
  DollarSign,
  Hash,
  User,
  FileText,
  Settings,
  GripVertical,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import type { CreateInvoiceInput, UpdateInvoiceInput } from '@invoice/api'

const lineItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  tax: z.number().min(0).max(100).optional().default(0),
})

const invoiceFormSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  invoice_number: z.string().optional(),
  issue_date: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  status: z.enum(['draft', 'unpaid', 'paid', 'overdue', 'canceled']),
  note: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  template: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>
type LineItem = z.infer<typeof lineItemSchema>

interface InvoiceFormProps {
  invoiceId?: string
  initialData?: Partial<InvoiceFormData>
  onSuccess?: () => void
}

export function InvoiceForm({ invoiceId, initialData, onSuccess }: InvoiceFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomer = searchParams?.get('customer')
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialData?.customer_id || preselectedCustomer || ''
  )

  const { data: customersData } = trpc.customer.list.useQuery({ limit: 100 })
  const createInvoiceMutation = trpc.invoice.create.useMutation()
  const updateInvoiceMutation = trpc.invoice.update.useMutation()
  const utils = trpc.useUtils()

  const isEditing = Boolean(invoiceId)
  
  // Generate default due date (30 days from now)
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 30)
  
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer_id: selectedCustomerId,
      invoice_number: initialData?.invoice_number || '',
      issue_date: initialData?.issue_date || format(new Date(), 'yyyy-MM-dd'),
      due_date: initialData?.due_date || format(defaultDueDate, 'yyyy-MM-dd'),
      currency: initialData?.currency || 'USD',
      status: initialData?.status || 'draft',
      note: initialData?.note || '',
      line_items: initialData?.line_items || [
        { name: '', description: '', quantity: 1, price: 0, tax: 0 }
      ],
      template: {
        title: initialData?.template?.title || '',
        description: initialData?.template?.description || '',
      },
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'line_items',
  })

  // Watch line items for real-time calculations
  const lineItems = form.watch('line_items')
  const selectedCurrency = form.watch('currency')

  // Real-time calculations
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.price || 0)
    }, 0)

    const totalTax = lineItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0)
      const itemTax = itemTotal * ((item.tax || 0) / 100)
      return sum + itemTax
    }, 0)

    const total = subtotal + totalTax

    return {
      subtotal,
      totalTax,
      total,
    }
  }, [lineItems])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const addLineItem = () => {
    append({ name: '', description: '', quantity: 1, price: 0, tax: 0 })
  }

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const invoiceData = {
        ...data,
        customer_id: selectedCustomerId || data.customer_id,
        issue_date: data.issue_date || undefined,
        invoice_number: data.invoice_number || undefined,
        note: data.note || undefined,
        template: data.template || undefined,
      }

      if (isEditing && invoiceId) {
        await updateInvoiceMutation.mutateAsync({
          id: invoiceId,
          ...invoiceData,
        } as UpdateInvoiceInput)
      } else {
        await createInvoiceMutation.mutateAsync(invoiceData as CreateInvoiceInput)
      }

      utils.invoice.list.invalidate()
      onSuccess?.()
      router.push('/dashboard/invoices')
    } catch (error) {
      console.error('Failed to save invoice:', error)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId)
    form.setValue('customer_id', customerId)
    
    // Auto-fill currency from customer if available
    const selectedCustomer = customersData?.customers?.find(c => c.id === customerId)
    if (selectedCustomer?.currency) {
      form.setValue('currency', selectedCustomer.currency)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update invoice details and line items' : 'Create a new invoice for your customer'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <Select 
                            value={selectedCustomerId} 
                            onValueChange={handleCustomerChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customersData?.customers?.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  <div>
                                    <div className="font-medium">{customer.name}</div>
                                    {customer.company && (
                                      <div className="text-sm text-muted-foreground">
                                        {customer.company}
                                      </div>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoice_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Auto-generated if empty" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty to auto-generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="issue_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value || format(new Date(), 'yyyy-MM-dd')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                              <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Line Items
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-1 flex justify-center pt-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`line_items.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="Item name" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`line_items.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <Textarea 
                                    placeholder="Description (optional)" 
                                    rows={2}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`line_items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Qty" 
                                    step="0.01"
                                    min="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`line_items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Price" 
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`line_items.${index}.tax`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Tax %" 
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-1 flex justify-center pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={fields.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any notes or terms for this invoice..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These notes will be visible to the customer on the invoice
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="template.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Invoice (default)" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="template.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief description" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Invoice Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(calculations.subtotal)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        {formatCurrency(calculations.totalTax)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(calculations.total)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span>{lineItems.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency</span>
                      <Badge variant="outline">{selectedCurrency}</Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Actions */}
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createInvoiceMutation.isLoading || updateInvoiceMutation.isLoading}
                    >
                      {(createInvoiceMutation.isLoading || updateInvoiceMutation.isLoading) 
                        ? 'Saving...' 
                        : isEditing ? 'Update Invoice' : 'Create Invoice'
                      }
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}