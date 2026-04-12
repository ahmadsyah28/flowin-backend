"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupContext = exports.requireAdmin = exports.requireVerification = exports.requireAuth = void 0;
const auth_1 = require("@/utils/auth");
const Pengguna_1 = require("@/models/Pengguna");
const errors_1 = require("@/utils/errors");
const requireAuth = (context) => {
    if (!context.isAuthenticated || !context.user) {
        throw (0, errors_1.authenticationError)("Authentication diperlukan untuk mengakses resource ini");
    }
    return context.user;
};
exports.requireAuth = requireAuth;
const requireVerification = (context) => {
    const user = (0, exports.requireAuth)(context);
    if (!user.isVerified) {
        throw (0, errors_1.emailNotVerifiedError)("Email harus diverifikasi terlebih dahulu");
    }
    return user;
};
exports.requireVerification = requireVerification;
const requireAdmin = (context) => {
    const user = (0, exports.requireVerification)(context);
    return user;
};
exports.requireAdmin = requireAdmin;
const extractToken = (req) => {
    const authHeader = req.headers?.authorization || req.get?.("authorization");
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    return parts[1];
};
const setupContext = async (req) => {
    const context = {
        req,
        isAuthenticated: false,
    };
    const token = extractToken(req);
    if (token) {
        try {
            const payload = (0, auth_1.verifyToken)(token);
            const user = await Pengguna_1.Pengguna.findById(payload.userId);
            if (user) {
                context.user = user;
                context.isAuthenticated = true;
            }
        }
        catch (error) {
            console.log("Invalid token:", error instanceof Error ? error.message : error);
        }
    }
    return context;
};
exports.setupContext = setupContext;
//# sourceMappingURL=authMiddleware.js.map