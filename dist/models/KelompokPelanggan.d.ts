import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
export declare enum KodeKelompok {
    SOSIAL_UMUM = "SOS-U",
    SOSIAL_KHUSUS = "SOS-K",
    RUMAH_TANGGA_A = "RT-1",
    RUMAH_TANGGA_B = "RT-2",
    RUMAH_TANGGA_C = "RT-3",
    RUMAH_TANGGA_D = "RT-4",
    NIAGA_KECIL = "N-1",
    NIAGA_MENENGAH = "N-2",
    NIAGA_BESAR = "N-3",
    INSTANSI_PEMERINTAH = "IP",
    KHUSUS = "KH"
}
export declare enum KategoriKelompok {
    SOSIAL = "Sosial",
    NON_NIAGA = "Non Niaga",
    NIAGA = "Niaga",
    INSTANSI_PEMERINTAH = "Instansi Pemerintah",
    KHUSUS = "Khusus"
}
export interface IKelompokPelanggan extends IBaseDocument {
    KodeKelompok: KodeKelompok;
    NamaKelompok: string;
    Kategori: KategoriKelompok;
    Deskripsi?: string;
    TarifRendah: number;
    TarifTinggi: number;
    BatasRendah: number;
    BiayaBeban: number;
    IsKesepakatan: boolean;
}
export declare const KelompokPelanggan: mongoose.Model<IKelompokPelanggan, {}, {}, {}, mongoose.Document<unknown, {}, IKelompokPelanggan, {}, mongoose.DefaultSchemaOptions> & IKelompokPelanggan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IKelompokPelanggan>;
export declare const kelompokPelangganSeed: Omit<IKelompokPelanggan, keyof IBaseDocument>[];
//# sourceMappingURL=KelompokPelanggan.d.ts.map