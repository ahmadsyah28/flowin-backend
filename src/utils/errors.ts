import { GraphQLError } from "graphql";

/**
 * Standard error codes for GraphQL errors
 * Maps to HTTP status codes for consistency
 */
export const ERROR_CODES = {
  // Client Errors (4xx)
  BAD_REQUEST: { code: "BAD_REQUEST", statusCode: 400 },
  BAD_USER_INPUT: { code: "BAD_USER_INPUT", statusCode: 400 },
  VALIDATION_ERROR: { code: "VALIDATION_ERROR", statusCode: 400 },
  UNAUTHENTICATED: { code: "UNAUTHENTICATED", statusCode: 401 },
  FORBIDDEN: { code: "FORBIDDEN", statusCode: 403 },
  NOT_FOUND: { code: "NOT_FOUND", statusCode: 404 },
  CONFLICT: { code: "CONFLICT", statusCode: 409 },
  EMAIL_NOT_VERIFIED: { code: "EMAIL_NOT_VERIFIED", statusCode: 403 },

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: { code: "INTERNAL_SERVER_ERROR", statusCode: 500 },
  DATABASE_ERROR: { code: "DATABASE_ERROR", statusCode: 500 },
  SERVICE_UNAVAILABLE: { code: "SERVICE_UNAVAILABLE", statusCode: 503 },
} as const;

type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Base function to create GraphQL errors with consistent structure
 */
const createError = (
  message: string,
  code: ErrorCode,
  details?: Record<string, unknown>,
): GraphQLError => {
  const errorInfo = ERROR_CODES[code];

  return new GraphQLError(message, {
    extensions: {
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  });
};

// ================================
// Client Error Functions
// ================================

/**
 * Bad request error (400)
 * Use when the request format is invalid
 */
export const badRequestError = (
  message: string = "Permintaan tidak valid",
  details?: Record<string, unknown>,
): GraphQLError => {
  return createError(message, "BAD_REQUEST", details);
};

/**
 * Bad user input error (400)
 * Use when user provides invalid input data
 */
export const badUserInputError = (
  message: string = "Input tidak valid",
  field?: string,
): GraphQLError => {
  return createError(message, "BAD_USER_INPUT", field ? { field } : undefined);
};

/**
 * Validation error (400)
 * Use when data validation fails
 */
export const validationError = (
  message: string = "Validasi gagal",
  fields?: Record<string, string>,
): GraphQLError => {
  return createError(
    message,
    "VALIDATION_ERROR",
    fields ? { fields } : undefined,
  );
};

/**
 * Authentication error (401)
 * Use when user is not authenticated
 */
export const authenticationError = (
  message: string = "Autentikasi diperlukan. Silakan login.",
): GraphQLError => {
  return createError(message, "UNAUTHENTICATED");
};

/**
 * Forbidden error (403)
 * Use when user doesn't have permission
 */
export const forbiddenError = (
  message: string = "Anda tidak memiliki akses ke resource ini",
): GraphQLError => {
  return createError(message, "FORBIDDEN");
};

/**
 * Not found error (404)
 * Use when resource is not found
 */
export const notFoundError = (
  message: string = "Resource tidak ditemukan",
  resource?: string,
): GraphQLError => {
  return createError(message, "NOT_FOUND", resource ? { resource } : undefined);
};

/**
 * Conflict error (409)
 * Use when there's a conflict (e.g., duplicate entry)
 */
export const conflictError = (
  message: string = "Resource sudah ada",
  field?: string,
): GraphQLError => {
  return createError(message, "CONFLICT", field ? { field } : undefined);
};

/**
 * Email not verified error (403)
 * Use when email verification is required
 */
export const emailNotVerifiedError = (
  message: string = "Email harus diverifikasi terlebih dahulu",
): GraphQLError => {
  return createError(message, "EMAIL_NOT_VERIFIED");
};

// ================================
// Server Error Functions
// ================================

/**
 * Internal server error (500)
 * Use for unexpected server errors
 */
export const internalServerError = (
  message: string = "Terjadi kesalahan pada server",
): GraphQLError => {
  return createError(message, "INTERNAL_SERVER_ERROR");
};

/**
 * Database error (500)
 * Use when database operation fails
 */
export const databaseError = (
  message: string = "Operasi database gagal",
): GraphQLError => {
  return createError(message, "DATABASE_ERROR");
};

/**
 * Service unavailable error (503)
 * Use when external service is down
 */
export const serviceUnavailableError = (
  message: string = "Layanan sedang tidak tersedia",
): GraphQLError => {
  return createError(message, "SERVICE_UNAVAILABLE");
};

// ================================
// Error Handler Utility
// ================================

/**
 * Centralized error handler for resolvers
 * Wraps unknown errors into proper GraphQL errors
 *
 * @example
 * try {
 *   // resolver logic
 * } catch (error) {
 *   throw handleError(error, "Resolver.login");
 * }
 */
export const handleError = (error: unknown, context: string): GraphQLError => {
  // Log error for debugging
  console.error(`[${context}] Error:`, error);

  // If already a GraphQL error, return as-is
  if (error instanceof GraphQLError) {
    return error;
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Check for MongoDB duplicate key error
    if ("code" in error && (error as { code: number }).code === 11000) {
      const keyValue = (error as { keyValue?: Record<string, unknown> })
        .keyValue;
      const field = keyValue ? Object.keys(keyValue)[0] : "unknown";
      return conflictError(`${field} sudah digunakan`, field);
    }

    // Check for MongoDB validation error
    if (error.name === "ValidationError") {
      return validationError(error.message);
    }

    // Check for MongoDB CastError (invalid ObjectId)
    if (error.name === "CastError") {
      return badUserInputError("ID tidak valid");
    }

    return internalServerError(error.message);
  }

  // Unknown error type
  return internalServerError("Terjadi kesalahan yang tidak diketahui");
};
