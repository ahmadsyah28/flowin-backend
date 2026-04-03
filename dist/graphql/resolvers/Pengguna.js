"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.penggunaResolvers = void 0;
const middlewares_1 = require("../../middlewares");
const PenggunaService_1 = require("../../services/PenggunaService");
exports.penggunaResolvers = {
    Query: {
        me: async (_, __, context) => {
            const user = (0, middlewares_1.requireAuth)(context);
            return user;
        },
    },
    Mutation: {
        register: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.register(input);
        },
        registerWithGoogle: async (_, { idToken }) => {
            return PenggunaService_1.PenggunaService.registerWithGoogle(idToken);
        },
        login: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.login(input);
        },
        googleLogin: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.googleLogin(input);
        },
        logout: async (_, __, context) => {
            const user = (0, middlewares_1.requireAuth)(context);
            return PenggunaService_1.PenggunaService.logout(user._id.toString());
        },
        updateProfile: async (_, { input }, context) => {
            const user = (0, middlewares_1.requireAuth)(context);
            return PenggunaService_1.PenggunaService.updateProfile(user._id.toString(), input);
        },
        updatePassword: async (_, { input }, context) => {
            const user = (0, middlewares_1.requireAuth)(context);
            return PenggunaService_1.PenggunaService.updatePassword(user, input);
        },
        completeGoogleProfile: async (_, { input }, context) => {
            const user = (0, middlewares_1.requireAuth)(context);
            return PenggunaService_1.PenggunaService.completeGoogleProfile(user._id.toString(), input);
        },
        verifyEmail: async (_, { token }) => {
            return PenggunaService_1.PenggunaService.verifyEmail(token);
        },
        resendVerificationEmail: async (_, __, context) => {
            const user = (0, middlewares_1.requireAuth)(context);
            return PenggunaService_1.PenggunaService.resendVerificationEmail(user);
        },
    },
};
//# sourceMappingURL=Pengguna.js.map