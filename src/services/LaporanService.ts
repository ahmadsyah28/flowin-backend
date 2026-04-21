import { Types } from "mongoose";
import { Laporan, ILaporan } from "@/models/Laporan";
import { GeoLokasi } from "@/models/GeoLokasi";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "@/enums";

// Input interfaces
export interface CreateLaporanInput {
  namaLaporan: string;
  masalah: string;
  alamat: string;
  imageURL?: string[];
  jenisLaporan: EnumJenisLaporan;
  catatan?: string;
  langitude: number;
  longitude: number;
}

export interface UpdateLaporanInput {
  namaLaporan?: string;
  masalah?: string;
  alamat?: string;
  imageURL?: string[];
  catatan?: string;
}

export interface LaporanFilterInput {
  jenisLaporan?: EnumJenisLaporan;
  status?: EnumWorkStatusPelanggan;
}

// Response interfaces
export interface LaporanResponse {
  success: boolean;
  message: string;
  data: ILaporan | null;
}

export interface LaporanListResponse {
  success: boolean;
  message: string;
  data: ILaporan[] | null;
  total?: number;
}

export class LaporanService {
  /**
   * Get all laporan by user with optional filter
   */
  static async getLaporanList(
    userId: string | Types.ObjectId,
    filter?: LaporanFilterInput,
  ): Promise<LaporanListResponse> {
    try {
      const query: any = { IdPengguna: userId };

      if (filter?.jenisLaporan) {
        query.JenisLaporan = filter.jenisLaporan;
      }
      if (filter?.status) {
        query.Status = filter.status;
      }

      const laporanList = await Laporan.find(query)
        .populate("IdPengguna", "namaLengkap email")
        .populate("Koordinat")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan daftar laporan",
        data: laporanList,
        total: laporanList.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan daftar laporan",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Get laporan by ID
   */
  static async getLaporanById(
    id: string | Types.ObjectId,
  ): Promise<LaporanResponse> {
    try {
      const laporan = await Laporan.findById(id)
        .populate("IdPengguna", "namaLengkap email")
        .populate("Koordinat");

      if (!laporan) {
        return {
          success: false,
          message: "Laporan tidak ditemukan",
          data: null,
        };
      }

      return {
        success: true,
        message: "Berhasil mendapatkan laporan",
        data: laporan,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan laporan",
        data: null,
      };
    }
  }

  /**
   * Get active laporan (not finished yet)
   */
  static async getLaporanAktif(
    userId: string | Types.ObjectId,
  ): Promise<LaporanListResponse> {
    try {
      const laporanList = await Laporan.find({
        IdPengguna: userId,
        Status: {
          $nin: [
            EnumWorkStatusPelanggan.SELESAI,
            EnumWorkStatusPelanggan.DIBATALKAN,
          ],
        },
      })
        .populate("IdPengguna", "namaLengkap email")
        .populate("Koordinat")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Berhasil mendapatkan laporan aktif",
        data: laporanList,
        total: laporanList.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan laporan aktif",
        data: null,
        total: 0,
      };
    }
  }

  /**
   * Create new laporan
   */
  static async createLaporan(
    userId: string | Types.ObjectId,
    input: CreateLaporanInput,
  ): Promise<LaporanResponse> {
    try {
      // Create GeoLokasi first
      const geoLokasi = await GeoLokasi.create({
        IdLaporan: new Types.ObjectId(), // Temporary, will update after
        Latitude: input.langitude,
        Longitude: input.longitude,
      });

      // Create Laporan
      const laporan = await Laporan.create({
        IdPengguna: userId,
        NamaLaporan: input.namaLaporan,
        Masalah: input.masalah,
        Alamat: input.alamat,
        ImageURL: input.imageURL || [],
        JenisLaporan: input.jenisLaporan,
        Catatan: input.catatan || "",
        Koordinat: geoLokasi._id,
        Status: EnumWorkStatusPelanggan.DIAJUKAN,
      });

      // Update GeoLokasi with actual Laporan ID
      await GeoLokasi.findByIdAndUpdate(geoLokasi._id, {
        IdLaporan: laporan._id,
      });

      // Populate and return
      const populatedLaporan = await Laporan.findById(laporan._id)
        .populate("IdPengguna", "namaLengkap email")
        .populate("Koordinat");

      return {
        success: true,
        message: "Berhasil membuat laporan",
        data: populatedLaporan,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal membuat laporan",
        data: null,
      };
    }
  }

  /**
   * Update laporan (only if status is DIAJUKAN)
   */
  static async updateLaporan(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    input: UpdateLaporanInput,
  ): Promise<LaporanResponse> {
    try {
      const laporan = await Laporan.findOne({
        _id: id,
        IdPengguna: userId,
      });

      if (!laporan) {
        return {
          success: false,
          message: "Laporan tidak ditemukan",
          data: null,
        };
      }

      if (laporan.Status !== EnumWorkStatusPelanggan.DIAJUKAN) {
        return {
          success: false,
          message: "Laporan tidak dapat diubah karena sudah diproses",
          data: null,
        };
      }

      const updateData: any = {};
      if (input.namaLaporan) updateData.NamaLaporan = input.namaLaporan;
      if (input.masalah) updateData.Masalah = input.masalah;
      if (input.alamat) updateData.Alamat = input.alamat;
      if (input.imageURL) updateData.ImageURL = input.imageURL;
      if (input.catatan !== undefined) updateData.Catatan = input.catatan;

      const updatedLaporan = await Laporan.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .populate("IdPengguna", "namaLengkap email")
        .populate("Koordinat");

      return {
        success: true,
        message: "Berhasil mengupdate laporan",
        data: updatedLaporan,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengupdate laporan",
        data: null,
      };
    }
  }

  /**
   * Cancel laporan
   */
  static async batalkanLaporan(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<LaporanResponse> {
    try {
      const laporan = await Laporan.findOne({
        _id: id,
        IdPengguna: userId,
      });

      if (!laporan) {
        return {
          success: false,
          message: "Laporan tidak ditemukan",
          data: null,
        };
      }

      if (laporan.Status === EnumWorkStatusPelanggan.SELESAI) {
        return {
          success: false,
          message: "Laporan yang sudah selesai tidak dapat dibatalkan",
          data: null,
        };
      }

      if (laporan.Status === EnumWorkStatusPelanggan.DIBATALKAN) {
        return {
          success: false,
          message: "Laporan sudah dibatalkan sebelumnya",
          data: null,
        };
      }

      const updatedLaporan = await Laporan.findByIdAndUpdate(
        id,
        { Status: EnumWorkStatusPelanggan.DIBATALKAN },
        { new: true },
      )
        .populate("IdPengguna", "namaLengkap email")
        .populate("Koordinat");

      return {
        success: true,
        message: "Berhasil membatalkan laporan",
        data: updatedLaporan,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal membatalkan laporan",
        data: null,
      };
    }
  }
}
