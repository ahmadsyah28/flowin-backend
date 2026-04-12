"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanService = void 0;
const mongoose_1 = require("mongoose");
const Laporan_1 = require("@/models/Laporan");
const GeoLokasi_1 = require("@/models/GeoLokasi");
const enums_1 = require("@/enums");
class LaporanService {
    static async getLaporanList(userId, filter) {
        try {
            const query = { IdPengguna: userId };
            if (filter?.jenisLaporan) {
                query.JenisLaporan = filter.jenisLaporan;
            }
            if (filter?.status) {
                query.Status = filter.status;
            }
            const laporanList = await Laporan_1.Laporan.find(query)
                .populate("IdPengguna", "namaLengkap email")
                .populate("Koordinat")
                .sort({ createdAt: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan daftar laporan",
                data: laporanList,
                total: laporanList.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan daftar laporan",
                data: null,
                total: 0,
            };
        }
    }
    static async getLaporanById(id) {
        try {
            const laporan = await Laporan_1.Laporan.findById(id)
                .populate("IdPengguna", "namaLengkap email")
                .populate("Koordinat");
            if (!laporan) {
                return {
                    success: false,
                    message: "Laporan tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan laporan",
                data: laporan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan laporan",
                data: null,
            };
        }
    }
    static async getLaporanAktif(userId) {
        try {
            const laporanList = await Laporan_1.Laporan.find({
                IdPengguna: userId,
                Status: {
                    $nin: [
                        enums_1.EnumWorkStatusPelanggan.SELESAI,
                        enums_1.EnumWorkStatusPelanggan.DIBATALKAN,
                    ],
                },
            })
                .populate("IdPengguna", "namaLengkap email")
                .populate("Koordinat")
                .sort({ createdAt: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan laporan aktif",
                data: laporanList,
                total: laporanList.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan laporan aktif",
                data: null,
                total: 0,
            };
        }
    }
    static async createLaporan(userId, input) {
        try {
            const geoLokasi = await GeoLokasi_1.GeoLokasi.create({
                IdLaporan: new mongoose_1.Types.ObjectId(),
                Latitude: input.langitude,
                Longitude: input.longitude,
            });
            const laporan = await Laporan_1.Laporan.create({
                IdPengguna: userId,
                NamaLaporan: input.namaLaporan,
                Masalah: input.masalah,
                Alamat: input.alamat,
                ImageURL: input.imageURL || [],
                JenisLaporan: input.jenisLaporan,
                Catatan: input.catatan || "",
                Koordinat: geoLokasi._id,
                Status: enums_1.EnumWorkStatusPelanggan.DITUNDA,
            });
            await GeoLokasi_1.GeoLokasi.findByIdAndUpdate(geoLokasi._id, {
                IdLaporan: laporan._id,
            });
            const populatedLaporan = await Laporan_1.Laporan.findById(laporan._id)
                .populate("IdPengguna", "namaLengkap email")
                .populate("Koordinat");
            return {
                success: true,
                message: "Berhasil membuat laporan",
                data: populatedLaporan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal membuat laporan",
                data: null,
            };
        }
    }
    static async updateLaporan(id, userId, input) {
        try {
            const laporan = await Laporan_1.Laporan.findOne({
                _id: id,
                IdPengguna: userId,
            });
            if (!laporan) {
                return {
                    success: false,
                    message: "Laporan tidak ditemukan",
                    data: null,
                };
            }
            if (laporan.Status !== enums_1.EnumWorkStatusPelanggan.DITUNDA) {
                return {
                    success: false,
                    message: "Laporan tidak dapat diubah karena sudah diproses",
                    data: null,
                };
            }
            const updateData = {};
            if (input.namaLaporan)
                updateData.NamaLaporan = input.namaLaporan;
            if (input.masalah)
                updateData.Masalah = input.masalah;
            if (input.alamat)
                updateData.Alamat = input.alamat;
            if (input.imageURL)
                updateData.ImageURL = input.imageURL;
            if (input.catatan !== undefined)
                updateData.Catatan = input.catatan;
            const updatedLaporan = await Laporan_1.Laporan.findByIdAndUpdate(id, updateData, {
                new: true,
            })
                .populate("IdPengguna", "namaLengkap email")
                .populate("Koordinat");
            return {
                success: true,
                message: "Berhasil mengupdate laporan",
                data: updatedLaporan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengupdate laporan",
                data: null,
            };
        }
    }
    static async batalkanLaporan(id, userId) {
        try {
            const laporan = await Laporan_1.Laporan.findOne({
                _id: id,
                IdPengguna: userId,
            });
            if (!laporan) {
                return {
                    success: false,
                    message: "Laporan tidak ditemukan",
                    data: null,
                };
            }
            if (laporan.Status === enums_1.EnumWorkStatusPelanggan.SELESAI) {
                return {
                    success: false,
                    message: "Laporan yang sudah selesai tidak dapat dibatalkan",
                    data: null,
                };
            }
            if (laporan.Status === enums_1.EnumWorkStatusPelanggan.DIBATALKAN) {
                return {
                    success: false,
                    message: "Laporan sudah dibatalkan sebelumnya",
                    data: null,
                };
            }
            const updatedLaporan = await Laporan_1.Laporan.findByIdAndUpdate(id, { Status: enums_1.EnumWorkStatusPelanggan.DIBATALKAN }, { new: true })
                .populate("IdPengguna", "namaLengkap email")
                .populate("Koordinat");
            return {
                success: true,
                message: "Berhasil membatalkan laporan",
                data: updatedLaporan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal membatalkan laporan",
                data: null,
            };
        }
    }
}
exports.LaporanService = LaporanService;
//# sourceMappingURL=LaporanService.js.map