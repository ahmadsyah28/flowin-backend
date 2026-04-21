import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
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
export declare const Notifikasi: mongoose.Model<INotifikasi, {}, {}, {}, mongoose.Document<unknown, {}, INotifikasi, {}, mongoose.DefaultSchemaOptions> & INotifikasi & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotifikasi>;
//# sourceMappingURL=Notifikasi.d.ts.map