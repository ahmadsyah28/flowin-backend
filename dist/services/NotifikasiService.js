"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifikasiService = void 0;
const Notifikasi_1 = require("../models/Notifikasi");
class NotifikasiService {
    static async getNotifikasiList(userId, filter) {
        try {
            const query = { IdPelanggan: userId };
            if (filter?.kategori) {
                query.Kategori = filter.kategori;
            }
            const notifikasiList = await Notifikasi_1.Notifikasi.find(query).sort({
                createdAt: -1,
            });
            const unreadCount = await Notifikasi_1.Notifikasi.countDocuments({
                IdPelanggan: userId,
                isRead: false,
            });
            return {
                success: true,
                message: "Berhasil mendapatkan daftar notifikasi",
                data: notifikasiList,
                total: notifikasiList.length,
                unreadCount,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan daftar notifikasi",
                data: null,
                total: 0,
                unreadCount: 0,
            };
        }
    }
    static async getNotifikasiById(id) {
        try {
            const notifikasi = await Notifikasi_1.Notifikasi.findById(id);
            if (!notifikasi) {
                return {
                    success: false,
                    message: "Notifikasi tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan notifikasi",
                data: notifikasi,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan notifikasi",
                data: null,
            };
        }
    }
    static async markAsRead(id, userId) {
        try {
            const notifikasi = await Notifikasi_1.Notifikasi.findOneAndUpdate({ _id: id, IdPelanggan: userId }, { isRead: true }, { new: true });
            if (!notifikasi) {
                return {
                    success: false,
                    message: "Notifikasi tidak ditemukan atau Anda tidak memiliki akses",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Notifikasi berhasil ditandai sebagai sudah dibaca",
                data: notifikasi,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal menandai notifikasi sebagai sudah dibaca",
                data: null,
            };
        }
    }
}
exports.NotifikasiService = NotifikasiService;
//# sourceMappingURL=NotifikasiService.js.map