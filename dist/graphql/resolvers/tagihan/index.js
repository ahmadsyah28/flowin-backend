"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagihanResolvers = void 0;
const graphql_1 = require("graphql");
const models_1 = require("@/models");
const enums_1 = require("@/enums");
exports.tagihanResolvers = {
    Query: {
        tagihanByPengguna: async (_, { penggunaId }, context) => {
            const userId = penggunaId || context.user?._id?.toString();
            if (!userId) {
                throw new graphql_1.GraphQLError("Not authenticated or user ID not provided");
            }
            try {
                const koneksiData = await models_1.KoneksiData.findOne({ IdPelanggan: userId });
                if (!koneksiData)
                    return [];
                const meters = await models_1.Meter.find({ IdKoneksiData: koneksiData._id });
                const meterIds = meters.map((m) => m._id);
                const tagihan = await models_1.Tagihan.find({
                    IdMeteran: { $in: meterIds },
                }).populate("IdMeteran");
                return tagihan.map((t) => ({
                    id: t._id.toString(),
                    IdMeteran: t.IdMeteran.toString(),
                    Periode: t.Periode,
                    PenggunaanSebelum: t.PenggunaanSebelum,
                    PenggunaanSekarang: t.PenggunaanSekarang,
                    TotalPemakaian: t.TotalPemakaian,
                    Biaya: t.Biaya,
                    TotalBiaya: t.TotalBiaya,
                    StatusPembayaran: t.StatusPembayaran,
                    TanggalPembayaran: t.TanggalPembayaran,
                    MetodePembayaran: t.MetodePembayaran,
                    TenggatWaktu: t.TenggatWaktu,
                    Menunggak: t.Menunggak,
                    Denda: t.Denda,
                    Catatan: t.Catatan,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                }));
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching tagihan");
            }
        },
        tagihanById: async (_, { id }) => {
            try {
                const tagihan = await models_1.Tagihan.findById(id).populate("IdMeteran");
                if (!tagihan) {
                    throw new graphql_1.GraphQLError("Tagihan tidak ditemukan");
                }
                return {
                    id: tagihan._id.toString(),
                    IdMeteran: tagihan.IdMeteran.toString(),
                    Periode: tagihan.Periode,
                    PenggunaanSebelum: tagihan.PenggunaanSebelum,
                    PenggunaanSekarang: tagihan.PenggunaanSekarang,
                    TotalPemakaian: tagihan.TotalPemakaian,
                    Biaya: tagihan.Biaya,
                    TotalBiaya: tagihan.TotalBiaya,
                    StatusPembayaran: tagihan.StatusPembayaran,
                    TanggalPembayaran: tagihan.TanggalPembayaran,
                    MetodePembayaran: tagihan.MetodePembayaran,
                    TenggatWaktu: tagihan.TenggatWaktu,
                    Menunggak: tagihan.Menunggak,
                    Denda: tagihan.Denda,
                    Catatan: tagihan.Catatan,
                    createdAt: tagihan.createdAt,
                    updatedAt: tagihan.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching tagihan");
            }
        },
        tagihanByStatus: async (_, { status }) => {
            try {
                const tagihan = await models_1.Tagihan.find({
                    StatusPembayaran: status,
                }).populate("IdMeteran");
                return tagihan.map((t) => ({
                    id: t._id.toString(),
                    IdMeteran: t.IdMeteran.toString(),
                    Periode: t.Periode,
                    PenggunaanSebelum: t.PenggunaanSebelum,
                    PenggunaanSekarang: t.PenggunaanSekarang,
                    TotalPemakaian: t.TotalPemakaian,
                    Biaya: t.Biaya,
                    TotalBiaya: t.TotalBiaya,
                    StatusPembayaran: t.StatusPembayaran,
                    TanggalPembayaran: t.TanggalPembayaran,
                    MetodePembayaran: t.MetodePembayaran,
                    TenggatWaktu: t.TenggatWaktu,
                    Menunggak: t.Menunggak,
                    Denda: t.Denda,
                    Catatan: t.Catatan,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                }));
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching tagihan by status");
            }
        },
    },
    Mutation: {
        bayarTagihan: async (_, { id, metodePembayaran }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const tagihan = await models_1.Tagihan.findById(id);
                if (!tagihan) {
                    throw new graphql_1.GraphQLError("Tagihan tidak ditemukan");
                }
                if (tagihan.StatusPembayaran === enums_1.EnumPaymentStatus.SETTLEMENT) {
                    throw new graphql_1.GraphQLError("Tagihan sudah dibayar");
                }
                const updatedTagihan = await models_1.Tagihan.findByIdAndUpdate(id, {
                    StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
                    MetodePembayaran: metodePembayaran,
                    TanggalPembayaran: new Date(),
                    Menunggak: false,
                }, { new: true });
                if (!updatedTagihan) {
                    throw new graphql_1.GraphQLError("Gagal mengupdate status pembayaran");
                }
                return {
                    id: updatedTagihan._id.toString(),
                    IdMeteran: updatedTagihan.IdMeteran.toString(),
                    Periode: updatedTagihan.Periode,
                    PenggunaanSebelum: updatedTagihan.PenggunaanSebelum,
                    PenggunaanSekarang: updatedTagihan.PenggunaanSekarang,
                    TotalPemakaian: updatedTagihan.TotalPemakaian,
                    Biaya: updatedTagihan.Biaya,
                    TotalBiaya: updatedTagihan.TotalBiaya,
                    StatusPembayaran: updatedTagihan.StatusPembayaran,
                    TanggalPembayaran: updatedTagihan.TanggalPembayaran,
                    MetodePembayaran: updatedTagihan.MetodePembayaran,
                    TenggatWaktu: updatedTagihan.TenggatWaktu,
                    Menunggak: updatedTagihan.Menunggak,
                    Denda: updatedTagihan.Denda,
                    Catatan: updatedTagihan.Catatan,
                    createdAt: updatedTagihan.createdAt,
                    updatedAt: updatedTagihan.updatedAt,
                };
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Failed to process payment: " + error.message);
            }
        },
    },
};
exports.default = exports.tagihanResolvers;
//# sourceMappingURL=index.js.map