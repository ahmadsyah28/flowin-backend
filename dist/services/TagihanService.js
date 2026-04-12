"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagihanService = void 0;
const Tagihan_1 = require("@/models/Tagihan");
const Meter_1 = require("@/models/Meter");
const KoneksiData_1 = require("@/models/KoneksiData");
const enums_1 = require("@/enums");
class TagihanService {
    static async getUserMeterIds(userId) {
        const koneksiData = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
        if (!koneksiData)
            return [];
        const meters = await Meter_1.Meter.find({ IdKoneksiData: koneksiData._id });
        return meters.map((m) => m._id);
    }
    static async getTagihanList(userId, filter) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                    total: 0,
                };
            }
            const query = { IdMeteran: { $in: meterIds } };
            if (filter?.idMeteran) {
                query.IdMeteran = filter.idMeteran;
            }
            if (filter?.periode) {
                query.Periode = filter.periode;
            }
            if (filter?.statusPembayaran) {
                query.StatusPembayaran = filter.statusPembayaran;
            }
            if (filter?.menunggak !== undefined) {
                query.Menunggak = filter.menunggak;
            }
            const tagihanList = await Tagihan_1.Tagihan.find(query)
                .populate("IdMeteran")
                .sort({ createdAt: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan daftar tagihan",
                data: tagihanList,
                total: tagihanList.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan daftar tagihan",
                data: null,
                total: 0,
            };
        }
    }
    static async getTagihanById(id) {
        try {
            const tagihan = await Tagihan_1.Tagihan.findById(id).populate("IdMeteran");
            if (!tagihan) {
                return {
                    success: false,
                    message: "Tagihan tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan tagihan",
                data: tagihan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan tagihan",
                data: null,
            };
        }
    }
    static async getTagihanAktif(userId) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                };
            }
            const tagihan = await Tagihan_1.Tagihan.findOne({
                IdMeteran: { $in: meterIds },
                StatusPembayaran: enums_1.EnumPaymentStatus.PENDING,
            })
                .populate("IdMeteran")
                .sort({ TenggatWaktu: 1 });
            if (!tagihan) {
                return {
                    success: true,
                    message: "Tidak ada tagihan aktif",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan tagihan aktif",
                data: tagihan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan tagihan aktif",
                data: null,
            };
        }
    }
    static async getTagihanRiwayat(userId) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            if (meterIds.length === 0) {
                return {
                    success: false,
                    message: "Tidak ada meteran terdaftar",
                    data: null,
                    total: 0,
                };
            }
            const tagihanList = await Tagihan_1.Tagihan.find({
                IdMeteran: { $in: meterIds },
                StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
            })
                .populate("IdMeteran")
                .sort({ TanggalPembayaran: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan riwayat tagihan",
                data: tagihanList,
                total: tagihanList.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan riwayat tagihan",
                data: null,
                total: 0,
            };
        }
    }
    static async bayarTagihan(id, userId, metodePembayaran) {
        try {
            const meterIds = await this.getUserMeterIds(userId);
            const tagihan = await Tagihan_1.Tagihan.findOne({
                _id: id,
                IdMeteran: { $in: meterIds },
            });
            if (!tagihan) {
                return {
                    success: false,
                    message: "Tagihan tidak ditemukan",
                    data: null,
                };
            }
            if (tagihan.StatusPembayaran === enums_1.EnumPaymentStatus.SETTLEMENT) {
                return {
                    success: false,
                    message: "Tagihan sudah dibayar",
                    data: null,
                };
            }
            const updatedTagihan = await Tagihan_1.Tagihan.findByIdAndUpdate(id, {
                StatusPembayaran: enums_1.EnumPaymentStatus.SETTLEMENT,
                TanggalPembayaran: new Date(),
                MetodePembayaran: metodePembayaran,
            }, { new: true }).populate("IdMeteran");
            return {
                success: true,
                message: "Berhasil membayar tagihan",
                data: updatedTagihan,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal membayar tagihan",
                data: null,
            };
        }
    }
}
exports.TagihanService = TagihanService;
//# sourceMappingURL=TagihanService.js.map