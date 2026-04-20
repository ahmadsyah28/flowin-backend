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
        login: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.login(input);
        },
        googleLogin: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.googleLogin(input);
        },
        verifyOTP: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.verifyOTP(input);
        },
        resendOTP: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.resendOTP(input);
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
        forgotPassword: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.forgotPassword(input);
        },
        verifyResetOTP: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.verifyResetOTP(input);
        },
        resetPassword: async (_, { input }) => {
            return PenggunaService_1.PenggunaService.resetPassword(input);
        },
    },
};
//# sourceMappingURL=Pengguna.js.map