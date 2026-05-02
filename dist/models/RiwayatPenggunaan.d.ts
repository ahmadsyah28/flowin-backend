import mongoose, { Document } from "mongoose";
export interface IRiwayatPenggunaan extends Document {
    MeterID: string;
    UserID: string;
    PenggunaanAir: number;
    timestamp: Date;
}
export declare const RiwayatPenggunaan: mongoose.Model<IRiwayatPenggunaan, {}, {}, {}, mongoose.Document<unknown, {}, IRiwayatPenggunaan, {}, mongoose.DefaultSchemaOptions> & IRiwayatPenggunaan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRiwayatPenggunaan>;
//# sourceMappingURL=RiwayatPenggunaan.d.ts.map