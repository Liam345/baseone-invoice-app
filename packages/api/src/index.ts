// Export main router and types
export { appRouter, type AppRouter } from './router'

// Export context creation functions
export { createContext, type PublicContext, type ProtectedContext } from './context'

// Export tRPC utilities
export { createTRPCRouter, publicProcedure, createCallerFactory } from './trpc'

// Export middleware
export { protectedProcedure, teamProcedure, adminProcedure } from './middleware/auth'

// Export types
export type { TRPCContext, ErrorCode } from './types'

// Export schemas for client-side use
export * from './schemas/invoice'
export * from './schemas/customer'
export * from './schemas/team'
export * from './schemas/user'