"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifikasiResolvers = void 0;
const authMiddleware_1 = require("@/utils/authMiddleware");
const NotifikasiService_1 = require("@/services/NotifikasiService");
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
    Notifikasi: {
        id: (parent) => parent._id?.toString() || parent.id,
        idPelanggan: (parent) => parent.IdPelanggan,
        idAdmin: (parent) => parent.IdAdmin,
        idTeknisi: (parent) => parent.IdTeknisi,
        judul: (parent) => parent.Judul,
        pesan: (parent) => parent.Pesan,
        kategori: (parent) => parent.Kategori,
        link: (parent) => parent.Link,
    },
};
//# sourceMappingURL=Notifikasi.js.map