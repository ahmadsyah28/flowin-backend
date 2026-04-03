import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export interface IGeoLokasi extends IBaseDocument {
    IdLaporan: Types.ObjectId;
    Latitude: number;
    Longitude: number;
}
export declare const GeoLokasi: mongoose.Model<IGeoLokasi, {}, {}, {}, mongoose.Document<unknown, {}, IGeoLokasi, {}, mongoose.DefaultSchemaOptions> & IGeoLokasi & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGeoLokasi>;
//# sourceMappingURL=GeoLokasi.d.ts.map