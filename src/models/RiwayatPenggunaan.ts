import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";

/**
 * RiwayatPenggunaan - Menyimpan data penggunaan air per bulan (dari migrasi Redis)
 *
 * Periode: Format "YYYY-MM" (contoh: "2026-03")
 * TotalPenggunaan: Total liter dalam bulan tersebut
 * DataHarian: Map tanggal (DD) -> liter per hari
 * DataPerJam: Map "DD-HH" -> liter per jam
 *
 * Note: Data ini di-populate oleh proses migrasi admin dari Redis
 *       setiap akhir bulan. Monitoring app hanya membaca data ini.
 */
export interface IRiwayatPenggunaan extends IBaseDocument {
  MeteranId: Types.ObjectId;
  Periode: string; // Format: "YYYY-MM"
  TotalPenggunaan: number; // Total liter dalam bulan
  DataHarian: Map<string, number>; // { "01": 45.7, "02": 38.2, ... }
  DataPerJam: Map<string, number>; // { "01-08": 5.3, "01-09": 4.1, ... }
}

const riwayatPenggunaanSchema = new Schema<IRiwayatPenggunaan>({
  MeteranId: {
    type: Schema.Types.ObjectId,
    ref: "Meter",
    required: [true, "Meteran ID is required"],
    index: true,
  },
  Periode: {
    type: String,
    required: [true, "Periode is required"],
    match: [/^\d{4}-\d{2}$/, "Periode must be in YYYY-MM format"],
    index: true,
  },
  TotalPenggunaan: {
    type: Number,
    required: [true, "Total Penggunaan is required"],
    min: [0, "Total Penggunaan cannot be negative"],
    default: 0,
  },
  DataHarian: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  DataPerJam: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  ...baseSchemaFields,
});

// Compound index untuk query efisien: cari by MeteranId + Periode
riwayatPenggunaanSchema.index({ MeteranId: 1, Periode: -1 });

// Unique constraint: satu record per meteran per bulan
riwayatPenggunaanSchema.index({ MeteranId: 1, Periode: 1 }, { unique: true });

addBaseMiddleware(riwayatPenggunaanSchema);

export const RiwayatPenggunaan = mongoose.model<IRiwayatPenggunaan>(
  "RiwayatPenggunaan",
  riwayatPenggunaanSchema,
);
