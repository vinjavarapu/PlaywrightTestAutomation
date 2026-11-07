export type LogLevel = 'INFO' | 'WARN' | 'ERROR';
export type LogContext = Readonly<Record<string, unknown>>;

class StructuredLogger {
  info(event: string, context: LogContext = {}): void {
    this.write('INFO', event, context);
  }

  warn(event: string, context: LogContext = {}): void {
    this.write('WARN', event, context);
  }

  error(event: string, context: LogContext = {}): void {
    this.write('ERROR', event, context);
  }

  private write(level: LogLevel, event: string, context: LogContext): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      ...context,
    }));
  }
}

export const logger = new StructuredLogger();
