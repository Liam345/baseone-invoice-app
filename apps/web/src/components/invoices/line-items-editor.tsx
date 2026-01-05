'use client'

import { useState } from 'react'
import { useFieldArray, Control, FieldErrors } from 'react-hook-form'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  Hash,
  GripVertical,
} from 'lucide-react'

interface LineItem {
  name: string
  description?: string
  quantity: number
  price: number
  tax: number
}

interface LineItemsEditorProps {
  control: Control<any>
  errors: FieldErrors
  currency: string
}

interface SortableLineItemProps {
  id: string
  index: number
  item: LineItem
  control: Control<any>
  currency: string
  onRemove: (index: number) => void
  canRemove: boolean
}

function SortableLineItem({ 
  id, 
  index, 
  item, 
  control, 
  currency, 
  onRemove, 
  canRemove 
}: SortableLineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const calculateLineTotal = () => {
    const subtotal = (item.quantity || 0) * (item.price || 0)
    const tax = subtotal * ((item.tax || 0) / 100)
    return subtotal + tax
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-12 gap-4 items-start p-4 rounded-lg border bg-card ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
    >
      <div className="col-span-1 flex justify-center pt-2">
        <button
          type="button"
          className="cursor-grab touch-none p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      
      <div className="col-span-4 space-y-2">
        <FormField
          control={control}
          name={`line_items.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="Item name" 
                  {...field} 
                  className="font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`line_items.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="Description (optional)" 
                  rows={2}
                  {...field} 
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={control}
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
                  className="text-center"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-xs text-muted-foreground text-center mt-1">
          Quantity
        </div>
      </div>

      <div className="col-span-2">
        <FormField
          control={control}
          name={`line_items.${index}.price`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-xs text-muted-foreground text-center mt-1">
          Price
        </div>
      </div>

      <div className="col-span-1">
        <FormField
          control={control}
          name={`line_items.${index}.tax`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  step="0.01"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="text-center"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-xs text-muted-foreground text-center mt-1">
          Tax %
        </div>
      </div>

      <div className="col-span-1 space-y-2">
        <div className="text-right font-medium text-sm">
          {formatCurrency(calculateLineTotal())}
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LineItemsEditor({ control, errors, currency }: LineItemsEditorProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'line_items',
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addLineItem = () => {
    append({ 
      name: '', 
      description: '', 
      quantity: 1, 
      price: 0, 
      tax: 0 
    })
  }

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex)
      }
    }
  }

  return (
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
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 text-sm text-muted-foreground font-medium px-4">
            <div className="col-span-1"></div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-1 text-center">Tax</div>
            <div className="col-span-2 text-center">Total</div>
          </div>

          {/* Drag and Drop Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={fields.map(f => f.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <SortableLineItem
                    key={field.id}
                    id={field.id}
                    index={index}
                    item={field as LineItem}
                    control={control}
                    currency={currency}
                    onRemove={removeLineItem}
                    canRemove={fields.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="h-8 w-8 mx-auto mb-2" />
              <p>No line items added</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="mt-2"
              >
                Add your first item
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}