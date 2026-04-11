import mongoose, { Schema, Document, Types } from "mongoose";
import { EnumPaymentStatus } from "@/enums";

export interface IRAB {
  idKoneksiData: Types.ObjectId;
  totalBiaya?: number | null;
  statusPembayaran: EnumPaymentStatus;
  orderId?: string | null;
  paymentUrl?: string | null;
  urlRab?: string | null;
  catatan?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRABDocument extends IRAB, Document {}

const rabSchema = new Schema<IRABDocument>(
  {
    idKoneksiData: {
      type: Schema.Types.ObjectId,
      ref: "KoneksiData",
      required: [true, "ID koneksi data diperlukan"],
      index: true,
    },

    totalBiaya: {
      type: Number,
      default: null,
      min: [0, "Total biaya tidak boleh negatif"],
    },

    statusPembayaran: {
      type: String,
      enum: {
        values: Object.values(EnumPaymentStatus),
        message: "Status pembayaran tidak valid",
      },
      required: [true, "Status pembayaran diperlukan"],
      default: EnumPaymentStatus.PENDING,
    },

    // Midtrans: order ID unik per transaksi
    orderId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    // Midtrans: URL redirect ke halaman pembayaran
    paymentUrl: {
      type: String,
      trim: true,
      default: null,
    },

    // URL dokumen RAB (PDF / gambar)
    urlRab: {
      type: String,
      trim: true,
      default: null,
    },

    catatan: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const RAB = mongoose.model<IRABDocument>("RAB", rabSchema);
