import { TRPCError } from '@trpc/server'
import { createTRPCRouter } from '../trpc'
import { teamProcedure } from '../middleware/auth'
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerFiltersSchema,
  getCustomerSchema,
  deleteCustomerSchema,
  customerAnalyticsSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  addCustomerTagSchema,
  removeCustomerTagSchema,
} from '../schemas/customer'
import { 
  getCustomers, 
  getCustomerById, 
  upsertCustomer, 
  deleteCustomer,
  getCustomerAnalytics,
} from '@invoice/db/queries/customers'

export const customerRouter = createTRPCRouter({
  /**
   * Get paginated customers for team with filtering
   */
  list: teamProcedure
    .input(customerFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        return await getCustomers(supabase, {
          teamId,
          page: input.page,
          limit: input.limit,
          search: input.search,
          tags: input.tags,
          country: input.country,
          sortField: input.sort_field,
          sortDirection: input.sort_direction,
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch customers',
          cause: error,
        })
      }
    }),

  /**
   * Get customer by ID
   */
  getById: teamProcedure
    .input(getCustomerSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        const customer = await getCustomerById(supabase, input.id, teamId)
        
        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        return customer
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch customer',
          cause: error,
        })
      }
    }),

  /**
   * Create a new customer
   */
  create: teamProcedure
    .input(createCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx

        const customer = await upsertCustomer(supabase, {
          ...input,
          team_id: teamId,
          created_by: ctx.user.id,
          updated_by: ctx.user.id,
        })

        return customer
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create customer',
          cause: error,
        })
      }
    }),

  /**
   * Update an existing customer
   */
  update: teamProcedure
    .input(updateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the customer belongs to the team
        const existingCustomer = await getCustomerById(supabase, input.id, teamId)
        if (!existingCustomer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        const { id, ...updateData } = input
        
        const customer = await upsertCustomer(supabase, {
          id,
          ...updateData,
          team_id: teamId,
          updated_by: ctx.user.id,
        })

        return customer
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update customer',
          cause: error,
        })
      }
    }),

  /**
   * Delete a customer
   */
  delete: teamProcedure
    .input(deleteCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the customer belongs to the team
        const existingCustomer = await getCustomerById(supabase, input.id, teamId)
        if (!existingCustomer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        // Check if customer has any invoices
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('id')
          .eq('customer_id', input.id)
          .eq('team_id', teamId)
          .limit(1)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to check customer invoices',
          })
        }

        if (invoices && invoices.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete customer with existing invoices',
          })
        }

        await deleteCustomer(supabase, input.id, teamId)
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete customer',
          cause: error,
        })
      }
    }),

  /**
   * Get customer analytics
   */
  analytics: teamProcedure
    .input(customerAnalyticsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        
        // First verify the customer belongs to the team
        const customer = await getCustomerById(supabase, input.id, teamId)
        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        return await getCustomerAnalytics(supabase, input.id, teamId, input.period)
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch customer analytics',
          cause: error,
        })
      }
    }),

  /**
   * Get all tags for team
   */
  getTags: teamProcedure
    .query(async ({ ctx }) => {
      try {
        const { teamId, supabase } = ctx
        
        const { data: tags, error } = await supabase
          .from('tags')
          .select('*')
          .eq('team_id', teamId)
          .order('name')

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch tags',
          })
        }

        return tags || []
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch tags',
          cause: error,
        })
      }
    }),

  /**
   * Create a new tag
   */
  createTag: teamProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx

        const { data: tag, error } = await supabase
          .from('tags')
          .insert({
            ...input,
            team_id: teamId,
            created_by: ctx.user.id,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to create tag',
          })
        }

        return tag
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create tag',
          cause: error,
        })
      }
    }),

  /**
   * Update a tag
   */
  updateTag: teamProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx
        const { id, ...updateData } = input

        const { data: tag, error } = await supabase
          .from('tags')
          .update(updateData)
          .eq('id', id)
          .eq('team_id', teamId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to update tag',
          })
        }

        if (!tag) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tag not found',
          })
        }

        return tag
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update tag',
          cause: error,
        })
      }
    }),

  /**
   * Delete a tag
   */
  deleteTag: teamProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx

        // First remove all customer-tag relationships
        await supabase
          .from('customer_tags')
          .delete()
          .eq('tag_id', input.id)

        // Then delete the tag
        const { error } = await supabase
          .from('tags')
          .delete()
          .eq('id', input.id)
          .eq('team_id', teamId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete tag',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete tag',
          cause: error,
        })
      }
    }),

  /**
   * Add tag to customer
   */
  addTag: teamProcedure
    .input(addCustomerTagSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx

        // Verify customer belongs to team
        const customer = await getCustomerById(supabase, input.customer_id, teamId)
        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        // Verify tag belongs to team
        const { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('id', input.tag_id)
          .eq('team_id', teamId)
          .single()

        if (!tag) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tag not found',
          })
        }

        const { error } = await supabase
          .from('customer_tags')
          .insert({
            customer_id: input.customer_id,
            tag_id: input.tag_id,
          })

        if (error && error.code !== '23505') { // Ignore duplicate key error
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to add tag to customer',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to add tag to customer',
          cause: error,
        })
      }
    }),

  /**
   * Remove tag from customer
   */
  removeTag: teamProcedure
    .input(removeCustomerTagSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { teamId, supabase } = ctx

        // Verify customer belongs to team
        const customer = await getCustomerById(supabase, input.customer_id, teamId)
        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        const { error } = await supabase
          .from('customer_tags')
          .delete()
          .eq('customer_id', input.customer_id)
          .eq('tag_id', input.tag_id)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to remove tag from customer',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove tag from customer',
          cause: error,
        })
      }
    }),
})