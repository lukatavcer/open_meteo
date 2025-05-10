/**
 * Logger utility for consistent logging throughout the application
 * This provides a centralized way to handle logging with different levels
 * and can be easily configured or extended
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // No logging
}

// Default configuration
const defaultConfig = {
  level: process.env.NODE_ENV === "production" ? LogLevel.ERROR : LogLevel.DEBUG,
  prefix: "[Weather App]",
};

// Logger configuration
let config = { ...defaultConfig };

/**
 * Configure the logger
 * @param options Configuration options
 */
export function configureLogger(options: Partial<typeof defaultConfig>): void {
  config = { ...config, ...options };
}

/**
 * Log a debug message
 * @param message Message to log
 * @param args Additional arguments
 */
export function debug(message: string, ...args: any[]): void {
  if (config.level <= LogLevel.DEBUG) {
    console.debug(`${config.prefix} ${message}`, ...args);
  }
}

/**
 * Log an info message
 * @param message Message to log
 * @param args Additional arguments
 */
export function info(message: string, ...args: any[]): void {
  if (config.level <= LogLevel.INFO) {
    console.info(`${config.prefix} ${message}`, ...args);
  }
}

/**
 * Log a warning message
 * @param message Message to log
 * @param args Additional arguments
 */
export function warn(message: string, ...args: any[]): void {
  if (config.level <= LogLevel.WARN) {
    console.warn(`${config.prefix} ${message}`, ...args);
  }
}

/**
 * Log an error message
 * @param message Message to log
 * @param args Additional arguments
 */
export function error(message: string, ...args: any[]): void {
  if (config.level <= LogLevel.ERROR) {
    console.error(`${config.prefix} ${message}`, ...args);
  }
}

// Default export for convenience
export default {
  debug,
  info,
  warn,
  error,
  configure: configureLogger,
  LogLevel,
};
