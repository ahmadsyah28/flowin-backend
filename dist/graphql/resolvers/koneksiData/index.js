"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.koneksiDataResolvers = void 0;
const graphql_1 = require("graphql");
const models_1 = require("@/models");
exports.koneksiDataResolvers = {
    Query: {
        koneksiDataByPelanggan: async (_, __, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const koneksiData = await models_1.KoneksiData.findOne({
                    IdPelanggan: context.user._id,
                }).populate("pelanggan");
                if (!koneksiData)
                    return null;
                return {
                    id: koneksiData._id.toString(),
                    IdPelanggan: koneksiData.IdPelanggan.toString(),
                    StatusVerifikasi: koneksiData.StatusVerifikasi,
                    NIK: koneksiData.NIK,
                    NIKUrl: koneksiData.NIKUrl,
                    NoKK: koneksiData.NoKK,
                    KKUrl: koneksiData.KKUrl,
                    IMB: koneksiData.IMB,
                    IMBUrl: koneksiData.IMBUrl,
                    Alamat: koneksiData.Alamat,
                    Kelurahan: koneksiData.Kelurahan,
                    Kecamatan: koneksiData.Kecamatan,
                    LuasBangunan: koneksiData.LuasBangunan,
                    createdAt: koneksiData.createdAt,
                    updatedAt: koneksiData.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching koneksi data");
            }
        },
        koneksiDataById: async (_, { id }) => {
            try {
                const koneksiData = await models_1.KoneksiData.findById(id).populate("pelanggan");
                if (!koneksiData) {
                    throw new graphql_1.GraphQLError("KoneksiData tidak ditemukan");
                }
                return {
                    id: koneksiData._id.toString(),
                    IdPelanggan: koneksiData.IdPelanggan.toString(),
                    StatusVerifikasi: koneksiData.StatusVerifikasi,
                    NIK: koneksiData.NIK,
                    NIKUrl: koneksiData.NIKUrl,
                    NoKK: koneksiData.NoKK,
                    KKUrl: koneksiData.KKUrl,
                    IMB: koneksiData.IMB,
                    IMBUrl: koneksiData.IMBUrl,
                    Alamat: koneksiData.Alamat,
                    Kelurahan: koneksiData.Kelurahan,
                    Kecamatan: koneksiData.Kecamatan,
                    LuasBangunan: koneksiData.LuasBangunan,
                    createdAt: koneksiData.createdAt,
                    updatedAt: koneksiData.updatedAt,
                };
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching koneksi data");
            }
        },
    },
    Mutation: {
        createKoneksiData: async (_, { input }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const existingKoneksiData = await models_1.KoneksiData.findOne({
                    IdPelanggan: context.user._id,
                });
                if (existingKoneksiData) {
                    throw new graphql_1.GraphQLError("Koneksi data sudah ada untuk pengguna ini");
                }
                const existingNIK = await models_1.KoneksiData.findOne({ NIK: input.NIK });
                if (existingNIK) {
                    throw new graphql_1.GraphQLError("NIK sudah terdaftar");
                }
                const koneksiData = new models_1.KoneksiData({
                    ...input,
                    IdPelanggan: context.user._id,
                });
                await koneksiData.save();
                return {
                    id: koneksiData._id.toString(),
                    IdPelanggan: koneksiData.IdPelanggan.toString(),
                    StatusVerifikasi: koneksiData.StatusVerifikasi,
                    NIK: koneksiData.NIK,
                    NIKUrl: koneksiData.NIKUrl,
                    NoKK: koneksiData.NoKK,
                    KKUrl: koneksiData.KKUrl,
                    IMB: koneksiData.IMB,
                    IMBUrl: koneksiData.IMBUrl,
                    Alamat: koneksiData.Alamat,
                    Kelurahan: koneksiData.Kelurahan,
                    Kecamatan: koneksiData.Kecamatan,
                    LuasBangunan: koneksiData.LuasBangunan,
                    createdAt: koneksiData.createdAt,
                    updatedAt: koneksiData.updatedAt,
                };
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Failed to create koneksi data: " + error.message);
            }
        },
        updateKoneksiData: async (_, { id, input }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError("Not authenticated");
            }
            try {
                const koneksiData = await models_1.KoneksiData.findOne({
                    _id: id,
                    IdPelanggan: context.user._id,
                });
                if (!koneksiData) {
                    throw new graphql_1.GraphQLError("Koneksi data tidak ditemukan atau tidak memiliki akses");
                }
                const updatedKoneksiData = await models_1.KoneksiData.findByIdAndUpdate(id, input, { new: true });
                if (!updatedKoneksiData) {
                    throw new graphql_1.GraphQLError("Gagal mengupdate koneksi data");
                }
                return {
                    id: updatedKoneksiData._id.toString(),
                    IdPelanggan: updatedKoneksiData.IdPelanggan.toString(),
                    StatusVerifikasi: updatedKoneksiData.StatusVerifikasi,
                    NIK: updatedKoneksiData.NIK,
                    NIKUrl: updatedKoneksiData.NIKUrl,
                    NoKK: updatedKoneksiData.NoKK,
                    KKUrl: updatedKoneksiData.KKUrl,
                    IMB: updatedKoneksiData.IMB,
                    IMBUrl: updatedKoneksiData.IMBUrl,
                    Alamat: updatedKoneksiData.Alamat,
                    Kelurahan: updatedKoneksiData.Kelurahan,
                    Kecamatan: updatedKoneksiData.Kecamatan,
                    LuasBangunan: updatedKoneksiData.LuasBangunan,
                    createdAt: updatedKoneksiData.createdAt,
                    updatedAt: updatedKoneksiData.updatedAt,
                };
            }
            catch (error) {
                if (error instanceof graphql_1.GraphQLError)
                    throw error;
                throw new graphql_1.GraphQLError("Failed to update koneksi data: " + error.message);
            }
        },
    },
};
exports.default = exports.koneksiDataResolvers;
//# sourceMappingURL=index.js.map