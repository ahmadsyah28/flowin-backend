"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabResolvers = void 0;
const authMiddleware_1 = require("../../utils/authMiddleware");
const RABService_1 = require("../../services/RABService");
exports.rabResolvers = {
    Query: {
        getMyRAB: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return RABService_1.RABService.getRABByKoneksiData(user._id);
        },
    },
    Mutation: {
        createRABPayment: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            const result = await RABService_1.RABService.createRABPayment(user._id);
            return {
                success: result.success,
                message: result.message,
                snapToken: result.data?.snapToken || null,
                snapRedirectUrl: result.data?.snapRedirectUrl || null,
            };
        },
    },
    RAB: {
        id: (parent) => parent._id?.toString() || parent.id,
        idKoneksiData: (parent) => parent.idKoneksiData,
        totalBiaya: (parent) => parent.totalBiaya,
        statusPembayaran: (parent) => parent.statusPembayaran,
        orderId: (parent) => parent.orderId || null,
        paymentUrl: (parent) => parent.paymentUrl || null,
        urlRab: (parent) => parent.urlRab || null,
        catatan: (parent) => parent.catatan || null,
    },
};
//# sourceMappingURL=RAB.js.map