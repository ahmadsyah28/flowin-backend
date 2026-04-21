import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";
import { EnumNotifikasiKategori } from "../enums";

export interface INotifikasi extends IBaseDocument {
  IdPelanggan: Types.ObjectId;
  IdAdmin: Types.ObjectId;
  IdTeknisi: Types.ObjectId;
  Judul: string;
  Pesan: string;
  Kategori: EnumNotifikasiKategori;
  Link: string | null;
  isRead: boolean;
}

const notifikasiSchema = new Schema<INotifikasi>({
  IdPelanggan: {
    type: Schema.Types.ObjectId,
    ref: "Pengguna",
    required: [true, "Pelanggan ID is required"],
    index: true,
  },
  IdAdmin: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: [true, "Admin ID is required"],
    index: true,
  },
  IdTeknisi: {
    type: Schema.Types.ObjectId,
    ref: "Teknisi",
    required: [true, "Teknisi ID is required"],
    index: true,
  },
  Judul: {
    type: String,
    required: [true, "Judul is required"],
    trim: true,
  },
  Pesan: {
    type: String,
    required: [true, "Pesan is required"],
    trim: true,
  },
  Kategori: {
    type: String,
    enum: Object.values(EnumNotifikasiKategori),
    default: EnumNotifikasiKategori.INFORMASI,
  },
  Link: {
    type: String,
    default: null,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  ...baseSchemaFields,
});
addBaseMiddleware(notifikasiSchema);
export const Notifikasi = mongoose.model<INotifikasi>(
  "Notifikasi",
  notifikasiSchema,
);
