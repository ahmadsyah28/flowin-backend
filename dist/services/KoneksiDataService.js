"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoneksiDataService = void 0;
const KoneksiData_1 = require("@/models/KoneksiData");
const RAB_1 = require("@/models/RAB");
const Meter_1 = require("@/models/Meter");
const enums_1 = require("@/enums");
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
                        message: "Pengajuan Anda sudah disetujui. Teknisi sedang melakukan survey dan menentukan biaya instalasi.",
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
                    subTahap: null,
                    jumlahRAB: null,
                    snapRedirectUrl: null,
                    urlRab: null,
                    catatanRab: null,
                };
            }
            const canSubmit = koneksiData.StatusPengajuan === enums_1.StatusPengajuan.REJECTED;
            let message = "";
            let subTahap = null;
            let jumlahRAB = null;
            let snapRedirectUrl = null;
            let urlRab = null;
            let catatanRab = null;
            switch (koneksiData.StatusPengajuan) {
                case enums_1.StatusPengajuan.PENDING:
                    message = "Pengajuan Anda sedang dalam proses verifikasi";
                    break;
                case enums_1.StatusPengajuan.APPROVED: {
                    const meter = await Meter_1.Meter.findOne({ IdKoneksiData: koneksiData._id });
                    if (meter) {
                        subTahap = "AKTIF";
                        message = "Selamat! Anda sudah menjadi pelanggan PDAM aktif";
                    }
                    else {
                        const rab = await RAB_1.RAB.findOne({ idKoneksiData: koneksiData._id });
                        if (!rab) {
                            subTahap = "SURVEI";
                            message =
                                "Dokumen disetujui. Teknisi akan melakukan survei ke lokasi Anda";
                        }
                        else {
                            urlRab = rab.urlRab || null;
                            catatanRab = rab.catatan || null;
                            jumlahRAB = rab.totalBiaya || null;
                            if (rab.statusPembayaran === enums_1.EnumPaymentStatus.SETTLEMENT) {
                                subTahap = "INSTALASI";
                                message =
                                    "Pembayaran RAB diterima. Teknisi sedang melakukan instalasi";
                            }
                            else {
                                subTahap = "MENUNGGU_PEMBAYARAN_RAB";
                                snapRedirectUrl = rab.paymentUrl || null;
                                message = `RAB pemasangan tersedia. Silakan lakukan pembayaran sebesar Rp ${rab.totalBiaya?.toLocaleString("id-ID") ?? 0}`;
                            }
                        }
                    }
                    break;
                }
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
                subTahap,
                jumlahRAB,
                snapRedirectUrl,
                urlRab,
                catatanRab,
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
                subTahap: null,
                jumlahRAB: null,
                snapRedirectUrl: null,
                urlRab: null,
                catatanRab: null,
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