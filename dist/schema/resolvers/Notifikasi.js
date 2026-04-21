"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifikasiResolvers = void 0;
const authMiddleware_1 = require("../../utils/authMiddleware");
const NotifikasiService_1 = require("../../services/NotifikasiService");
exports.notifikasiResolvers = {
    Query: {
        notifikasiList: async (_, { filter }, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return NotifikasiService_1.NotifikasiService.getNotifikasiList(user._id, filter);
        },
        notifikasiById: async (_, { id }) => {
            return NotifikasiService_1.NotifikasiService.getNotifikasiById(id);
        },
    },
    Mutation: {
        markNotifikasiAsRead: async (_, { id }, context) => {
            try {
                console.log(`🔵 [Resolver] markNotifikasiAsRead called with ID: ${id}`);
                const user = (0, authMiddleware_1.requireAuth)(context);
                console.log(`🔵 [Resolver] User ID: ${user._id}`);
                const result = await NotifikasiService_1.NotifikasiService.markAsRead(id, user._id);
                console.log(`🔵 [Resolver] Result:`, result);
                return result;
            }
            catch (error) {
                console.error(`🔴 [Resolver] Error in markNotifikasiAsRead:`, error);
                return {
                    success: false,
                    message: error.message || "Terjadi kesalahan pada server",
                    data: null,
                };
            }
        },
    },
    Notifikasi: {
        id: (parent) => parent._id?.toString() || parent.id,
        idPelanggan: (parent) => parent.IdPelanggan,
        idAdmin: (parent) => parent.IdAdmin,
        idTeknisi: (parent) => parent.IdTeknisi,
        judul: (parent) => parent.Judul,
        pesan: (parent) => parent.Pesan,
        kategori: (parent) => parent.Kategori,
        link: (parent) => parent.Link,
        isRead: (parent) => parent.isRead || false,
    },
};
//# sourceMappingURL=Notifikasi.js.map