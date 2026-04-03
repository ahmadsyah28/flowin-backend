import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export interface IRiwayatPenggunaan extends IBaseDocument {
    MeteranId: Types.ObjectId;
    Periode: string;
    TotalPenggunaan: number;
    DataHarian: Map<string, number>;
    DataPerJam: Map<string, number>;
}
export declare const RiwayatPenggunaan: mongoose.Model<IRiwayatPenggunaan, {}, {}, {}, mongoose.Document<unknown, {}, IRiwayatPenggunaan, {}, mongoose.DefaultSchemaOptions> & IRiwayatPenggunaan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRiwayatPenggunaan>;
//# sourceMappingURL=RiwayatPenggunaan.d.ts.map