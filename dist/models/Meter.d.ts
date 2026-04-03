import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export interface IMeter extends IBaseDocument {
    IdKelompokPelanggan: Types.ObjectId;
    IdKoneksiData: Types.ObjectId;
    NomorMeteran: string;
    NomorAkun: string;
}
export declare const Meter: mongoose.Model<IMeter, {}, {}, {}, mongoose.Document<unknown, {}, IMeter, {}, mongoose.DefaultSchemaOptions> & IMeter & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMeter>;
//# sourceMappingURL=Meter.d.ts.map