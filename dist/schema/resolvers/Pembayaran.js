"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pembayaranResolvers = void 0;
const authMiddleware_1 = require("@/utils/authMiddleware");
const PembayaranService_1 = require("@/services/PembayaranService");
const Pembayaran_1 = require("@/models/Pembayaran");
exports.pembayaranResolvers = {
    StatusPembayaran: {
        Pending: Pembayaran_1.EnumStatusPembayaran.PENDING,
        Settlement: Pembayaran_1.EnumStatusPembayaran.SUKSES,
        Cancel: Pembayaran_1.EnumStatusPembayaran.GAGAL,
        Expire: Pembayaran_1.EnumStatusPembayaran.EXPIRED,
        Refund: Pembayaran_1.EnumStatusPembayaran.REFUND,
    },
    Query: {
        pembayaranList: async (_, { limit, offset }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return PembayaranService_1.PembayaranService.getMyPembayaran(user._id, limit || 10, offset || 0);
        },
        pembayaran: async (_, { id }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return PembayaranService_1.PembayaranService.getPembayaranDetail(id, user._id);
        },
        cekStatusPembayaran: async (_, { orderId }, context) => {
            (0, authMiddleware_1.requireAuth)(context);
            return PembayaranService_1.PembayaranService.checkTransactionStatus(orderId);
        },
    },
    Mutation: {
        buatPembayaran: async (_, { tagihanId }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return PembayaranService_1.PembayaranService.createPayment(tagihanId, user._id);
        },
    },
    Pembayaran: {
        id: (parent) => parent._id?.toString() || parent.id,
        idTagihan: (parent) => parent.IdTagihan,
        tagihan: (parent) => parent.IdTagihan,
        idPengguna: (parent) => parent.IdPengguna,
        midtransOrderId: (parent) => parent.MidtransOrderId,
        midtransTransactionId: (parent) => parent.MidtransTransactionId,
        snapToken: (parent) => parent.SnapToken,
        snapRedirectUrl: (parent) => parent.SnapRedirectUrl,
        metodePembayaran: (parent) => parent.MetodePembayaran,
        jumlahBayar: (parent) => parent.JumlahBayar,
        statusPembayaran: (parent) => parent.StatusPembayaran,
        tanggalBayar: (parent) => parent.TanggalBayar,
    },
};
//# sourceMappingURL=Pembayaran.js.map