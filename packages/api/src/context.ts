import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { TRPCContext } from './types'

/**
 * Create tRPC context with Supabase client and optional user
 */
export async function createContext(
  req?: Request,
  supabase?: SupabaseClient
): Promise<TRPCContext> {
  let user: User | null = null
  let supabaseClient = supabase

  // Create Supabase client if not provided
  if (!supabaseClient && req) {
    supabaseClient = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookieHeader = req.headers.get('cookie')
            if (!cookieHeader) return undefined
            
            const cookies = cookieHeader
              .split(';')
              .map(c => c.trim().split('='))
              .reduce((acc, [key, value]) => {
                acc[key] = decodeURIComponent(value || '')
                return acc
              }, {} as Record<string, string>)
            
            return cookies[name]
          },
        },
      }
    )
  }

  // Get authenticated user if client exists
  if (supabaseClient) {
    const { data: { user: authUser } } = await supabaseClient.auth.getUser()
    user = authUser
  }

  return {
    user,
    supabase: supabaseClient,
    req,
  }
}

/**
 * Context type for public procedures (no auth required)
 */
export type PublicContext = Awaited<ReturnType<typeof createContext>>

/**
 * Context type for protected procedures (auth required)
 */
export type ProtectedContext = PublicContext & {
  user: User
  supabase: SupabaseClient
}