import {
  RiwayatPenggunaan,
  IRiwayatPenggunaan,
} from "@/models/RiwayatPenggunaan";
import { getRedisData, setRedisData } from "@/config/redis";

const TTL_RIWAYAT = 300; // 5 menit

export interface RiwayatPenggunaanListResponse {
  success: boolean;
  message: string;
  data: IRiwayatPenggunaan[] | null;
  total: number;
}

export class RiwayatPenggunaanService {
  /**
   * Mendapatkan riwayat penggunaan air berdasarkan meterId (MeterID: string).
   * Hasil di-cache di Redis dengan TTL 5 menit untuk mengurangi query MongoDB.
   */
  static async getRiwayatPenggunaan(
    meteranId: string,
  ): Promise<RiwayatPenggunaanListResponse> {
    const cacheKey = `cache:riwayat:${meteranId}`;
    try {
      const cached = await getRedisData(cacheKey);
      if (cached) {
        const parsed =
          typeof cached === "string" ? JSON.parse(cached) : (cached as any);
        return {
          success: true,
          message: "Berhasil mendapatkan riwayat penggunaan air",
          data: parsed.data,
          total: parsed.total,
        };
      }

      const riwayat = await RiwayatPenggunaan.find({ MeterID: meteranId }).sort(
        { timestamp: -1 },
      );

      const result: RiwayatPenggunaanListResponse = {
        success: true,
        message: "Berhasil mendapatkan riwayat penggunaan air",
        data: riwayat,
        total: riwayat.length,
      };

      await setRedisData(
        cacheKey,
        JSON.stringify({ data: riwayat, total: riwayat.length }),
        TTL_RIWAYAT,
      );

      return result;
    } catch (error) {
      return {
        success: false,
        message: "Gagal mendapatkan riwayat penggunaan air",
        data: null,
        total: 0,
      };
    }
  }
}
