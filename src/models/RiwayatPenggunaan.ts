import mongoose, { Schema, Document } from "mongoose";

/**
 * RiwayatPenggunaan - Menyimpan raw data pembacaan IoT per sample
 *
 * Data ditulis oleh flowin-recieve-iot (cron migration dari Redis list).
 * Format: satu dokumen = satu pembacaan dari sensor flow meter.
 *
 * MeterID  : string ID meteran (Meter._id.toString())
 * UserID   : string ID pengguna (Pengguna._id.toString())
 * PenggunaanAir : volume air dalam liter untuk sample ini
 * timestamp: waktu pembacaan (epoch ms dari IoT firmware via NTP)
 */
export interface IRiwayatPenggunaan extends Document {
  MeterID: string;
  UserID: string;
  PenggunaanAir: number;
  timestamp: Date;
}

const riwayatPenggunaanSchema = new Schema<IRiwayatPenggunaan>({
  MeterID: { type: String, required: true, index: true },
  UserID: { type: String, required: true, index: true },
  PenggunaanAir: { type: Number, required: true },
  timestamp: { type: Date, required: true, index: true },
});

// Compound index: query range per meteran per waktu (untuk aggregasi bulanan)
riwayatPenggunaanSchema.index({ MeterID: 1, timestamp: -1 });

export const RiwayatPenggunaan = mongoose.model<IRiwayatPenggunaan>(
  "RiwayatPenggunaan",
  riwayatPenggunaanSchema,
  "riwayatpenggunaans",
);
