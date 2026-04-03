import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";
import { StatusPengajuan } from "@/enums";

export interface IKoneksiData extends IBaseDocument {
  // Foreign Key reference to Pelanggan (User)
  IdPelanggan: Types.ObjectId;

  // Status pengajuan (PENDING / APPROVED / REJECTED)
  StatusPengajuan: StatusPengajuan;

  // Alasan penolakan (diisi saat REJECTED)
  AlasanPenolakan?: string;

  // Tanggal verifikasi
  TanggalVerifikasi?: Date;

  // Dokumen identitas
  NIK: string;
  NIKUrl: string;

  // Dokumen Kartu Keluarga
  NoKK: string;
  KKUrl: string;

  // Dokumen IMB (Izin Mendirikan Bangunan)
  IMB: string;
  IMBUrl: string;

  // Data alamat
  Alamat: string;
  Kelurahan: string;
  Kecamatan: string;

  // Data bangunan
  LuasBangunan: number;
}

const koneksiDataSchema = new Schema<IKoneksiData>(
  {
    // Foreign Key ke Pengguna
    IdPelanggan: {
      type: Schema.Types.ObjectId,
      ref: "Pengguna", // Reference ke Pengguna model
      required: [true, "ID Pelanggan is required"],
      index: true,
    },

    // Status pengajuan
    StatusPengajuan: {
      type: String,
      enum: Object.values(StatusPengajuan),
      default: StatusPengajuan.PENDING,
      required: true,
    },

    // Alasan penolakan (diisi saat REJECTED)
    AlasanPenolakan: {
      type: String,
      trim: true,
      default: null,
    },

    // Tanggal verifikasi
    TanggalVerifikasi: {
      type: Date,
      default: null,
    },

    // NIK (Nomor Induk Kependudukan)
    NIK: {
      type: String,
      required: [true, "NIK is required"],
      trim: true,
      minlength: [16, "NIK must be 16 characters"],
      maxlength: [16, "NIK must be 16 characters"],
      match: [/^\d{16}$/, "NIK must be 16 digits"],
      unique: true,
    },

    // URL file NIK (foto/scan KTP)
    NIKUrl: {
      type: String,
      required: [true, "NIK document URL is required"],
      trim: true,
    },

    // No KK (Nomor Kartu Keluarga)
    NoKK: {
      type: String,
      required: [true, "No KK is required"],
      trim: true,
      minlength: [16, "No KK must be 16 characters"],
      maxlength: [16, "No KK must be 16 characters"],
      match: [/^\d{16}$/, "No KK must be 16 digits"],
    },

    // URL file KK (foto/scan Kartu Keluarga)
    KKUrl: {
      type: String,
      required: [true, "KK document URL is required"],
      trim: true,
    },

    // IMB (Izin Mendirikan Bangunan)
    IMB: {
      type: String,
      required: [true, "IMB number is required"],
      trim: true,
      maxlength: [50, "IMB number cannot exceed 50 characters"],
    },

    // URL file IMB
    IMBUrl: {
      type: String,
      required: [true, "IMB document URL is required"],
      trim: true,
    },

    // Alamat lengkap
    Alamat: {
      type: String,
      required: [true, "Alamat is required"],
      trim: true,
      maxlength: [500, "Alamat cannot exceed 500 characters"],
    },

    // Kelurahan
    Kelurahan: {
      type: String,
      required: [true, "Kelurahan is required"],
      trim: true,
      maxlength: [100, "Kelurahan cannot exceed 100 characters"],
    },

    // Kecamatan
    Kecamatan: {
      type: String,
      required: [true, "Kecamatan is required"],
      trim: true,
      maxlength: [100, "Kecamatan cannot exceed 100 characters"],
    },

    // Luas bangunan (dalam meter persegi)
    LuasBangunan: {
      type: Number,
      required: [true, "Luas Bangunan is required"],
      min: [1, "Luas Bangunan must be at least 1 m²"],
      max: [10000, "Luas Bangunan cannot exceed 10000 m²"],
    },

    // Add base fields (createdAt, updatedAt)
    ...baseSchemaFields,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add base middleware
addBaseMiddleware(koneksiDataSchema);

// Create indexes for better query performance
// IdPelanggan: index already defined via `index: true` in field definition
// NIK: index already defined via `unique: true` in field definition
koneksiDataSchema.index({ StatusPengajuan: 1 });
koneksiDataSchema.index({ Kecamatan: 1, Kelurahan: 1 });
koneksiDataSchema.index({ createdAt: -1 });

// Virtual untuk populate pelanggan data
koneksiDataSchema.virtual("pelanggan", {
  ref: "Pengguna",
  localField: "IdPelanggan",
  foreignField: "_id",
  justOne: true,
});

// Pre-validate middleware untuk custom validation
koneksiDataSchema.pre("validate", function () {
  // Validasi tambahan jika diperlukan
  if (this.NIK && this.NoKK && this.NIK === this.NoKK) {
    throw new Error("NIK and No KK cannot be the same");
  }
});

// Static methods untuk query yang sering digunakan
koneksiDataSchema.statics.findByPelanggan = function (pelangganId: string) {
  return this.findOne({ IdPelanggan: pelangganId }).populate("pelanggan");
};

koneksiDataSchema.statics.findVerified = function () {
  return this.find({ StatusPengajuan: StatusPengajuan.APPROVED }).populate(
    "pelanggan",
  );
};

koneksiDataSchema.statics.findPendingVerification = function () {
  return this.find({ StatusPengajuan: StatusPengajuan.PENDING }).populate(
    "pelanggan",
  );
};

// Create and export model
export const KoneksiData = mongoose.model<IKoneksiData>(
  "KoneksiData",
  koneksiDataSchema,
);
