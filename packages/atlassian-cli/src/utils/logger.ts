/**
 * Simple logger interface that can be passed to components
 * Allows parent processes (like MCP servers) to control logging behavior
 */

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  log(message: string, ...args: any[]): void;
}

export class ConsoleLogger implements Logger {
  constructor(private verbose = false) {}

  debug(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(message, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }

  log(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
}

/**
 * Silent logger for MCP or other scenarios where output should be suppressed
 */
export class SilentLogger implements Logger {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  debug(_message: string, ..._args: any[]): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  info(_message: string, ..._args: any[]): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  warn(_message: string, ..._args: any[]): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  error(_message: string, ..._args: any[]): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  log(_message: string, ..._args: any[]): void {}
}

/**
 * Create a logger based on verbose flag
 */
export function createLogger(verbose = false): Logger {
  return new ConsoleLogger(verbose);
}

