import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";

export enum EnumStatusPembayaran {
  PENDING = "Pending",
  SUKSES = "Settlement",
  GAGAL = "Cancel",
  EXPIRED = "Expire",
  REFUND = "Refund",
}

export interface IPembayaran extends IBaseDocument {
  IdTagihan: Types.ObjectId;
  IdPengguna: Types.ObjectId;
  MidtransOrderId: string;
  MidtransTransactionId?: string;
  SnapToken: string;
  SnapRedirectUrl: string;
  MetodePembayaran?: string;
  JumlahBayar: number;
  StatusPembayaran: EnumStatusPembayaran;
  MidtransResponse?: Record<string, any>;
  TanggalBayar?: Date;
}

const pembayaranSchema = new Schema<IPembayaran>({
  IdTagihan: {
    type: Schema.Types.ObjectId,
    ref: "Tagihan",
    required: [true, "ID Tagihan is required"],
    index: true,
  },
  IdPengguna: {
    type: Schema.Types.ObjectId,
    ref: "Pengguna",
    required: [true, "ID Pengguna is required"],
    index: true,
  },
  MidtransOrderId: {
    type: String,
    required: [true, "Midtrans Order ID is required"],
    unique: true,
    trim: true,
  },
  MidtransTransactionId: {
    type: String,
    default: null,
    trim: true,
  },
  SnapToken: {
    type: String,
    required: [true, "Snap Token is required"],
    trim: true,
  },
  SnapRedirectUrl: {
    type: String,
    required: [true, "Snap Redirect URL is required"],
    trim: true,
  },
  MetodePembayaran: {
    type: String,
    default: null,
    trim: true,
  },
  JumlahBayar: {
    type: Number,
    required: [true, "Jumlah Bayar is required"],
    min: [0, "Jumlah Bayar cannot be negative"],
  },
  StatusPembayaran: {
    type: String,
    enum: Object.values(EnumStatusPembayaran),
    default: EnumStatusPembayaran.PENDING,
    required: true,
  },
  MidtransResponse: {
    type: Schema.Types.Mixed,
    default: null,
  },
  TanggalBayar: {
    type: Date,
    default: null,
  },
  ...baseSchemaFields,
});

// Compound indexes untuk query yang sering digunakan
pembayaranSchema.index({ IdPengguna: 1, createdAt: -1 });
// MidtransOrderId: index already defined via `unique: true` in field definition
pembayaranSchema.index({ IdTagihan: 1, StatusPembayaran: 1 });

addBaseMiddleware(pembayaranSchema);

export const Pembayaran = mongoose.model<IPembayaran>(
  "Pembayaran",
  pembayaranSchema,
);
