type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  error(message: string | Error): void {
    const errorMessage = message instanceof Error ? message.message : message;
    const stack = message instanceof Error ? message.stack : undefined;
    console.error(this.formatMessage('error', errorMessage));
    if (stack && process.env.NODE_ENV === 'development') {
      console.error(stack);
    }
  }

  debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('debug', message));
    }
  }
}

export const logger = new Logger();
