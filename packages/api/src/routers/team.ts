import { TRPCError } from '@trpc/server'
import { createTRPCRouter } from '../trpc'
import { teamProcedure, adminProcedure, protectedProcedure } from '../middleware/auth'
import {
  createTeamSchema,
  updateTeamSchema,
  getTeamSchema,
  deleteTeamSchema,
  inviteTeamMemberSchema,
  updateTeamMemberSchema,
  removeTeamMemberSchema,
  updateTeamSettingsSchema,
} from '../schemas/team'

export const teamRouter = createTRPCRouter({
  /**
   * Get current user's teams
   */
  list: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { supabase, user } = ctx
        
        const { data: teams, error } = await supabase
          .from('users_on_team')
          .select(`
            role,
            team:teams(
              id,
              name,
              logo_url,
              created_at,
              base_currency
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { referencedTable: 'teams', ascending: false })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch teams',
          })
        }

        return teams?.map(t => ({
          ...t.team,
          role: t.role,
        })) || []
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch teams',
          cause: error,
        })
      }
    }),

  /**
   * Get team by ID
   */
  getById: teamProcedure
    .input(getTeamSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { supabase, teamId } = ctx
        
        if (input.id !== teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this team',
          })
        }

        const { data: team, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single()

        if (error || !team) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found',
          })
        }

        return team
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch team',
          cause: error,
        })
      }
    }),

  /**
   * Create a new team
   */
  create: protectedProcedure
    .input(createTeamSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, user } = ctx

        // Create the team
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .insert({
            ...input,
            created_by: user.id,
          })
          .select()
          .single()

        if (teamError || !team) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to create team',
          })
        }

        // Add creator as owner
        const { error: memberError } = await supabase
          .from('users_on_team')
          .insert({
            user_id: user.id,
            team_id: team.id,
            role: 'owner',
          })

        if (memberError) {
          // Clean up team if member creation fails
          await supabase.from('teams').delete().eq('id', team.id)
          
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to add user to team',
          })
        }

        return team
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create team',
          cause: error,
        })
      }
    }),

  /**
   * Update team (admin only)
   */
  update: adminProcedure
    .input(updateTeamSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, teamId } = ctx
        
        if (input.id !== teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this team',
          })
        }

        const { id, ...updateData } = input
        
        const { data: team, error } = await supabase
          .from('teams')
          .update(updateData)
          .eq('id', teamId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to update team',
          })
        }

        return team
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update team',
          cause: error,
        })
      }
    }),

  /**
   * Get team members
   */
  getMembers: teamProcedure
    .query(async ({ ctx }) => {
      try {
        const { supabase, teamId } = ctx
        
        const { data: members, error } = await supabase
          .from('users_on_team')
          .select(`
            role,
            created_at,
            user:users(
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('team_id', teamId)
          .order('created_at', { ascending: true })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch team members',
          })
        }

        return members?.map(m => ({
          ...m.user,
          role: m.role,
          joined_at: m.created_at,
        })) || []
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch team members',
          cause: error,
        })
      }
    }),

  /**
   * Invite team member (admin only)
   */
  inviteMember: adminProcedure
    .input(inviteTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, teamId } = ctx
        
        if (input.team_id !== teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this team',
          })
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', input.email)
          .single()

        if (existingUser) {
          // Check if already a member
          const { data: existingMember } = await supabase
            .from('users_on_team')
            .select('id')
            .eq('user_id', existingUser.id)
            .eq('team_id', teamId)
            .single()

          if (existingMember) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'User is already a member of this team',
            })
          }

          // Add existing user to team
          const { error } = await supabase
            .from('users_on_team')
            .insert({
              user_id: existingUser.id,
              team_id: teamId,
              role: input.role,
            })

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_ERROR',
              message: 'Failed to add user to team',
            })
          }

          return { success: true, message: 'User added to team successfully' }
        } else {
          // TODO: Create invitation system for new users
          // This would create an invitation record and send an email
          // For now, we'll return a message indicating this feature is pending
          
          return { 
            success: false, 
            message: 'User invitation system not yet implemented. User must create an account first.' 
          }
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to invite team member',
          cause: error,
        })
      }
    }),

  /**
   * Update team member role (admin only)
   */
  updateMember: adminProcedure
    .input(updateTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, teamId, user } = ctx
        
        if (input.team_id !== teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this team',
          })
        }

        // Prevent user from changing their own role
        if (input.user_id === user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot change your own role',
          })
        }

        const { error } = await supabase
          .from('users_on_team')
          .update({ role: input.role })
          .eq('user_id', input.user_id)
          .eq('team_id', teamId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to update team member',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update team member',
          cause: error,
        })
      }
    }),

  /**
   * Remove team member (admin only)
   */
  removeMember: adminProcedure
    .input(removeTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, teamId, user } = ctx
        
        if (input.team_id !== teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this team',
          })
        }

        // Prevent user from removing themselves
        if (input.user_id === user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot remove yourself from team',
          })
        }

        const { error } = await supabase
          .from('users_on_team')
          .delete()
          .eq('user_id', input.user_id)
          .eq('team_id', teamId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to remove team member',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove team member',
          cause: error,
        })
      }
    }),

  /**
   * Update team settings (admin only)
   */
  updateSettings: adminProcedure
    .input(updateTeamSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { supabase, teamId } = ctx
        
        if (input.team_id !== teamId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this team',
          })
        }

        // Update team with new settings
        const { data: team, error } = await supabase
          .from('teams')
          .update({
            // Map settings to team columns
            logo_url: input.settings.logo_url,
            base_currency: input.settings.default_currency,
            // Store other settings in a settings JSONB column if it exists
            // For now, we'll just handle the direct mappings
          })
          .eq('id', teamId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to update team settings',
          })
        }

        return { success: true, team }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to update team settings',
          cause: error,
        })
      }
    }),

  /**
   * Leave team (member only)
   */
  leave: teamProcedure
    .mutation(async ({ ctx }) => {
      try {
        const { supabase, teamId, user, userRole } = ctx
        
        // Prevent last owner from leaving
        if (userRole === 'owner') {
          const { data: owners, error } = await supabase
            .from('users_on_team')
            .select('user_id')
            .eq('team_id', teamId)
            .eq('role', 'owner')

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_ERROR',
              message: 'Failed to check team ownership',
            })
          }

          if (owners && owners.length <= 1) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cannot leave team as the only owner. Transfer ownership first.',
            })
          }
        }

        const { error } = await supabase
          .from('users_on_team')
          .delete()
          .eq('user_id', user.id)
          .eq('team_id', teamId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_ERROR',
            message: 'Failed to leave team',
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_ERROR',
          message: 'Failed to leave team',
          cause: error,
        })
      }
    }),
})