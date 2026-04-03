"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.serviceUnavailableError = exports.databaseError = exports.internalServerError = exports.emailNotVerifiedError = exports.conflictError = exports.notFoundError = exports.forbiddenError = exports.authenticationError = exports.validationError = exports.badUserInputError = exports.badRequestError = exports.ERROR_CODES = void 0;
const graphql_1 = require("../graphql");
exports.ERROR_CODES = {
    BAD_REQUEST: { code: "BAD_REQUEST", statusCode: 400 },
    BAD_USER_INPUT: { code: "BAD_USER_INPUT", statusCode: 400 },
    VALIDATION_ERROR: { code: "VALIDATION_ERROR", statusCode: 400 },
    UNAUTHENTICATED: { code: "UNAUTHENTICATED", statusCode: 401 },
    FORBIDDEN: { code: "FORBIDDEN", statusCode: 403 },
    NOT_FOUND: { code: "NOT_FOUND", statusCode: 404 },
    CONFLICT: { code: "CONFLICT", statusCode: 409 },
    EMAIL_NOT_VERIFIED: { code: "EMAIL_NOT_VERIFIED", statusCode: 403 },
    INTERNAL_SERVER_ERROR: { code: "INTERNAL_SERVER_ERROR", statusCode: 500 },
    DATABASE_ERROR: { code: "DATABASE_ERROR", statusCode: 500 },
    SERVICE_UNAVAILABLE: { code: "SERVICE_UNAVAILABLE", statusCode: 503 },
};
const createError = (message, code, details) => {
    const errorInfo = exports.ERROR_CODES[code];
    return new graphql_1.GraphQLError(message, {
        extensions: {
            code: errorInfo.code,
            statusCode: errorInfo.statusCode,
            timestamp: new Date().toISOString(),
            ...(details && { details }),
        },
    });
};
const badRequestError = (message = "Permintaan tidak valid", details) => {
    return createError(message, "BAD_REQUEST", details);
};
exports.badRequestError = badRequestError;
const badUserInputError = (message = "Input tidak valid", field) => {
    return createError(message, "BAD_USER_INPUT", field ? { field } : undefined);
};
exports.badUserInputError = badUserInputError;
const validationError = (message = "Validasi gagal", fields) => {
    return createError(message, "VALIDATION_ERROR", fields ? { fields } : undefined);
};
exports.validationError = validationError;
const authenticationError = (message = "Autentikasi diperlukan. Silakan login.") => {
    return createError(message, "UNAUTHENTICATED");
};
exports.authenticationError = authenticationError;
const forbiddenError = (message = "Anda tidak memiliki akses ke resource ini") => {
    return createError(message, "FORBIDDEN");
};
exports.forbiddenError = forbiddenError;
const notFoundError = (message = "Resource tidak ditemukan", resource) => {
    return createError(message, "NOT_FOUND", resource ? { resource } : undefined);
};
exports.notFoundError = notFoundError;
const conflictError = (message = "Resource sudah ada", field) => {
    return createError(message, "CONFLICT", field ? { field } : undefined);
};
exports.conflictError = conflictError;
const emailNotVerifiedError = (message = "Email harus diverifikasi terlebih dahulu") => {
    return createError(message, "EMAIL_NOT_VERIFIED");
};
exports.emailNotVerifiedError = emailNotVerifiedError;
const internalServerError = (message = "Terjadi kesalahan pada server") => {
    return createError(message, "INTERNAL_SERVER_ERROR");
};
exports.internalServerError = internalServerError;
const databaseError = (message = "Operasi database gagal") => {
    return createError(message, "DATABASE_ERROR");
};
exports.databaseError = databaseError;
const serviceUnavailableError = (message = "Layanan sedang tidak tersedia") => {
    return createError(message, "SERVICE_UNAVAILABLE");
};
exports.serviceUnavailableError = serviceUnavailableError;
const handleError = (error, context) => {
    console.error(`[${context}] Error:`, error);
    if (error instanceof graphql_1.GraphQLError) {
        return error;
    }
    if (error instanceof Error) {
        if ("code" in error && error.code === 11000) {
            const keyValue = error
                .keyValue;
            const field = keyValue ? Object.keys(keyValue)[0] : "unknown";
            return (0, exports.conflictError)(`${field} sudah digunakan`, field);
        }
        if (error.name === "ValidationError") {
            return (0, exports.validationError)(error.message);
        }
        if (error.name === "CastError") {
            return (0, exports.badUserInputError)("ID tidak valid");
        }
        return (0, exports.internalServerError)(error.message);
    }
    return (0, exports.internalServerError)("Terjadi kesalahan yang tidak diketahui");
};
exports.handleError = handleError;
//# sourceMappingURL=errors.js.map