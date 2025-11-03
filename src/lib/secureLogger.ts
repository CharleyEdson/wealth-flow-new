import { toast } from "sonner";

/**
 * Secure logging utility that only logs detailed errors in development
 * and shows user-friendly messages in production
 */
export const secureLogger = {
  /**
   * Log an error with context
   * @param error - The error object or message
   * @param context - A brief description of where the error occurred
   * @param userMessage - Optional custom message to show to the user
   */
  error: (error: any, context: string, userMessage?: string) => {
    // Only log detailed errors in development
    if (import.meta.env.DEV) {
      console.error(`[${context}]`, error);
    }
    
    // In production, you would send to a logging service like Sentry
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { tags: { context } });
    // }

    // Always show a user-friendly message
    toast.error(userMessage || 'An error occurred. Please try again.');
  },

  /**
   * Log general information (safe in both dev and prod)
   */
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  },

  /**
   * Log a warning
   */
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.warn(message, data);
    }
  },
};