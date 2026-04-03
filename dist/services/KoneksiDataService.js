"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoneksiDataService = void 0;
const KoneksiData_1 = require("../models/KoneksiData");
const enums_1 = require("../enums");
class KoneksiDataService {
    static async getKoneksiData(userId) {
        try {
            const koneksiData = await KoneksiData_1.KoneksiData.findOne({
                IdPelanggan: userId,
            }).populate("IdPelanggan", "namaLengkap email");
            if (!koneksiData) {
                return {
                    success: false,
                    message: "Koneksi data tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan koneksi data",
                data: koneksiData,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan koneksi data",
                data: null,
            };
        }
    }
    static async getKoneksiDataById(id) {
        try {
            const koneksiData = await KoneksiData_1.KoneksiData.findById(id).populate("IdPelanggan", "namaLengkap email");
            if (!koneksiData) {
                return {
                    success: false,
                    message: "Koneksi data tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan koneksi data",
                data: koneksiData,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan koneksi data",
                data: null,
            };
        }
    }
    static async createKoneksiData(userId, input) {
        try {
            const existing = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
            if (existing) {
                if (existing.StatusPengajuan === enums_1.StatusPengajuan.PENDING) {
                    return {
                        success: false,
                        message: "Pengajuan Anda sedang dalam proses verifikasi. Silakan tunggu.",
                        data: null,
                    };
                }
                if (existing.StatusPengajuan === enums_1.StatusPengajuan.APPROVED) {
                    return {
                        success: false,
                        message: "Pengajuan Anda sudah disetujui. Koneksi air sudah aktif.",
                        data: null,
                    };
                }
                if (existing.StatusPengajuan === enums_1.StatusPengajuan.REJECTED) {
                    existing.NIK = input.nik;
                    existing.NIKUrl = input.nikUrl;
                    existing.NoKK = input.noKK;
                    existing.KKUrl = input.kkUrl;
                    existing.IMB = input.imb;
                    existing.IMBUrl = input.imbUrl;
                    existing.Alamat = input.alamat;
                    existing.Kelurahan = input.kelurahan;
                    existing.Kecamatan = input.kecamatan;
                    existing.LuasBangunan = input.luasBangunan;
                    existing.StatusPengajuan = enums_1.StatusPengajuan.PENDING;
                    existing.AlasanPenolakan = undefined;
                    existing.TanggalVerifikasi = undefined;
                    await existing.save();
                    return {
                        success: true,
                        message: "Pengajuan ulang berhasil dikirim",
                        data: existing,
                    };
                }
            }
            const koneksiData = await KoneksiData_1.KoneksiData.create({
                IdPelanggan: userId,
                NIK: input.nik,
                NIKUrl: input.nikUrl,
                NoKK: input.noKK,
                KKUrl: input.kkUrl,
                IMB: input.imb,
                IMBUrl: input.imbUrl,
                Alamat: input.alamat,
                Kelurahan: input.kelurahan,
                Kecamatan: input.kecamatan,
                LuasBangunan: input.luasBangunan,
                StatusPengajuan: enums_1.StatusPengajuan.PENDING,
            });
            return {
                success: true,
                message: "Berhasil membuat koneksi data",
                data: koneksiData,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal membuat koneksi data",
                data: null,
            };
        }
    }
    static async cekStatusPengajuan(userId) {
        try {
            const koneksiData = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
            if (!koneksiData) {
                return {
                    success: true,
                    message: "Belum ada pengajuan",
                    statusPengajuan: null,
                    alasanPenolakan: null,
                    tanggalVerifikasi: null,
                    canSubmit: true,
                };
            }
            const canSubmit = koneksiData.StatusPengajuan === enums_1.StatusPengajuan.REJECTED;
            let message = "";
            switch (koneksiData.StatusPengajuan) {
                case enums_1.StatusPengajuan.PENDING:
                    message = "Pengajuan Anda sedang dalam proses verifikasi";
                    break;
                case enums_1.StatusPengajuan.APPROVED:
                    message = "Pengajuan Anda sudah disetujui";
                    break;
                case enums_1.StatusPengajuan.REJECTED:
                    message = `Pengajuan Anda ditolak. Alasan: ${koneksiData.AlasanPenolakan || "Tidak ada alasan"}`;
                    break;
            }
            return {
                success: true,
                message,
                statusPengajuan: koneksiData.StatusPengajuan,
                alasanPenolakan: koneksiData.AlasanPenolakan || null,
                tanggalVerifikasi: koneksiData.TanggalVerifikasi || null,
                canSubmit,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengecek status pengajuan",
                statusPengajuan: null,
                alasanPenolakan: null,
                tanggalVerifikasi: null,
                canSubmit: false,
            };
        }
    }
    static async updateKoneksiData(userId, input) {
        try {
            const updateData = {};
            if (input.nikUrl)
                updateData.NIKUrl = input.nikUrl;
            if (input.kkUrl)
                updateData.KKUrl = input.kkUrl;
            if (input.imbUrl)
                updateData.IMBUrl = input.imbUrl;
            if (input.alamat)
                updateData.Alamat = input.alamat;
            if (input.kelurahan)
                updateData.Kelurahan = input.kelurahan;
            if (input.kecamatan)
                updateData.Kecamatan = input.kecamatan;
            if (input.luasBangunan !== undefined)
                updateData.LuasBangunan = input.luasBangunan;
            const koneksiData = await KoneksiData_1.KoneksiData.findOneAndUpdate({ IdPelanggan: userId }, updateData, { new: true }).populate("IdPelanggan", "namaLengkap email");
            if (!koneksiData) {
                return {
                    success: false,
                    message: "Koneksi data tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mengupdate koneksi data",
                data: koneksiData,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengupdate koneksi data",
                data: null,
            };
        }
    }
}
exports.KoneksiDataService = KoneksiDataService;
//# sourceMappingURL=KoneksiDataService.js.map