"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagihanResolvers = void 0;
const authMiddleware_1 = require("@/utils/authMiddleware");
const TagihanService_1 = require("@/services/TagihanService");
const enums_1 = require("@/enums");
exports.tagihanResolvers = {
    PaymentStatus: {
        PENDING: enums_1.EnumPaymentStatus.PENDING,
        SETTLEMENT: enums_1.EnumPaymentStatus.SETTLEMENT,
        CANCEL: enums_1.EnumPaymentStatus.CANCEL,
        EXPIRE: enums_1.EnumPaymentStatus.EXPIRE,
        REFUND: enums_1.EnumPaymentStatus.REFUND,
        CHARGEBACK: enums_1.EnumPaymentStatus.CHARGEBACK,
        FRAUD: enums_1.EnumPaymentStatus.FRAUD,
    },
    Query: {
        tagihanList: async (_, { filter }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return TagihanService_1.TagihanService.getTagihanList(user._id, filter);
        },
        tagihan: async (_, { id }) => {
            return TagihanService_1.TagihanService.getTagihanById(id);
        },
        tagihanAktif: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return TagihanService_1.TagihanService.getTagihanAktif(user._id);
        },
        tagihanRiwayat: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return TagihanService_1.TagihanService.getTagihanRiwayat(user._id);
        },
    },
    Mutation: {
        bayarTagihan: async (_, { id, metodePembayaran }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return TagihanService_1.TagihanService.bayarTagihan(id, user._id, metodePembayaran);
        },
    },
    Tagihan: {
        id: (parent) => parent._id?.toString() || parent.id,
        idMeteran: (parent) => parent.IdMeteran,
        meteran: (parent) => parent.IdMeteran,
        periode: (parent) => parent.Periode,
        penggunaanSebelum: (parent) => parent.PenggunaanSebelum,
        penggunaanSesudah: (parent) => parent.PenggunaanSekarang,
        TotalPemakaian: (parent) => parent.TotalPemakaian,
        biaya: (parent) => parent.Biaya,
        totalBiaya: (parent) => parent.TotalBiaya,
        statusPembayaran: (parent) => parent.StatusPembayaran,
        tanggalPembayaran: (parent) => parent.TanggalPembayaran,
        metodePembayaran: (parent) => parent.MetodePembayaran,
        tenggatWaktu: (parent) => parent.TenggatWaktu,
        menunggak: (parent) => parent.Menunggak,
        denda: (parent) => parent.Denda,
    },
};
//# sourceMappingURL=Tagihan.js.map