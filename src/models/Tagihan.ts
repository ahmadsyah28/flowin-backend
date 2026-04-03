import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";
import { EnumPaymentStatus } from "../enums";

export interface ITagihan extends IBaseDocument {
  IdMeteran: Types.ObjectId;
  Periode: string;
  PenggunaanSebelum: number;
  PenggunaanSekarang: number;
  TotalPemakaian: number;
  Biaya: number;
  TotalBiaya: number;
  StatusPembayaran: EnumPaymentStatus;
  TanggalPembayaran: Date;
  MetodePembayaran: string;
  TenggatWaktu: Date;
  Menunggak: boolean;
  Denda: number;
  Catatan: string;
}

const tagihanSchema = new Schema<ITagihan>({
  IdMeteran: {
    type: Schema.Types.ObjectId,
    ref: "Meter",
    required: [true, "Meteran ID is required"],
    index: true,
  },
  Periode: {
    type: String,
    required: [true, "Periode is required"],
    trim: true,
  },
  PenggunaanSebelum: {
    type: Number,
    required: [true, "Penggunaan Sebelum is required"],
    min: [0, "Penggunaan Sebelum cannot be negative"],
  },
  PenggunaanSekarang: {
    type: Number,
    required: [true, "Penggunaan Sekarang is required"],
    min: [0, "Penggunaan Sekarang cannot be negative"],
  },
  TotalPemakaian: {
    type: Number,
    required: [true, "Total Pemakaian is required"],
    min: [0, "Total Pemakaian cannot be negative"],
  },
  Biaya: {
    type: Number,
    required: [true, "Biaya is required"],
    min: [0, "Biaya cannot be negative"],
  },
  TotalBiaya: {
    type: Number,
    required: [true, "Total Biaya is required"],
    min: [0, "Total Biaya cannot be negative"],
  },
  StatusPembayaran: {
    type: String,
    enum: Object.values(EnumPaymentStatus),
    default: EnumPaymentStatus.PENDING,
    required: true,
  },
  TanggalPembayaran: {
    type: Date,
    default: null,
  },
  MetodePembayaran: {
    type: String,
    default: null,
    trim: true,
  },
  TenggatWaktu: {
    type: Date,
    required: [true, "Tenggat Waktu is required"],
  },
  Menunggak: {
    type: Boolean,
    default: false,
    required: true,
  },
  Denda: {
    type: Number,
    default: 0,
    min: [0, "Denda cannot be negative"],
  },
  Catatan: {
    type: String,
    default: null,
    trim: true,
  },
  ...baseSchemaFields,
});
addBaseMiddleware(tagihanSchema);
export const Tagihan = mongoose.model<ITagihan>("Tagihan", tagihanSchema);
