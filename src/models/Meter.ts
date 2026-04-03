import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";

export interface IMeter extends IBaseDocument {
  IdKelompokPelanggan: Types.ObjectId;
  IdKoneksiData: Types.ObjectId;
  NomorMeteran: string;
  NomorAkun: string;
}

const meterSchema = new Schema<IMeter>({
  IdKelompokPelanggan: {
    type: Schema.Types.ObjectId,
    ref: "KelompokPelanggan",
    required: [true, "ID Kelompok Pelanggan is required"],
    index: true,
  },
  IdKoneksiData: {
    type: Schema.Types.ObjectId,
    ref: "KoneksiData",
    required: [true, "ID Koneksi Data is required"],
    index: true,
  },
  NomorMeteran: {
    type: String,
    required: [true, "Nomor Meteran is required"],
    unique: true,
    trim: true,
  },
  NomorAkun: {
    type: String,
    required: [true, "Nomor Akun is required"],
    unique: true,
    trim: true,
  },
  ...baseSchemaFields,
});

addBaseMiddleware(meterSchema);

export const Meter = mongoose.model<IMeter>("Meter", meterSchema);
