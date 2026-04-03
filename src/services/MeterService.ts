import { Types } from "mongoose";
import { Meter, IMeter } from "@/models/Meter";
import { KoneksiData } from "@/models/KoneksiData";

// Response interfaces
export interface MeterResponse {
  success: boolean;
  message: string;
  data: IMeter | null;
}

export interface MeterListResponse {
  success: boolean;
  message: string;
  data: IMeter[] | null;
  total?: number;
}

export class MeterService {
  /**
   * Get all meters for a user (via KoneksiData)
   */
  static async getMeterList(
    userId: string | Types.ObjectId,
  ): Promise<MeterListResponse> {
    try {
      // First, get user's KoneksiData
      const koneksiData = await KoneksiData.findOne({ IdPelanggan: userId });

      if (!koneksiData) {
        return {
          success: false,
          message:
            "Koneksi data tidak ditemukan. Silakan daftar langganan terlebih dahulu.",
          data: null,
          total: 0,
        };
      }

      const meters = await Meter.find({ IdKoneksiData: koneksiData._id })
        .populate("IdKoneksiData")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan daftar meteran",
        data: meters,
        total: meters.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan daftar meteran",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Get meter by ID
   */
  static async getMeterById(
    id: string | Types.ObjectId,
  ): Promise<MeterResponse> {
    try {
      const meter = await Meter.findById(id).populate("IdKoneksiData");

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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan meteran",
        data: null,
      };
    }
  }

  /**
   * Get meter by nomor meteran
   */
  static async getMeterByNomor(nomorMeteran: string): Promise<MeterResponse> {
    try {
      const meter = await Meter.findOne({
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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan meteran",
        data: null,
      };
    }
  }
}
