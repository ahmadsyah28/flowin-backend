"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laporanResolvers = void 0;
const authMiddleware_1 = require("../../utils/authMiddleware");
const enums_1 = require("../../enums");
const LaporanService_1 = require("../../services/LaporanService");
exports.laporanResolvers = {
    JenisLaporan: {
        AIR_TIDAK_MENGALIR: enums_1.EnumJenisLaporan.AIR_TIDAK_MENGALIR,
        AIR_KERUH: enums_1.EnumJenisLaporan.AIR_KERUH,
        KEBOCORAN_PIPA: enums_1.EnumJenisLaporan.KEBOCORAN_PIPA,
        METERAN_BERMASALAH: enums_1.EnumJenisLaporan.METERAN_BERMASALAH,
        KENDALA_LAINNYA: enums_1.EnumJenisLaporan.KENDALA_LAINNYA,
    },
    WorkStatusPelanggan: {
        DIAJUKAN: enums_1.EnumWorkStatusPelanggan.DIAJUKAN,
        DITUGASKAN: enums_1.EnumWorkStatusPelanggan.DITUGASKAN,
        DITINJAU_ADMIN: enums_1.EnumWorkStatusPelanggan.DITINJAU_ADMIN,
        SEDANG_DIKERJAKAN: enums_1.EnumWorkStatusPelanggan.SEDANG_DIKERJAKAN,
        SELESAI: enums_1.EnumWorkStatusPelanggan.SELESAI,
        DIBATALKAN: enums_1.EnumWorkStatusPelanggan.DIBATALKAN,
    },
    Query: {
        laporanList: async (_, { filter }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return LaporanService_1.LaporanService.getLaporanList(user._id, filter);
        },
        laporanById: async (_, { id }) => {
            return LaporanService_1.LaporanService.getLaporanById(id);
        },
        laporanAktif: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return LaporanService_1.LaporanService.getLaporanAktif(user._id);
        },
    },
    Mutation: {
        createLaporan: async (_, { input }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return LaporanService_1.LaporanService.createLaporan(user._id, input);
        },
        updateLaporan: async (_, { id, input }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return LaporanService_1.LaporanService.updateLaporan(id, user._id, input);
        },
        batalkanLaporan: async (_, { id }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return LaporanService_1.LaporanService.batalkanLaporan(id, user._id);
        },
    },
    Laporan: {
        id: (parent) => parent._id?.toString() || parent.id,
        idPengguna: (parent) => parent.IdPengguna,
        pengguna: (parent) => parent.IdPengguna,
        namaLaporan: (parent) => parent.NamaLaporan,
        masalah: (parent) => parent.Masalah,
        alamat: (parent) => parent.Alamat,
        imageURL: (parent) => parent.ImageURL,
        jenisLaporan: (parent) => parent.JenisLaporan,
        catatan: (parent) => parent.Catatan,
        koordinat: (parent) => parent.Koordinat,
        geoLokasi: (parent) => parent.Koordinat,
        status: (parent) => parent.Status,
    },
    GeoLokasi: {
        id: (parent) => parent._id?.toString() || parent.id,
        idLaporan: (parent) => parent.IdLaporan,
        latitude: (parent) => parent.Latitude,
        longitude: (parent) => parent.Longitude,
    },
};
//# sourceMappingURL=Laporan.js.map