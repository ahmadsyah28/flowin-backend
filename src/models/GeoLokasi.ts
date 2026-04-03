import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";

export interface IGeoLokasi extends IBaseDocument {
  IdLaporan: Types.ObjectId;
  Latitude: number;
  Longitude: number;
}

const geoLokasiSchema = new Schema<IGeoLokasi>({
  IdLaporan: {
    type: Schema.Types.ObjectId,
    ref: "Laporan",
    required: [true, "Laporan ID is required"],
    index: true,
  },
  Latitude: {
    type: Number,
    required: [true, "Latitude is required"],
  },
  Longitude: {
    type: Number,
    required: [true, "Longitude is required"],
  },
  ...baseSchemaFields,
});
addBaseMiddleware(geoLokasiSchema);
export const GeoLokasi = mongoose.model<IGeoLokasi>(
  "GeoLokasi",
  geoLokasiSchema,
);
