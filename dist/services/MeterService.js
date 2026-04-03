"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterService = void 0;
const Meter_1 = require("../models/Meter");
const KoneksiData_1 = require("../models/KoneksiData");
class MeterService {
    static async getMeterList(userId) {
        try {
            const koneksiData = await KoneksiData_1.KoneksiData.findOne({ IdPelanggan: userId });
            if (!koneksiData) {
                return {
                    success: false,
                    message: "Koneksi data tidak ditemukan. Silakan daftar langganan terlebih dahulu.",
                    data: null,
                    total: 0,
                };
            }
            const meters = await Meter_1.Meter.find({ IdKoneksiData: koneksiData._id })
                .populate("IdKoneksiData")
                .sort({ createdAt: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan daftar meteran",
                data: meters,
                total: meters.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan daftar meteran",
                data: null,
                total: 0,
            };
        }
    }
    static async getMeterById(id) {
        try {
            const meter = await Meter_1.Meter.findById(id).populate("IdKoneksiData");
            if (!meter) {
                return {
                    success: false,
                    message: "Meteran tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan meteran",
                data: meter,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan meteran",
                data: null,
            };
        }
    }
    static async getMeterByNomor(nomorMeteran) {
        try {
            const meter = await Meter_1.Meter.findOne({
                NomorMeteran: nomorMeteran,
            }).populate("IdKoneksiData");
            if (!meter) {
                return {
                    success: false,
                    message: "Meteran tidak ditemukan",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Berhasil mendapatkan meteran",
                data: meter,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan meteran",
                data: null,
            };
        }
    }
}
exports.MeterService = MeterService;
//# sourceMappingURL=MeterService.js.map