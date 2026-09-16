/**
 * Error Handler Utility
 * Sanitizes error messages to hide technical details and code snippets
 * Returns user-friendly error messages with actionable guidance
 */

export type ErrorCategory = 'auth' | 'validation' | 'network' | 'permission' | 'notfound' | 'server' | 'unknown';

interface SanitizedError {
  message: string;
  category: ErrorCategory;
  action: string;
}

/**
 * Determine error category from error message or HTTP status
 */
function getErrorCategory(error: unknown, status?: number): ErrorCategory {
  const errorStr = String(error).toLowerCase();

  if (status === 401 || errorStr.includes('unauthorized') || errorStr.includes('not authenticated')) {
    return 'auth';
  }
  if (status === 403 || errorStr.includes('forbidden') || errorStr.includes('permission denied')) {
    return 'permission';
  }
  if (status === 404 || errorStr.includes('not found')) {
    return 'notfound';
  }
  if (status === 400 || errorStr.includes('invalid') || errorStr.includes('required')) {
    return 'validation';
  }
  if (status === 500 || status === 502 || status === 503) {
    return 'server';
  }
  if (errorStr.includes('network') || errorStr.includes('fetch') || errorStr.includes('timeout')) {
    return 'network';
  }

  return 'unknown';
}

/**
 * Get user-friendly message based on error category
 */
function getErrorMessage(category: ErrorCategory, customHint?: string): string {
  const messages: Record<ErrorCategory, string> = {
    auth: 'Please sign in to continue. Your session may have expired.',
    validation: 'Please check your input and try again.',
    network: 'Connection lost. Please check your internet and try again.',
    permission: 'You do not have permission to perform this action.',
    notfound: 'The resource you are looking for could not be found.',
    server: 'Our servers are experiencing issues. Please try again in a few moments.',
    unknown: 'Something went wrong. Please try again.',
  };

  return messages[category];
}

/**
 * Get actionable guidance based on error category
 */
function getAction(category: ErrorCategory): string {
  const actions: Record<ErrorCategory, string> = {
    auth: 'Sign in with your account to access this feature.',
    validation: 'Review your input fields and ensure all required information is filled correctly.',
    network: 'Check your internet connection and refresh the page.',
    permission: 'Contact support if you believe you should have access to this.',
    notfound: 'Go back and verify the item exists, or refresh the page.',
    server: 'Try again in a few moments or contact support if the issue persists.',
    unknown: 'Refresh the page or contact support if the problem continues.',
  };

  return actions[category];
}

/**
 * Main error sanitizer function
 * Takes any error and returns a safe, user-friendly message
 */
export function sanitizeError(error: unknown, status?: number, customMessage?: string): SanitizedError {
  const category = getErrorCategory(error, status);

  return {
    message: customMessage || getErrorMessage(category),
    category,
    action: getAction(category),
  };
}

/**
 * Extract safe error message from API response
 * Only returns the message field, never exposes stack traces or technical details
 */
export function getSafeErrorMessage(data: any): string {
  if (!data) {
    return 'An unexpected error occurred.';
  }

  // If it's a custom error message, use it
  if (typeof data.message === 'string' && !data.message.includes('at ') && !data.message.includes('.js:')) {
    return data.message;
  }

  // If it's an error field, use it
  if (typeof data.error === 'string' && !data.error.includes('at ') && !data.error.includes('.js:')) {
    return data.error;
  }

  // Default fallback
  return 'An unexpected error occurred.';
}

/**
 * Handle form submission errors
 * Returns clean error message for display
 */
export async function handleFormError(response: Response | Error): Promise<SanitizedError> {
  if (response instanceof Error) {
    return sanitizeError(response.message);
  }

  try {
    const data = await response.json();
    const safeMessage = getSafeErrorMessage(data);
    const category = getErrorCategory(safeMessage, response.status);

    return {
      message: safeMessage,
      category,
      action: getAction(category),
    };
  } catch {
    const category = getErrorCategory(response.statusText, response.status);
    return {
      message: getErrorMessage(category),
      category,
      action: getAction(category),
    };
  }
}

/**
 * Create a user-friendly error display string
 * Includes both message and action
 */
export function formatErrorDisplay(error: SanitizedError): string {
  return `${error.message} ${error.action}`;
}

/**
 * Log error to console in development, but never expose to user
 * In production, this could be sent to a monitoring service
 */
export function logError(context: string, error: unknown, metadata?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error, metadata);
  } else {
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    // Avoid sending sensitive user data
    console.error(`[${context}] Error occurred - check server logs`);
  }
}
