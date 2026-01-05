'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { X, Plus } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import type { CreateCustomerInput, UpdateCustomerInput } from '@invoice/api'

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  company: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  tax_id: z.string().optional(),
  note: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  customerId?: string
  initialData?: Partial<CustomerFormData>
  onSuccess?: () => void
}

export function CustomerForm({ customerId, initialData, onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
  const [newTagName, setNewTagName] = useState('')

  const { data: tagsData } = trpc.customer.getTags.useQuery()
  const createCustomerMutation = trpc.customer.create.useMutation()
  const updateCustomerMutation = trpc.customer.update.useMutation()
  const createTagMutation = trpc.customer.createTag.useMutation()
  const utils = trpc.useUtils()

  const isEditing = Boolean(customerId)
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      website: initialData?.website || '',
      company: initialData?.company || '',
      address_line_1: initialData?.address_line_1 || '',
      address_line_2: initialData?.address_line_2 || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zip: initialData?.zip || '',
      country: initialData?.country || '',
      currency: initialData?.currency || 'USD',
      tax_id: initialData?.tax_id || '',
      note: initialData?.note || '',
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const customerData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        company: data.company || undefined,
        address_line_1: data.address_line_1 || undefined,
        address_line_2: data.address_line_2 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip: data.zip || undefined,
        country: data.country || undefined,
        tax_id: data.tax_id || undefined,
        note: data.note || undefined,
        tags: selectedTags,
      }

      if (isEditing && customerId) {
        await updateCustomerMutation.mutateAsync({
          id: customerId,
          ...customerData,
        } as UpdateCustomerInput)
      } else {
        await createCustomerMutation.mutateAsync(customerData as CreateCustomerInput)
      }

      utils.customer.list.invalidate()
      onSuccess?.()
      router.push('/dashboard/customers')
    } catch (error) {
      console.error('Failed to save customer:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const newTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
      })
      
      setSelectedTags(prev => [...prev, newTag.id])
      setNewTagName('')
      utils.customer.getTags.invalidate()
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Customer' : 'New Customer'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update customer information' : 'Add a new customer to your database'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_line_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tags and Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tags & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tags */}
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Organize customers with tags for better filtering and grouping
                </p>
                
                {/* Selected tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tagId) => {
                      const tag = tagsData?.find(t => t.id === tagId)
                      if (!tag) return null
                      
                      return (
                        <Badge key={tagId} variant="secondary" className="gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: tag.color || '#6b7280' }}
                          />
                          {tag.name}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tagId)}
                          />
                        </Badge>
                      )
                    })}
                  </div>
                )}
                
                {/* Available tags */}
                {tagsData && tagsData.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Available tags:</Label>
                    <div className="flex flex-wrap gap-2">
                      {tagsData
                        .filter(tag => !selectedTags.includes(tag.id))
                        .map((tag) => (
                          <Badge 
                            key={tag.id} 
                            variant="outline" 
                            className="cursor-pointer gap-1 hover:bg-secondary"
                            onClick={() => toggleTag(tag.id)}
                          >
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: tag.color || '#6b7280' }}
                            />
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Create new tag */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Create new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateTag()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input placeholder="123-45-6789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Customer's tax identification number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about this customer..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal notes about the customer (not visible to customer)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={createCustomerMutation.isLoading || updateCustomerMutation.isLoading}
            >
              {(createCustomerMutation.isLoading || updateCustomerMutation.isLoading) 
                ? 'Saving...' 
                : isEditing ? 'Update Customer' : 'Create Customer'
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}