/**
 * Simple logger utility for API operations
 */

export interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

export const LOG_LEVEL: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: keyof LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    }

    if (this.isDevelopment) {
      // In development, use console methods for better formatting
      switch (level) {
        case 'ERROR':
          console.error(`[${timestamp}] ERROR: ${message}`, meta || '')
          break
        case 'WARN':
          console.warn(`[${timestamp}] WARN: ${message}`, meta || '')
          break
        case 'INFO':
          console.info(`[${timestamp}] INFO: ${message}`, meta || '')
          break
        case 'DEBUG':
          console.debug(`[${timestamp}] DEBUG: ${message}`, meta || '')
          break
      }
    } else {
      // In production, output structured JSON logs
      console.log(JSON.stringify(logEntry))
    }
  }

  error(message: string, meta?: any) {
    this.log('ERROR', message, meta)
  }

  warn(message: string, meta?: any) {
    this.log('WARN', message, meta)
  }

  info(message: string, meta?: any) {
    this.log('INFO', message, meta)
  }

  debug(message: string, meta?: any) {
    if (this.isDevelopment) {
      this.log('DEBUG', message, meta)
    }
  }
}

export const logger = new Logger()

/**
 * Error logging helper
 */
export function logError(error: unknown, context: string, meta?: any) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const errorStack = error instanceof Error ? error.stack : undefined

  logger.error(`${context}: ${errorMessage}`, {
    stack: errorStack,
    ...meta,
  })
}

/**
 * API operation logging helper
 */
export function logApiOperation(
  operation: string,
  userId?: string,
  teamId?: string,
  meta?: any
) {
  logger.info(`API Operation: ${operation}`, {
    userId,
    teamId,
    ...meta,
  })
}