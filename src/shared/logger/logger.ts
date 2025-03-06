import { winstonLogger } from './winston.config';

export function createLogger(context?: string) {
  return {
    log: (message: string) => winstonLogger.info(message, { context }),
    error: (message: string, trace?: string) =>
      winstonLogger.error(message, { trace, context }),
    warn: (message: string) => winstonLogger.warn(message, { context }),
    debug: (message: string) => winstonLogger.debug(message, { context }),
    verbose: (message: string) => winstonLogger.verbose(message, { context }),
  };
}
