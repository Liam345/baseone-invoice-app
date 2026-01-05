import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createContext } from '@invoice/api'
import { createClient } from '@/lib/supabase/server'

const handler = async (req: Request) => {
  try {
    // Create Supabase client for this request
    const supabase = await createClient()

    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createContext(req, supabase),
      onError: ({ path, error, type, input }) => {
        // Always log errors for monitoring
        console.error(`❌ tRPC ${type} failed on ${path ?? '<no-path>'}:`, {
          error: error.message,
          code: error.code,
          cause: error.cause,
          input: process.env.NODE_ENV === 'development' ? input : undefined,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        })

        // In production, you might want to send errors to a monitoring service
        if (process.env.NODE_ENV === 'production' && process.env.ERROR_REPORTING_URL) {
          // Example: Send to error reporting service
          fetch(process.env.ERROR_REPORTING_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service: 'invoice-app-trpc',
              error: error.message,
              path,
              type,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {
            // Ignore error reporting failures
          })
        }
      },
    })
  } catch (error) {
    // Handle initialization errors
    console.error('Failed to initialize tRPC handler:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export { handler as GET, handler as POST }