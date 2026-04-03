import { GraphQLFormattedError, GraphQLError } from "graphql";
import { config, isDevelopment } from "@/config";
import { ERROR_CODES } from "@/utils/errors";

/**
 * Extended error response structure
 */
interface FormattedErrorResponse extends GraphQLFormattedError {
  extensions: {
    code: string;
    statusCode: number;
    timestamp: string;
    path?: readonly (string | number)[];
    details?: unknown;
    stacktrace?: string[];
  };
}

/**
 * Format GraphQL errors for consistent API responses
 * - In development: includes full error details and stack trace
 * - In production: hides internal errors, shows generic message
 *
 * @example
 * // Di Apollo Server config
 * formatError: formatGraphQLError
 */
export const formatGraphQLError = (
  formattedError: GraphQLFormattedError,
  error: unknown,
): FormattedErrorResponse => {
  // Log error in development
  if (isDevelopment) {
    console.error("═".repeat(50));
    console.error("🔴 GraphQL Error:");
    console.error("Message:", formattedError.message);
    console.error("Code:", formattedError.extensions?.code);
    console.error("Path:", formattedError.path);
    if (error instanceof GraphQLError) {
      console.error("Stack:", error.stack);
    }
    console.error("═".repeat(50));
  }

  // Get error code and status
  const originalCode = formattedError.extensions?.code as string;
  const errorInfo =
    ERROR_CODES[originalCode as keyof typeof ERROR_CODES] ||
    ERROR_CODES.INTERNAL_SERVER_ERROR;

  const statusCode =
    (formattedError.extensions?.statusCode as number) || errorInfo.statusCode;

  // Get additional details
  const details = formattedError.extensions?.details as
    | Record<string, unknown>
    | undefined;

  // In production, hide internal error messages
  const message =
    config.nodeEnv === "production" && originalCode === "INTERNAL_SERVER_ERROR"
      ? "Terjadi kesalahan pada server"
      : formattedError.message;

  // Build response
  const response: FormattedErrorResponse = {
    message,
    path: formattedError.path,
    extensions: {
      code: errorInfo.code,
      statusCode,
      timestamp: new Date().toISOString(),
      path: formattedError.path,
      ...(details && { details }),
    },
  };

  // Include stack trace in development only
  if (isDevelopment && formattedError.extensions?.stacktrace) {
    response.extensions.stacktrace = formattedError.extensions
      .stacktrace as string[];
  }

  return response;
};

/**
 * Generate unique request ID for tracking
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request logger middleware (untuk Express jika digunakan)
 * Logs incoming requests in development mode
 */
export const requestLogger = (req: any, _res: any, next: () => void): void => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path || req.url;
    console.log(`[${timestamp}] ${method} ${path}`);
  }
  next?.();
};
