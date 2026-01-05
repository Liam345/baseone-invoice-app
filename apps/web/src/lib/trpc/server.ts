import { cache } from 'react'
import { headers } from 'next/headers'
import { createCallerFactory, appRouter } from '@invoice/api'
import { createContext } from '@invoice/api'
import { createClient } from '@/lib/supabase/server'

/**
 * Create tRPC caller for server-side operations
 */
const createCaller = createCallerFactory(appRouter)

/**
 * Server-side tRPC caller with Supabase context
 */
export const api = cache(async () => {
  const supabase = await createClient()
  const headersList = await headers()
  
  // Create a mock request object for context
  const req = new Request('http://localhost', {
    headers: headersList,
  })

  const context = await createContext(req, supabase)
  
  return createCaller(context)
})