import { Types } from "mongoose";
import {
  RiwayatPenggunaan,
  IRiwayatPenggunaan,
} from "@/models/RiwayatPenggunaan";

export interface RiwayatPenggunaanListResponse {
  success: boolean;
  message: string;
  data: IRiwayatPenggunaan[] | null;
  total: number;
}

export class RiwayatPenggunaanService {
  /**
   * Mendapatkan riwayat penggunaan air berdasarkan meteranId
   */
  static async getRiwayatPenggunaan(
    meteranId: string | Types.ObjectId,
  ): Promise<RiwayatPenggunaanListResponse> {
    try {
      const riwayat = await RiwayatPenggunaan.find({ MeteranId: meteranId })
        .populate("MeteranId")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan riwayat penggunaan air",
        data: riwayat,
        total: riwayat.length,
      };
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
