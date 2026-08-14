export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY',
  AUDIT = 'AUDIT',
}

export interface LogContext {
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      environment: this.environment,
      message,
      ...(context && { context }),
    };

    if (this.environment === 'production' || process.env.LOG_FORMAT === 'json') {
      return JSON.stringify(logObject);
    }

    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.environment !== 'production' ? error.stack : undefined,
    } : error;

    const mergedContext = { ...context, error: errorDetails };
    console.error(this.formatMessage(LogLevel.ERROR, message, mergedContext));
  }

  security(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.SECURITY, `[SECURITY EVENT] ${message}`, context));
  }

  audit(action: string, actorId: string, target: string, metadata?: Record<string, any>): void {
    console.log(
      this.formatMessage(LogLevel.AUDIT, `[AUDIT LOG] ${action}`, {
        actorId,
        action,
        target,
        metadata,
      })
    );
  }
}

export const logger = new Logger();
