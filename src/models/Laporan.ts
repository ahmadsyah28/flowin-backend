import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "../enums";
import { IGeoLokasi } from "./GeoLokasi";
import { IPengguna } from "./Pengguna";

export interface ILaporan extends IBaseDocument {
  IdPengguna: Types.ObjectId;
  NamaLaporan: string;
  Masalah: string;
  Alamat: string;
  ImageURL: string[];
  JenisLaporan: EnumJenisLaporan;
  Catatan: string;
  Koordinat: Types.ObjectId;
  Status: EnumWorkStatusPelanggan;

  // Virtual fields untuk populated data
  geoLokasi?: IGeoLokasi;
  pengguna?: IPengguna;
}

// Interface untuk static methods
export interface ILaporanModel extends mongoose.Model<ILaporan> {
  findWithGeoLokasi(filter?: any): Promise<ILaporan[]>;
  findByPenggunaWithGeoLokasi(
    penggunaId: string | Types.ObjectId,
  ): Promise<ILaporan[]>;
}
const laporanSchema = new Schema<ILaporan>({
  IdPengguna: {
    type: Schema.Types.ObjectId,
    ref: "Pengguna",
    required: [true, "Pengguna ID is required"],
    index: true,
  },
  NamaLaporan: {
    type: String,
    required: [true, "Nama Laporan is required"],
    trim: true,
  },
  Masalah: {
    type: String,
    required: [true, "Masalah is required"],
    trim: true,
  },
  Alamat: {
    type: String,
    required: [true, "Alamat is required"],
    trim: true,
  },
  ImageURL: {
    type: [String],
    default: [],
  },
  JenisLaporan: {
    type: String,
    enum: Object.values(EnumJenisLaporan),
    required: [true, "Jenis Laporan is required"],
  },
  Catatan: {
    type: String,
    trim: true,
    default: "",
  },
  Koordinat: {
    type: Schema.Types.ObjectId,
    ref: "GeoLokasi",
    required: [true, "Geo Lokasi ID is required"],
    index: true,
  },
  Status: {
    type: String,
    enum: Object.values(EnumWorkStatusPelanggan),
    default: EnumWorkStatusPelanggan.DITUNDA,
    required: true,
  },
  ...baseSchemaFields,
});

addBaseMiddleware(laporanSchema);

// Virtual untuk populate geo lokasi data
laporanSchema.virtual("geoLokasi", {
  ref: "GeoLokasi",
  localField: "Koordinat",
  foreignField: "_id",
  justOne: true,
});

// Static methods untuk query dengan populated data
laporanSchema.statics.findWithGeoLokasi = function (filter = {}) {
  return this.find(filter)
    .populate("geoLokasi")
    .populate("IdPengguna", "namaLengkap email");
};

laporanSchema.statics.findByPenggunaWithGeoLokasi = function (
  penggunaId: string | Types.ObjectId,
) {
  return this.find({ IdPengguna: penggunaId })
    .populate("geoLokasi")
    .populate("IdPengguna", "namaLengkap email");
};

export const Laporan = mongoose.model<ILaporan, ILaporanModel>(
  "Laporan",
  laporanSchema,
);
