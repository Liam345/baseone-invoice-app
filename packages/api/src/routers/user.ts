import { TRPCError } from '@trpc/server'
import { createTRPCRouter } from '../trpc'
import { protectedProcedure } from '../middleware/auth'
import {
  updateUserProfileSchema,
  updateUserPreferencesSchema,
  changePasswordSchema,
  deleteAccountSchema,
  getUserSchema,
} from '../schemas/user'

export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  profile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { supabase, user } = ctx
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error || !profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found',
          })
        }

        return profile
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user profile',
          cause: error,
        })
      }
    }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, user } = ctx
        
        const { data: profile, error } = await supabase
          .from('users')
          .update({
            ...input,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to update user profile',
          })
        }

        return profile
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user profile',
          cause: error,
        })
      }
    }),

  /**
   * Get user preferences
   */
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { supabase, user } = ctx
        
        // For now, we'll store preferences in the users table
        // In a more complex system, this might be a separate table
        const { data: userWithPrefs, error } = await supabase
          .from('users')
          .select('locale, timezone, week_starts_on_monday, date_format, time_format')
          .eq('id', user.id)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch user preferences',
          })
        }

        // Return default preferences merged with user's preferences
        return {
          email_notifications: {
            invoice_sent: true,
            invoice_paid: true,
            invoice_overdue: true,
            new_team_member: true,
            weekly_summary: true,
          },
          dashboard_widgets: [],
          default_currency: 'USD',
          default_invoice_template: null,
          ...userWithPrefs,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user preferences',
          cause: error,
        })
      }
    }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(updateUserPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, user } = ctx
        
        // Extract preference fields that map to user table columns
        const userTableFields = {
          locale: input.locale,
          timezone: input.timezone,
          week_starts_on_monday: input.week_starts_on_monday,
          date_format: input.date_format,
          time_format: input.time_format,
        }

        // Remove undefined values
        const updateData = Object.fromEntries(
          Object.entries(userTableFields).filter(([_, value]) => value !== undefined)
        )

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from('users')
            .update({
              ...updateData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_ERROR',
              message: 'Failed to update user preferences',
            })
          }
        }

        // TODO: Store other preferences (email_notifications, dashboard_widgets, etc.)
        // in a separate user_preferences table or JSONB column

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user preferences',
          cause: error,
        })
      }
    }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase } = ctx
        
        // Verify current password by attempting to sign in
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: ctx.user.email!,
          password: input.current_password,
        })

        if (verifyError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Current password is incorrect',
          })
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: input.new_password,
        })

        if (updateError) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to update password',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to change password',
          cause: error,
        })
      }
    }),

  /**
   * Delete user account
   */
  deleteAccount: protectedProcedure
    .input(deleteAccountSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, user } = ctx
        
        // Verify password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: input.password,
        })

        if (verifyError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password is incorrect',
          })
        }

        // Check if user is the only owner of any teams
        const { data: ownedTeams, error: teamsError } = await supabase
          .from('users_on_team')
          .select(`
            team_id,
            team:teams(name)
          `)
          .eq('user_id', user.id)
          .eq('role', 'owner')

        if (teamsError) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to check team ownership',
          })
        }

        if (ownedTeams && ownedTeams.length > 0) {
          // Check if user is the sole owner of any team
          for (const ownedTeam of ownedTeams) {
            const { data: otherOwners, error } = await supabase
              .from('users_on_team')
              .select('user_id')
              .eq('team_id', ownedTeam.team_id)
              .eq('role', 'owner')
              .neq('user_id', user.id)

            if (error) {
              throw new TRPCError({
                code: 'INTERNAL_ERROR',
                message: 'Failed to check team ownership',
              })
            }

            if (!otherOwners || otherOwners.length === 0) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Cannot delete account. You are the only owner of team "${ownedTeam.team?.name}". Transfer ownership first.`,
              })
            }
          }
        }

        // TODO: Implement proper account deletion
        // This should:
        // 1. Remove user from all teams
        // 2. Anonymize or transfer their data
        // 3. Delete the auth user account
        // 4. Clean up related records
        
        // For now, just remove from teams and mark user as deleted
        await supabase
          .from('users_on_team')
          .delete()
          .eq('user_id', user.id)

        await supabase
          .from('users')
          .update({
            email: `deleted-${user.id}@deleted.local`,
            full_name: 'Deleted User',
            avatar_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        // Delete from Supabase Auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete user account',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete account',
          cause: error,
        })
      }
    }),

  /**
   * Get user by ID (for admin purposes or public profiles)
   */
  getById: protectedProcedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { supabase, user } = ctx
        
        const userId = input.id || user.id
        
        // Only allow users to view their own profile for now
        // In a more complex system, you might allow team members to view each other
        if (userId !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          })
        }

        const { data: profile, error } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url, created_at')
          .eq('id', userId)
          .single()

        if (error || !profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        return profile
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user',
          cause: error,
        })
      }
    }),
})