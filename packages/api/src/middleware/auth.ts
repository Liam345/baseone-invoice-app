import { TRPCError } from '@trpc/server'
import { middleware, publicProcedure } from '../trpc'
import type { ProtectedContext } from '../context'

/**
 * Authentication middleware that ensures user is logged in
 */
export const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.supabase) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      supabase: ctx.supabase,
    } as ProtectedContext,
  })
})

/**
 * Team membership middleware that ensures user belongs to a team
 */
export const teamMiddleware = middleware(async ({ ctx, input, next }) => {
  if (!ctx.user || !ctx.supabase) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  // Get user's team membership
  const { data: userTeam, error } = await ctx.supabase
    .from('users_on_team')
    .select('team_id, role')
    .eq('user_id', ctx.user.id)
    .single()

  if (error || !userTeam) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Team membership required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      supabase: ctx.supabase,
      teamId: userTeam.team_id,
      userRole: userTeam.role,
    },
  })
})

/**
 * Admin middleware that ensures user has admin role in team
 */
export const adminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.supabase) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  // Get user's team membership and role
  const { data: userTeam, error } = await ctx.supabase
    .from('users_on_team')
    .select('team_id, role')
    .eq('user_id', ctx.user.id)
    .single()

  if (error || !userTeam || userTeam.role !== 'owner') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      supabase: ctx.supabase,
      teamId: userTeam.team_id,
      userRole: userTeam.role,
    },
  })
})

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = publicProcedure.use(authMiddleware)

/**
 * Team procedure that requires team membership
 */
export const teamProcedure = publicProcedure.use(teamMiddleware)

/**
 * Admin procedure that requires admin access
 */
export const adminProcedure = publicProcedure.use(adminMiddleware)