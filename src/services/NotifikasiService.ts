import { Types } from "mongoose";
import { Notifikasi, INotifikasi } from "@/models/Notifikasi";
import { EnumNotifikasiKategori } from "@/enums";

// Input interfaces
export interface NotifikasiFilterInput {
  kategori?: EnumNotifikasiKategori;
}

// Response interfaces
export interface NotifikasiResponse {
  success: boolean;
  message: string;
  data: INotifikasi | null;
}

export interface NotifikasiListResponse {
  success: boolean;
  message: string;
  data: INotifikasi[] | null;
  total?: number;
  unreadCount?: number;
}

export class NotifikasiService {
  /**
   * Get all notifikasi for a user with optional filter
   */
  static async getNotifikasiList(
    userId: string | Types.ObjectId,
    filter?: NotifikasiFilterInput,
  ): Promise<NotifikasiListResponse> {
    try {
      const query: any = { IdPelanggan: userId };

      if (filter?.kategori) {
        query.Kategori = filter.kategori;
      }

      const notifikasiList = await Notifikasi.find(query).sort({
        createdAt: -1,
      });

      return {
        success: true,
        message: "Berhasil mendapatkan daftar notifikasi",
        data: notifikasiList,
        total: notifikasiList.length,
        unreadCount: 0, // TODO: Implement read status tracking
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan daftar notifikasi",
        data: null,
        total: 0,
        unreadCount: 0,
      };
    }
  }

  /**
   * Get notifikasi by ID
   */
  static async getNotifikasiById(
    id: string | Types.ObjectId,
  ): Promise<NotifikasiResponse> {
    try {
      const notifikasi = await Notifikasi.findById(id);

      if (!notifikasi) {
        return {
          success: false,
          message: "Notifikasi tidak ditemukan",
          data: null,
        };
      }

      return {
        success: true,
        message: "Berhasil mendapatkan notifikasi",
        data: notifikasi,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan notifikasi",
        data: null,
      };
    }
  }
}
