"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupContext = exports.requireAdmin = exports.requireVerification = exports.requireAuth = void 0;
const graphql_1 = require("graphql");
const auth_1 = require("./auth");
const Pengguna_1 = require("@/models/Pengguna");
const requireAuth = (context) => {
    if (!context.isAuthenticated || !context.user) {
        throw new graphql_1.GraphQLError("Authentication diperlukan untuk mengakses resource ini", {
            extensions: {
                code: "UNAUTHENTICATED",
            },
        });
    }
    return context.user;
};
exports.requireAuth = requireAuth;
const requireVerification = (context) => {
    const user = (0, exports.requireAuth)(context);
    if (!user.isVerified) {
        throw new graphql_1.GraphQLError("Email harus diverifikasi terlebih dahulu", {
            extensions: {
                code: "EMAIL_NOT_VERIFIED",
            },
        });
    }
    return user;
};
exports.requireVerification = requireVerification;
const requireAdmin = (context) => {
    const user = (0, exports.requireVerification)(context);
    return user;
};
exports.requireAdmin = requireAdmin;
const setupContext = async (req) => {
    const context = {
        req,
        isAuthenticated: false,
    };
    const authHeader = req.headers?.authorization || req.get?.("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
            const payload = (0, auth_1.verifyToken)(token);
            const user = await Pengguna_1.Pengguna.findById(payload.userId);
            if (user) {
                context.user = user;
                context.isAuthenticated = true;
            }
        }
        catch (error) {
        }
    }
    return context;
};
exports.setupContext = setupContext;
//# sourceMappingURL=authMiddleware.js.map