import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@invoice/api'

export const trpc = createTRPCReact<AppRouter>()