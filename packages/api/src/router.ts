import { createTRPCRouter } from './trpc'
import { invoiceRouter } from './routers/invoice'
import { customerRouter } from './routers/customer'
import { teamRouter } from './routers/team'
import { userRouter } from './routers/user'
import { pdfRouter } from './routers/pdf'

/**
 * Main tRPC router that combines all feature routers
 */
export const appRouter = createTRPCRouter({
  invoice: invoiceRouter,
  customer: customerRouter,
  team: teamRouter,
  user: userRouter,
  pdf: pdfRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter