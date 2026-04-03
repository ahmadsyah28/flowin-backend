import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export interface IRiwayatRagihan extends IBaseDocument {
    MeteranId: Types.ObjectId;
    PenggunaanAir: number;
}
export declare const RiwayatRagihan: mongoose.Model<IRiwayatRagihan, {}, {}, {}, mongoose.Document<unknown, {}, IRiwayatRagihan, {}, mongoose.DefaultSchemaOptions> & IRiwayatRagihan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRiwayatRagihan>;
//# sourceMappingURL=RiwayatRagihan.d.ts.map