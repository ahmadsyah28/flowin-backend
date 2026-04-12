"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.generateRequestId = exports.formatGraphQLError = void 0;
const graphql_1 = require("graphql");
const config_1 = require("@/config");
const errors_1 = require("@/utils/errors");
const formatGraphQLError = (formattedError, error) => {
    if (config_1.isDevelopment) {
        console.error("═".repeat(50));
        console.error("🔴 GraphQL Error:");
        console.error("Message:", formattedError.message);
        console.error("Code:", formattedError.extensions?.code);
        console.error("Path:", formattedError.path);
        if (error instanceof graphql_1.GraphQLError) {
            console.error("Stack:", error.stack);
        }
        console.error("═".repeat(50));
    }
    const originalCode = formattedError.extensions?.code;
    const errorInfo = errors_1.ERROR_CODES[originalCode] ||
        errors_1.ERROR_CODES.INTERNAL_SERVER_ERROR;
    const statusCode = formattedError.extensions?.statusCode || errorInfo.statusCode;
    const details = formattedError.extensions?.details;
    const message = config_1.config.nodeEnv === "production" && originalCode === "INTERNAL_SERVER_ERROR"
        ? "Terjadi kesalahan pada server"
        : formattedError.message;
    const response = {
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
    if (config_1.isDevelopment && formattedError.extensions?.stacktrace) {
        response.extensions.stacktrace = formattedError.extensions
            .stacktrace;
    }
    return response;
};
exports.formatGraphQLError = formatGraphQLError;
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateRequestId = generateRequestId;
const requestLogger = (req, _res, next) => {
    if (config_1.isDevelopment) {
        const timestamp = new Date().toISOString();
        const method = req.method;
        const path = req.path || req.url;
        console.log(`[${timestamp}] ${method} ${path}`);
    }
    next?.();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=errorHandler.js.map