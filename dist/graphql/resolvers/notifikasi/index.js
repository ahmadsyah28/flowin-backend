"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifikasiResolvers = void 0;
const graphql_1 = require("graphql");
const models_1 = require("@/models");
exports.notifikasiResolvers = {
    Query: {
        notifikasiByPelanggan: async (_, { pelangganId }, context) => {
            const userId = pelangganId || context.user?._id?.toString();
            if (!userId) {
                throw new graphql_1.GraphQLError("Not authenticated or user ID not provided");
            }
            try {
                const notifikasi = await models_1.Notifikasi.find({ IdPelanggan: userId });
                return notifikasi.map((n) => ({
                    id: n._id.toString(),
                    IdPelanggan: n.IdPelanggan.toString(),
                    IdAdmin: n.IdAdmin.toString(),
                    IdTeknisi: n.IdTeknisi.toString(),
                    Judul: n.Judul,
                    Pesan: n.Pesan,
                    Kategori: n.Kategori,
                    Link: n.Link,
                    createdAt: n.createdAt,
                    updatedAt: n.updatedAt,
                }));
            }
            catch (error) {
                throw new graphql_1.GraphQLError("Error fetching notifikasi");
            }
        },
    },
};
exports.default = exports.notifikasiResolvers;
//# sourceMappingURL=index.js.map