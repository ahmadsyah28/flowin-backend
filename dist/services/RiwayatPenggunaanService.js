"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiwayatPenggunaanService = void 0;
const RiwayatPenggunaan_1 = require("../models/RiwayatPenggunaan");
const redis_1 = require("../config/redis");
const TTL_RIWAYAT = 300;
class RiwayatPenggunaanService {
    static async getRiwayatPenggunaan(meteranId) {
        const cacheKey = `cache:riwayat:${meteranId}`;
        try {
            const cached = await (0, redis_1.getRedisData)(cacheKey);
            if (cached) {
                const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
                return {
                    success: true,
                    message: "Berhasil mendapatkan riwayat penggunaan air",
                    data: parsed.data,
                    total: parsed.total,
                };
            }
            const riwayat = await RiwayatPenggunaan_1.RiwayatPenggunaan.find({ MeterID: meteranId }).sort({ timestamp: -1 });
            const result = {
                success: true,
                message: "Berhasil mendapatkan riwayat penggunaan air",
                data: riwayat,
                total: riwayat.length,
            };
            await (0, redis_1.setRedisData)(cacheKey, JSON.stringify({ data: riwayat, total: riwayat.length }), TTL_RIWAYAT);
            return result;
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