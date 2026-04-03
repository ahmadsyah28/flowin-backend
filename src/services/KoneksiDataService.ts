import { Types } from "mongoose";
import { KoneksiData, IKoneksiData } from "@/models/KoneksiData";
import { StatusPengajuan } from "@/enums";

// Input interfaces
export interface CreateKoneksiDataInput {
  nik: string;
  nikUrl: string;
  noKK: string;
  kkUrl: string;
  imb: string;
  imbUrl: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  luasBangunan: number;
}

export interface UpdateKoneksiDataInput {
  nikUrl?: string;
  kkUrl?: string;
  imbUrl?: string;
  alamat?: string;
  kelurahan?: string;
  kecamatan?: string;
  luasBangunan?: number;
}

// Response interfaces
export interface KoneksiDataResponse {
  success: boolean;
  message: string;
  data: IKoneksiData | null;
}

export interface StatusPengajuanResponse {
  success: boolean;
  message: string;
  statusPengajuan: StatusPengajuan | null;
  alasanPenolakan: string | null;
  tanggalVerifikasi: Date | null;
  canSubmit: boolean;
}

export class KoneksiDataService {
  /**
   * Get koneksi data by user ID
   */
  static async getKoneksiData(
    userId: string | Types.ObjectId,
  ): Promise<KoneksiDataResponse> {
    try {
      const koneksiData = await KoneksiData.findOne({
        IdPelanggan: userId,
      }).populate("IdPelanggan", "namaLengkap email");

      if (!koneksiData) {
        return {
          success: false,
          message: "Koneksi data tidak ditemukan",
          data: null,
        };
      }

      return {
        success: true,
        message: "Berhasil mendapatkan koneksi data",
        data: koneksiData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan koneksi data",
        data: null,
      };
    }
  }

  /**
   * Get koneksi data by ID
   */
  static async getKoneksiDataById(
    id: string | Types.ObjectId,
  ): Promise<KoneksiDataResponse> {
    try {
      const koneksiData = await KoneksiData.findById(id).populate(
        "IdPelanggan",
        "namaLengkap email",
      );

      if (!koneksiData) {
        return {
          success: false,
          message: "Koneksi data tidak ditemukan",
          data: null,
        };
      }

      return {
        success: true,
        message: "Berhasil mendapatkan koneksi data",
        data: koneksiData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan koneksi data",
        data: null,
      };
    }
  }

  /**
   * Create new koneksi data
   */
  static async createKoneksiData(
    userId: string | Types.ObjectId,
    input: CreateKoneksiDataInput,
  ): Promise<KoneksiDataResponse> {
    try {
      // Check if user already has koneksi data
      const existing = await KoneksiData.findOne({ IdPelanggan: userId });

      if (existing) {
        // Jika PENDING, tidak boleh submit ulang
        if (existing.StatusPengajuan === StatusPengajuan.PENDING) {
          return {
            success: false,
            message:
              "Pengajuan Anda sedang dalam proses verifikasi. Silakan tunggu.",
            data: null,
          };
        }

        // Jika APPROVED, tidak boleh submit ulang
        if (existing.StatusPengajuan === StatusPengajuan.APPROVED) {
          return {
            success: false,
            message: "Pengajuan Anda sudah disetujui. Koneksi air sudah aktif.",
            data: null,
          };
        }

        // Jika REJECTED, update data yang ada untuk pengajuan ulang
        if (existing.StatusPengajuan === StatusPengajuan.REJECTED) {
          existing.NIK = input.nik;
          existing.NIKUrl = input.nikUrl;
          existing.NoKK = input.noKK;
          existing.KKUrl = input.kkUrl;
          existing.IMB = input.imb;
          existing.IMBUrl = input.imbUrl;
          existing.Alamat = input.alamat;
          existing.Kelurahan = input.kelurahan;
          existing.Kecamatan = input.kecamatan;
          existing.LuasBangunan = input.luasBangunan;
          existing.StatusPengajuan = StatusPengajuan.PENDING;
          existing.AlasanPenolakan = undefined;
          existing.TanggalVerifikasi = undefined;

          await existing.save();

          return {
            success: true,
            message: "Pengajuan ulang berhasil dikirim",
            data: existing,
          };
        }
      }

      const koneksiData = await KoneksiData.create({
        IdPelanggan: userId,
        NIK: input.nik,
        NIKUrl: input.nikUrl,
        NoKK: input.noKK,
        KKUrl: input.kkUrl,
        IMB: input.imb,
        IMBUrl: input.imbUrl,
        Alamat: input.alamat,
        Kelurahan: input.kelurahan,
        Kecamatan: input.kecamatan,
        LuasBangunan: input.luasBangunan,
        StatusPengajuan: StatusPengajuan.PENDING,
      });

      return {
        success: true,
        message: "Berhasil membuat koneksi data",
        data: koneksiData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal membuat koneksi data",
        data: null,
      };
    }
  }

