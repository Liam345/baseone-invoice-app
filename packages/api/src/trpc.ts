import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { TRPCContext } from './types'
import { logger, logError } from './lib/logger'

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Log the error
    logError(error, 'tRPC Error', {
      code: error.code,
      path: shape.path,
    })

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
        httpStatus: mapTRPCErrorToHttpStatus(error.code),
      },
    }
  },
})

/**
 * Map tRPC error codes to HTTP status codes
 */
function mapTRPCErrorToHttpStatus(code: TRPCError['code']): number {
  switch (code) {
    case 'BAD_REQUEST':
      return 400
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'METHOD_NOT_SUPPORTED':
      return 405
    case 'TIMEOUT':
      return 408
    case 'CONFLICT':
      return 409
    case 'PRECONDITION_FAILED':
      return 412
    case 'PAYLOAD_TOO_LARGE':
      return 413
    case 'UNPROCESSABLE_CONTENT':
      return 422
    case 'TOO_MANY_REQUESTS':
      return 429
    case 'CLIENT_CLOSED_REQUEST':
      return 499
    case 'INTERNAL_ERROR':
    default:
      return 500
  }
}

/**
 * Logging middleware for all procedures
 */
const loggingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now()
  const result = await next()
  const duration = Date.now() - start

  // Log successful operations
  if (result.ok) {
    logger.info(`tRPC ${type} ${path} completed`, {
      duration,
      userId: ctx.user?.id,
      success: true,
    })
  } else {
    logger.error(`tRPC ${type} ${path} failed`, {
      duration,
      userId: ctx.user?.id,
      error: result.error.message,
      success: false,
    })
  }

  return result
})

/**
 * Export reusable router and procedure builders
 */
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure.use(loggingMiddleware)
export const middleware = t.middleware

/**
 * Create a server-side caller
 */
export const createCallerFactory = t.createCallerFactory