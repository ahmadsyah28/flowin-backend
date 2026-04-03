"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laporanResolvers = void 0;
const graphql_1 = require("../../../graphql");
const models_1 = require("../../../models");
exports.laporanResolvers = {
    Query: {
        laporanByPengguna: async (_, { penggunaId }, context) => {
            const userId = penggunaId || context.user?._id?.toString();
            if (!userId) {
                throw new graphql_1.GraphQLError("Not authenticated or user ID not provided");
            }
            try {
                const laporan = await models_1.Laporan.findWithGeoLokasi({ IdPengguna: userId });
                return laporan.map((l) => ({
                    id: l._id.toString(),
                    IdPengguna: l.IdPengguna.toString(),
                    NamaLaporan: l.NamaLaporan,
                    Masalah: l.Masalah,
                    Alamat: l.Alamat,
                    ImageURL: l.ImageURL,
                    JenisLaporan: l.JenisLaporan,
                    Catatan: l.Catatan,
                    Koordinat: l.Koordinat.toString(),
                    Status: l.Status,
                    createdAt: l.createdAt,
                    updatedAt: l.updatedAt,
                }));
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching laporan");
            }
        },
        laporanById: async (_, { id }) => {
            try {
                const laporan = await models_1.Laporan.findById(id)
                    .populate("geoLokasi")
                    .populate("IdPengguna");
                if (!laporan) {
                    throw new graphql_1.GraphQLError("Laporan tidak ditemukan");
                }
                return {
                    id: laporan._id.toString(),
                    IdPengguna: laporan.IdPengguna.toString(),
                    NamaLaporan: laporan.NamaLaporan,
                    Masalah: laporan.Masalah,
                    Alamat: laporan.Alamat,
                    ImageURL: laporan.ImageURL,
                    JenisLaporan: laporan.JenisLaporan,
                    Catatan: laporan.Catatan,
                    Koordinat: laporan.Koordinat.toString(),
                    Status: laporan.Status,
                    createdAt: laporan.createdAt,
                    updatedAt: laporan.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching laporan");
            }
        },
        laporanByStatus: async (_, { status }) => {
            try {
                const laporan = await models_1.Laporan.findWithGeoLokasi({ Status: status });
                return laporan.map((l) => ({
                    id: l._id.toString(),
                    IdPengguna: l.IdPengguna.toString(),
                    NamaLaporan: l.NamaLaporan,
                    Masalah: l.Masalah,
                    Alamat: l.Alamat,
                    ImageURL: l.ImageURL,
                    JenisLaporan: l.JenisLaporan,
                    Catatan: l.Catatan,
                    Koordinat: l.Koordinat.toString(),
                    Status: l.Status,
                    createdAt: l.createdAt,
                    updatedAt: l.updatedAt,
                }));
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching laporan by status");
            }
        },
    },
    Mutation: {
        createLaporan: async (_, { input }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const geoLokasi = new models_1.GeoLokasi({
                    Latitude: input.Latitude,
                    Longitude: input.Longitude,
                    IdLaporan: null,
                });
                await geoLokasi.save();
                const laporan = new models_1.Laporan({
                    IdPengguna: context.user._id,
                    NamaLaporan: input.NamaLaporan,
                    Masalah: input.Masalah,
                    Alamat: input.Alamat,
                    ImageURL: input.ImageURL || [],
                    JenisLaporan: input.JenisLaporan,
                    Catatan: input.Catatan || "",
                    Koordinat: geoLokasi._id,
                });
                await laporan.save();
                geoLokasi.IdLaporan = laporan._id;
                await geoLokasi.save();
                return {
                    id: laporan._id.toString(),
                    IdPengguna: laporan.IdPengguna.toString(),
                    NamaLaporan: laporan.NamaLaporan,
                    Masalah: laporan.Masalah,
                    Alamat: laporan.Alamat,
                    ImageURL: laporan.ImageURL,
                    JenisLaporan: laporan.JenisLaporan,
                    Catatan: laporan.Catatan,
                    Koordinat: laporan.Koordinat.toString(),
                    Status: laporan.Status,
                    createdAt: laporan.createdAt,
                    updatedAt: laporan.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Failed to create laporan: " + error.message);
            }
        },
        updateLaporanStatus: async (_, { id, status }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const laporan = await models_1.Laporan.findById(id);
                if (!laporan) {
                    throw new graphql_1.GraphQLError("Laporan tidak ditemukan");
                }
                const updatedLaporan = await models_1.Laporan.findByIdAndUpdate(id, { Status: status }, { new: true });
                if (!updatedLaporan) {
                    throw new graphql_1.GraphQLError("Gagal mengupdate status laporan");
                }
                return {
                    id: updatedLaporan._id.toString(),
                    IdPengguna: updatedLaporan.IdPengguna.toString(),
                    NamaLaporan: updatedLaporan.NamaLaporan,
                    Masalah: updatedLaporan.Masalah,
                    Alamat: updatedLaporan.Alamat,
                    ImageURL: updatedLaporan.ImageURL,
                    JenisLaporan: updatedLaporan.JenisLaporan,
                    Catatan: updatedLaporan.Catatan,
                    Koordinat: updatedLaporan.Koordinat.toString(),
                    Status: updatedLaporan.Status,
                    createdAt: updatedLaporan.createdAt,
                    updatedAt: updatedLaporan.updatedAt,
                };
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Failed to update laporan status: " + error.message);
            }
        },
    },
};
exports.default = exports.laporanResolvers;
//# sourceMappingURL=index.js.map