"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.koneksiDataResolvers = void 0;
const authMiddleware_1 = require("../../utils/authMiddleware");
const KoneksiDataService_1 = require("../../services/KoneksiDataService");
exports.koneksiDataResolvers = {
    Query: {
        koneksiData: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return KoneksiDataService_1.KoneksiDataService.getKoneksiData(user._id);
        },
        koneksiDataById: async (_, { id }) => {
            return KoneksiDataService_1.KoneksiDataService.getKoneksiDataById(id);
        },
        cekStatusPengajuan: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return KoneksiDataService_1.KoneksiDataService.cekStatusPengajuan(user._id);
        },
    },
    Mutation: {
        createKoneksiData: async (_, { input }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return KoneksiDataService_1.KoneksiDataService.createKoneksiData(user._id, input);
        },
        updateKoneksiData: async (_, { input }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return KoneksiDataService_1.KoneksiDataService.updateKoneksiData(user._id, input);
        },
    },
    KoneksiData: {
        id: (parent) => parent._id?.toString() || parent.id,
        idPelanggan: (parent) => parent.IdPelanggan,
        pengguna: (parent) => parent.IdPelanggan,
        statusPengajuan: (parent) => parent.StatusPengajuan,
        alasanPenolakan: (parent) => parent.AlasanPenolakan || null,
        tanggalVerifikasi: (parent) => parent.TanggalVerifikasi || null,
        nik: (parent) => parent.NIK,
        nikUrl: (parent) => parent.NIKUrl,
        noKK: (parent) => parent.NoKK,
        kkUrl: (parent) => parent.KKUrl,
        imb: (parent) => parent.IMB,
        imbUrl: (parent) => parent.IMBUrl,
        alamat: (parent) => parent.Alamat,
        kelurahan: (parent) => parent.Kelurahan,
        kecamatan: (parent) => parent.Kecamatan,
        luasBangunan: (parent) => parent.LuasBangunan,
    },
};
//# sourceMappingURL=KoneksiData.js.map