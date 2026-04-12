"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riwayatPenggunaanResolvers = void 0;
const RiwayatPenggunaanService_1 = require("../../services/RiwayatPenggunaanService");
exports.riwayatPenggunaanResolvers = {
    Query: {
        riwayatPenggunaan: async (_, { meteranId }) => {
            return RiwayatPenggunaanService_1.RiwayatPenggunaanService.getRiwayatPenggunaan(meteranId);
        },
    },
    RiwayatPenggunaan: {
        id: (parent) => parent._id?.toString() || parent.id,
        meteranId: (parent) => parent.MeteranId,
        meteran: (parent) => parent.MeteranId,
        penggunaanAir: (parent) => parent.PenggunaanAir,
    },
};
//# sourceMappingURL=RiwayatPenggunaan.js.map