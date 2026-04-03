import { Types } from "mongoose";
import { Tagihan, ITagihan } from "@/models/Tagihan";
import { Meter } from "@/models/Meter";
import { KoneksiData } from "@/models/KoneksiData";
import { EnumPaymentStatus } from "@/enums";

// Input interfaces
export interface TagihanFilterInput {
  idMeteran?: string;
  periode?: string;
  statusPembayaran?: EnumPaymentStatus;
  menunggak?: boolean;
}

// Response interfaces
export interface TagihanResponse {
  success: boolean;
  message: string;
  data: ITagihan | null;
}

export interface TagihanListResponse {
  success: boolean;
  message: string;
  data: ITagihan[] | null;
  total?: number;
}

export class TagihanService {
  /**
   * Helper to get all meter IDs for a user
   */
  private static async getUserMeterIds(
    userId: string | Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const koneksiData = await KoneksiData.findOne({ IdPelanggan: userId });
    if (!koneksiData) return [];

    const meters = await Meter.find({ IdKoneksiData: koneksiData._id });
    return meters.map((m) => m._id as Types.ObjectId);
  }

  /**
   * Get all tagihan for a user with optional filter
   */
  static async getTagihanList(
    userId: string | Types.ObjectId,
    filter?: TagihanFilterInput,
  ): Promise<TagihanListResponse> {
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

      const query: any = { IdMeteran: { $in: meterIds } };

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

      const tagihanList = await Tagihan.find(query)
        .populate("IdMeteran")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan daftar tagihan",
        data: tagihanList,
        total: tagihanList.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan daftar tagihan",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Get tagihan by ID
   */
  static async getTagihanById(
    id: string | Types.ObjectId,
  ): Promise<TagihanResponse> {
    try {
      const tagihan = await Tagihan.findById(id).populate("IdMeteran");

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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan tagihan",
        data: null,
      };
    }
  }

  /**
   * Get active tagihan (unpaid)
   */
  static async getTagihanAktif(
    userId: string | Types.ObjectId,
  ): Promise<TagihanResponse> {
    try {
      const meterIds = await this.getUserMeterIds(userId);

      if (meterIds.length === 0) {
        return {
          success: false,
          message: "Tidak ada meteran terdaftar",
          data: null,
        };
      }

      const tagihan = await Tagihan.findOne({
        IdMeteran: { $in: meterIds },
        StatusPembayaran: EnumPaymentStatus.PENDING,
      })
        .populate("IdMeteran")
        .sort({ TenggatWaktu: 1 }); // Get the one with earliest due date

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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan tagihan aktif",
        data: null,
      };
    }
  }

  /**
   * Get tagihan history (paid)
   */
  static async getTagihanRiwayat(
    userId: string | Types.ObjectId,
  ): Promise<TagihanListResponse> {
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

      const tagihanList = await Tagihan.find({
        IdMeteran: { $in: meterIds },
        StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
      })
        .populate("IdMeteran")
        .sort({ TanggalPembayaran: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan riwayat tagihan",
        data: tagihanList,
        total: tagihanList.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan riwayat tagihan",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Pay tagihan
   */
  static async bayarTagihan(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    metodePembayaran: string,
  ): Promise<TagihanResponse> {
    try {
      const meterIds = await this.getUserMeterIds(userId);

      const tagihan = await Tagihan.findOne({
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

      if (tagihan.StatusPembayaran === EnumPaymentStatus.SETTLEMENT) {
        return {
          success: false,
          message: "Tagihan sudah dibayar",
          data: null,
        };
      }

      // Update tagihan status
      const updatedTagihan = await Tagihan.findByIdAndUpdate(
        id,
        {
          StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
          TanggalPembayaran: new Date(),
          MetodePembayaran: metodePembayaran,
        },
        { new: true },
      ).populate("IdMeteran");

      return {
        success: true,
        message: "Berhasil membayar tagihan",
        data: updatedTagihan,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal membayar tagihan",
        data: null,
      };
    }
  }
}
