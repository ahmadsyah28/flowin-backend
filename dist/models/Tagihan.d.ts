import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
import { EnumPaymentStatus } from "../enums";
export interface ITagihan extends IBaseDocument {
    IdMeteran: Types.ObjectId;
    Periode: string;
    PenggunaanSebelum: number;
    PenggunaanSekarang: number;
    TotalPemakaian: number;
    Biaya: number;
    TotalBiaya: number;
    StatusPembayaran: EnumPaymentStatus;
    TanggalPembayaran: Date;
    MetodePembayaran: string;
    TenggatWaktu: Date;
    Menunggak: boolean;
    Denda: number;
    Catatan: string;
}
export declare const Tagihan: mongoose.Model<ITagihan, {}, {}, {}, mongoose.Document<unknown, {}, ITagihan, {}, mongoose.DefaultSchemaOptions> & ITagihan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITagihan>;
//# sourceMappingURL=Tagihan.d.ts.map