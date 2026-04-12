"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiwayatPenggunaanService = void 0;
const RiwayatPenggunaan_1 = require("../models/RiwayatPenggunaan");
class RiwayatPenggunaanService {
    static async getRiwayatPenggunaan(meteranId) {
        try {
            const riwayat = await RiwayatPenggunaan_1.RiwayatPenggunaan.find({ MeteranId: meteranId })
                .populate("MeteranId")
                .sort({ createdAt: -1 });
            return {
                success: true,
                message: "Berhasil mendapatkan riwayat penggunaan air",
                data: riwayat,
                total: riwayat.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: "Gagal mendapatkan riwayat penggunaan air",
                data: null,
                total: 0,
            };
        }
    }
}
exports.RiwayatPenggunaanService = RiwayatPenggunaanService;
//# sourceMappingURL=RiwayatPenggunaanService.js.map