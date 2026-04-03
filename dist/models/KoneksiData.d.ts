import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export interface IKoneksiData extends IBaseDocument {
    IdPelanggan: Types.ObjectId;
    StatusVerifikasi: boolean;
    NIK: string;
    NIKUrl: string;
    NoKK: string;
    KKUrl: string;
    IMB: string;
    IMBUrl: string;
    Alamat: string;
    Kelurahan: string;
    Kecamatan: string;
    LuasBangunan: number;
}
export declare const KoneksiData: mongoose.Model<IKoneksiData, {}, {}, {}, mongoose.Document<unknown, {}, IKoneksiData, {}, mongoose.DefaultSchemaOptions> & IKoneksiData & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IKoneksiData>;
//# sourceMappingURL=KoneksiData.d.ts.map