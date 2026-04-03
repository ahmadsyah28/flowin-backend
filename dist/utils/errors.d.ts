import { GraphQLError } from "../graphql";
export declare const ERROR_CODES: {
    readonly BAD_REQUEST: {
        readonly code: "BAD_REQUEST";
        readonly statusCode: 400;
    };
    readonly BAD_USER_INPUT: {
        readonly code: "BAD_USER_INPUT";
        readonly statusCode: 400;
    };
    readonly VALIDATION_ERROR: {
        readonly code: "VALIDATION_ERROR";
        readonly statusCode: 400;
    };
    readonly UNAUTHENTICATED: {
        readonly code: "UNAUTHENTICATED";
        readonly statusCode: 401;
    };
    readonly FORBIDDEN: {
        readonly code: "FORBIDDEN";
        readonly statusCode: 403;
    };
    readonly NOT_FOUND: {
        readonly code: "NOT_FOUND";
        readonly statusCode: 404;
    };
    readonly CONFLICT: {
        readonly code: "CONFLICT";
        readonly statusCode: 409;
    };
    readonly EMAIL_NOT_VERIFIED: {
        readonly code: "EMAIL_NOT_VERIFIED";
        readonly statusCode: 403;
    };
    readonly INTERNAL_SERVER_ERROR: {
        readonly code: "INTERNAL_SERVER_ERROR";
        readonly statusCode: 500;
    };
    readonly DATABASE_ERROR: {
        readonly code: "DATABASE_ERROR";
        readonly statusCode: 500;
    };
    readonly SERVICE_UNAVAILABLE: {
        readonly code: "SERVICE_UNAVAILABLE";
        readonly statusCode: 503;
    };
};
export declare const badRequestError: (message?: string, details?: Record<string, unknown>) => GraphQLError;
export declare const badUserInputError: (message?: string, field?: string) => GraphQLError;
export declare const validationError: (message?: string, fields?: Record<string, string>) => GraphQLError;
export declare const authenticationError: (message?: string) => GraphQLError;
export declare const forbiddenError: (message?: string) => GraphQLError;
export declare const notFoundError: (message?: string, resource?: string) => GraphQLError;
export declare const conflictError: (message?: string, field?: string) => GraphQLError;
export declare const emailNotVerifiedError: (message?: string) => GraphQLError;
export declare const internalServerError: (message?: string) => GraphQLError;
export declare const databaseError: (message?: string) => GraphQLError;
export declare const serviceUnavailableError: (message?: string) => GraphQLError;
export declare const handleError: (error: unknown, context: string) => GraphQLError;
//# sourceMappingURL=errors.d.ts.map