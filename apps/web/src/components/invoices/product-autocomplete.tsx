'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  tax_rate?: number
}

interface ProductAutocompleteProps {
  value?: string
  onSelect: (product: Product) => void
  placeholder?: string
  className?: string
}

// Mock products data - in a real app this would come from an API
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Website Development',
    description: 'Custom website development and design',
    price: 5000.00,
    category: 'Development',
    tax_rate: 10,
  },
  {
    id: '2',
    name: 'Logo Design',
    description: 'Professional logo design with revisions',
    price: 500.00,
    category: 'Design',
    tax_rate: 10,
  },
  {
    id: '3',
    name: 'SEO Optimization',
    description: 'Search engine optimization services',
    price: 1200.00,
    category: 'Marketing',
    tax_rate: 10,
  },
  {
    id: '4',
    name: 'Content Writing',
    description: 'Professional content writing per page',
    price: 150.00,
    category: 'Content',
    tax_rate: 10,
  },
  {
    id: '5',
    name: 'Mobile App Development',
    description: 'iOS and Android app development',
    price: 15000.00,
    category: 'Development',
    tax_rate: 10,
  },
  {
    id: '6',
    name: 'Branding Package',
    description: 'Complete branding package including logo, colors, fonts',
    price: 2500.00,
    category: 'Design',
    tax_rate: 10,
  },
  {
    id: '7',
    name: 'Social Media Management',
    description: 'Monthly social media management and content creation',
    price: 800.00,
    category: 'Marketing',
    tax_rate: 10,
  },
  {
    id: '8',
    name: 'Database Design',
    description: 'Custom database design and optimization',
    price: 3000.00,
    category: 'Development',
    tax_rate: 10,
  },
  {
    id: '9',
    name: 'Photography Session',
    description: 'Professional product photography session',
    price: 600.00,
    category: 'Photography',
    tax_rate: 10,
  },
  {
    id: '10',
    name: 'Consultation Hour',
    description: 'Technical consultation and strategy session',
    price: 200.00,
    category: 'Consulting',
    tax_rate: 10,
  },
]

export function ProductAutocomplete({ 
  value, 
  onSelect, 
  placeholder = "Search products...",
  className 
}: ProductAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    if (!search) return MOCK_PRODUCTS

    const searchLower = search.toLowerCase()
    return MOCK_PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    )
  }, [search])

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {}
    
    filteredProducts.forEach(product => {
      const category = product.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(product)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredProducts])

  const selectedProduct = MOCK_PRODUCTS.find(p => p.id === value)

  const handleSelect = (product: Product) => {
    onSelect(product)
    setOpen(false)
    setSearch('')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedProduct ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{selectedProduct.name}</span>
              <Badge variant="secondary" className="ml-auto">
                {formatPrice(selectedProduct.price)}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{placeholder}</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search products..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredProducts.length === 0 ? (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No products found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try a different search term
                  </p>
                </div>
              </CommandEmpty>
            ) : (
              groupedProducts.map(([category, products]) => (
                <CommandGroup key={category} heading={category}>
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.name} ${product.description} ${product.category}`}
                      onSelect={() => handleSelect(product)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {product.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formatPrice(product.price)}
                            </Badge>
                          </div>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedProduct?.id === product.id 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}