  /**
   * Cek status pengajuan koneksi
   */
  static async cekStatusPengajuan(
    userId: string | Types.ObjectId,
  ): Promise<StatusPengajuanResponse> {
    try {
      const koneksiData = await KoneksiData.findOne({ IdPelanggan: userId });

      if (!koneksiData) {
        // Belum pernah mengajukan
        return {
          success: true,
          message: "Belum ada pengajuan",
          statusPengajuan: null,
          alasanPenolakan: null,
          tanggalVerifikasi: null,
          canSubmit: true,
        };
      }

      const canSubmit =
        koneksiData.StatusPengajuan === StatusPengajuan.REJECTED;

      let message = "";
      switch (koneksiData.StatusPengajuan) {
        case StatusPengajuan.PENDING:
          message = "Pengajuan Anda sedang dalam proses verifikasi";
          break;
        case StatusPengajuan.APPROVED:
          message = "Pengajuan Anda sudah disetujui";
          break;
        case StatusPengajuan.REJECTED:
          message = `Pengajuan Anda ditolak. Alasan: ${koneksiData.AlasanPenolakan || "Tidak ada alasan"}`;
          break;
      }

      return {
        success: true,
        message,
        statusPengajuan: koneksiData.StatusPengajuan,
        alasanPenolakan: koneksiData.AlasanPenolakan || null,
        tanggalVerifikasi: koneksiData.TanggalVerifikasi || null,
        canSubmit,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengecek status pengajuan",
        statusPengajuan: null,
        alasanPenolakan: null,
        tanggalVerifikasi: null,
        canSubmit: false,
      };
    }
  }

  /**
   * Update koneksi data
   */
  static async updateKoneksiData(
    userId: string | Types.ObjectId,
    input: UpdateKoneksiDataInput,
  ): Promise<KoneksiDataResponse> {
    try {
      const updateData: any = {};
      if (input.nikUrl) updateData.NIKUrl = input.nikUrl;
      if (input.kkUrl) updateData.KKUrl = input.kkUrl;
      if (input.imbUrl) updateData.IMBUrl = input.imbUrl;
      if (input.alamat) updateData.Alamat = input.alamat;
      if (input.kelurahan) updateData.Kelurahan = input.kelurahan;
      if (input.kecamatan) updateData.Kecamatan = input.kecamatan;
      if (input.luasBangunan !== undefined)
        updateData.LuasBangunan = input.luasBangunan;

      const koneksiData = await KoneksiData.findOneAndUpdate(
        { IdPelanggan: userId },
        updateData,
        { new: true },
      ).populate("IdPelanggan", "namaLengkap email");

      if (!koneksiData) {
        return {
          success: false,
          message: "Koneksi data tidak ditemukan",
          data: null,
        };
      }

      return {
        success: true,
        message: "Berhasil mengupdate koneksi data",
        data: koneksiData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengupdate koneksi data",
        data: null,
      };
    }
  }
}
